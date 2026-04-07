import { useCallback } from 'react'

import {
  connectHeartRateDevice,
  disconnectHeartRateDevice,
  startHeartRateStream,
  stopHeartRateStream,
} from '@/services/wearables/ble-heart-rate'
import { scanWearableDevices } from '@/services/wearables/device-registry'
import { useActivityStore } from '@/stores/activity-store'
import { useWearableStore } from '@/stores/wearable-store'

export function useWearableSession() {
  const setAvailableDevices = useWearableStore((state) => state.setAvailableDevices)
  const setConnectedDevice = useWearableStore((state) => state.setConnectedDevice)
  const setConnectionStatus = useWearableStore((state) => state.setConnectionStatus)
  const addHeartRateSample = useWearableStore((state) => state.addHeartRateSample)
  const clearSessionSamples = useWearableStore((state) => state.clearSessionSamples)
  const connectedDevice = useWearableStore((state) => state.connectedDevice)
  const updateHeartRate = useActivityStore((state) => state.updateHeartRate)

  const scan = useCallback(async () => {
    setConnectionStatus('scanning')
    const devices = await scanWearableDevices()
    setAvailableDevices(devices)
    setConnectionStatus(devices.length > 0 ? 'disconnected' : 'idle')
    return devices
  }, [setAvailableDevices, setConnectionStatus])

  const connect = useCallback(async (deviceId: string) => {
    const devices = useWearableStore.getState().availableDevices
    const device = devices.find((item) => item.id === deviceId)

    if (!device) throw new Error('Dispositivo no encontrado')

    const connected = await connectHeartRateDevice(device)
    setConnectedDevice(connected)
    return connected
  }, [setConnectedDevice])

  const disconnect = useCallback(async () => {
    stopHeartRateStream()
    await disconnectHeartRateDevice()
    clearSessionSamples()
    useWearableStore.getState().disconnect()
  }, [clearSessionSamples])

  const startSession = useCallback(async () => {
    const device = useWearableStore.getState().connectedDevice
    clearSessionSamples()
    if (!device) return

    await startHeartRateStream(device, (sample) => {
      addHeartRateSample(sample)
      updateHeartRate(sample.bpm)
    })
  }, [addHeartRateSample, clearSessionSamples, updateHeartRate])

  const stopSession = useCallback(async () => {
    stopHeartRateStream()
  }, [])

  return {
    connectedDevice,
    scan,
    connect,
    disconnect,
    startSession,
    stopSession,
  }
}
