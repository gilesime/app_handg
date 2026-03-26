import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import type { GeoPoint, LiveActivityState } from '../types'
import { useActivityStore } from '../stores/activity-store'

// ─── Task Name ────────────────────────────────────────────────────────────────

export const BACKGROUND_LOCATION_TASK = 'LOYALRUN_BACKGROUND_LOCATION'

// ─── Task Definition (must be at module top-level) ────────────────────────────

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error)
    return
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] }
    const store = useActivityStore.getState()

    for (const loc of locations) {
      const point: GeoPoint = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude ?? undefined,
        accuracy: loc.coords.accuracy ?? undefined,
        timestamp: loc.timestamp,
      }
      store.addPoint(point)
    }
  }
})

// ─── Permission Handling ──────────────────────────────────────────────────────

export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()
  if (foregroundStatus !== 'granted') return false

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()
  return backgroundStatus === 'granted'
}

// ─── Tracking Control ─────────────────────────────────────────────────────────

export async function startTracking(): Promise<void> {
  const hasPermission = await requestLocationPermissions()
  if (!hasPermission) throw new Error('Se necesita permiso de ubicación para tracking')

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 2000,        // update every 2s
    distanceInterval: 5,       // or every 5 meters
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Entrenamiento activo',
      notificationBody: 'LoyalRun está registrando tu recorrido',
      notificationColor: '#6366F1',
    },
  })
}

export async function stopTracking(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK)
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
  }
}

// ─── Distance Calculation ─────────────────────────────────────────────────────

/** Haversine formula — returns distance in meters */
export function haversineDistance(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371000 // Earth radius in meters
  const dLat = toRad(p2.latitude - p1.latitude)
  const dLon = toRad(p2.longitude - p1.longitude)
  const lat1 = toRad(p1.latitude)
  const lat2 = toRad(p2.latitude)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

const toRad = (deg: number) => (deg * Math.PI) / 180

/** Calculate cumulative distance from an array of GPS points */
export function totalDistance(points: GeoPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(points[i - 1], points[i])
  }
  return total // meters
}

/** Calculate rolling pace from last N points (seconds per km) */
export function currentPace(points: GeoPoint[], windowSize = 10): number {
  if (points.length < 2) return 0
  const recent = points.slice(-windowSize)
  const dist = totalDistance(recent)
  if (dist < 10) return 0

  const elapsed = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000
  return (elapsed / dist) * 1000 // seconds per km
}

/** Estimate calories burned (simplified MET formula) */
export function estimateCalories(
  durationSeconds: number,
  distanceKm: number,
  weightKg: number = 70
): number {
  const met = distanceKm / (durationSeconds / 3600) > 8 ? 11 : 9
  return Math.floor((met * weightKg * durationSeconds) / 3600)
}
