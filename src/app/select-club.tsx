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

  const handleBack = () => {
    if (activeClub) {
      router.back()
      return
    }

    router.replace('/consent-preferences' as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Seleccionar club</Text>
        <Text>Antes de usar el app, elige uno de tus clubes o unete por slug. No avanzaremos hasta que lo selecciones.</Text>

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
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    <Text style={styles.rowMeta}>{item.sport_type}</Text>
                  </View>
                  <Text style={styles.rowAction}>Seleccionar</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </WireframeSection>

        <WireframeSection>
          <Text style={styles.sectionTitle}>Unirme por slug</Text>
          <Text style={styles.label}>Slug del club</Text>
          <Text style={styles.helperText}>
            Escribe el identificador corto que te compartio el administrador del club.
          </Text>
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
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  backButtonText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '700',
  },
  title: { fontSize: 28, fontWeight: '700' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  row: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowMeta: { color: '#6B7280', marginTop: 2 },
  rowAction: { color: '#4F46E5', fontWeight: '600' },
})
