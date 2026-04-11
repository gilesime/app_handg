import React, { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'

import { getActivitiesWithinDays, getWeeklyDistanceKm, getWeeklyXp } from '@/lib/competitive-insights'
import { formatDistance, formatDuration, formatPace } from '@/lib/xp-engine'
import { activityApi } from '@/services/api'
import { useClubStore } from '@/stores/activity-store'
import type { Activity } from '@/types'

type HistoryRange = '7d' | '30d' | 'all'

const RANGE_LABELS: Record<HistoryRange, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  all: 'Todo',
}

export default function HistoryScreen() {
  const activeClub = useClubStore((state) => state.activeClub)
  const [range, setRange] = useState<HistoryRange>('30d')

  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'history', activeClub?.id],
    queryFn: () => activityApi.list({ club_id: activeClub?.id, limit: 50 }),
    enabled: !!activeClub,
  })

  const allActivities = data?.data ?? []
  const activities = useMemo(() => {
    if (range === 'all') return allActivities
    return getActivitiesWithinDays(allActivities, range === '7d' ? 7 : 30)
  }, [allActivities, range])

  const summary = useMemo(() => {
    const distanceKm = activities.reduce((sum, activity) => sum + activity.distance_km, 0)
    const durationS = activities.reduce((sum, activity) => sum + activity.duration_s, 0)
    const xp = activities.reduce((sum, activity) => sum + activity.xp_earned, 0)

    return {
      distanceKm,
      durationS,
      xp,
      count: activities.length,
      weeklyDistanceKm: getWeeklyDistanceKm(activities),
      weeklyXp: getWeeklyXp(activities),
    }
  }, [activities])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Historial de actividades</Text>
        <Text style={styles.subtitle}>
          Consulta tu volumen reciente y abre cualquier sesión para revisar su resumen.
        </Text>

        <View style={styles.filterRow}>
          {(Object.keys(RANGE_LABELS) as HistoryRange[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, range === item && styles.filterChipActive]}
              onPress={() => setRange(item)}
            >
              <Text style={[styles.filterChipText, range === item && styles.filterChipTextActive]}>
                {RANGE_LABELS[item]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <Text style={styles.summaryClub}>{activeClub?.name ?? 'Sin club seleccionado'}</Text>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryStat label="Distancia" value={formatDistance(summary.distanceKm)} />
            <SummaryStat label="Tiempo" value={formatDuration(summary.durationS)} />
            <SummaryStat label="XP" value={`+${summary.xp}`} />
            <SummaryStat label="Sesiones" value={String(summary.count)} />
          </View>

          <View style={styles.summaryFoot}>
            <Text style={styles.summaryFootText}>
              Ultimos 7 dias: {formatDistance(summary.weeklyDistanceKm)} y +{summary.weeklyXp} XP
            </Text>
          </View>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Sesiones</Text>
            <Text style={styles.listHint}>{activities.length} resultados</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#6366F1" style={{ marginVertical: 24 }} />
          ) : (
            <FlatList
              data={activities}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={styles.emptyText}>No hay actividades en este rango.</Text>}
              renderItem={({ item }) => <ActivityHistoryRow activity={item} />}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatValue}>{value}</Text>
      <Text style={styles.summaryStatLabel}>{label}</Text>
    </View>
  )
}

function ActivityHistoryRow({ activity }: { activity: Activity }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push({ pathname: '/activity-summary', params: { activity_id: activity.id } })}
      activeOpacity={0.75}
    >
      <View style={styles.rowIcon}>
        <Text style={styles.rowIconText}>🏃</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>
          {new Date(activity.started_at).toLocaleString('es-MX', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.rowMeta}>
          {formatDistance(activity.distance_km)} · {formatDuration(activity.duration_s)} · {formatPace(activity.avg_pace_s_per_km)}
        </Text>
      </View>
      <Text style={styles.rowValue}>+{activity.xp_earned} XP</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { flex: 1, padding: 20 },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  backButtonText: { color: '#C7D2FE', fontWeight: '700', fontSize: 14 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 18 },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 20 },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterChipText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  filterChipTextActive: { color: '#FFFFFF' },
  summaryCard: {
    marginTop: 20,
    backgroundColor: '#17172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  summaryClub: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  summaryStat: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
  },
  summaryStatValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  summaryStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  summaryFoot: { marginTop: 16 },
  summaryFootText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  listCard: {
    marginTop: 18,
    flex: 1,
    backgroundColor: '#17172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  listHint: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIconText: { fontSize: 18 },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#FFFFFF', fontWeight: '600' },
  rowMeta: { color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  rowValue: { color: '#C4B5FD', fontWeight: '700', fontSize: 13 },
  emptyText: { color: 'rgba(255,255,255,0.45)', paddingVertical: 12 },
})
