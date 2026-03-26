import type { Activity, XPLevel, Badge, Challenge } from '../types'

// ─── XP Level Table ───────────────────────────────────────────────────────────

export const XP_LEVELS: XPLevel[] = [
  { level: 1, min_xp: 0,     max_xp: 500,   title: 'Novato' },
  { level: 2, min_xp: 500,   max_xp: 1500,  title: 'Activo' },
  { level: 3, min_xp: 1500,  max_xp: 3500,  title: 'Corredor' },
  { level: 4, min_xp: 3500,  max_xp: 7000,  title: 'Atleta' },
  { level: 5, min_xp: 7000,  max_xp: 13000, title: 'Campeón' },
  { level: 6, min_xp: 13000, max_xp: 22000, title: 'Élite' },
  { level: 7, min_xp: 22000, max_xp: 35000, title: 'Leyenda' },
  { level: 8, min_xp: 35000, max_xp: 99999, title: 'Maestro' },
]

// ─── XP Calculation ───────────────────────────────────────────────────────────

interface XPBreakdown {
  base_xp: number
  distance_bonus: number
  pace_bonus: number
  streak_multiplier: number
  total_xp: number
  breakdown: string[]
}

/**
 * Calculates XP earned for a completed activity.
 * Base: 10 XP per km, bonuses for pace and distance milestones.
 */
export function calculateActivityXP(
  activity: Pick<Activity, 'distance_km' | 'duration_s' | 'avg_pace_s_per_km'>,
  currentStreak: number = 0
): XPBreakdown {
  const breakdown: string[] = []

  // Base XP: 10 points per km
  const base_xp = Math.floor(activity.distance_km * 10)
  breakdown.push(`Base: ${base_xp} XP (${activity.distance_km.toFixed(1)} km × 10)`)

  // Distance milestone bonus
  let distance_bonus = 0
  if (activity.distance_km >= 21.1) {
    distance_bonus = 200
    breakdown.push(`Medio maratón: +${distance_bonus} XP`)
  } else if (activity.distance_km >= 10) {
    distance_bonus = 80
    breakdown.push(`10K completado: +${distance_bonus} XP`)
  } else if (activity.distance_km >= 5) {
    distance_bonus = 30
    breakdown.push(`5K completado: +${distance_bonus} XP`)
  }

  // Pace bonus: under 5 min/km = excellent
  let pace_bonus = 0
  if (activity.avg_pace_s_per_km > 0) {
    if (activity.avg_pace_s_per_km < 300) {
      pace_bonus = 50
      breakdown.push(`Ritmo élite (<5:00/km): +${pace_bonus} XP`)
    } else if (activity.avg_pace_s_per_km < 360) {
      pace_bonus = 25
      breakdown.push(`Buen ritmo (<6:00/km): +${pace_bonus} XP`)
    }
  }

  // Streak multiplier: consecutive day bonus
  let streak_multiplier = 1.0
  if (currentStreak >= 7) {
    streak_multiplier = 1.5
    breakdown.push(`Racha de ${currentStreak} días: ×1.5`)
  } else if (currentStreak >= 3) {
    streak_multiplier = 1.25
    breakdown.push(`Racha de ${currentStreak} días: ×1.25`)
  }

  const subtotal = base_xp + distance_bonus + pace_bonus
  const total_xp = Math.floor(subtotal * streak_multiplier)

  return { base_xp, distance_bonus, pace_bonus, streak_multiplier, total_xp, breakdown }
}

// ─── Level Utilities ──────────────────────────────────────────────────────────

export function getLevelForXP(totalXP: number): XPLevel {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_LEVELS[i].min_xp) return XP_LEVELS[i]
  }
  return XP_LEVELS[0]
}

export function getLevelProgress(totalXP: number): {
  level: XPLevel
  progress_pct: number
  xp_to_next: number
} {
  const level = getLevelForXP(totalXP)
  const range = level.max_xp - level.min_xp
  const earned = totalXP - level.min_xp
  const progress_pct = Math.min(100, Math.floor((earned / range) * 100))
  const xp_to_next = level.max_xp - totalXP

  return { level, progress_pct, xp_to_next }
}

// ─── Badge Evaluation ─────────────────────────────────────────────────────────

export function evaluateBadges(
  activity: Activity,
  userStats: { total_distance_km: number; total_activities: number; current_streak: number },
  availableBadges: Badge[]
): Badge[] {
  const earned: Badge[] = []

  for (const badge of availableBadges) {
    const criteria = badge.trigger_criteria as Record<string, number>

    switch (badge.trigger_type) {
      case 'first_activity':
        if (userStats.total_activities === 1) earned.push(badge)
        break

      case 'distance_total':
        if (userStats.total_distance_km >= criteria.target_km) earned.push(badge)
        break

      case 'streak':
        if (userStats.current_streak >= criteria.days) earned.push(badge)
        break

      case 'speed':
        if (activity.avg_pace_s_per_km > 0 &&
            activity.avg_pace_s_per_km <= criteria.max_pace_s_per_km &&
            activity.distance_km >= (criteria.min_distance_km ?? 0)) {
          earned.push(badge)
        }
        break
    }
  }

  return earned
}

// ─── Challenge Progress ───────────────────────────────────────────────────────

export function evaluateChallengeProgress(
  challenge: Challenge,
  userActivities: Activity[]
): { progress: number; completed: boolean } {
  const { criteria } = challenge

  const relevantActivities = userActivities.filter((a) => {
    const activityDate = new Date(a.started_at)
    const start = new Date(challenge.starts_at)
    const end = new Date(challenge.ends_at)
    return activityDate >= start && activityDate <= end && a.status === 'completed'
  })

  let progress = 0

  switch (challenge.type) {
    case 'distance':
      progress = relevantActivities.reduce((sum, a) => sum + a.distance_km, 0)
      break
    case 'duration':
      progress = relevantActivities.reduce((sum, a) => sum + a.duration_s / 60, 0)
      break
    case 'frequency':
      progress = relevantActivities.length
      break
  }

  return {
    progress: Math.min(progress, criteria.target_value),
    completed: progress >= criteria.target_value,
  }
}

// ─── Pace / Distance Formatters ───────────────────────────────────────────────

export function formatPace(paceSecondsPerKm: number, units: 'km' | 'miles' = 'km'): string {
  if (paceSecondsPerKm <= 0) return '--:--'
  const adjustedPace = units === 'miles' ? paceSecondsPerKm * 1.60934 : paceSecondsPerKm
  const mins = Math.floor(adjustedPace / 60)
  const secs = Math.floor(adjustedPace % 60)
  return `${mins}:${secs.toString().padStart(2, '0')} /${units === 'miles' ? 'mi' : 'km'}`
}

export function formatDistance(km: number, units: 'km' | 'miles' = 'km'): string {
  if (units === 'miles') return `${(km * 0.621371).toFixed(2)} mi`
  return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}
