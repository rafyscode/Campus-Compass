# Supabase / Phase 2

## Setup

1. Create a Supabase project.
2. Apply `migrations/202609130001_initial_schema.sql`.
3. Add `VITE_SUPABASE_URL` and the **anon** key to the frontend environment.
4. Never expose `SUPABASE_SERVICE_ROLE_KEY` to Vite or the browser.
5. Deploy `functions/ingest-sensor` as a Supabase Edge Function.

## Device provisioning

Each Raspberry Pi receives only:

- a public-ish `device_key`
- a long, random, device-specific secret
- the HTTPS ingestion endpoint

Store **only SHA-256(secret)** in `sensor_devices.auth_secret_hash`. The clear secret stays on that device and can be rotated by provisioning a new value and updating `secret_rotated_at`.

Example hash generation:

```bash
printf '%s' 'YOUR_LONG_RANDOM_DEVICE_SECRET' | sha256sum
```

The Edge Function owns the server-side service-role credential through Supabase secrets. The Pi never receives it.

## Ingestion payload

```json
{
  "device_key": "mensa-pi-01",
  "captured_at": "2026-09-13T12:30:00.000Z",
  "occupancy_count": 316,
  "confidence": 0.98,
  "metadata": { "sensor_firmware": "1.0.0" }
}
```

Header: `x-device-secret: <device-specific-secret>`

The function validates authentication, timestamp skew, capacity, input range and a basic per-device request interval. Production can later add a dedicated rate-limit store / gateway without changing the frontend contract.

## Realtime

`occupancy_snapshots` is added to `supabase_realtime`. The frontend subscribes to INSERT events and updates without reload.

## RLS

The public frontend is read-only. Raw ingest and health tables receive no anon/authenticated grants. `sensor_devices.auth_secret_hash` is also excluded from frontend column grants.
