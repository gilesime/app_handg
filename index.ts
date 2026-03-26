// ─── Core Domain Types ────────────────────────────────────────────────────────

export type SportType = 'running' | 'cycling' | 'walking' | 'swimming' | 'hiking' | string

export interface Club {
  id: string
  name: string
  sport_type: SportType
  slug: string
  description?: string
  theme_config: ClubTheme
  owner_id: string
  member_count: number
  avatar_url?: string
  created_at: string
}

export interface ClubTheme {
  primary_color: string
  secondary_color: string
  logo_url?: string
  cover_url?: string
}

export interface User {
  id: string
  display_name: string
  email: string
  avatar_url?: string
  total_xp: number
  level: number
  preferences: UserPreferences
  created_at: string
}

export interface UserPreferences {
  units: 'km' | 'miles'
  notifications_enabled: boolean
  privacy_mode: 'public' | 'club_only' | 'private'
}

export interface ClubMember {
  id: string
  user_id: string
  club_id: string
  role: 'owner' | 'admin' | 'member'
  club_xp: number
  joined_at: string
  user?: User
}

// ─── Activity Types ───────────────────────────────────────────────────────────

export interface GeoPoint {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  timestamp: number
}

export interface ActivitySegment {
  id: string
  activity_id: string
  start_point: GeoPoint
  end_point: GeoPoint
  distance_m: number
  duration_s: number
  avg_pace_s_per_km: number
  elevation_gain_m: number
}

export interface Activity {
  id: string
  user_id: string
  club_id: string
  type: SportType
  status: 'active' | 'paused' | 'completed' | 'syncing'
  distance_km: number
  duration_s: number
  avg_pace_s_per_km: number
  elevation_gain_m: number
  xp_earned: number
  route_points: GeoPoint[]
  started_at: string
  ended_at?: string
}

export interface LiveActivityState {
  status: 'idle' | 'active' | 'paused'
  elapsed_s: number
  distance_km: number
  current_pace_s_per_km: number
  elevation_gain_m: number
  points: GeoPoint[]
  calories_estimate: number
}

// ─── Gaming / XP Types ────────────────────────────────────────────────────────

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  trigger_type: 'distance_total' | 'streak' | 'challenge_complete' | 'first_activity' | 'speed'
  trigger_criteria: Record<string, unknown>
}

export interface BadgeAward {
  id: string
  user_id: string
  badge_id: string
  activity_id?: string
  awarded_at: string
  badge: Badge
}

export interface Challenge {
  id: string
  club_id: string
  title: string
  description: string
  type: 'distance' | 'duration' | 'frequency' | 'speed'
  criteria: ChallengeCriteria
  xp_reward: number
  badge_reward_id?: string
  starts_at: string
  ends_at: string
  participant_count: number
  completed?: boolean
  progress?: number
}

export interface ChallengeCriteria {
  target_value: number
  unit: string
  period?: 'daily' | 'weekly' | 'monthly' | 'total'
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  display_name: string
  avatar_url?: string
  value: number
  unit: string
}

export type XPLevel = {
  level: number
  min_xp: number
  max_xp: number
  title: string
}

// ─── Business / Rewards Types ─────────────────────────────────────────────────

export interface Business {
  id: string
  name: string
  category: string
  description?: string
  logo_url?: string
  address: string
  latitude: number
  longitude: number
  distance_m?: number
}

export interface BusinessOffer {
  id: string
  business_id: string
  club_id?: string
  title: string
  description: string
  points_cost?: number
  xp_cost?: number
  discount_value: number
  discount_type: 'percentage' | 'fixed'
  expires_at: string
  is_active: boolean
  redemption_limit?: number
  times_redeemed: number
  business: Business
}

export interface RewardTransaction {
  id: string
  user_id: string
  offer_id: string
  qr_code: string
  status: 'pending' | 'redeemed' | 'expired' | 'cancelled'
  created_at: string
  redeemed_at?: string
  offer: BusinessOffer
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  has_more: boolean
}
