import React from 'react'
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { activityApi } from '@/services/api'
import { useClubStore } from '@/stores/activity-store'
import { formatDistance, formatDuration, formatPace } from '@/lib/xp-engine'
import { WireframeSection } from '@/components/wireframe/WireframeSection'

export default function HistoryScreen() {
  const activeClub = useClubStore((state) => state.activeClub)

  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'history', activeClub?.id],
    queryFn: () => activityApi.list({ club_id: activeClub?.id, limit: 50 }),
    enabled: !!activeClub,
  })

  return (
    <SafeAreaView style={styles.container}>
      <WireframeSection>
        <Text style={styles.title}>Historial de actividades</Text>
        <Text>Listado simple para revisar actividades anteriores.</Text>
      </WireframeSection>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text>No hay actividades registradas.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.date}>
                {new Date(item.started_at).toLocaleString('es-MX')}
              </Text>
              <Text>{formatDistance(item.distance_km)}</Text>
              <Text>{formatDuration(item.duration_s)}</Text>
              <Text>{formatPace(item.avg_pace_s_per_km)}</Text>
              <Text>XP: {item.xp_earned}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  loader: { marginTop: 40 },
  list: { gap: 12, paddingBottom: 24 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, gap: 4 },
  date: { fontWeight: '600' },
})
