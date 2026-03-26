// supabase/functions/activity-complete/index.ts
// Runs on: POST /functions/v1/activity-complete
// Auth: Bearer JWT (user token)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const {
      club_id, type, distance_km, duration_s,
      avg_pace_s_per_km, elevation_gain_m,
      route_points, started_at, ended_at
    } = body

    // ── Validate membership ───────────────────────────────────────────────────
    const { data: membership } = await supabase
      .from('club_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('club_id', club_id)
      .single()

    if (!membership) throw new Error('Not a member of this club')

    // ── Calculate XP ──────────────────────────────────────────────────────────
    const baseXP = Math.floor(distance_km * 10)
    let bonusXP = 0
    if (distance_km >= 21.1) bonusXP += 200
    else if (distance_km >= 10) bonusXP += 80
    else if (distance_km >= 5) bonusXP += 30

    // Streak bonus
    const { data: recentActivities } = await supabase
      .from('activities')
      .select('started_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('started_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .order('started_at', { ascending: false })

    const uniqueDays = new Set(
      (recentActivities ?? []).map(a =>
        new Date(a.started_at).toDateString()
      )
    ).size
    const streak = uniqueDays
    let multiplier = 1.0
    if (streak >= 7) multiplier = 1.5
    else if (streak >= 3) multiplier = 1.25

    const xp_earned = Math.floor((baseXP + bonusXP) * multiplier)

    // ── Persist activity ──────────────────────────────────────────────────────
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        club_id,
        type,
        status: 'completed',
        distance_km,
        duration_s,
        avg_pace_s_per_km,
        elevation_gain_m,
        xp_earned,
        route_points: JSON.stringify(route_points), // stored as JSONB
        started_at,
        ended_at,
      })
      .select()
      .single()

    if (activityError) throw activityError

    // ── Award XP to user and club membership ──────────────────────────────────
    await Promise.all([
      supabase.rpc('increment_user_xp', { p_user_id: user.id, p_xp: xp_earned }),
      supabase.rpc('increment_member_xp', {
        p_user_id: user.id,
        p_club_id: club_id,
        p_xp: xp_earned
      }),
    ])

    // ── Check and award badges ────────────────────────────────────────────────
    const { data: badges } = await supabase
      .from('badges')
      .select('*')

    const { data: userStats } = await supabase
      .rpc('get_user_stats', { p_user_id: user.id })

    const { data: existingBadgeIds } = await supabase
      .from('badge_awards')
      .select('badge_id')
      .eq('user_id', user.id)

    const alreadyHas = new Set((existingBadgeIds ?? []).map((b: any) => b.badge_id))
    const newBadges: string[] = []

    for (const badge of badges ?? []) {
      if (alreadyHas.has(badge.id)) continue

      const c = badge.trigger_criteria
      let earned = false

      switch (badge.trigger_type) {
        case 'first_activity':
          earned = userStats?.total_activities === 1
          break
        case 'distance_total':
          earned = (userStats?.total_distance_km ?? 0) >= c.target_km
          break
        case 'streak':
          earned = streak >= c.days
          break
        case 'speed':
          earned = avg_pace_s_per_km > 0 &&
            avg_pace_s_per_km <= c.max_pace_s_per_km &&
            distance_km >= (c.min_distance_km ?? 0)
          break
      }

      if (earned) {
        await supabase.from('badge_awards').insert({
          user_id: user.id,
          badge_id: badge.id,
          activity_id: activity.id,
        })
        newBadges.push(badge.id)
      }
    }

    // ── Check challenge completions ────────────────────────────────────────────
    const now = new Date().toISOString()
    const { data: activeChallenges } = await supabase
      .from('challenges')
      .select('*')
      .eq('club_id', club_id)
      .lte('starts_at', now)
      .gte('ends_at', now)

    const completedChallenges: string[] = []
    for (const challenge of activeChallenges ?? []) {
      const { data: progress } = await supabase
        .rpc('get_challenge_progress', {
          p_challenge_id: challenge.id,
          p_user_id: user.id
        })

      if (progress?.completed) {
        // Award challenge XP bonus
        await supabase.rpc('increment_user_xp', {
          p_user_id: user.id,
          p_xp: challenge.xp_reward
        })
        completedChallenges.push(challenge.id)
      }
    }

    // ── Trigger nearby business webhooks ──────────────────────────────────────
    if (route_points?.length > 0) {
      const lastPoint = route_points[route_points.length - 1]
      const { data: nearbyOffers } = await supabase
        .rpc('get_nearby_active_offers', {
          p_club_id: club_id,
          p_lat: lastPoint.latitude,
          p_lon: lastPoint.longitude,
          p_radius_km: 2.0
        })

      for (const offer of nearbyOffers ?? []) {
        if (offer.business?.webhook_url) {
          fetch(offer.business.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'member_nearby',
              offer_id: offer.id,
              club_id,
              distance_km,
              member_count_nearby: 1,
            }),
          }).catch(() => {}) // fire-and-forget
        }
      }
    }

    return new Response(
      JSON.stringify({
        activity,
        xp_earned,
        new_badges: newBadges,
        completed_challenges: completedChallenges,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
