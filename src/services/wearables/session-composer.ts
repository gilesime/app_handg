import type { Club, User } from '@/types'
import type { HeartRateSample, WearableSessionDraft } from '@/types/wearables'

export function composeWearableSessionDraft(params: {
  user: User
  club: Club
  deviceId?: string
  startedAt: string
  endedAt: string
  distanceKm: number
  durationS: number
  elevationGainM: number
  heartRateSamples: HeartRateSample[]
}) {
  const avgHeartRate =
    params.heartRateSamples.length > 0
      ? Math.round(
          params.heartRateSamples.reduce((sum, sample) => sum + sample.bpm, 0) /
            params.heartRateSamples.length
        )
      : undefined

  const maxHeartRate =
    params.heartRateSamples.length > 0
      ? Math.max(...params.heartRateSamples.map((sample) => sample.bpm))
      : undefined

  const session: WearableSessionDraft = {
    user_id: params.user.id,
    club_id: params.club.id,
    device_id: params.deviceId,
    provider: 'ble',
    sport_type: params.club.sport_type,
    started_at: params.startedAt,
    ended_at: params.endedAt,
    distance_km: params.distanceKm,
    duration_s: params.durationS,
    avg_heart_rate: avgHeartRate,
    max_heart_rate: maxHeartRate,
    elevation_gain_m: params.elevationGainM,
    route_source: 'phone_gps',
    payload: {
      phase: 'phase-1-local-ble-phone-gps',
    },
    heart_rate_samples: params.heartRateSamples,
  }

  return session
}
