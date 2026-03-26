-- ═══════════════════════════════════════════════════════════════════════════════
-- LoyalRun — Initial Schema Migration
-- Requires: PostGIS extension, UUID extension
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ─── Enable Row Level Security ────────────────────────────────────────────────
-- All tables use RLS; policies defined at the bottom.

-- ─── CLUBS ────────────────────────────────────────────────────────────────────

CREATE TABLE clubs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  sport_type   TEXT NOT NULL DEFAULT 'running',
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  theme_config JSONB NOT NULL DEFAULT '{"primary_color":"#6366F1","secondary_color":"#A78BFA"}',
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_clubs_slug ON clubs(slug);
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES (extends auth.users) ───────────────────────────────────────────

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url   TEXT,
  total_xp     INTEGER NOT NULL DEFAULT 0,
  level        INTEGER NOT NULL DEFAULT 1,
  preferences  JSONB NOT NULL DEFAULT '{"units":"km","notifications_enabled":true,"privacy_mode":"club_only"}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuario'));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── CLUB MEMBERS ─────────────────────────────────────────────────────────────

CREATE TABLE club_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  club_id   UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  club_xp   INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);
CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_members_user ON club_members(user_id);
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- ─── ACTIVITIES ───────────────────────────────────────────────────────────────

CREATE TABLE activities (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  club_id             UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  type                TEXT NOT NULL DEFAULT 'running',
  status              TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('active','paused','completed','syncing')),
  distance_km         NUMERIC(8,3) NOT NULL DEFAULT 0,
  duration_s          INTEGER NOT NULL DEFAULT 0,
  avg_pace_s_per_km   INTEGER NOT NULL DEFAULT 0,
  elevation_gain_m    NUMERIC(6,1) NOT NULL DEFAULT 0,
  xp_earned           INTEGER NOT NULL DEFAULT 0,
  route_points        JSONB,                    -- Array of {lat, lon, alt, ts}
  route_line          GEOMETRY(LineString, 4326), -- PostGIS for spatial queries
  started_at          TIMESTAMPTZ NOT NULL,
  ended_at            TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activities_user ON activities(user_id, started_at DESC);
CREATE INDEX idx_activities_club ON activities(club_id, started_at DESC);
CREATE INDEX idx_activities_route ON activities USING GIST(route_line);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ─── CHALLENGES ───────────────────────────────────────────────────────────────

CREATE TABLE challenges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('distance','duration','frequency','speed')),
  criteria          JSONB NOT NULL,  -- {target_value, unit, period?}
  xp_reward         INTEGER NOT NULL DEFAULT 0,
  badge_reward_id   UUID,
  participant_count INTEGER NOT NULL DEFAULT 0,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_challenges_club ON challenges(club_id, ends_at);
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- ─── BADGES ───────────────────────────────────────────────────────────────────

CREATE TABLE badges (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  icon_url         TEXT NOT NULL,
  tier             TEXT NOT NULL CHECK (tier IN ('bronze','silver','gold','platinum')),
  trigger_type     TEXT NOT NULL CHECK (trigger_type IN ('distance_total','streak','challenge_complete','first_activity','speed')),
  trigger_criteria JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE badge_awards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE badge_awards ENABLE ROW LEVEL SECURITY;

-- ─── BUSINESSES ───────────────────────────────────────────────────────────────

CREATE TABLE businesses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  logo_url    TEXT,
  address     TEXT NOT NULL,
  location    GEOMETRY(Point, 4326) NOT NULL, -- PostGIS point for proximity queries
  webhook_url TEXT,
  api_key     TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- ─── BUSINESS OFFERS ─────────────────────────────────────────────────────────

CREATE TABLE business_offers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id       UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  club_id           UUID REFERENCES clubs(id) ON DELETE CASCADE, -- NULL = global
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  points_cost       INTEGER,
  xp_cost           INTEGER,
  discount_value    NUMERIC(8,2) NOT NULL,
  discount_type     TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  redemption_limit  INTEGER,
  times_redeemed    INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_offers_club ON business_offers(club_id, expires_at) WHERE is_active = true;
ALTER TABLE business_offers ENABLE ROW LEVEL SECURITY;

-- ─── REWARD TRANSACTIONS ─────────────────────────────────────────────────────

CREATE TABLE reward_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offer_id    UUID NOT NULL REFERENCES business_offers(id) ON DELETE CASCADE,
  qr_code     TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','redeemed','expired','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes',
  redeemed_at TIMESTAMPTZ
);
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Increment user XP and update level
CREATE OR REPLACE FUNCTION increment_user_xp(p_user_id UUID, p_xp INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE profiles SET total_xp = total_xp + p_xp WHERE id = p_user_id
  RETURNING total_xp INTO new_xp;

  -- Update level based on XP thresholds
  SELECT CASE
    WHEN new_xp >= 35000 THEN 8
    WHEN new_xp >= 22000 THEN 7
    WHEN new_xp >= 13000 THEN 6
    WHEN new_xp >= 7000  THEN 5
    WHEN new_xp >= 3500  THEN 4
    WHEN new_xp >= 1500  THEN 3
    WHEN new_xp >= 500   THEN 2
    ELSE 1
  END INTO new_level;

  UPDATE profiles SET level = new_level WHERE id = p_user_id;
END;
$$;

-- Increment club member XP
CREATE OR REPLACE FUNCTION increment_member_xp(p_user_id UUID, p_club_id UUID, p_xp INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE club_members SET club_xp = club_xp + p_xp
  WHERE user_id = p_user_id AND club_id = p_club_id;
END;
$$;

-- Get user stats for badge evaluation
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE(total_distance_km NUMERIC, total_activities BIGINT, current_streak INTEGER)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(a.distance_km), 0) AS total_distance_km,
    COUNT(*) AS total_activities,
    (
      SELECT COUNT(DISTINCT date_trunc('day', started_at))::INTEGER
      FROM activities
      WHERE user_id = p_user_id
        AND status = 'completed'
        AND started_at >= NOW() - INTERVAL '30 days'
    ) AS current_streak
  FROM activities a
  WHERE a.user_id = p_user_id AND a.status = 'completed';
END;
$$;

-- Club leaderboard
CREATE OR REPLACE FUNCTION get_club_leaderboard(p_club_id UUID, p_period TEXT DEFAULT 'weekly')
RETURNS TABLE(rank BIGINT, user_id UUID, display_name TEXT, avatar_url TEXT, value NUMERIC, unit TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  period_start TIMESTAMPTZ;
BEGIN
  period_start := CASE p_period
    WHEN 'weekly'  THEN date_trunc('week', NOW())
    WHEN 'monthly' THEN date_trunc('month', NOW())
    ELSE '1970-01-01'::TIMESTAMPTZ
  END;

  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(a.distance_km) DESC) AS rank,
    p.id AS user_id,
    p.display_name,
    p.avatar_url,
    COALESCE(SUM(a.distance_km), 0) AS value,
    'km'::TEXT AS unit
  FROM profiles p
  INNER JOIN club_members cm ON cm.user_id = p.id AND cm.club_id = p_club_id
  LEFT JOIN activities a ON a.user_id = p.id
    AND a.club_id = p_club_id
    AND a.status = 'completed'
    AND a.started_at >= period_start
  GROUP BY p.id, p.display_name, p.avatar_url
  ORDER BY value DESC
  LIMIT 50;
END;
$$;

-- Get nearby active offers (geospatial)
CREATE OR REPLACE FUNCTION get_nearby_active_offers(
  p_club_id UUID, p_lat FLOAT, p_lon FLOAT, p_radius_km FLOAT DEFAULT 2.0
)
RETURNS TABLE(id UUID, title TEXT, business_id UUID, webhook_url TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.title, o.business_id, b.webhook_url
  FROM business_offers o
  INNER JOIN businesses b ON b.id = o.business_id
  WHERE (o.club_id = p_club_id OR o.club_id IS NULL)
    AND o.is_active = true
    AND o.expires_at > NOW()
    AND ST_DWithin(
      b.location,
      ST_MakePoint(p_lon, p_lat)::GEOGRAPHY,
      p_radius_km * 1000
    );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Clubs: anyone can read, only owners can write
CREATE POLICY "clubs_select" ON clubs FOR SELECT USING (true);
CREATE POLICY "clubs_insert" ON clubs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "clubs_update" ON clubs FOR UPDATE USING (auth.uid() = owner_id);

-- Profiles: users can read all, only write own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Activities: users read own + club members read club activities
CREATE POLICY "activities_select" ON activities FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.user_id = auth.uid() AND cm.club_id = activities.club_id
    )
  );
CREATE POLICY "activities_insert" ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Club members: read by club members, insert own
CREATE POLICY "club_members_select" ON club_members FOR SELECT USING (true);
CREATE POLICY "club_members_insert" ON club_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Offers: anyone can read active offers
CREATE POLICY "offers_select" ON business_offers FOR SELECT
  USING (is_active = true AND expires_at > NOW());

-- Transactions: only own user
CREATE POLICY "transactions_select" ON reward_transactions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON reward_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Badge awards: read all, system writes
CREATE POLICY "badge_awards_select" ON badge_awards FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA — Default badges
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO badges (name, description, icon_url, tier, trigger_type, trigger_criteria) VALUES
  ('Primera huella', 'Completa tu primera actividad', 'badges/first-step.png', 'bronze', 'first_activity', '{}'),
  ('5K completado', 'Corre 5km en una sola sesión', 'badges/5k.png', 'bronze', 'distance_total', '{"target_km": 5}'),
  ('10K runner', 'Corre 10km en una sola sesión', 'badges/10k.png', 'silver', 'distance_total', '{"target_km": 10}'),
  ('Medio maratonista', 'Completa 21.1km en una sesión', 'badges/half-marathon.png', 'gold', 'distance_total', '{"target_km": 21.1}'),
  ('Racha de fuego', 'Activo 7 días seguidos', 'badges/streak-7.png', 'silver', 'streak', '{"days": 7}'),
  ('Velocista', 'Corre 5km a menos de 5:00/km', 'badges/speedster.png', 'gold', 'speed', '{"max_pace_s_per_km": 300, "min_distance_km": 5}'),
  ('Centenario', 'Acumula 100km totales', 'badges/100km.png', 'platinum', 'distance_total', '{"target_km": 100}');
