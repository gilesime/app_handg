// Branch: feat/ux-competitive-wireframes
// Business need: turn raw activity data into a clearer "next best action" and
// lightweight progress insights so the app feels closer to leading training apps.

import type { Activity, BusinessOffer, Challenge, ClubMember, User } from '@/types'

const DAY_MS = 1000 * 60 * 60 * 24

export function getActivitiesWithinDays(activities: Activity[], days: number): Activity[] {
  const cutoff = Date.now() - days * DAY_MS
  return activities.filter((activity) => new Date(activity.started_at).getTime() >= cutoff)
}

export function getWeeklyDistanceKm(activities: Activity[]): number {
  return getActivitiesWithinDays(activities, 7).reduce((sum, activity) => sum + activity.distance_km, 0)
}

export function getWeeklyXp(activities: Activity[]): number {
  return getActivitiesWithinDays(activities, 7).reduce((sum, activity) => sum + activity.xp_earned, 0)
}

export function getCurrentStreakDays(activities: Activity[]): number {
  const uniqueDays = Array.from(
    new Set(
      activities.map((activity) =>
        new Date(activity.started_at).toISOString().slice(0, 10)
      )
    )
  ).sort((a, b) => (a < b ? 1 : -1))

  if (uniqueDays.length === 0) return 0

  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (let index = 0; index < uniqueDays.length; index += 1) {
    const candidate = uniqueDays[index]
    const expected = cursor.toISOString().slice(0, 10)

    if (candidate === expected) {
      streak += 1
      cursor = new Date(cursor.getTime() - DAY_MS)
      continue
    }

    if (index === 0) {
      const yesterday = new Date(cursor.getTime() - DAY_MS).toISOString().slice(0, 10)
      if (candidate === yesterday) {
        streak += 1
        cursor = new Date(cursor.getTime() - DAY_MS * 2)
        continue
      }
    }

    break
  }

  return streak
}

export function getPrimaryTrainingFocus(params: {
  activities: Activity[]
  challenges: Challenge[]
}): {
  title: string
  subtitle: string
  ctaLabel: string
  progressLabel: string
  progressPct: number
} {
  const weeklyDistance = getWeeklyDistanceKm(params.activities)
  const weeklyChallenge = params.challenges.find((challenge) => challenge.type === 'distance')

  if (weeklyChallenge) {
    const target = weeklyChallenge.criteria.target_value
    const progress = Math.min(100, Math.round((weeklyDistance / target) * 100))
    const remaining = Math.max(0, target - weeklyDistance)

    return {
      title: weeklyDistance >= target
        ? 'Meta semanal completada'
        : `Te faltan ${remaining.toFixed(1)} km esta semana`,
      subtitle: weeklyChallenge.title,
      ctaLabel: weeklyDistance >= target ? 'Registrar otra actividad' : 'Seguir sumando',
      progressLabel: `${weeklyDistance.toFixed(1)} / ${target} km`,
      progressPct: progress,
    }
  }

  const defaultTarget = 20
  const remaining = Math.max(0, defaultTarget - weeklyDistance)
  return {
    title: remaining > 0 ? `Objetivo semanal: ${remaining.toFixed(1)} km pendientes` : 'Objetivo semanal cumplido',
    subtitle: 'Una meta simple ayuda a mantener constancia y volver a la app.',
    ctaLabel: 'Iniciar actividad',
    progressLabel: `${weeklyDistance.toFixed(1)} / ${defaultTarget} km`,
    progressPct: Math.min(100, Math.round((weeklyDistance / defaultTarget) * 100)),
  }
}

export function getRewardHighlight(params: {
  offers: BusinessOffer[]
  user: User | null
  membership: ClubMember | null
}): {
  title: string
  subtitle: string
} | null {
  if (!params.offers.length) return null

  const userXp = params.user?.total_xp ?? 0
  const userPoints = params.membership?.club_xp ?? 0
  const affordableOffer = params.offers.find((offer) => {
    const hasXp = !offer.xp_cost || userXp >= offer.xp_cost
    const hasPoints = !offer.points_cost || userPoints >= offer.points_cost
    return hasXp && hasPoints
  })

  if (affordableOffer) {
    return {
      title: `${affordableOffer.business.name}: ${affordableOffer.title}`,
      subtitle: 'Ya tienes saldo suficiente para canjear esta recompensa.',
    }
  }

  const nextOffer = params.offers[0]
  return {
    title: `${nextOffer.business.name}: ${nextOffer.title}`,
    subtitle: 'Aun no disponible, pero ya aparece como siguiente recompensa sugerida.',
  }
}

export function getActivitySummaryInsights(params: {
  activity: Activity
  challenges: Challenge[]
  weeklyDistanceKm: number
}): string[] {
  const insights: string[] = []

  if (params.activity.distance_km >= 10) {
    insights.push('Sesión larga completada: esta actividad ya se siente como bloque principal de la semana.')
  } else if (params.activity.distance_km >= 5) {
    insights.push('Sesión sólida: suficiente volumen para reforzar constancia y sumar buen XP.')
  } else {
    insights.push('Sesión corta y útil: mantiene la racha viva sin sobrecargar la semana.')
  }

  if (params.activity.avg_pace_s_per_km > 0 && params.activity.avg_pace_s_per_km < 360) {
    insights.push('Tu ritmo promedio cayó en una zona competitiva para trabajo aeróbico eficiente.')
  }

  const nearestChallenge = params.challenges.find((challenge) => {
    const progress = challenge.progress ?? 0
    return progress < challenge.criteria.target_value
  })

  if (nearestChallenge) {
    const remaining = Math.max(0, nearestChallenge.criteria.target_value - (nearestChallenge.progress ?? 0))
    insights.push(`Quedas a ${remaining.toFixed(1)} ${nearestChallenge.criteria.unit} de cerrar "${nearestChallenge.title}".`)
  } else if (params.weeklyDistanceKm > 0) {
    insights.push(`Llevas ${params.weeklyDistanceKm.toFixed(1)} km acumulados en los ultimos 7 dias.`)
  }

  return insights.slice(0, 3)
}
