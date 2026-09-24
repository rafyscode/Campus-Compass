#!/bin/bash

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST_DIR="$PROJECT_DIR/host"
SERVICE_NAME="paxcounter"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

echo "=========================================="
echo "      Raspberry Pi Zero Setup Script      "
echo "=========================================="

echo "[*] Ensuring required system packages are installed..."
sudo apt-get update
sudo apt-get install -y python3-venv python3-pip

echo "[*] Setting up Python virtual environment..."
cd "$HOST_DIR" || exit
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "[*] Installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt
deactivate

echo "[*] Generating Systemd service file..."
cat <<EOF | sudo tee "$SERVICE_FILE" > /dev/null
[Unit]
Description=PaxCounter Host Gateway Daemon
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOST_DIR
ExecStart=$HOST_DIR/venv/bin/python $HOST_DIR/host_gateway.py
Restart=always
RestartSec=10
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
EOF

echo "[*] Reloading systemd daemon..."
sudo systemctl daemon-reload

echo "[*] Enabling and starting the service..."
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl start "$SERVICE_NAME"

echo "[+] Success! The gateway is now running in the background."
echo "    You can check the logs anytime using: journalctl -u $SERVICE_NAME -f"
