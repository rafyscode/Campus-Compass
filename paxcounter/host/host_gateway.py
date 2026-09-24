import json
import time
import statistics
import serial
import requests
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def load_config(path="config.json"):
    import os
    if not os.path.exists(path):
        raise FileNotFoundError(f"Configuration file '{path}' not found. Please run 'python setup.py' first to configure your sensor.")
    with open(path, "r") as f:
        return json.load(f)

def get_headers(config):
    return {
        "apikey": config["SUPABASE_SERVICE_KEY"],
        "Authorization": f"Bearer {config['SUPABASE_SERVICE_KEY']}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def ensure_location_exists(config, headers):
    url = f"{config['SUPABASE_URL']}/rest/v1/locations"
    query_url = f"{url}?id=eq.{config['LOCATION_ID']}"
    
    try:
        response = requests.get(query_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if not data:
            logging.info(f"Location {config['LOCATION_ID']} not found. Creating it...")
            payload = {
                "id": config["LOCATION_ID"],
                "name": config["LOCATION_NAME"]
            }
            post_response = requests.post(url, headers=headers, json=payload)
            post_response.raise_for_status()
            logging.info("Location created successfully.")
        else:
            logging.info(f"Location {config['LOCATION_ID']} exists.")
            
    except requests.exceptions.RequestException as e:
        logging.error(f"Error checking/creating location: {e}")
        # Not exiting here; maybe network is just down temporarily.

def post_occupancy_log(config, headers, count):
    url = f"{config['SUPABASE_URL']}/rest/v1/occupancy_logs"
    payload = {
        "location_id": config["LOCATION_ID"],
        "device_count": count
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        logging.info(f"Successfully posted count: {count}. Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error posting occupancy log: {e}")

def main():
    try:
        config = load_config()
    except Exception as e:
        logging.error(f"Failed to load config.json: {e}")
        return

    headers = get_headers(config)
    
    # Phase A: Initialization & Automatic Location Registration
    ensure_location_exists(config, headers)
    
    # Configuration
    SERIAL_PORT = config.get("SERIAL_PORT", "/dev/ttyUSB1")
    import os
    if not os.path.exists(SERIAL_PORT):
        import serial.tools.list_ports as slp
        for port in slp.comports():
            if 'USB' in port.device or 'ACM' in port.device:
                SERIAL_PORT = port.device
                break
    
    BAUD_RATE = 115200
    AGGREGATION_WINDOW_SECONDS = config.get("AGGREGATION_WINDOW_MINUTES", 3) * 60
    
    readings = []
    last_post_time = time.time()
    
    logging.info("Starting Host Gateway main loop...")
    
    while True:
        try:
            # Phase B: Serial Reading
            with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
                logging.info(f"Connected to {SERIAL_PORT}")
                while True:
                    try:
                        line = ser.readline().decode('utf-8', errors='ignore').strip()
                        if line:
                            try:
                                # Try to parse the json line from esp32
                                data = json.loads(line)
                                if isinstance(data, dict) and data.get("type") == "count" and "pax" in data:
                                    count = data["pax"]
                                    readings.append(count)
                                    logging.info(f"Read count: {count} (Total readings in window: {len(readings)})")
                            except json.JSONDecodeError:
                                # If not json (like wifi errors), we just ignore
                                pass
                    except serial.SerialException as e:
                        if "readiness to read but returned no data" in str(e):
                            # Known pyserial bug on Linux with some drivers + timeout. Safe to ignore.
                            pass
                        else:
                            # Re-raise actual disconnects
                            raise
                            
                    # Data Aggregation
                    current_time = time.time()
                    if current_time - last_post_time >= AGGREGATION_WINDOW_SECONDS:
                        if readings:
                            # Calculate average and round
                            mean_count = int(round(statistics.mean(readings)))
                            logging.info(f"Window elapsed. Calculated average count: {mean_count}")
                            
                            # API Ingestion
                            post_occupancy_log(config, headers, mean_count)
                            readings.clear()
                        else:
                            logging.info("Window elapsed but no valid readings received.")
                            
                        last_post_time = current_time
                        
        except serial.SerialException as e:
            # Phase C: Resilience & Error Handling
            logging.warning(f"Serial connection error: {e}. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logging.error(f"Unexpected error: {e}. Retrying in 5 seconds...")
            time.sleep(5)

if __name__ == "__main__":
    main()
