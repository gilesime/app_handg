import { useCallback, useEffect, useRef } from 'react'
import { useActivityStore } from '../stores/activity-store'
import { useAuthStore } from '../stores/activity-store'
import { useClubStore } from '../stores/activity-store'
import { startTracking, stopTracking } from '../services/gps-service'
import { calculateActivityXP } from '../lib/xp-engine'
import { activityApi } from '../services/api'
import { useQueryClient } from '@tanstack/react-query'
import { useWearableStore } from '@/stores/wearable-store'
import { useWearableSession } from '@/hooks/useWearableSession'
import { composeWearableSessionDraft } from '@/services/wearables/session-composer'
import { wearablesService } from '@/services/wearables'

export function useActivityTracker() {
  const store = useActivityStore()
  const { user } = useAuthStore()
  const { activeClub } = useClubStore()
  const wearableSession = useWearableSession()
  const connectedDevice = useWearableStore((state) => state.connectedDevice)
  const sessionSamples = useWearableStore((state) => state.sessionSamples)
  const setLastSessionDraft = useWearableStore((state) => state.setLastSessionDraft)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const queryClient = useQueryClient()

  // ── Timer tick every second while active ──────────────────────────────────
  useEffect(() => {
    if (store.live.status === 'active') {
      timerRef.current = setInterval(() => {
        const { sessionStartTime, totalPausedMs } = useActivityStore.getState()
        if (!sessionStartTime) return
        const elapsed_s = Math.floor((Date.now() - sessionStartTime - totalPausedMs) / 1000)
        store.updateStats({ elapsed_s })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [store.live.status])

  // ── Start ────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (!user || !activeClub) throw new Error('Necesitas estar en un club para registrar actividad')
    store.startSession()
    await startTracking()
    await wearableSession.startSession()
  }, [user, activeClub, store, wearableSession])

  // ── Pause ─────────────────────────────────────────────────────────────────
  const pause = useCallback(async () => {
    store.pauseSession()
    await stopTracking()
    await wearableSession.stopSession()
  }, [store, wearableSession])

  // ── Resume ────────────────────────────────────────────────────────────────
  const resume = useCallback(async () => {
    store.resumeSession()
    await startTracking()
    await wearableSession.startSession()
  }, [store, wearableSession])

  // ── Finish and save ───────────────────────────────────────────────────────
  const finish = useCallback(async () => {
    if (!activeClub || !user) throw new Error('No hay club activo')
    await stopTracking()
    await wearableSession.stopSession()
    store.stopSession()

    const { live, sessionStartTime } = useActivityStore.getState()
    const startedAt = sessionStartTime ? new Date(sessionStartTime).toISOString() : new Date().toISOString()
    const endedAt = new Date().toISOString()

    const activity = await activityApi.create({
      club_id: activeClub.id,
      type: activeClub.sport_type,
      distance_km: live.distance_km,
      duration_s: live.elapsed_s,
      avg_pace_s_per_km: live.current_pace_s_per_km,
      elevation_gain_m: live.elevation_gain_m,
      route_points: live.points,
      started_at: startedAt,
      ended_at: endedAt,
    })

    if (connectedDevice && sessionSamples.length > 0) {
      const draft = composeWearableSessionDraft({
        user,
        club: activeClub,
        deviceId: connectedDevice.id,
        startedAt,
        endedAt,
        distanceKm: live.distance_km,
        durationS: live.elapsed_s,
        elevationGainM: live.elevation_gain_m,
        heartRateSamples: sessionSamples,
      })

      draft.activity_id = activity.id

      const savedDraft = await wearablesService.createSessionDraft(draft)
      setLastSessionDraft(savedDraft)
    }

    // Invalidate relevant queries so UI refreshes
    queryClient.invalidateQueries({ queryKey: ['activities'] })
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    queryClient.invalidateQueries({ queryKey: ['user'] })

    const xpResult = calculateActivityXP({
      distance_km: live.distance_km,
      duration_s: live.elapsed_s,
      avg_pace_s_per_km: live.current_pace_s_per_km,
    })

    store.reset()

    return { activity, xpResult }
  }, [activeClub, connectedDevice, queryClient, sessionSamples, setLastSessionDraft, store, user, wearableSession])

  // ── Discard ───────────────────────────────────────────────────────────────
  const discard = useCallback(async () => {
    await stopTracking()
    await wearableSession.stopSession()
    store.reset()
  }, [store, wearableSession])

  return {
    live: store.live,
    start,
    pause,
    resume,
    finish,
    discard,
    isActive: store.live.status === 'active',
    isPaused: store.live.status === 'paused',
    isIdle: store.live.status === 'idle',
  }
}
