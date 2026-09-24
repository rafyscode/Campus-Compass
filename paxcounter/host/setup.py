import json
import os

def run_setup():
    print("Welcome to Campus Compass Sensor Setup!")
    print("Please contact the Campus Compass team to get your database credentials if you haven't already.")
    
    supabase_url = input("Enter Supabase URL: ").strip()
    supabase_key = input("Enter Supabase Service Key: ").strip()
    location_id = input("Enter a unique Location ID (e.g., building1_room2): ").strip()
    location_name = input("Enter a friendly Location Name (e.g., Building 1, Room 2): ").strip()
    
    config = {
        "SUPABASE_URL": supabase_url,
        "SUPABASE_SERVICE_KEY": supabase_key,
        "LOCATION_ID": location_id,
        "LOCATION_NAME": location_name,
        "AGGREGATION_WINDOW_MINUTES": 3
    }
    
    with open("config.json", "w") as f:
        json.dump(config, f, indent=4)
        
    print("\nSetup complete! Configuration saved to config.json.")
    print("You can now run 'python host_gateway.py' to start the sensor host.")

if __name__ == "__main__":
    run_setup()
