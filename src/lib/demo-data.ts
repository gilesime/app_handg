import type {
  Activity,
  BadgeAward,
  BusinessOffer,
  Challenge,
  Club,
  ClubMember,
  LeaderboardEntry,
  RewardTransaction,
  User,
} from '@/types'

const now = new Date()

export const demoUser = (overrides?: Partial<User>): User => ({
  id: 'demo-user',
  display_name: 'Demo Runner',
  email: 'demo@loyalrun.app',
  total_xp: 2840,
  level: 4,
  preferences: {
    units: 'km',
    notifications_enabled: true,
    privacy_mode: 'club_only',
  },
  created_at: now.toISOString(),
  ...overrides,
})

const clubThemes = {
  running: { primary_color: '#2563EB', secondary_color: '#93C5FD' },
  cycling: { primary_color: '#059669', secondary_color: '#6EE7B7' },
}

export const demoClubs: Club[] = [
  {
    id: 'club-running',
    name: 'Runners Centro',
    sport_type: 'running',
    slug: 'runners-centro',
    description: 'Club urbano para 5K y 10K.',
    theme_config: clubThemes.running,
    owner_id: 'owner-1',
    member_count: 186,
    created_at: now.toISOString(),
  },
  {
    id: 'club-cycling',
    name: 'Ciclistas Norte',
    sport_type: 'cycling',
    slug: 'ciclistas-norte',
    description: 'Rodadas de fin de semana y retos mensuales.',
    theme_config: clubThemes.cycling,
    owner_id: 'owner-2',
    member_count: 92,
    created_at: now.toISOString(),
  },
]

const demoMemberships: ClubMember[] = [
  {
    id: 'membership-running',
    user_id: 'demo-user',
    club_id: 'club-running',
    role: 'member',
    club_xp: 920,
    joined_at: now.toISOString(),
  },
]

const demoActivitiesState: Activity[] = [
  {
    id: 'activity-1',
    user_id: 'demo-user',
    club_id: 'club-running',
    type: 'running',
    status: 'completed',
    distance_km: 5.4,
    duration_s: 1860,
    avg_pace_s_per_km: 344,
    elevation_gain_m: 42,
    xp_earned: 84,
    route_points: [],
    started_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    ended_at: new Date(now.getTime() - 1000 * 60 * 60 * 23.5).toISOString(),
  },
  {
    id: 'activity-2',
    user_id: 'demo-user',
    club_id: 'club-running',
    type: 'running',
    status: 'completed',
    distance_km: 10.2,
    duration_s: 3540,
    avg_pace_s_per_km: 347,
    elevation_gain_m: 88,
    xp_earned: 162,
    route_points: [],
    started_at: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    ended_at: new Date(now.getTime() - 1000 * 60 * 60 * 47).toISOString(),
  },
  {
    id: 'activity-3',
    user_id: 'demo-user',
    club_id: 'club-running',
    type: 'running',
    status: 'completed',
    distance_km: 3.1,
    duration_s: 1170,
    avg_pace_s_per_km: 377,
    elevation_gain_m: 15,
    xp_earned: 42,
    route_points: [],
    started_at: new Date(now.getTime() - 1000 * 60 * 60 * 72).toISOString(),
    ended_at: new Date(now.getTime() - 1000 * 60 * 60 * 71.6).toISOString(),
  },
]

export const demoChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    club_id: 'club-running',
    title: 'Acumula 25 km esta semana',
    description: 'Suma kilometros para desbloquear XP extra.',
    type: 'distance',
    criteria: { target_value: 25, unit: 'km', period: 'weekly' },
    xp_reward: 120,
    starts_at: now.toISOString(),
    ends_at: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    participant_count: 48,
    progress: 18.7,
  },
  {
    id: 'challenge-2',
    club_id: 'club-running',
    title: 'Corre 3 dias seguidos',
    description: 'Mantener la racha tambien da puntos.',
    type: 'frequency',
    criteria: { target_value: 3, unit: 'dias', period: 'weekly' },
    xp_reward: 60,
    starts_at: now.toISOString(),
    ends_at: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    participant_count: 29,
    progress: 2,
  },
]

export const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user_id: 'u-1', display_name: 'Ana', value: 34.8, unit: 'km' },
  { rank: 2, user_id: 'demo-user', display_name: 'Demo Runner', value: 18.7, unit: 'km' },
  { rank: 3, user_id: 'u-2', display_name: 'Carlos', value: 17.2, unit: 'km' },
]

export const demoOffers: BusinessOffer[] = [
  {
    id: 'offer-1',
    business_id: 'biz-1',
    club_id: 'club-running',
    title: 'Cafe post-run',
    description: 'Cafe americano o te helado despues del entrenamiento.',
    points_cost: 150,
    discount_value: 20,
    discount_type: 'percentage',
    expires_at: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    is_active: true,
    times_redeemed: 12,
    business: {
      id: 'biz-1',
      name: 'Cafe Estacion',
      category: 'Cafe',
      address: 'Av. Reforma 101',
      latitude: 19.4326,
      longitude: -99.1332,
      distance_m: 650,
    },
  },
  {
    id: 'offer-2',
    business_id: 'biz-2',
    club_id: 'club-running',
    title: 'Descuento en tenis',
    description: 'Aplica en calzado de running seleccionado.',
    xp_cost: 300,
    discount_value: 15,
    discount_type: 'percentage',
    expires_at: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    is_active: true,
    times_redeemed: 5,
    business: {
      id: 'biz-2',
      name: 'Sport House',
      category: 'Retail',
      address: 'Insurgentes Sur 450',
      latitude: 19.423,
      longitude: -99.162,
      distance_m: 1800,
    },
  },
]

export const demoBadgeAwards: BadgeAward[] = [
  {
    id: 'award-1',
    user_id: 'demo-user',
    badge_id: 'badge-1',
    awarded_at: now.toISOString(),
    badge: {
      id: 'badge-1',
      name: 'Primer 5K',
      description: 'Completaste tu primer 5K.',
      icon_url: '',
      tier: 'bronze',
      trigger_type: 'first_activity',
      trigger_criteria: {},
    },
  },
  {
    id: 'award-2',
    user_id: 'demo-user',
    badge_id: 'badge-2',
    awarded_at: now.toISOString(),
    badge: {
      id: 'badge-2',
      name: 'Racha 3 dias',
      description: 'Entrenaste 3 dias seguidos.',
      icon_url: '',
      tier: 'silver',
      trigger_type: 'streak',
      trigger_criteria: {},
    },
  },
]

const rewardTransactionsState: RewardTransaction[] = []

export function getDemoUserClubs(): (Club & { membership: ClubMember })[] {
  return demoMemberships
    .map((membership) => {
      const club = demoClubs.find((item) => item.id === membership.club_id)
      return club ? { ...club, membership } : null
    })
    .filter(Boolean) as (Club & { membership: ClubMember })[]
}

export function joinDemoClub(clubId: string): ClubMember {
  const existing = demoMemberships.find((membership) => membership.club_id === clubId)
  if (existing) return existing

  const membership: ClubMember = {
    id: `membership-${clubId}`,
    user_id: 'demo-user',
    club_id: clubId,
    role: 'member',
    club_xp: 120,
    joined_at: new Date().toISOString(),
  }
  demoMemberships.push(membership)
  return membership
}

export function listDemoActivities(clubId?: string) {
  return demoActivitiesState.filter((activity) => !clubId || activity.club_id === clubId)
}

export function getDemoActivity(id: string) {
  return demoActivitiesState.find((activity) => activity.id === id) ?? demoActivitiesState[0]
}

export function createDemoActivity(
  params: Pick<
    Activity,
    'club_id' | 'type' | 'distance_km' | 'duration_s' | 'avg_pace_s_per_km' | 'elevation_gain_m' | 'route_points'
  > & {
    started_at: string
    ended_at: string
  }
) {
  const activity: Activity = {
    id: `activity-${demoActivitiesState.length + 1}`,
    user_id: 'demo-user',
    status: 'completed',
    xp_earned: Math.max(25, Math.round(params.distance_km * 12)),
    ...params,
  }

  demoActivitiesState.unshift(activity)
  return activity
}

export function generateDemoRedemption(offerId: string): RewardTransaction {
  const offer = demoOffers.find((item) => item.id === offerId) ?? demoOffers[0]
  const transaction: RewardTransaction = {
    id: `transaction-${rewardTransactionsState.length + 1}`,
    user_id: 'demo-user',
    offer_id: offer.id,
    qr_code: `LOYALRUN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    offer,
  }
  rewardTransactionsState.unshift(transaction)
  return transaction
}

export function getDemoRewardHistory() {
  return rewardTransactionsState
}
