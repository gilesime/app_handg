import { isDemoMode } from '@/lib/demo-mode'
import type { WearableDevice } from '@/types/wearables'

const demoDevices: WearableDevice[] = [
  {
    id: 'ble-polar-h10',
    user_id: 'demo-user',
    provider: 'ble',
    device_name: 'Polar H10 Demo',
    device_type: 'chest_strap',
    manufacturer: 'Polar',
    model: 'H10',
    is_active: true,
  },
  {
    id: 'ble-garmin-hrm',
    user_id: 'demo-user',
    provider: 'ble',
    device_name: 'Garmin HRM Demo',
    device_type: 'chest_strap',
    manufacturer: 'Garmin',
    model: 'HRM-Pro',
    is_active: true,
  },
]

export async function scanWearableDevices(): Promise<WearableDevice[]> {
  if (isDemoMode) {
    return demoDevices
  }

  return []
}
