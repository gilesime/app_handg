export type WearableProvider =
  | 'ble'
  | 'apple_health'
  | 'health_connect'
  | 'garmin'
  | 'polar'
  | 'wear_os'

export type WearableDeviceType =
  | 'chest_strap'
  | 'smart_watch'
  | 'bike_computer'
  | 'phone_sensor'

export type RouteSource = 'phone_gps' | 'wearable_gps' | 'merged'

export interface WearableConnection {
  id: string
  user_id: string
  provider: WearableProvider
  status: 'active' | 'expired' | 'revoked'
  external_user_id?: string
  last_synced_at?: string
}

export interface WearableDevice {
  id: string
  user_id: string
  connection_id?: string
  provider: WearableProvider
  device_name: string
  device_type: WearableDeviceType
  manufacturer?: string
  model?: string
  is_active: boolean
  last_seen_at?: string
}

export interface HeartRateSample {
  measured_at: string
  bpm: number
  confidence?: number
  source: WearableProvider | 'phone_sensor'
}

export interface WearableRoutePoint {
  sequence_no: number
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  speed_mps?: number
  recorded_at: string
}

export interface WearableSessionDraft {
  user_id: string
  club_id?: string
  activity_id?: string
  device_id?: string
  provider: WearableProvider
  source_session_id?: string
  sport_type: string
  started_at: string
  ended_at?: string
  distance_km?: number
  duration_s?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  calories?: number
  elevation_gain_m?: number
  route_source: RouteSource
  payload?: Record<string, unknown>
  heart_rate_samples?: HeartRateSample[]
  route_points?: WearableRoutePoint[]
}
