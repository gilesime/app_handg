import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MMKV } from 'react-native-mmkv'
import type { User, Club, ClubMember, GeoPoint, LiveActivityState } from '../types'

// ─── MMKV Storage Adapter for Zustand ────────────────────────────────────────

const storage = new MMKV({ id: 'loyalrun-store' })

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
}

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    { name: 'auth', storage: mmkvStorage }
  )
)

// ─── Club Store ───────────────────────────────────────────────────────────────

interface ClubState {
  activeClub: Club | null
  membership: ClubMember | null
  userClubs: Club[]
  setActiveClub: (club: Club, membership: ClubMember) => void
  setUserClubs: (clubs: Club[]) => void
  clear: () => void
}

export const useClubStore = create<ClubState>()(
  persist(
    (set) => ({
      activeClub: null,
      membership: null,
      userClubs: [],
      setActiveClub: (activeClub, membership) => set({ activeClub, membership }),
      setUserClubs: (userClubs) => set({ userClubs }),
      clear: () => set({ activeClub: null, membership: null, userClubs: [] }),
    }),
    { name: 'club', storage: mmkvStorage }
  )
)

// ─── Activity Store (live session) ────────────────────────────────────────────

const INITIAL_LIVE_STATE: LiveActivityState = {
  status: 'idle',
  elapsed_s: 0,
  distance_km: 0,
  current_pace_s_per_km: 0,
  elevation_gain_m: 0,
  points: [],
  calories_estimate: 0,
}

interface ActivityState {
  live: LiveActivityState
  sessionStartTime: number | null
  pausedAt: number | null
  totalPausedMs: number

  // Actions
  startSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  stopSession: () => void
  addPoint: (point: GeoPoint) => void
  updateStats: (stats: Partial<LiveActivityState>) => void
  reset: () => void
}

export const useActivityStore = create<ActivityState>()((set, get) => ({
  live: INITIAL_LIVE_STATE,
  sessionStartTime: null,
  pausedAt: null,
  totalPausedMs: 0,

  startSession: () => {
    set({
      live: { ...INITIAL_LIVE_STATE, status: 'active' },
      sessionStartTime: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
    })
  },

  pauseSession: () => {
    set((state) => ({
      live: { ...state.live, status: 'paused' },
      pausedAt: Date.now(),
    }))
  },

  resumeSession: () => {
    const { pausedAt, totalPausedMs } = get()
    const addedPause = pausedAt ? Date.now() - pausedAt : 0
    set((state) => ({
      live: { ...state.live, status: 'active' },
      pausedAt: null,
      totalPausedMs: totalPausedMs + addedPause,
    }))
  },

  stopSession: () => {
    set((state) => ({
      live: { ...state.live, status: 'idle' },
    }))
  },

  addPoint: (point: GeoPoint) => {
    const state = get()
    if (state.live.status !== 'active') return

    const newPoints = [...state.live.points, point]

    // Calculate incremental distance
    let newDistance = state.live.distance_km
    if (newPoints.length > 1) {
      const prev = newPoints[newPoints.length - 2]
      const curr = newPoints[newPoints.length - 1]
      // Import haversine inline to avoid circular deps
      const R = 6371000
      const dLat = ((curr.latitude - prev.latitude) * Math.PI) / 180
      const dLon = ((curr.longitude - prev.longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 *
          Math.cos((prev.latitude * Math.PI) / 180) *
          Math.cos((curr.latitude * Math.PI) / 180)
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      newDistance += dist / 1000
    }

    // Elapsed time (excluding pauses)
    const now = Date.now()
    const elapsed_s = state.sessionStartTime
      ? Math.floor((now - state.sessionStartTime - state.totalPausedMs) / 1000)
      : 0

    // Rolling pace from last 10 points
    const recent = newPoints.slice(-10)
    let current_pace_s_per_km = 0
    if (recent.length >= 2) {
      let recentDist = 0
      for (let i = 1; i < recent.length; i++) {
        const p1 = recent[i - 1], p2 = recent[i]
        const d = ((p2.latitude - p1.latitude) * Math.PI) / 180
        const d2 = ((p2.longitude - p1.longitude) * Math.PI) / 180
        const a2 =
          Math.sin(d / 2) ** 2 +
          Math.sin(d2 / 2) ** 2 *
            Math.cos((p1.latitude * Math.PI) / 180) *
            Math.cos((p2.latitude * Math.PI) / 180)
        recentDist += 6371000 * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2))
      }
      const recentTime = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000
      current_pace_s_per_km = recentDist > 10 ? (recentTime / recentDist) * 1000 : 0
    }

    set((state) => ({
      live: {
        ...state.live,
        points: newPoints,
        distance_km: newDistance,
        elapsed_s,
        current_pace_s_per_km,
        calories_estimate: Math.floor((9 * 70 * elapsed_s) / 3600),
      },
    }))
  },

  updateStats: (stats) => {
    set((state) => ({ live: { ...state.live, ...stats } }))
  },

  reset: () => {
    set({ live: INITIAL_LIVE_STATE, sessionStartTime: null, pausedAt: null, totalPausedMs: 0 })
  },
}))
