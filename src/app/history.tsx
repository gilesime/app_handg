import React from 'react'
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'

import { activityApi } from '@/services/api'
import { useClubStore } from '@/stores/activity-store'
import { formatDistance, formatDuration, formatPace } from '@/lib/xp-engine'

export default function HistoryScreen() {
  const activeClub = useClubStore((state) => state.activeClub)

  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'history', activeClub?.id],
    queryFn: () => activityApi.list({ club_id: activeClub?.id, limit: 50 }),
    enabled: !!activeClub,
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial de actividades</Text>
        <Text>Consulta tus sesiones anteriores con distancia, tiempo, ritmo y XP ganado.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen</Text>
          <Text>Club activo: {activeClub?.name ?? 'Sin club seleccionado'}</Text>
          <Text>Total cargado: {data?.data?.length ?? 0} actividades</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actividades</Text>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={data?.data ?? []}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text>No hay actividades registradas.</Text>}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>
                      {new Date(item.started_at).toLocaleString('es-MX')}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {formatDistance(item.distance_km)} · {formatDuration(item.duration_s)} · {formatPace(item.avg_pace_s_per_km)}
                    </Text>
                  </View>
                  <Text style={styles.rowValue}>XP {item.xp_earned}</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, gap: 16 },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  backButtonText: {
    color: '#4338CA',
    fontWeight: '700',
    fontSize: 14,
  },
  title: { fontSize: 28, fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  rowInfo: { flex: 1 },
  rowTitle: { fontWeight: '600' },
  rowMeta: { color: '#6B7280', marginTop: 2 },
  rowValue: { color: '#4338CA', fontWeight: '700' },
})
