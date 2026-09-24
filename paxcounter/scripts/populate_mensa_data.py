#!/usr/bin/env python3
"""
scripts/populate_mensa_data.py

Simulates realistic crowd telemetry for the University Mensa and populates
the Supabase database with two weeks (or custom duration) of data.

Schedule and Behavior Modeled:
- Baseline: ~40 static installed devices (WiFi APs, IoT screens, vending machines, etc.)
  active 24/7 with subtle random packet/beacon fluctuations.
- Morgenmensa (Mon - Fri): 07:30 - 10:30 (Breakfast & coffee surge, peak ~75 - 110)
- Mittagsmensa (Mon - Sat): 11:20 - 14:20 (Main lunch rush: Mon-Fri peak ~220 - 380, Sat peak ~80 - 140)
- Abendmensa (Mon - Thu): 15:30 - 19:00 (Dinner crowd, peak ~90 - 160; closed Fri - Sun)
- Non-meal hours: Building remains open for studying/lounge until 22:00 (~50 - 80 devices)
- Night (22:00 - 07:00): Building closed, returns to ~40 baseline
- Sunday: Closed all day (baseline ~40 devices only)
- Sensor Artifacts: Autoregressive noise (AR-1), minute-to-minute jitter, probe randomization.

Supports:
  - Batch population of 14 days (in chunks of 500 rows)
  - Dry-run verification (--dry-run)
  - Live continuous emulation (--live)
"""

import argparse
import datetime
import json
import logging
import math
import os
import random
import sys
import time
from typing import Dict, List, Tuple

try:
    import zoneinfo
except ImportError:
    zoneinfo = None

try:
    import requests
except ImportError:
    requests = None

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def load_config(path: str = "host/config.json") -> Dict:
    """Load configuration from config.json if present."""
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def calculate_mensa_occupancy(
    dt: datetime.datetime,
    prev_noise: float = 0.0,
    max_capacity: int = 400,
    tz_name: str = "Europe/Berlin",
) -> Tuple[int, int, int, float]:
    """
    Calculate realistic Uni Mensa sensor counts for a given timestamp.
    Evaluates operating schedule based on local timezone (Europe/Berlin).
    
    Returns:
        (wifi_count, ble_count, pax_count, next_noise)
    """
    if zoneinfo is not None and dt.tzinfo is not None:
        try:
            local_tz = zoneinfo.ZoneInfo(tz_name)
            local_dt = dt.astimezone(local_tz)
        except Exception:
            local_dt = dt
    else:
        local_dt = dt

    weekday = local_dt.weekday()  # 0: Mon, 1: Tue, ..., 5: Sat, 6: Sun
    hour_float = local_dt.hour + local_dt.minute / 60.0 + local_dt.second / 3600.0

    # 1. Baseline static devices (always present, ~40 devices)
    baseline = 40.0 + random.gauss(0.0, 2.2)

    # 2. Human crowd additions
    crowd = 0.0

    if weekday == 6:
        # Sunday: Closed all day
        crowd = 0.0
    else:
        # Open schedule (Mon - Sat)
        if 7.0 <= hour_float < 22.0:
            # Day-specific crowd modifier (Wed/Thu slightly busier, Mon/Fri slightly lighter)
            day_multiplier = {
                0: 0.95,  # Monday
                1: 1.05,  # Tuesday
                2: 1.10,  # Wednesday
                3: 1.05,  # Thursday
                4: 0.85,  # Friday (campus thins out in the afternoon)
                5: 0.45,  # Saturday (only weekend workshops / library goers)
            }.get(weekday, 1.0)

            # A. Morgenmensa (Mon - Fri, 07:30 - 10:30)
            if weekday < 5 and 7.5 <= hour_float <= 10.5:
                # Gaussian curve centered around 08:45 (8.75), sigma = 0.8h
                peak_factor = math.exp(-0.5 * ((hour_float - 8.75) / 0.8) ** 2)
                morning_crowd = (45.0 + random.uniform(-5, 8)) * peak_factor * day_multiplier
                crowd += morning_crowd

            # B. Mittagsmensa (Mon - Sat, 11:20 - 14:20)
            # Center ~ 12:30 (12.5), sigma = 0.75h
            if 11.33 <= hour_float <= 14.33:
                peak_factor = math.exp(-0.5 * ((hour_float - 12.45) / 0.72) ** 2)
                # Weekdays reach peak crowd around 200 - 300 above baseline; Saturday ~ 60 - 90
                base_peak = 250.0 if weekday < 5 else 75.0
                lunch_crowd = (base_peak + random.uniform(-20, 30)) * peak_factor * day_multiplier
                crowd += lunch_crowd

            # C. Abendmensa (Mon - Thu, 15:30 - 19:00)
            if weekday < 4 and 15.5 <= hour_float <= 19.0:
                # Center around 17:15 (17.25), sigma = 0.9h
                peak_factor = math.exp(-0.5 * ((hour_float - 17.25) / 0.9) ** 2)
                dinner_crowd = (75.0 + random.uniform(-10, 15)) * peak_factor * day_multiplier
                crowd += dinner_crowd

            # D. Background Study & Lounge Occupancy (Between meals / late evening)
            # Students studying, chatting, buying coffee from vending machines
            study_crowd = 0.0
            if 7.0 <= hour_float < 11.33:
                study_crowd = 12.0 * day_multiplier
            elif 14.33 <= hour_float < 15.5:
                study_crowd = 35.0 * day_multiplier
            elif 15.5 <= hour_float < 19.0 and weekday >= 4:
                # Friday/Sat afternoon/evening study (no dinner counter open)
                study_crowd = 18.0 * day_multiplier
            elif 19.0 <= hour_float < 22.0:
                # Tapering evening study crowd until 22:00
                taper = (22.0 - hour_float) / 3.0
                study_crowd = 25.0 * taper * day_multiplier

            crowd += study_crowd

    # 3. Short-term correlation noise (Autoregressive AR-1 process)
    # Models temporary clusters (lecture finishing, group arrival/departure)
    phi = 0.72  # Persistence of noise between samples
    shock = random.gauss(0.0, 4.0 if crowd > 20 else 1.5)
    next_noise = phi * prev_noise + shock

    # Total estimated device count
    total_raw = baseline + crowd + next_noise

    # Detection logic fluctuation (libpax detects probe packets; devices enter/exit power-save)
    rf_jitter = random.uniform(-0.06, 0.06) * total_raw
    final_pax = max(0, min(max_capacity, int(round(total_raw + rf_jitter))))

    # Synthesize WiFi vs BLE subcomponents for raw sensor realism
    # BLE typically ~ 40-50% of devices, WiFi ~ 60-70% (with overlap)
    wifi_count = int(round(final_pax * random.uniform(0.65, 0.85)))
    ble_count = int(round(final_pax * random.uniform(0.40, 0.60)))

    return wifi_count, ble_count, final_pax, next_noise


def ensure_location_exists(
    supabase_url: str,
    headers: Dict,
    location_id: str,
    location_name: str,
    max_capacity: int,
    lat: float,
    lon: float,
) -> None:
    """Ensure location exists in Supabase locations table."""
    url = f"{supabase_url}/rest/v1/locations"
    query_url = f"{url}?id=eq.{location_id}"

    try:
        r = requests.get(query_url, headers=headers)
        r.raise_for_status()
        data = r.json()
        if not data:
            logging.info(f"Location '{location_id}' does not exist. Creating it...")
            payload = {
                "id": location_id,
                "name": location_name,
                "max_capacity": max_capacity,
                "lat": lat,
                "lon": lon,
            }
            post_r = requests.post(url, headers=headers, json=payload)
            post_r.raise_for_status()
            logging.info(f"Location '{location_id}' created successfully.")
        else:
            logging.info(f"Location '{location_id}' already exists: {data[0]['name']}")
    except Exception as e:
        logging.error(f"Failed to check/create location: {e}")
        raise


def clear_existing_logs(supabase_url: str, headers: Dict, location_id: str) -> None:
    """Delete all previous occupancy logs for a given location."""
    url = f"{supabase_url}/rest/v1/occupancy_logs?location_id=eq.{location_id}"
    logging.warning(f"Deleting existing logs for location '{location_id}'...")
    r = requests.delete(url, headers=headers)
    r.raise_for_status()
    logging.info(f"Cleared existing logs for location '{location_id}'.")


def clear_all_logs(supabase_url: str, headers: Dict) -> None:
    """Delete all occupancy logs across all locations."""
    url = f"{supabase_url}/rest/v1/occupancy_logs?device_count=gte.0"
    logging.warning("Deleting all occupancy logs across all locations...")
    r = requests.delete(url, headers=headers)
    r.raise_for_status()
    logging.info("All occupancy logs cleared successfully.")


def parse_start_date(val: str, tz_name: str = "Europe/Berlin") -> datetime.datetime:
    """Parse start date string like '2026-07-06' or 'july 6th' into timezone-aware datetime."""
    import re
    if zoneinfo is not None:
        tz = zoneinfo.ZoneInfo(tz_name)
    else:
        tz = datetime.timezone.utc

    val_clean = val.strip().lower()

    # Try ISO date / datetime formats
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y/%m/%d"):
        try:
            dt = datetime.datetime.strptime(val.strip(), fmt)
            return dt.replace(tzinfo=tz)
        except ValueError:
            pass

    # Try month names: 'july 6', 'july 6th', '6 july'
    clean = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", val_clean)
    for fmt in ("%B %d", "%b %d", "%d %B", "%d %b", "%B %d %Y", "%b %d %Y"):
        try:
            dt = datetime.datetime.strptime(clean.strip(), fmt)
            if dt.year == 1900:
                dt = dt.replace(year=2026)
            return dt.replace(tzinfo=tz)
        except ValueError:
            pass

    raise ValueError(
        f"Unable to parse start date '{val}'. Please use 'YYYY-MM-DD' (e.g. '2026-07-06') or 'July 6th'."
    )


def generate_timeseries(
    days: int = 14,
    interval_minutes: int = 3,
    start_time: datetime.datetime = None,
    end_time: datetime.datetime = None,
    max_capacity: int = 400,
    tz_name: str = "Europe/Berlin",
) -> List[Tuple[datetime.datetime, int]]:
    """
    Generate a time series of (timestamp, device_count) for the specified period.
    If start_time is given, generates forwards for `days`.
    Otherwise, generates backwards from `end_time` (or now).
    """
    total_seconds_step = interval_minutes * 60

    if start_time is not None:
        start_dt = start_time
        end_dt = start_dt + datetime.timedelta(days=days)
    else:
        if end_time is None:
            end_time = datetime.datetime.now(datetime.timezone.utc)
        aligned_timestamp = int(end_time.timestamp() // total_seconds_step) * total_seconds_step
        end_dt = datetime.datetime.fromtimestamp(aligned_timestamp, datetime.timezone.utc)
        start_dt = end_dt - datetime.timedelta(days=days)

    current_dt = start_dt
    records = []
    noise = 0.0

    while current_dt <= end_dt:
        # Simulate sensor 60s sampling aggregated over interval_minutes
        readings = []
        for offset_sec in range(0, interval_minutes * 60, 60):
            sample_time = current_dt + datetime.timedelta(seconds=offset_sec)
            _, _, pax, noise = calculate_mensa_occupancy(
                sample_time, prev_noise=noise, max_capacity=max_capacity, tz_name=tz_name
            )
            readings.append(pax)

        mean_count = int(round(sum(readings) / len(readings)))
        records.append((current_dt, mean_count))
        current_dt += datetime.timedelta(minutes=interval_minutes)

    return records


def upload_in_batches(
    supabase_url: str,
    headers: Dict,
    location_id: str,
    records: List[Tuple[datetime.datetime, int]],
    batch_size: int = 500,
) -> None:
    """Upload records to Supabase in batches."""
    url = f"{supabase_url}/rest/v1/occupancy_logs"
    total_records = len(records)
    logging.info(f"Uploading {total_records} records to Supabase in chunks of {batch_size}...")

    for i in range(0, total_records, batch_size):
        chunk = records[i : i + batch_size]
        payload = [
            {
                "location_id": location_id,
                "device_count": count,
                "created_at": dt.isoformat(),
            }
            for dt, count in chunk
        ]

        retries = 3
        while retries > 0:
            try:
                r = requests.post(
                    url,
                    headers={**headers, "Prefer": "return=minimal"},
                    json=payload,
                    timeout=20,
                )
                r.raise_for_status()
                break
            except Exception as e:
                retries -= 1
                logging.warning(f"Batch {i // batch_size + 1} failed: {e}. Retrying ({retries} left)...")
                time.sleep(2)
                if retries == 0:
                    logging.error("Max retries exceeded for batch. Aborting.")
                    raise

        progress = min(100.0, (i + len(chunk)) / total_records * 100)
        logging.info(f"Progress: {i + len(chunk)}/{total_records} ({progress:.1f}%) uploaded.")

    logging.info("Upload complete!")


def run_live_simulation(
    supabase_url: str,
    headers: Dict,
    location_id: str,
    aggregation_minutes: int = 3,
    max_capacity: int = 400,
    tz_name: str = "Europe/Berlin",
) -> None:
    """
    Run continuous live simulation emulating the ESP32 sensor outputting
    telemetry over Serial every 60 seconds and posting 3-minute aggregated records.
    """
    logging.info(f"Starting continuous live simulation for '{location_id}'...")
    logging.info(f"Emulating 60s ESP32 serial output and {aggregation_minutes}-min host aggregation.")

    readings = []
    noise = 0.0
    uptime_s = 0
    last_post_time = time.time()

    print('{"type": "status", "msg": "PaxCounter Booted"}', flush=True)

    try:
        while True:
            now = datetime.datetime.now(datetime.timezone.utc)
            uptime_s += 60

            wifi, ble, pax, noise = calculate_mensa_occupancy(
                now, prev_noise=noise, max_capacity=max_capacity, tz_name=tz_name
            )
            readings.append(pax)

            # Emulate sensor serial JSON
            serial_msg = {
                "type": "count",
                "wifi": wifi,
                "ble": ble,
                "pax": pax,
                "uptime_s": uptime_s,
            }
            print(json.dumps(serial_msg), flush=True)

            # Host aggregation check
            current_time = time.time()
            if current_time - last_post_time >= (aggregation_minutes * 60):
                if readings and supabase_url and headers:
                    avg_count = int(round(sum(readings) / len(readings)))
                    payload = {
                        "location_id": location_id,
                        "device_count": avg_count,
                        "created_at": now.isoformat(),
                    }
                    try:
                        r = requests.post(
                            f"{supabase_url}/rest/v1/occupancy_logs",
                            headers=headers,
                            json=payload,
                            timeout=10,
                        )
                        r.raise_for_status()
                        logging.info(f"Host posted aggregated count {avg_count} to Supabase.")
                    except Exception as e:
                        logging.error(f"Error posting log to Supabase: {e}")
                readings.clear()
                last_post_time = current_time

            time.sleep(1)  # 1 second loop in live mode (or 60s in real-time)
    except KeyboardInterrupt:
        logging.info("Live simulation stopped by user.")


def main():
    parser = argparse.ArgumentParser(
        description="Populate Supabase with 2 weeks of realistic Uni Mensa sensor data."
    )
    parser.add_argument(
        "--days",
        type=int,
        default=14,
        help="Number of days to simulate (default: 14).",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=3,
        help="Log aggregation interval in minutes (default: 3).",
    )
    parser.add_argument(
        "--location-id",
        type=str,
        default="mensa_main",
        help="Location ID in database (default: 'mensa_main').",
    )
    parser.add_argument(
        "--location-name",
        type=str,
        default="Leuphana Uni Mensa",
        help="Location Name if creating (default: 'Leuphana Uni Mensa').",
    )
    parser.add_argument(
        "--max-capacity",
        type=int,
        default=400,
        help="Max seating capacity of the Mensa (default: 400).",
    )
    parser.add_argument(
        "--clear-existing",
        action="store_true",
        help="Delete existing logs for this location before inserting.",
    )
    parser.add_argument(
        "--clear-all",
        action="store_true",
        help="Delete ALL occupancy logs across all locations before inserting.",
    )
    parser.add_argument(
        "--start-date",
        type=str,
        default=None,
        help="Start date for simulation, e.g. '2026-07-06' or 'July 6th'. Defaults to now - days.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Generate and inspect statistics without uploading to Supabase.",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Run in live continuous emulation mode.",
    )
    parser.add_argument(
        "--config",
        type=str,
        default="host/config.json",
        help="Path to config.json (default: host/config.json).",
    )
    parser.add_argument(
        "--timezone",
        type=str,
        default="Europe/Berlin",
        help="Local timezone for Mensa schedules (default: Europe/Berlin).",
    )

    args = parser.parse_args()

    start_dt = None
    if args.start_date:
        start_dt = parse_start_date(args.start_date, args.timezone)
        logging.info(f"Using custom start date: {start_dt.strftime('%Y-%m-%d %H:%M:%S %Z')}")

    config = load_config(args.config)
    supabase_url = config.get("SUPABASE_URL", "")
    service_key = config.get("SUPABASE_SERVICE_KEY", "")

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }

    if args.dry_run:
        logging.info("=== DRY RUN MODE ACTIVATED ===")
        logging.info(f"Simulating {args.days} days with {args.interval}-minute cadence (Timezone: {args.timezone})...")
        records = generate_timeseries(
            days=args.days,
            interval_minutes=args.interval,
            start_time=start_dt,
            max_capacity=args.max_capacity,
            tz_name=args.timezone,
        )

        counts = [c for _, c in records]
        logging.info(f"Total points generated: {len(records)}")
        logging.info(f"Min device count: {min(counts)}")
        logging.info(f"Max device count: {max(counts)}")
        logging.info(f"Average device count: {sum(counts) / len(counts):.2f}")

        # Sample inspection across key times
        logging.info("\n--- Sample Generated Data Points ---")
        import zoneinfo
        local_tz = zoneinfo.ZoneInfo(args.timezone)
        for dt, count in records[:: len(records) // 15]:
            local_dt = dt.astimezone(local_tz)
            dow = local_dt.strftime("%a")
            t_local = local_dt.strftime("%Y-%m-%d %H:%M %Z")
            t_utc = dt.astimezone(datetime.timezone.utc).strftime("%H:%M UTC")
            logging.info(f"{t_local} ({dow}, {t_utc}): {count} devices")

        return

    if not supabase_url or not service_key:
        logging.error("Supabase URL and Service Key required in host/config.json.")
        sys.exit(1)

    if args.live:
        ensure_location_exists(
            supabase_url,
            headers,
            args.location_id,
            args.location_name,
            args.max_capacity,
            lat=53.2285,
            lon=10.4014,
        )
        run_live_simulation(
            supabase_url,
            headers,
            args.location_id,
            aggregation_minutes=args.interval,
            max_capacity=args.max_capacity,
            tz_name=args.timezone,
        )
        return

    # Backfill mode
    logging.info(f"Generating {args.days} days of realistic telemetry (3-min cadence, Timezone: {args.timezone})...")
    records = generate_timeseries(
        days=args.days,
        interval_minutes=args.interval,
        start_time=start_dt,
        max_capacity=args.max_capacity,
        tz_name=args.timezone,
    )

    counts = [c for _, c in records]
    logging.info(
        f"Generated {len(records)} points. Min: {min(counts)}, Max: {max(counts)}, Mean: {sum(counts)/len(counts):.1f}"
    )

    # Step 1: Ensure location exists
    ensure_location_exists(
        supabase_url,
        headers,
        args.location_id,
        args.location_name,
        args.max_capacity,
        lat=53.2285,
        lon=10.4014,
    )

    # Step 2: Clear logs if requested
    if args.clear_all:
        clear_all_logs(supabase_url, headers)
    elif args.clear_existing:
        clear_existing_logs(supabase_url, headers, args.location_id)

    # Step 3: Upload batch records
    upload_in_batches(
        supabase_url=supabase_url,
        headers=headers,
        location_id=args.location_id,
        records=records,
        batch_size=500,
    )

    logging.info("All two-week Mensa telemetry has been populated successfully!")


if __name__ == "__main__":
    main()
