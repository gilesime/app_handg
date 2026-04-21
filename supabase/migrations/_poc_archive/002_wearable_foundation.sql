create table if not exists wearable_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null,
  status text not null default 'active',
  external_user_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  scopes jsonb not null default '[]'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wearable_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  connection_id uuid references wearable_connections(id) on delete set null,
  provider text not null,
  device_name text not null,
  device_type text not null,
  manufacturer text,
  model text,
  external_device_id text,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists wearable_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  club_id uuid references clubs(id) on delete set null,
  activity_id uuid references activities(id) on delete set null,
  device_id uuid references wearable_devices(id) on delete set null,
  provider text not null,
  source_session_id text,
  sport_type text not null,
  status text not null default 'completed',
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_km numeric(10,3),
  duration_s integer,
  avg_heart_rate integer,
  max_heart_rate integer,
  calories numeric(10,2),
  elevation_gain_m numeric(10,2),
  route_source text not null default 'phone_gps',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists heart_rate_samples (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references wearable_sessions(id) on delete cascade,
  activity_id uuid references activities(id) on delete set null,
  measured_at timestamptz not null,
  bpm integer not null check (bpm > 0),
  confidence numeric(5,2),
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists session_route_points (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references wearable_sessions(id) on delete cascade,
  activity_id uuid references activities(id) on delete set null,
  sequence_no integer not null,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  altitude numeric(10,2),
  accuracy numeric(10,2),
  speed_mps numeric(10,3),
  recorded_at timestamptz not null
);

create table if not exists wearable_sync_events (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references wearable_connections(id) on delete cascade,
  provider text not null,
  event_type text not null,
  status text not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  error_message text,
  occurred_at timestamptz not null default now()
);
