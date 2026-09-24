create extension if not exists pgcrypto;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  capacity integer check (capacity is null or capacity > 0),
  timezone text not null default 'Europe/Berlin',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sensor_devices (
  id uuid primary key default gen_random_uuid(),
  device_key text not null unique,
  name text not null,
  location_id uuid not null references public.locations(id) on delete restrict,
  device_type text not null,
  auth_secret_hash text not null,
  secret_rotated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  status text not null default 'provisioned' check (status in ('provisioned','online','warning','offline','disabled'))
);

create table if not exists public.raw_sensor_events (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.sensor_devices(id) on delete restrict,
  event_type text not null,
  value jsonb not null,
  captured_at timestamptz not null,
  received_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(device_id, event_type, captured_at)
);
create index if not exists raw_sensor_events_device_captured_idx on public.raw_sensor_events(device_id, captured_at desc);

create table if not exists public.occupancy_snapshots (
  id bigint generated always as identity primary key,
  location_id uuid not null references public.locations(id) on delete restrict,
  occupancy_count integer check (occupancy_count is null or occupancy_count >= 0),
  occupancy_percent numeric(5,2) not null check (occupancy_percent between 0 and 100),
  capacity integer not null check (capacity > 0),
  captured_at timestamptz not null,
  received_at timestamptz not null default now(),
  source text not null default 'sensor',
  confidence numeric(5,4) not null default 1 check (confidence between 0 and 1),
  device_id uuid references public.sensor_devices(id) on delete set null,
  unique(device_id, captured_at)
);
create index if not exists occupancy_snapshots_location_time_idx on public.occupancy_snapshots(location_id, captured_at desc);

create table if not exists public.occupancy_aggregates (
  id bigint generated always as identity primary key,
  location_id uuid not null references public.locations(id) on delete restrict,
  bucket_start timestamptz not null,
  interval_minutes integer not null check (interval_minutes > 0),
  avg_occupancy numeric(5,2) not null,
  min_occupancy numeric(5,2) not null,
  max_occupancy numeric(5,2) not null,
  sample_count integer not null check (sample_count >= 0),
  unique(location_id, bucket_start, interval_minutes)
);

create table if not exists public.model_runs (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  model_version text not null unique,
  trained_at timestamptz not null default now(),
  training_start timestamptz not null,
  training_end timestamptz not null,
  metrics jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  artifact_uri text,
  status text not null default 'candidate' check (status in ('candidate','production','retired','failed'))
);

create table if not exists public.forecasts (
  id bigint generated always as identity primary key,
  location_id uuid not null references public.locations(id) on delete restrict,
  generated_at timestamptz not null,
  target_at timestamptz not null,
  horizon_minutes integer not null check (horizon_minutes > 0),
  predicted_occupancy numeric(5,2) not null check (predicted_occupancy between 0 and 100),
  lower_bound numeric(5,2) not null check (lower_bound between 0 and 100),
  upper_bound numeric(5,2) not null check (upper_bound between 0 and 100),
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  model_version text not null references public.model_runs(model_version) on delete restrict,
  created_at timestamptz not null default now(),
  check (lower_bound <= predicted_occupancy and predicted_occupancy <= upper_bound),
  unique(location_id, generated_at, target_at, model_version)
);
create index if not exists forecasts_location_target_idx on public.forecasts(location_id, target_at desc);

create table if not exists public.sensor_health (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.sensor_devices(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  uptime_seconds bigint check (uptime_seconds is null or uptime_seconds >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  battery numeric(5,2),
  temperature numeric(6,2),
  error_code text,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists sensor_health_device_time_idx on public.sensor_health(device_id, recorded_at desc);

alter table public.locations enable row level security;
alter table public.sensor_devices enable row level security;
alter table public.raw_sensor_events enable row level security;
alter table public.occupancy_snapshots enable row level security;
alter table public.occupancy_aggregates enable row level security;
alter table public.model_runs enable row level security;
alter table public.forecasts enable row level security;
alter table public.sensor_health enable row level security;

-- Public dashboard reads. Raw ingest and health writes remain server-side only.
create policy "public read active locations" on public.locations for select using (active = true);
create policy "public read sensor state" on public.sensor_devices for select using (status <> 'disabled');
create policy "public read occupancy snapshots" on public.occupancy_snapshots for select using (true);
create policy "public read occupancy aggregates" on public.occupancy_aggregates for select using (true);
create policy "public read model metadata" on public.model_runs for select using (status in ('production','candidate'));
create policy "public read forecasts" on public.forecasts for select using (true);

revoke all on public.raw_sensor_events from anon, authenticated;
revoke all on public.sensor_health from anon, authenticated;
revoke all on public.sensor_devices from anon, authenticated;
grant select (id, device_key, name, location_id, device_type, created_at, last_seen_at, status) on public.sensor_devices to anon, authenticated;
grant select on public.locations, public.occupancy_snapshots, public.occupancy_aggregates, public.forecasts to anon, authenticated;
revoke all on public.model_runs from anon, authenticated;
grant select (id, model_name, model_version, trained_at, training_start, training_end, metrics, features, status) on public.model_runs to anon, authenticated;

-- Realtime: enable only the table needed by the public UI.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'occupancy_snapshots'
  ) then
    alter publication supabase_realtime add table public.occupancy_snapshots;
  end if;
end $$;

-- Seed only the location definition. It is not a sensor measurement.
insert into public.locations (slug, name, capacity)
values ('mensa-central-campus', 'Mensa · Zentraler Campus', 734)
on conflict (slug) do update set name = excluded.name, capacity = excluded.capacity;
