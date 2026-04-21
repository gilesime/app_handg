-- =============================================================================
-- LoyalRun — DDL completo · Supabase compatible
-- PostgreSQL 16 + PostGIS + pgcrypto
-- Nota: auth.users es gestionado por Supabase Auth — no se crea manualmente.
--       Todas las FKs de usuario apuntan a auth.users(id).
-- =============================================================================

-- Extensiones (ya habilitadas via dashboard, se declaran por idempotencia)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. LEVELS
-- =============================================================================
CREATE TABLE levels (
    id          INT           PRIMARY KEY,
    name        VARCHAR(50)   NOT NULL,
    min_xp      INT           NOT NULL,
    max_xp      INT           NOT NULL,
    badge_url   TEXT,
    color_hex   VARCHAR(7)
);

INSERT INTO levels (id, name, min_xp, max_xp, color_hex) VALUES
    (1, 'Principiante',        0,      999,    '#94A3B8'),
    (2, 'Corredor Urbano',     1000,   2999,   '#60A5FA'),
    (3, 'Atleta en Forma',     3000,   5999,   '#34D399'),
    (4, 'Maratonista Amateur', 6000,   9999,   '#FBBF24'),
    (5, 'Competidor',          10000,  14999,  '#F97316'),
    (6, 'Elite Local',         15000,  24999,  '#EF4444'),
    (7, 'Campeon Regional',    25000,  49999,  '#A78BFA'),
    (8, 'Leyenda',             50000,  9999999,'#F59E0B');

-- =============================================================================
-- 2. USER_PROFILES  (extiende auth.users — relación 1:1)
-- =============================================================================
CREATE TABLE user_profiles (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID          NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username            VARCHAR(50)   NOT NULL UNIQUE,
    full_name           VARCHAR(100),
    avatar_url          TEXT,
    birth_date          DATE,
    gender              VARCHAR(10)   CHECK (gender IN ('male','female','other','prefer_not')),
    weight_kg           NUMERIC(5,2),
    height_cm           NUMERIC(5,2),
    fitness_level       VARCHAR(20)   CHECK (fitness_level IN ('beginner','intermediate','advanced','elite')),
    weekly_goal_km      NUMERIC(6,2),
    xp_total            INT           NOT NULL DEFAULT 0,
    level_id            INT           REFERENCES levels(id),
    subscription_tier   VARCHAR(20)   NOT NULL DEFAULT 'free'
                                      CHECK (subscription_tier IN ('free','premium')),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_profiles_username ON user_profiles (username);
CREATE INDEX        idx_profiles_xp       ON user_profiles (xp_total DESC);

-- Trigger: auto-crear perfil al registrarse un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, username, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 3. SUBSCRIPTIONS
-- =============================================================================
CREATE TABLE subscriptions (
    id                          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID          NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    tier                        VARCHAR(20)   NOT NULL DEFAULT 'free'
                                              CHECK (tier IN ('free','premium')),
    provider                    VARCHAR(20)   CHECK (provider IN ('revenuecat','promo','manual')),
    provider_subscription_id    VARCHAR(200),
    started_at                  TIMESTAMPTZ,
    expires_at                  TIMESTAMPTZ,
    auto_renew                  BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ
);

CREATE INDEX idx_subscriptions_expiry ON subscriptions (expires_at)
    WHERE expires_at IS NOT NULL;

-- =============================================================================
-- 4. XP_TRANSACTIONS
-- =============================================================================
CREATE TABLE xp_transactions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount          INT           NOT NULL,
    type            VARCHAR(50)   NOT NULL
                                  CHECK (type IN ('activity_complete','badge_earned',
                                                  'challenge_win','referral','manual')),
    reference_id    UUID,
    reference_type  VARCHAR(50),
    description     TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_user_date ON xp_transactions (user_id, created_at DESC);

-- =============================================================================
-- 5. WALLET_TRANSACTIONS
-- =============================================================================
CREATE TABLE wallet_transactions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount          NUMERIC(10,2)   NOT NULL,
    currency        VARCHAR(10)     NOT NULL DEFAULT 'points',
    type            VARCHAR(20)     NOT NULL
                                    CHECK (type IN ('earn','redeem','expire','refund')),
    reference_id    UUID,
    reference_type  VARCHAR(50),
    balance_after   NUMERIC(10,2)   NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_user_date ON wallet_transactions (user_id, created_at DESC);

-- =============================================================================
-- 6. REFERRALS
-- =============================================================================
CREATE TABLE referrals (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code       VARCHAR(20)   NOT NULL UNIQUE,
    status              VARCHAR(20)   NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending','completed','rewarded')),
    reward_granted_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals (referrer_id);

-- =============================================================================
-- 7. WEARABLES
-- =============================================================================
CREATE TABLE wearables (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name     VARCHAR(100)  NOT NULL,
    device_type     VARCHAR(50)   NOT NULL
                                  CHECK (device_type IN ('smartwatch','band','hrm','footpod','phone')),
    brand           VARCHAR(50),
    model           VARCHAR(100),
    ble_mac_address VARCHAR(17),
    is_primary      BOOLEAN       NOT NULL DEFAULT FALSE,
    last_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wearables_user ON wearables (user_id);

-- =============================================================================
-- 8. ROUTES
-- =============================================================================
CREATE TABLE routes (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by       UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
    name             VARCHAR(100),
    description      TEXT,
    distance_km      NUMERIC(8,3),
    elevation_gain_m NUMERIC(8,2),
    difficulty       VARCHAR(20)   CHECK (difficulty IN ('easy','moderate','hard')),
    surface_type     VARCHAR(50),
    is_circular      BOOLEAN       NOT NULL DEFAULT FALSE,
    is_surprise      BOOLEAN       NOT NULL DEFAULT FALSE,
    start_point      extensions.geometry(Point, 4326),
    route_geometry   extensions.geometry(LineString, 4326),
    polyline_encoded TEXT,
    ai_description   TEXT,
    source           VARCHAR(20)   NOT NULL
                                   CHECK (source IN ('user','ai','ors')),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routes_start ON routes USING GIST (start_point);
CREATE INDEX idx_routes_geom  ON routes USING GIST (route_geometry);

-- =============================================================================
-- 9. ACTIVITIES  (particionada por año)
-- =============================================================================
CREATE TABLE activities (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type    VARCHAR(20)   NOT NULL
                                   CHECK (activity_type IN ('run','walk','cycling','trail')),
    started_at       TIMESTAMPTZ   NOT NULL,
    ended_at         TIMESTAMPTZ,
    duration_seconds INT,
    distance_km      NUMERIC(8,3),
    avg_pace_sec_km  INT,
    avg_heart_rate   INT,
    max_heart_rate   INT,
    elevation_gain_m NUMERIC(8,2),
    elevation_loss_m NUMERIC(8,2),
    calories_burned  INT,
    avg_cadence      INT,
    route_id         UUID          REFERENCES routes(id) ON DELETE SET NULL,
    route_geometry   extensions.geometry(LineString, 4326),
    polyline_encoded TEXT,
    xp_earned        INT           NOT NULL DEFAULT 0,
    source           VARCHAR(20)   NOT NULL
                                   CHECK (source IN ('gps','wearable','manual')),
    wearable_id      UUID          REFERENCES wearables(id) ON DELETE SET NULL,
    weather_temp_c   NUMERIC(4,1),
    weather_condition VARCHAR(50),
    notes            TEXT,
    is_public        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (started_at);

CREATE TABLE activities_2025 PARTITION OF activities
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE activities_2026 PARTITION OF activities
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE activities_2027 PARTITION OF activities
    FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

CREATE INDEX idx_activities_user_date ON activities (user_id, started_at DESC);
CREATE INDEX idx_activities_geom      ON activities USING GIST (route_geometry);

-- =============================================================================
-- 10. ACTIVITY_SPLITS
-- =============================================================================
CREATE TABLE activity_splits (
    id               UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id      UUID      NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    km_number        INT       NOT NULL,
    pace_sec_km      INT,
    heart_rate_avg   INT,
    elevation_gain_m NUMERIC(6,2),
    UNIQUE (activity_id, km_number)
);

CREATE INDEX idx_splits_activity ON activity_splits (activity_id, km_number);

-- =============================================================================
-- 11. ACTIVITY_GPS_POINTS
-- =============================================================================
CREATE TABLE activity_gps_points (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID          NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    lat         NUMERIC(10,7) NOT NULL,
    lng         NUMERIC(10,7) NOT NULL,
    elevation_m NUMERIC(8,2),
    speed_mps   NUMERIC(6,3),
    heart_rate  INT,
    sequence    INT           NOT NULL,
    recorded_at TIMESTAMPTZ   NOT NULL,
    UNIQUE (activity_id, sequence)
);

CREATE INDEX idx_gps_activity_seq ON activity_gps_points (activity_id, sequence);

-- =============================================================================
-- 12. TRAINING_PLANS
-- =============================================================================
CREATE TABLE training_plans (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start          DATE          NOT NULL,
    week_end            DATE          NOT NULL,
    goal                TEXT,
    ai_model            VARCHAR(50),
    ai_prompt_tokens    INT,
    ai_response_tokens  INT,
    status              VARCHAR(20)   NOT NULL DEFAULT 'draft'
                                      CHECK (status IN ('draft','active','completed','skipped')),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, week_start)
);

CREATE UNIQUE INDEX idx_training_user_week ON training_plans (user_id, week_start);

-- =============================================================================
-- 13. TRAINING_PLAN_SESSIONS
-- =============================================================================
CREATE TABLE training_plan_sessions (
    id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                 UUID         NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    day_of_week             INT          NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    session_date            DATE,
    session_type            VARCHAR(50)  NOT NULL
                                         CHECK (session_type IN ('easy_run','tempo','intervals',
                                                                 'long_run','rest','cross')),
    distance_km             NUMERIC(6,2),
    duration_min            INT,
    intensity               VARCHAR(20)  CHECK (intensity IN ('low','moderate','high')),
    instructions            TEXT,
    completed_activity_id   UUID         REFERENCES activities(id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_plan ON training_plan_sessions (plan_id);

-- =============================================================================
-- 14. NUTRITION_PLANS
-- =============================================================================
CREATE TABLE nutrition_plans (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start      DATE          NOT NULL,
    week_end        DATE          NOT NULL,
    daily_calories  INT,
    protein_g       NUMERIC(6,2),
    carbs_g         NUMERIC(6,2),
    fat_g           NUMERIC(6,2),
    ai_model        VARCHAR(50),
    status          VARCHAR(20)   NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft','active','completed')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, week_start)
);

CREATE UNIQUE INDEX idx_nutrition_user_week ON nutrition_plans (user_id, week_start);

-- =============================================================================
-- 15. NUTRITION_PLAN_MEALS
-- =============================================================================
CREATE TABLE nutrition_plan_meals (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id     UUID         NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
    day_of_week INT          NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    meal_type   VARCHAR(20)  NOT NULL
                             CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    calories    INT,
    protein_g   NUMERIC(6,2),
    carbs_g     NUMERIC(6,2),
    fat_g       NUMERIC(6,2)
);

CREATE INDEX idx_meals_plan ON nutrition_plan_meals (plan_id);

-- =============================================================================
-- 16. FOOD_PREFERENCES
-- =============================================================================
CREATE TABLE food_preferences (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_type VARCHAR(30)   NOT NULL
                                  CHECK (preference_type IN ('allergy','intolerance','dislike','diet_style')),
    value           VARCHAR(100)  NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_pref_user ON food_preferences (user_id);

-- =============================================================================
-- 17. SLEEP_RECORDS
-- =============================================================================
CREATE TABLE sleep_records (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_date       DATE          NOT NULL,
    duration_minutes INT,
    quality_score    INT           CHECK (quality_score BETWEEN 1 AND 10),
    source           VARCHAR(20)   NOT NULL CHECK (source IN ('manual','wearable')),
    wearable_id      UUID          REFERENCES wearables(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sleep_user_date ON sleep_records (user_id, sleep_date);

-- =============================================================================
-- 18. WEEKLY_RECAPS
-- =============================================================================
CREATE TABLE weekly_recaps (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start              DATE          NOT NULL,
    total_km                NUMERIC(8,3),
    total_activities        INT,
    total_duration_seconds  INT,
    total_xp_earned         INT,
    avg_pace_sec_km         INT,
    best_activity_id        UUID          REFERENCES activities(id) ON DELETE SET NULL,
    ai_summary              TEXT,
    ai_model                VARCHAR(50),
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, week_start)
);

CREATE UNIQUE INDEX idx_recap_user_week ON weekly_recaps (user_id, week_start);

-- =============================================================================
-- 19. BADGES
-- =============================================================================
CREATE TABLE badges (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50)   NOT NULL UNIQUE,
    name            VARCHAR(100)  NOT NULL,
    description     TEXT,
    icon_url        TEXT,
    category        VARCHAR(50)   NOT NULL
                                  CHECK (category IN ('distance','streak','social',
                                                      'challenge','special','nutrition')),
    xp_reward       INT           NOT NULL DEFAULT 0,
    condition_type  VARCHAR(50),
    condition_value JSONB,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_badges_category ON badges (category);

-- =============================================================================
-- 20. USER_BADGES
-- =============================================================================
CREATE TABLE user_badges (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id    UUID          NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    activity_id UUID          REFERENCES activities(id) ON DELETE SET NULL,
    UNIQUE (user_id, badge_id)
);

CREATE UNIQUE INDEX idx_user_badges ON user_badges (user_id, badge_id);

-- =============================================================================
-- 21. CLUBS
-- =============================================================================
CREATE TABLE clubs (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(100)  NOT NULL,
    description  TEXT,
    logo_url     TEXT,
    city         VARCHAR(100),
    country      VARCHAR(100),
    location     extensions.geometry(Point, 4326),
    owner_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    is_public    BOOLEAN       NOT NULL DEFAULT TRUE,
    member_count INT           NOT NULL DEFAULT 0,
    total_km     NUMERIC(12,3) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubs_location ON clubs USING GIST (location);

-- =============================================================================
-- 22. CLUB_MEMBERS
-- =============================================================================
CREATE TABLE club_members (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id          UUID          NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role             VARCHAR(20)   NOT NULL DEFAULT 'member'
                                   CHECK (role IN ('owner','admin','member')),
    joined_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    total_km_in_club NUMERIC(10,3) NOT NULL DEFAULT 0,
    UNIQUE (club_id, user_id)
);

CREATE UNIQUE INDEX idx_club_members ON club_members (club_id, user_id);

-- =============================================================================
-- 23. RUNNING_GROUPS
-- =============================================================================
CREATE TABLE running_groups (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)  NOT NULL,
    description     TEXT,
    min_pace_sec_km INT,
    max_pace_sec_km INT,
    min_distance_km NUMERIC(6,2),
    max_distance_km NUMERIC(6,2),
    created_by      UUID          NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    is_public       BOOLEAN       NOT NULL DEFAULT TRUE,
    member_count    INT           NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 24. GROUP_MEMBERS
-- =============================================================================
CREATE TABLE group_members (
    id        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id  UUID          NOT NULL REFERENCES running_groups(id) ON DELETE CASCADE,
    user_id   UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role      VARCHAR(20)   NOT NULL DEFAULT 'member'
                            CHECK (role IN ('admin','member')),
    joined_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

CREATE UNIQUE INDEX idx_group_members ON group_members (group_id, user_id);

-- =============================================================================
-- 25. CHALLENGES
-- =============================================================================
CREATE TABLE challenges (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(100)  NOT NULL,
    description     TEXT,
    challenge_type  VARCHAR(30)   NOT NULL
                                  CHECK (challenge_type IN ('1v1','group',
                                                            'peleas_gallos','club_vs_club')),
    metric          VARCHAR(30)   NOT NULL
                                  CHECK (metric IN ('distance_km','activities_count','elevation_m')),
    target_value    NUMERIC(10,2),
    start_at        TIMESTAMPTZ   NOT NULL,
    end_at          TIMESTAMPTZ   NOT NULL,
    created_by      UUID          NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    club_id         UUID          REFERENCES clubs(id) ON DELETE SET NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','active','completed','cancelled')),
    winner_id       UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
    xp_reward       INT           NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_challenges_status ON challenges (status, start_at, end_at);

-- =============================================================================
-- 26. CHALLENGE_PARTICIPANTS
-- =============================================================================
CREATE TABLE challenge_participants (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id    UUID          NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    progress_value  NUMERIC(10,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20)   NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active','completed','withdrawn')),
    joined_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (challenge_id, user_id)
);

CREATE UNIQUE INDEX idx_challenge_part ON challenge_participants (challenge_id, user_id);

-- =============================================================================
-- 27. TERRITORIES
-- =============================================================================
CREATE TABLE territories (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    h3_index            VARCHAR(20)   NOT NULL UNIQUE,
    center_point        extensions.geometry(Point, 4326) NOT NULL,
    captured_by         UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
    captured_at         TIMESTAMPTZ,
    capture_activity_id UUID          REFERENCES activities(id) ON DELETE SET NULL,
    previous_owner_id   UUID          REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_territories_h3    ON territories (h3_index);
CREATE INDEX        idx_territories_geom  ON territories USING GIST (center_point);
CREATE INDEX        idx_territories_owner ON territories (captured_by)
    WHERE captured_by IS NOT NULL;

-- =============================================================================
-- 28. BUSINESSES
-- =============================================================================
CREATE TABLE businesses (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100)  NOT NULL,
    description   TEXT,
    logo_url      TEXT,
    category      VARCHAR(50)
                  CHECK (category IN ('running_store','nutrition','gym','restaurant','other')),
    location      extensions.geometry(Point, 4326),
    address       TEXT,
    city          VARCHAR(100),
    country       VARCHAR(100),
    contact_email VARCHAR(255),
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_location ON businesses USING GIST (location);
CREATE INDEX idx_businesses_category ON businesses (category);

-- =============================================================================
-- 29. REWARDS
-- =============================================================================
CREATE TABLE rewards (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title       VARCHAR(100)  NOT NULL,
    description TEXT,
    image_url   TEXT,
    points_cost INT           NOT NULL CHECK (points_cost > 0),
    stock       INT,
    valid_from  TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rewards_business  ON rewards (business_id, is_active);
CREATE INDEX idx_rewards_validity  ON rewards (valid_until)
    WHERE valid_until IS NOT NULL;

-- =============================================================================
-- 30. REWARD_REDEMPTIONS
-- =============================================================================
CREATE TABLE reward_redemptions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id       UUID          NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
    points_spent    INT           NOT NULL,
    redemption_code VARCHAR(50)   NOT NULL UNIQUE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','validated','expired')),
    redeemed_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    validated_at    TIMESTAMPTZ
);

CREATE INDEX idx_redemptions_user ON reward_redemptions (user_id);

-- =============================================================================
-- 31. NOTIFICATIONS
-- =============================================================================
CREATE TABLE notifications (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type       VARCHAR(50)   NOT NULL,
    title      VARCHAR(200)  NOT NULL,
    body       TEXT,
    data       JSONB,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_unread ON notifications (user_id, created_at DESC)
    WHERE read_at IS NULL;

-- =============================================================================
-- 32. RACES
-- =============================================================================
CREATE TABLE races (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(200)  NOT NULL,
    description             TEXT,
    location                extensions.geometry(Point, 4326),
    city                    VARCHAR(100),
    country                 VARCHAR(100),
    race_date               DATE          NOT NULL,
    registration_deadline   DATE,
    distances               JSONB,
    registration_url        TEXT,
    image_url               TEXT,
    organizer               VARCHAR(100),
    is_active               BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_races_location ON races USING GIST (location);
CREATE INDEX idx_races_date     ON races (race_date, country);

-- =============================================================================
-- 33. RACE_ALERTS
-- =============================================================================
CREATE TABLE race_alerts (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    race_id             UUID          NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    alert_days_before   INT           NOT NULL DEFAULT 7,
    notified_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, race_id)
);

CREATE UNIQUE INDEX idx_race_alerts ON race_alerts (user_id, race_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearables              ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_splits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_gps_points    ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plan_meals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_recaps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges            ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_alerts            ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "own_profile"
    ON user_profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_subscription"
    ON subscriptions FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_or_public_activities_select"
    ON activities FOR SELECT USING (user_id = auth.uid() OR is_public = TRUE);
CREATE POLICY "own_activities_write"
    ON activities FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_notifications"
    ON notifications FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_wallet_read"
    ON wallet_transactions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "own_xp_read"
    ON xp_transactions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "own_wearables"
    ON wearables FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_training_plans"
    ON training_plans FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_nutrition_plans"
    ON nutrition_plans FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_food_preferences"
    ON food_preferences FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_sleep_records"
    ON sleep_records FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_weekly_recaps"
    ON weekly_recaps FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_race_alerts"
    ON race_alerts FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own_reward_redemptions"
    ON reward_redemptions FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- updated_at en user_profiles
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sincronizar xp_total desnormalizado
CREATE OR REPLACE FUNCTION sync_xp_total()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE user_profiles
    SET xp_total = xp_total + NEW.amount
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_xp_total
    AFTER INSERT ON xp_transactions
    FOR EACH ROW EXECUTE FUNCTION sync_xp_total();

-- Sincronizar member_count desnormalizado en clubs
CREATE OR REPLACE FUNCTION sync_club_member_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clubs SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.club_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_club_member_count
    AFTER INSERT OR DELETE ON club_members
    FOR EACH ROW EXECUTE FUNCTION sync_club_member_count();

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
