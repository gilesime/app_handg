import React, { useCallback, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions
} from 'react-native'
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useAnimatedStyle, withSpring, useSharedValue
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { useActivityTracker } from '../../hooks/useActivityTracker'
import { formatDistance, formatDuration, formatPace } from '../../lib/xp-engine'
import { useAuthStore } from '../../stores/activity-store'

const { width, height } = Dimensions.get('window')

export default function TrackScreen() {
  const tracker = useActivityTracker()
  const { user } = useAuthStore()
  const [isFinishing, setIsFinishing] = useState(false)
  const buttonScale = useSharedValue(1)

  const units = user?.preferences?.units ?? 'km'

  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const handleMainButton = useCallback(async () => {
    buttonScale.value = withSpring(0.93, {}, () => {
      buttonScale.value = withSpring(1)
    })

    if (tracker.isIdle) {
      try {
        await tracker.start()
      } catch (e: any) {
        Alert.alert('Error', e.message)
      }
    } else if (tracker.isActive) {
      tracker.pause()
    } else if (tracker.isPaused) {
      tracker.resume()
    }
  }, [tracker])

  const handleFinish = useCallback(() => {
    Alert.alert(
      'Finalizar actividad',
      `¿Terminar el recorrido de ${formatDistance(tracker.live.distance_km, units)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            setIsFinishing(true)
            try {
              const result = await tracker.finish()
              router.push({
                pathname: '/activity-summary',
                params: { activity_id: result.activity.id }
              })
            } catch (e: any) {
              Alert.alert('Error al guardar', e.message)
              setIsFinishing(false)
            }
          }
        }
      ]
    )
  }, [tracker, units])

  const mapRegion = tracker.live.points.length > 0
    ? {
        latitude: tracker.live.points[tracker.live.points.length - 1].latitude,
        longitude: tracker.live.points[tracker.live.points.length - 1].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : undefined

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        showsUserLocation
        followsUserLocation={tracker.isActive}
        mapType="standard"
      >
        {tracker.live.points.length > 1 && (
          <Polyline
            coordinates={tracker.live.points.map((p) => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor="#6366F1"
            strokeWidth={4}
            lineDashPattern={undefined}
          />
        )}
      </MapView>

      {/* Stats overlay */}
      <View style={styles.statsOverlay}>
        <View style={styles.statsRow}>
          <StatBox
            label="Distancia"
            value={formatDistance(tracker.live.distance_km, units)}
          />
          <StatBox
            label="Tiempo"
            value={formatDuration(tracker.live.elapsed_s)}
          />
          <StatBox
            label="Ritmo"
            value={formatPace(tracker.live.current_pace_s_per_km, units)}
          />
        </View>

        <View style={styles.statsRow}>
          <StatBox
            label="Calorías"
            value={`${tracker.live.calories_estimate} kcal`}
            small
          />
          <StatBox
            label="Elevación"
            value={`${Math.round(tracker.live.elevation_gain_m)} m`}
            small
          />
        </View>

        {/* Status indicator */}
        {tracker.isPaused && (
          <View style={styles.pausedBadge}>
            <Text style={styles.pausedText}>⏸ PAUSADO</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {(tracker.isActive || tracker.isPaused) && (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinish}
              disabled={isFinishing}
            >
              <Text style={styles.finishButtonText}>
                {isFinishing ? 'Guardando...' : '■ Finalizar'}
              </Text>
            </TouchableOpacity>
          )}

          <Animated.View style={animatedButton}>
            <TouchableOpacity
              style={[
                styles.mainButton,
                tracker.isActive && styles.mainButtonActive,
                tracker.isPaused && styles.mainButtonPaused,
              ]}
              onPress={handleMainButton}
              disabled={isFinishing}
            >
              <Text style={styles.mainButtonText}>
                {tracker.isIdle
                  ? '▶ Iniciar'
                  : tracker.isActive
                  ? '⏸ Pausar'
                  : '▶ Continuar'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  )
}

function StatBox({
  label, value, small
}: { label: string; value: string; small?: boolean }) {
  return (
    <View style={[styles.statBox, small && styles.statBoxSmall]}>
      <Text style={[styles.statValue, small && styles.statValueSmall]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  map: { flex: 1 },
  statsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxSmall: { flex: 1 },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statValueSmall: { fontSize: 20 },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pausedBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  pausedText: { color: '#FBBf24', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  controls: { flexDirection: 'row', gap: 12, marginTop: 8 },
  mainButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  mainButtonActive: { backgroundColor: '#F59E0B' },
  mainButtonPaused: { backgroundColor: '#6366F1' },
  mainButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  finishButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  finishButtonText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
})
