import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, Alert, ActivityIndicator
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore, useClubStore } from '@/stores/activity-store'
import { auth } from '@/lib/supabase'
import { badgeApi, clubApi } from '@/services/api'
import { getLevelProgress } from '@/lib/xp-engine'
import type { BadgeAward } from '@/types'

export default function ProfileScreen() {
  const { user, clear: clearAuth } = useAuthStore()
  const { activeClub, setActiveClub, clear: clearClub } = useClubStore()
  const [showClubPicker, setShowClubPicker] = useState(false)

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: () => badgeApi.getUserBadges(user!.id),
    enabled: !!user,
  })

  const { data: clubs } = useQuery({
    queryKey: ['user-clubs'],
    queryFn: () => clubApi.getUserClubs(),
    enabled: !!user,
  })

  const levelInfo = user ? getLevelProgress(user.total_xp) : null

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

        {/* Active club */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Club activo</Text>
          <TouchableOpacity
            style={styles.clubRow}
            onPress={() => setShowClubPicker(true)}
          >
            <View style={styles.clubDot} />
            <Text style={styles.clubRowName}>{activeClub?.name ?? 'Sin club seleccionado'}</Text>
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
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/history')}>
            <Text style={styles.actionRowText}>Ver historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/onboarding')}>
            <Text style={styles.actionRowText}>Ver onboarding</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
            <Text style={styles.actionRowTextDanger}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Club picker modal */}
      <Modal visible={showClubPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar club</Text>
            <ScrollView>
              {(clubs ?? []).map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={[
                    styles.clubPickerRow,
                    activeClub?.id === club.id && styles.clubPickerRowActive,
                  ]}
                  onPress={() => {
                    setActiveClub(club, (club as any).membership)
                    setShowClubPicker(false)
                  }}
                >
                  <View style={[styles.clubPickerDot, { backgroundColor: club.theme_config.primary_color }]} />
                  <View style={styles.clubPickerInfo}>
                    <Text style={styles.clubPickerName}>{club.name}</Text>
                    <Text style={styles.clubPickerType}>{club.sport_type}</Text>
                  </View>
                  {activeClub?.id === club.id && (
                    <Text style={styles.clubPickerCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowClubPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  clubRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  clubDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },
  clubRowName: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
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
  actionRowTextDanger: { color: '#EF4444', fontSize: 15, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#1A1A2E', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, maxHeight: '70%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  clubPickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  clubPickerRowActive: { backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 10, paddingHorizontal: 8 },
  clubPickerDot: { width: 12, height: 12, borderRadius: 6 },
  clubPickerInfo: { flex: 1 },
  clubPickerName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  clubPickerType: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 1 },
  clubPickerCheck: { color: '#6366F1', fontSize: 18, fontWeight: '700' },
  modalClose: { marginTop: 20, alignItems: 'center' },
  modalCloseText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
})
