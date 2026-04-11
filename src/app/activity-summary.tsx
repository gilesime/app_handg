import React, { useEffect, useMemo, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'

import { getActivitySummaryInsights, getWeeklyDistanceKm } from '@/lib/competitive-insights'
import { formatDistance, formatDuration, formatPace } from '@/lib/xp-engine'
import { activityApi, challengeApi, rewardsApi } from '@/services/api'
import { useClubStore } from '@/stores/activity-store'
import { useWearableStore } from '@/stores/wearable-store'

export default function ActivitySummaryScreen() {
  const { activity_id } = useLocalSearchParams<{ activity_id: string }>()
  const lastSessionDraft = useWearableStore((state) => state.lastSessionDraft)
  const { activeClub } = useClubStore()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', activity_id],
    queryFn: () => activityApi.get(activity_id!),
    enabled: !!activity_id,
  })

  const { data: recentActivities } = useQuery({
    queryKey: ['activities', 'summary-window', activeClub?.id],
    queryFn: () => activityApi.list({ club_id: activeClub?.id, limit: 20 }),
    enabled: !!activeClub,
  })

  const { data: challenges } = useQuery({
    queryKey: ['challenges', activeClub?.id, 'summary'],
    queryFn: () => challengeApi.list(activeClub!.id),
    enabled: !!activeClub,
  })

  const { data: offers } = useQuery({
    queryKey: ['offers', activeClub?.id, 'summary'],
    queryFn: () => rewardsApi.getOffers(activeClub!.id),
    enabled: !!activeClub,
  })

  const wearableSummary = lastSessionDraft?.activity_id === activity_id ? lastSessionDraft : null

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, scaleAnim, slideAnim])

  const weeklyDistanceKm = useMemo(
    () => getWeeklyDistanceKm(recentActivities?.data ?? []),
    [recentActivities]
  )
  const insights = useMemo(
    () => activity ? getActivitySummaryInsights({
      activity,
      challenges: challenges ?? [],
      weeklyDistanceKm,
    }) : [],
    [activity, challenges, weeklyDistanceKm]
  )
  const offerPreview = offers?.[0] ?? null

  if (isLoading || !activity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Procesando actividad...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={[
          styles.xpHero,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <Text style={styles.xpEmoji}>⚡</Text>
          <Text style={styles.xpAmount}>+{activity.xp_earned} XP</Text>
          <Text style={styles.xpLabel}>Actividad completada</Text>
        </Animated.View>

        <Animated.View style={[
          styles.statsCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={styles.statsGrid}>
            <StatItem label="Distancia" value={formatDistance(activity.distance_km)} icon="📍" />
            <StatItem label="Tiempo" value={formatDuration(activity.duration_s)} icon="⏱" />
            <StatItem label="Ritmo promedio" value={formatPace(activity.avg_pace_s_per_km)} icon="💨" />
            <StatItem label="Elevación" value={`${Math.round(activity.elevation_gain_m)} m`} icon="⛰" />
          </View>
        </Animated.View>

        <Text style={styles.dateLabel}>
          {new Date(activity.started_at).toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </Text>

        {insights.length > 0 && (
          <Animated.View style={[
            styles.statsCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Text style={styles.cardTitle}>Insights</Text>
            {insights.map((insight) => (
              <View style={styles.insightRow} key={insight}>
                <Text style={styles.insightBullet}>•</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {wearableSummary && (
          <Animated.View style={[
            styles.statsCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Text style={styles.cardTitle}>Resumen wearable</Text>
            <View style={styles.wearableRow}>
              <Text style={styles.wearableLabel}>Pulso promedio</Text>
              <Text style={styles.wearableValue}>{wearableSummary.avg_heart_rate ?? 0} bpm</Text>
            </View>
            <View style={styles.wearableRow}>
              <Text style={styles.wearableLabel}>Pulso maximo</Text>
              <Text style={styles.wearableValue}>{wearableSummary.max_heart_rate ?? 0} bpm</Text>
            </View>
            <View style={styles.wearableRow}>
              <Text style={styles.wearableLabel}>Muestras</Text>
              <Text style={styles.wearableValue}>{wearableSummary.heart_rate_samples?.length ?? 0}</Text>
            </View>
          </Animated.View>
        )}

        {(offerPreview || weeklyDistanceKm > 0) && (
          <Animated.View style={[
            styles.impactCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Text style={styles.impactEyebrow}>Continuidad</Text>
            <Text style={styles.impactTitle}>Tu semana sigue construyendose</Text>
            <Text style={styles.impactText}>
              Llevas {formatDistance(weeklyDistanceKm)} en los ultimos 7 dias.
              {offerPreview ? ` Siguiente recompensa sugerida: ${offerPreview.title}.` : ''}
            </Text>
          </Animated.View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/history')}>
            <Text style={styles.primaryBtnText}>Ver historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)/track')}>
            <Text style={styles.secondaryBtnText}>Nueva actividad</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  scroll: { padding: 24, paddingTop: 40, alignItems: 'center' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  xpHero: { alignItems: 'center', marginBottom: 32 },
  xpEmoji: { fontSize: 56, marginBottom: 8 },
  xpAmount: { fontSize: 52, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
  xpLabel: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  statsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: { width: '45%', alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, textAlign: 'center' },
  dateLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  insightBullet: { color: '#A78BFA', fontSize: 18, lineHeight: 20 },
  insightText: { color: 'rgba(255,255,255,0.75)', flex: 1, lineHeight: 20 },
  wearableRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  wearableLabel: { color: 'rgba(255,255,255,0.55)' },
  wearableValue: { color: '#FFFFFF', fontWeight: '600' },
  impactCard: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(99,102,241,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.24)',
    marginBottom: 18,
  },
  impactEyebrow: { color: '#C4B5FD', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  impactTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 8 },
  impactText: { color: 'rgba(255,255,255,0.72)', fontSize: 14, marginTop: 8, lineHeight: 20 },
  actions: { width: '100%', gap: 12 },
  primaryBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 17, fontWeight: '600' },
})
