import { supabase } from '../lib/supabase'
import type {
  Activity, Club, ClubMember, Challenge, BusinessOffer,
  RewardTransaction, Badge, BadgeAward, LeaderboardEntry,
  PaginatedResponse, GeoPoint
} from '../types'

// ─── Activity API ─────────────────────────────────────────────────────────────

export const activityApi = {
  /** Create a completed activity and trigger reward processing */
  create: async (params: {
    club_id: string
    type: string
    distance_km: number
    duration_s: number
    avg_pace_s_per_km: number
    elevation_gain_m: number
    route_points: GeoPoint[]
    started_at: string
    ended_at: string
  }): Promise<Activity> => {
    const { data, error } = await supabase
      .functions.invoke('activity-complete', { body: params })

    if (error) throw new Error(error.message)
    return data.activity as Activity
  },

  /** Fetch user's activity history */
  list: async (params: {
    club_id?: string
    limit?: number
    offset?: number
  }): Promise<PaginatedResponse<Activity>> => {
    let query = supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(params.limit ?? 20)
      .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1)

    if (params.club_id) query = query.eq('club_id', params.club_id)

    const { data, error, count } = await query
    if (error) throw error

    return {
      data: data as Activity[],
      count: count ?? 0,
      page: Math.floor((params.offset ?? 0) / (params.limit ?? 20)),
      page_size: params.limit ?? 20,
      has_more: (count ?? 0) > (params.offset ?? 0) + (params.limit ?? 20),
    }
  },

  /** Get single activity with route data */
  get: async (id: string): Promise<Activity> => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Activity
  },
}

// ─── Club API ─────────────────────────────────────────────────────────────────

export const clubApi = {
  /** Get clubs the user belongs to */
  getUserClubs: async (): Promise<(Club & { membership: ClubMember })[]> => {
    const { data, error } = await supabase
      .from('club_members')
      .select(`
        *,
        club:clubs(*)
      `)
      .order('joined_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map((m: any) => ({ ...m.club, membership: m }))
  },

  /** Get club by slug (for deep links / sharing) */
  getBySlug: async (slug: string): Promise<Club> => {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Club
  },

  /** Join a club */
  join: async (club_id: string): Promise<ClubMember> => {
    const { data, error } = await supabase
      .from('club_members')
      .insert({ club_id, role: 'member' })
      .select()
      .single()

    if (error) throw error
    return data as ClubMember
  },

  /** Get club leaderboard */
  getLeaderboard: async (
    club_id: string,
    period: 'weekly' | 'monthly' | 'all_time' = 'weekly'
  ): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .rpc('get_club_leaderboard', { p_club_id: club_id, p_period: period })

    if (error) throw error
    return data as LeaderboardEntry[]
  },
}

// ─── Challenge API ────────────────────────────────────────────────────────────

export const challengeApi = {
  list: async (club_id: string): Promise<Challenge[]> => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('club_id', club_id)
      .gte('ends_at', now)
      .order('ends_at', { ascending: true })

    if (error) throw error
    return data as Challenge[]
  },

  getUserProgress: async (challenge_id: string): Promise<{ progress: number; completed: boolean }> => {
    const { data, error } = await supabase
      .rpc('get_challenge_progress', { p_challenge_id: challenge_id })

    if (error) throw error
    return data
  },
}

// ─── Rewards / Business API ───────────────────────────────────────────────────

export const rewardsApi = {
  /** Get available offers for a club */
  getOffers: async (club_id: string, nearbyKm?: number): Promise<BusinessOffer[]> => {
    const { data, error } = await supabase
      .from('business_offers')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('club_id', club_id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as BusinessOffer[]
  },

  /** Generate a QR code token for redemption */
  generateRedemption: async (offer_id: string): Promise<RewardTransaction> => {
    const { data, error } = await supabase
      .functions.invoke('generate-redemption', { body: { offer_id } })

    if (error) throw new Error(error.message)
    return data.transaction as RewardTransaction
  },

  /** Get user's redemption history */
  getHistory: async (): Promise<RewardTransaction[]> => {
    const { data, error } = await supabase
      .from('reward_transactions')
      .select(`*, offer:business_offers(*, business:businesses(*))`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as RewardTransaction[]
  },
}

// ─── Badge API ────────────────────────────────────────────────────────────────

export const badgeApi = {
  getUserBadges: async (user_id?: string): Promise<BadgeAward[]> => {
    const query = user_id
      ? supabase.from('badge_awards').select('*, badge:badges(*)').eq('user_id', user_id)
      : supabase.from('badge_awards').select('*, badge:badges(*)')

    const { data, error } = await query.order('awarded_at', { ascending: false })
    if (error) throw error
    return data as BadgeAward[]
  },
}
