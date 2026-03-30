import { isDemoMode } from '@/lib/demo-mode'
import type { HeartRateSample, WearableDevice } from '@/types/wearables'

let demoInterval: ReturnType<typeof setInterval> | null = null

export async function connectHeartRateDevice(device: WearableDevice): Promise<WearableDevice> {
  if (isDemoMode) {
    return {
      ...device,
      last_seen_at: new Date().toISOString(),
    }
  }

  throw new Error('La integracion BLE nativa aun no esta instalada en este build.')
}

export async function disconnectHeartRateDevice(): Promise<void> {
  stopHeartRateStream()
}

export async function startHeartRateStream(
  device: WearableDevice,
  onSample: (sample: HeartRateSample) => void
): Promise<void> {
  if (!isDemoMode) {
    throw new Error('La integracion BLE nativa aun no esta instalada en este build.')
  }

  stopHeartRateStream()

  demoInterval = setInterval(() => {
    const bpm = 138 + Math.round(Math.random() * 24)
    onSample({
      measured_at: new Date().toISOString(),
      bpm,
      confidence: 0.95,
      source: device.provider,
    })
  }, 2500)
}

export function stopHeartRateStream() {
  if (demoInterval) {
    clearInterval(demoInterval)
    demoInterval = null
  }
}
