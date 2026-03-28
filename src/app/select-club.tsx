import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'

import { WireframeSection } from '@/components/wireframe/WireframeSection'
import { clubApi } from '@/services/api'
import { useClubStore } from '@/stores/activity-store'

export default function SelectClubScreen() {
  const { activeClub, setActiveClub, setUserClubs } = useClubStore()
  const [clubSlug, setClubSlug] = useState('')

  const clubsQuery = useQuery({
    queryKey: ['user-clubs'],
    queryFn: () => clubApi.getUserClubs(),
  })

  useEffect(() => {
    if (!clubsQuery.data) return
    setUserClubs(clubsQuery.data)

    if (!activeClub && clubsQuery.data.length === 1) {
      const club = clubsQuery.data[0]
      setActiveClub(club, club.membership)
      router.replace('/(tabs)')
    }
  }, [activeClub, clubsQuery.data, setActiveClub, setUserClubs])

  const joinMutation = useMutation({
    mutationFn: async (slug: string) => {
      const club = await clubApi.getBySlug(slug.trim())
      const membership = await clubApi.join(club.id)
      return { ...club, membership }
    },
    onSuccess: (club) => {
      setActiveClub(club, club.membership)
      setUserClubs([...(clubsQuery.data ?? []), club])
      setClubSlug('')
      router.replace('/(tabs)')
    },
    onError: (error) => {
      Alert.alert('No se pudo unir al club', getErrorMessage(error))
    },
  })

  const clubs = useMemo(() => clubsQuery.data ?? [], [clubsQuery.data])

  const handleJoinBySlug = () => {
    if (!clubSlug.trim()) {
      Alert.alert('Slug requerido', 'Ingresa el slug de un club.')
      return
    }
    joinMutation.mutate(clubSlug)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Seleccionar club</Text>
        <Text>Antes de usar el app, elige uno de tus clubes o únete por slug.</Text>

        <WireframeSection>
          <Text style={styles.sectionTitle}>Mis clubes</Text>
          {clubsQuery.isLoading ? (
            <Text>Cargando clubes...</Text>
          ) : clubs.length === 0 ? (
            <Text>No tienes clubes asociados todavía.</Text>
          ) : (
            <FlatList
              data={clubs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    setActiveClub(item, item.membership)
                    router.replace('/(tabs)')
                  }}
                >
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text>{item.sport_type}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </WireframeSection>

        <WireframeSection>
          <Text style={styles.sectionTitle}>Unirme por slug</Text>
          <TextInput
            autoCapitalize="none"
            placeholder="ej. corredores-centro"
            style={styles.input}
            value={clubSlug}
            onChangeText={setClubSlug}
          />
          <Button
            title={joinMutation.isPending ? 'Uniendo...' : 'Unirme al club'}
            onPress={handleJoinBySlug}
            disabled={joinMutation.isPending}
          />
        </WireframeSection>
      </View>
    </SafeAreaView>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error desconocido'
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, gap: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
  row: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
})
