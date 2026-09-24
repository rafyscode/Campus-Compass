# `scope.md`: Data Gathering & Database Architecture

This document defines the exact boundaries, roles, and data formats for the data gathering pipeline. It ensures that the Edge Hardware, the Host Gateway, and the Cloud Database communicate flawlessly.

---

## 1. Firmware (ESP32 NodeMCU)

**Status:** *Already implemented, but must conform to these constraints.*
**Role:** The "Edge Sensor" (Data Collection & Anonymization)

### What it should do:
*   **Passive Sniffing:** Utilize `libpax` to continuously listen for Wi-Fi and BLE probe requests in promiscuous mode.
*   **Edge Anonymization:** Hash MAC addresses entirely in volatile RAM. Keep a running tally of unique devices currently in range.
*   **Periodic Output:** Every `X` seconds (e.g., every 10 or 30 seconds), output the current unique device count to the Serial (USB) port.
*   **No Networking:** The ESP32 should *not* attempt to connect to Wi-Fi. It acts purely as a dumb serial sensor. This ensures maximum stability for the sniffing radio.

### Inputs, Outputs, & Constraints:
*   **Input:** RF Signals (Smartphones/Laptops emitting probes).
*   **Output:** A simple text string sent over Serial (baud rate: 115200). 
    *   *Required format:* It should output just the integer or a easily parseable string, e.g., `COUNT:45\n`
*   **Constraints:** Must never output raw MAC addresses. Must survive being unplugged and plugged back in (instant boot-to-sniffing).

---

## 2. Host Gateway (Raspberry Pi Zero / Ubuntu Laptop)

**Status:** *To be developed (Python script).*
**Role:** The "Aggregator & Transporter" (Smoothing data and Cloud Ingestion)

### What it should do:
*   **Serial Reading:** Run a continuous Python daemon (`pyserial`) that listens to the USB port connected to the ESP32.
*   **Data Aggregation (Crucial):** Probe requests fluctuate wildly (e.g., a phone goes to sleep, the count drops briefly). The Host must collect the serial outputs over a **3-minute rolling window** and calculate the *average* or *median* count.
*   **Network Transmission:** After calculating the 3-minute average, construct a JSON payload and send it to the Supabase REST API via a standard `HTTPS POST` request (using the `requests` library).
*   **Resilience:** If the campus Wi-Fi drops, the script must catch the network exception, wait, and retry. It should not crash.

### Inputs, Outputs, & Constraints:
*   **Input 1:** Serial string from the ESP32 (e.g., `COUNT:45\n`).
*   **Input 2:** Loca*** 

### 🚀 How to use this document:
*   **To code the ESP32:** Check your current C++ code. Make sure it prints `COUNT: X` every few seconds to the Serial monitor. If it does, you are done with this step.
*   **To code the Python Host:** You can pass Section 2 of this document directly into an LLM with the prompt: *"Write the Python script for the Host Gateway as described in this scope, using pyserial and requests."*
*   **To set up the Database:** Open Supabase, create a new project, go to the SQL Editor, and ask an LLM: *"Generate the exact PostgreSQL commands to create the tables and RLS policies described in Section 3 of this scope."*l configuration variables (e.g., `LOCATION_ID = "lib_f1"`, `SUPABASE_URL = "..."`, `SUPABASE_API_KEY = "..."`).
*   **Output:** Network POST Request to Supabase.
    *   *Payload Contract:*
        ```json
        {
          "location_id": "lib_f1",
          "device_count": 42
        }
        ```
        *(Note: No timestamp is needed in the payload; the database will automatically generate the timestamp upon arrival).*
*   **Constraints:** Must be lightweight enough to run on a Pi Zero without maxing out the 512MB RAM.

---

## 3. Database (Supabase / PostgreSQL)

**Status:** *To be configured.*
**Role:** The "Central Hub" (Storage, API Generation, and Real-time Broadcasting)

### What it should do:
*   **Automated API:** Provide a secure REST API endpoint that the Host Gateway can POST data to without needing complex database drivers.
*   **Data Validation:** Reject any data that does not match the schema (e.g., missing location IDs, negative counts).
*   **Real-time Enablement:** Have "Realtime" enabled on the `occupancy_logs` table so the Frontend React/JS app can listen to WebSockets and update the map live.

### Inputs, Outputs, & Constraints:
*   **Input:** HTTPS POST requests from the Host Gateways.
*   **Output:** Stored PostgreSQL rows, and WebSocket broadcasts to the Frontend.

### Required Setup (Table Schemas):

**Table 1: `locations`** (Create this manually in the Supabase UI)
*This acts as the source of truth for your campus map.*
*   `id` (type: `text`, Primary Key) - e.g., `"lib_f1"`
*   `name` (type: `text`) - e.g., `"Library Main Floor"`
*   `max_capacity` (type: `integer`) - e.g., `250`
*   `lat` (type: `float8`) - e.g., `53.2285` (Leuphana campus coords)
*   `lon` (type: `float8`) - e.g., `10.4014`

**Table 2: `occupancy_logs`** (The Host Gateway writes to this)
*This stores the millions of telemetry points.*
*   `id` (type: `uuid`, Primary Key, Default: `gen_random_uuid()`)
*   `created_at` (type: `timestamptz`, Default: `now()`)
*   `location_id` (type: `text`, Foreign Key linked to `locations.id`)
*   `device_count` (type: `integer`)

### Security Configuration (Row Level Security - RLS):
To ensure nobody can spam your database with fake data:
1.  **occupancy_logs:** 
    *   Enable RLS. 
    *   Create a policy: "Allow insert access to users with `service_role` key". 
    *   *Result:* Your Pi Zero uses the secret service key to write data securely.
    *   Create a policy: "Allow read access to `anon` (public)".
    *   *Result:* The frontend website can read the data and show it to users without them needing to log in.


