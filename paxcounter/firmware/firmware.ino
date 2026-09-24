#include <ArduinoJson.h>
#include <libpax_api.h>
#include "esp_log.h"

struct count_payload_t count_data;

// Callback executed by libpax
void process_count() {
  StaticJsonDocument<200> doc;
  doc["type"] = "count";
  doc["wifi"] = count_data.wifi_count;
  doc["ble"] = count_data.ble_count;
  doc["pax"] = count_data.pax;
  doc["uptime_s"] = millis() / 1000;

  serializeJson(doc, Serial);
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect
  }
  
  esp_log_level_set("*", ESP_LOG_NONE); // Disable ESP-IDF logging

  Serial.println("{\"type\": \"status\", \"msg\": \"PaxCounter Booted\"}");

  struct libpax_config_t config;
  libpax_default_config(&config);
  
  // Explicitly enable WiFi and BLE sniffing
  config.wificounter = 1;
  config.blecounter = 1;
  
  libpax_update_config(&config);
  
  libpax_counter_init(process_count, &count_data, 60, 0);
  libpax_counter_start();
}

void loop() {
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, input);
    
    if (!error) {
      if (doc.containsKey("cmd")) {
        String cmd = doc["cmd"].as<String>();
        
        if (cmd == "set_rssi") {
          struct libpax_config_t config;
          libpax_get_current_config(&config);
          
          if (doc.containsKey("wifi")) {
            config.wifi_rssi_threshold = doc["wifi"].as<int>();
          }
          if (doc.containsKey("ble")) {
            config.ble_rssi_threshold = doc["ble"].as<int>();
          }
          
          libpax_update_config(&config);
          
          StaticJsonDocument<100> ack;
          ack["type"] = "status";
          ack["msg"] = "config updated";
          serializeJson(ack, Serial);
          Serial.println();
        }
      }
    }
  }
  
  delay(10); 
}
