import React, { useEffect, useMemo, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, TextInput
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { getConsentSummary, hasCompletedConsent, normalizeUserPreferences } from '@/lib/consent'
import { useAuthStore, useClubStore } from '@/stores/activity-store'
import { auth } from '@/lib/supabase'
import { badgeApi } from '@/services/api'
import { getLevelProgress } from '@/lib/xp-engine'
import type { BadgeAward } from '@/types'

export default function ProfileScreen() {
  const { user, setUser, clear: clearAuth } = useAuthStore()
  const { activeClub, clear: clearClub } = useClubStore()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: () => badgeApi.getUserBadges(user!.id),
    enabled: !!user,
  })

  const levelInfo = user ? getLevelProgress(user.total_xp) : null
  const consentPreferences = normalizeUserPreferences(user?.preferences)
  const consentSummary = getConsentSummary(consentPreferences)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.display_name)
    setEmail(user.email)
  }, [user])

  const hasProfileChanges = useMemo(() => {
    if (!user) return false
    return (
      displayName.trim() !== user.display_name ||
      email.trim().toLowerCase() !== user.email.toLowerCase()
    )
  }, [displayName, email, user])

  const handleSaveProfile = async () => {
    if (!user) return

    const nextDisplayName = displayName.trim()
    const nextEmail = email.trim().toLowerCase()

    if (!nextDisplayName || !nextEmail) {
      Alert.alert('Campos incompletos', 'Ingresa tu nombre y tu correo para guardar cambios.')
      return
    }

    try {
      setIsSavingProfile(true)
      const updatedUser = await auth.updateProfile(user, {
        displayName: nextDisplayName,
        email: nextEmail,
      })
      setUser(updatedUser)
      Alert.alert(
        'Perfil actualizado',
        nextEmail !== user.email.toLowerCase()
          ? 'Tus cambios se guardaron. Si cambiaste el correo, revisa si tu proyecto requiere confirmacion por email.'
          : 'Tus datos se guardaron correctamente.'
      )
    } catch (error) {
      Alert.alert('No se pudo actualizar el perfil', getErrorMessage(error))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await auth.signOut()
          clearAuth()
          clearClub()
        },
      },
    ])
  }

  if (!user) return null

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user.display_name[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{user.display_name}</Text>
          {levelInfo && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                Nivel {levelInfo.level.level} · {levelInfo.level.title}
              </Text>
            </View>
          )}
        </View>

        {/* XP Progress */}
        {levelInfo && (
          <View style={styles.xpSection}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>{user.total_xp.toLocaleString()} XP</Text>
              <Text style={styles.xpToNext}>
                {levelInfo.xp_to_next.toLocaleString()} para Nivel {levelInfo.level.level + 1}
              </Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${levelInfo.progress_pct}%` as any }]} />
            </View>
          </View>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Total XP" value={user.total_xp.toLocaleString()} icon="⚡" />
          <StatCard label="Nivel" value={String(user.level)} icon="🏅" />
          <StatCard label="Badges" value={String(badges?.length ?? 0)} icon="🎖" />
          <StatCard label="Club" value={activeClub?.name ?? '—'} icon="👥" small />
        </View>

        {/* Editable profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis datos</Text>
          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre visible</Text>
              <Text style={styles.fieldHint}>
                Es el nombre que mostraremos en tu perfil, ranking y retos.
              </Text>
              <TextInput
                autoCapitalize="words"
                placeholder="Tu nombre"
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Correo electronico</Text>
              <Text style={styles.fieldHint}>
                Este correo se usa para iniciar sesion y recuperar tu cuenta.
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="tu@correo.com"
                spellCheck={false}
                style={styles.input}
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryAction,
                (!hasProfileChanges || isSavingProfile) && styles.primaryActionDisabled,
              ]}
              onPress={handleSaveProfile}
              disabled={!hasProfileChanges || isSavingProfile}
            >
              <Text style={styles.primaryActionText}>
                {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active club */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Club activo</Text>
          <TouchableOpacity
            style={styles.clubRow}
            onPress={() => router.push('/select-club')}
          >
            <View style={styles.clubDot} />
            <View style={styles.clubRowInfo}>
              <Text style={styles.clubRowName}>{activeClub?.name ?? 'Sin club seleccionado'}</Text>
              <Text style={styles.clubRowHint}>
                Cambia tu club activo o unete a uno nuevo con slug.
              </Text>
            </View>
            <Text style={styles.clubRowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad y comunicaciones</Text>
          <TouchableOpacity
            style={styles.clubRow}
            onPress={() => router.push('/consent-preferences' as never)}
          >
            <View style={styles.clubDot} />
            <View style={styles.clubRowInfo}>
              <Text style={styles.clubRowName}>
                {hasCompletedConsent(consentPreferences)
                  ? 'Consentimiento registrado'
                  : 'Completar consentimiento'}
              </Text>
              <Text style={styles.clubRowHint}>{consentSummary}</Text>
            </View>
            <Text style={styles.clubRowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis badges</Text>
          {loadingBadges ? (
            <ActivityIndicator color="#6366F1" style={{ marginVertical: 16 }} />
          ) : (badges ?? []).length === 0 ? (
            <View style={styles.emptyBadges}>
              <Text style={styles.emptyBadgesText}>
                Completa actividades para desbloquear badges
              </Text>
            </View>
          ) : (
            <View style={styles.badgesGrid}>
              {(badges ?? []).map((award) => (
                <BadgeItem key={award.id} award={award} />
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/devices')}>
            <Text style={styles.actionRowText}>Gestionar wearables</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/history')}>
            <Text style={styles.actionRowText}>Ver historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/onboarding')}>
            <Text style={styles.actionRowText}>Ver onboarding</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerAction} onPress={handleSignOut}>
            <Text style={styles.dangerActionText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function StatCard({
  label, value, icon, small
}: { label: string; value: string; icon: string; small?: boolean }) {
  return (
    <View style={[styles.statCard, small && { flex: 2 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function BadgeItem({ award }: { award: BadgeAward }) {
  const tierColors: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
  }
  const color = tierColors[award.badge.tier] ?? '#6366F1'

  return (
    <View style={styles.badgeItem}>
      <View style={[styles.badgeIconBg, { borderColor: color }]}>
        <Text style={styles.badgeIconText}>🎖</Text>
      </View>
      <Text style={styles.badgeName} numberOfLines={2}>{award.badge.name}</Text>
    </View>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error desconocido'
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  profileHeader: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarLargeText: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  displayName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  levelBadge: {
    marginTop: 8, backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
  },
  levelBadgeText: { color: '#A78BFA', fontSize: 13, fontWeight: '600' },

  xpSection: { paddingHorizontal: 20, marginBottom: 16 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { color: '#FFFFFF', fontWeight: '600' },
  xpToNext: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  xpBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  xpBarFill: { height: 6, backgroundColor: '#6366F1', borderRadius: 3 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fieldHint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
  },
  primaryAction: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  clubRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  clubRowInfo: { flex: 1 },
  clubDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },
  clubRowName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  clubRowHint: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 },
  clubRowArrow: { color: 'rgba(255,255,255,0.3)', fontSize: 20 },

  emptyBadges: { padding: 20, alignItems: 'center' },
  emptyBadgesText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: 14 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeItem: { alignItems: 'center', width: 72 },
  badgeIconBg: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, marginBottom: 6,
  },
  badgeIconText: { fontSize: 24 },
  badgeName: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

  actionRow: {
    paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
  },
  actionRowText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  dangerAction: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerActionText: { color: '#FCA5A5', fontSize: 15, fontWeight: '700' },
})
