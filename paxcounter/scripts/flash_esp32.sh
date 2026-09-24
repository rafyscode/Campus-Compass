#!/bin/bash

# Configuration
FIRMWARE_DIR="firmware"
PORT="/dev/ttyUSB0"
FQBN="esp32:esp32:esp32"

echo "=========================================="
echo "    PaxCounter ESP32 Firmware Flasher     "
echo "=========================================="

if ! command -v arduino-cli &> /dev/null
then
    echo "[!] arduino-cli could not be found. Please install it first."
    exit 1
fi

echo "[*] Compiling firmware for $FQBN..."
arduino-cli compile --libraries "$FIRMWARE_DIR/lib" --libraries "$FIRMWARE_DIR/lib/libpax/lib" --fqbn "$FQBN" "$FIRMWARE_DIR"
if [ $? -ne 0 ]; then
    echo "[!] Compilation failed."
    exit 1
fi

echo "[*] Uploading firmware to $PORT..."
arduino-cli upload -p "$PORT" --fqbn "$FQBN" "$FIRMWARE_DIR"
if [ $? -ne 0 ]; then
    echo "[!] Upload failed. Check your connection or port permissions."
    exit 1
fi

echo "[+] Success! Firmware flashed to $PORT."
