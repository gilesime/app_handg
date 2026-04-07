import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MMKV } from 'react-native-mmkv'

import type { HeartRateSample, WearableDevice, WearableSessionDraft } from '@/types/wearables'

const storage = new MMKV({ id: 'loyalrun-wearables-store' })

const mmkvStorage = createJSONStorage(() => ({
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
}))

interface WearableState {
  availableDevices: WearableDevice[]
  connectedDevice: WearableDevice | null
  connectionStatus: 'idle' | 'scanning' | 'connected' | 'disconnected'
  currentHeartRateBpm: number | null
  sessionSamples: HeartRateSample[]
  lastSessionDraft: WearableSessionDraft | null
  setAvailableDevices: (devices: WearableDevice[]) => void
  setConnectedDevice: (device: WearableDevice | null) => void
  setConnectionStatus: (status: WearableState['connectionStatus']) => void
  addHeartRateSample: (sample: HeartRateSample) => void
  clearSessionSamples: () => void
  setLastSessionDraft: (session: WearableSessionDraft | null) => void
  disconnect: () => void
}

export const useWearableStore = create<WearableState>()(
  persist(
    (set) => ({
      availableDevices: [],
      connectedDevice: null,
      connectionStatus: 'idle',
      currentHeartRateBpm: null,
      sessionSamples: [],
      lastSessionDraft: null,
      setAvailableDevices: (availableDevices) => set({ availableDevices }),
      setConnectedDevice: (connectedDevice) =>
        set({
          connectedDevice,
          connectionStatus: connectedDevice ? 'connected' : 'disconnected',
        }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      addHeartRateSample: (sample) =>
        set((state) => ({
          currentHeartRateBpm: sample.bpm,
          sessionSamples: [...state.sessionSamples, sample],
        })),
      clearSessionSamples: () => set({ currentHeartRateBpm: null, sessionSamples: [] }),
      setLastSessionDraft: (lastSessionDraft) => set({ lastSessionDraft }),
      disconnect: () =>
        set({
          connectedDevice: null,
          connectionStatus: 'disconnected',
          currentHeartRateBpm: null,
        }),
    }),
    {
      name: 'wearables',
      storage: mmkvStorage,
      partialize: (state) => ({
        availableDevices: state.availableDevices,
        connectedDevice: state.connectedDevice,
        connectionStatus: state.connectionStatus,
        lastSessionDraft: state.lastSessionDraft,
      }),
    }
  )
)
