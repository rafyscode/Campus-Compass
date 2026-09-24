import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Payload = {
  device_key: string;
  captured_at: string;
  occupancy_count: number;
  confidence?: number;
  event_type?: string;
  metadata?: Record<string, unknown>;
};

const jsonHeaders = { 'content-type': 'application/json; charset=utf-8' };

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return respond(405, { error: 'method_not_allowed' });

  const secret = request.headers.get('x-device-secret')?.trim();
  if (!secret || secret.length < 24 || secret.length > 256) {
    return respond(401, { error: 'invalid_device_secret' });
  }

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return respond(400, { error: 'invalid_json' });
  }

  if (!payload.device_key || !/^[a-zA-Z0-9_-]{3,80}$/.test(payload.device_key)) {
    return respond(400, { error: 'invalid_device_key' });
  }
  if (!Number.isInteger(payload.occupancy_count) || payload.occupancy_count < 0) {
    return respond(400, { error: 'invalid_occupancy_count' });
  }

  const capturedAt = new Date(payload.captured_at);
  if (Number.isNaN(capturedAt.getTime())) return respond(400, { error: 'invalid_captured_at' });
  const skewMs = capturedAt.getTime() - Date.now();
  if (skewMs > 5 * 60_000 || skewMs < -24 * 60 * 60_000) {
    return respond(400, { error: 'captured_at_out_of_range' });
  }

  const confidence = payload.confidence ?? 1;
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    return respond(400, { error: 'invalid_confidence' });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRole) return respond(500, { error: 'server_not_configured' });

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { data: device, error: deviceError } = await supabase
    .from('sensor_devices')
    .select('id, location_id, auth_secret_hash, status')
    .eq('device_key', payload.device_key)
    .maybeSingle();

  if (deviceError) return respond(500, { error: 'device_lookup_failed' });
  if (!device || device.status === 'disabled') return respond(401, { error: 'unknown_or_disabled_device' });
  if (await sha256Hex(secret) !== device.auth_secret_hash) return respond(401, { error: 'authentication_failed' });

  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('capacity')
    .eq('id', device.location_id)
    .single();
  if (locationError || !location) return respond(500, { error: 'location_lookup_failed' });

  const { data: recent } = await supabase
    .from('raw_sensor_events')
    .select('received_at')
    .eq('device_id', device.id)
    .order('received_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent && Date.now() - new Date(recent.received_at).getTime() < 750) {
    return respond(429, { error: 'rate_limited' });
  }

  const capacity = Number(location.capacity ?? 0);
  if (!capacity || payload.occupancy_count > capacity * 1.1) {
    return respond(422, { error: 'count_outside_capacity_range' });
  }

  const percent = Math.min(100, (payload.occupancy_count / capacity) * 100);
  const receivedAt = new Date().toISOString();
  const normalizedCapturedAt = capturedAt.toISOString();
  const eventType = payload.event_type ?? 'occupancy_count';

  const { error: rawError } = await supabase.from('raw_sensor_events').upsert({
    device_id: device.id,
    event_type: eventType,
    value: { occupancy_count: payload.occupancy_count },
    captured_at: normalizedCapturedAt,
    received_at: receivedAt,
    metadata: payload.metadata ?? {},
  }, {
    onConflict: 'device_id,event_type,captured_at',
    ignoreDuplicates: true,
  });
  if (rawError) return respond(500, { error: 'raw_insert_failed' });

  const { error: snapshotError } = await supabase.from('occupancy_snapshots').upsert({
    location_id: device.location_id,
    occupancy_count: payload.occupancy_count,
    occupancy_percent: percent,
    capacity,
    captured_at: normalizedCapturedAt,
    received_at: receivedAt,
    source: 'sensor',
    confidence,
    device_id: device.id,
  }, {
    onConflict: 'device_id,captured_at',
    ignoreDuplicates: true,
  });
  if (snapshotError) return respond(500, { error: 'snapshot_insert_failed' });

  await supabase
    .from('sensor_devices')
    .update({ last_seen_at: receivedAt, status: 'online' })
    .eq('id', device.id);

  return respond(202, {
    accepted: true,
    captured_at: normalizedCapturedAt,
    received_at: receivedAt,
  });
});
