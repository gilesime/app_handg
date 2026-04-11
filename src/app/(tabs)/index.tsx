import React, { useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'

import { PrimaryFocusCard } from '@/components/dashboard/PrimaryFocusCard'
import {
  getCurrentStreakDays,
  getPrimaryTrainingFocus,
  getRewardHighlight,
  getWeeklyDistanceKm,
  getWeeklyXp,
} from '@/lib/competitive-insights'
import { formatDistance, formatDuration, getLevelProgress } from '@/lib/xp-engine'
import { activityApi, challengeApi, clubApi, rewardsApi } from '@/services/api'
import { useAuthStore, useClubStore } from '@/stores/activity-store'
import type { Activity, Challenge, LeaderboardEntry } from '@/types'

export default function HomeScreen() {
  const { user } = useAuthStore()
  const { activeClub, membership } = useClubStore()

  const { data: leaderboard, isLoading: loadingLb, refetch: refetchLb } = useQuery({
    queryKey: ['leaderboard', activeClub?.id, 'weekly'],
    queryFn: () => clubApi.getLeaderboard(activeClub!.id, 'weekly'),
    enabled: !!activeClub,
  })

  const { data: challenges, isLoading: loadingCh, refetch: refetchCh } = useQuery({
    queryKey: ['challenges', activeClub?.id],
    queryFn: () => challengeApi.list(activeClub!.id),
    enabled: !!activeClub,
  })

  const { data: recentActivities, isLoading: loadingAct, refetch: refetchAct } = useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: () => activityApi.list({ club_id: activeClub?.id, limit: 5 }),
    enabled: !!activeClub,
  })

  const { data: offers, isLoading: loadingOffers, refetch: refetchOffers } = useQuery({
    queryKey: ['offers', activeClub?.id, 'dashboard-preview'],
    queryFn: () => rewardsApi.getOffers(activeClub!.id),
    enabled: !!activeClub,
  })

  const onRefresh = useCallback(() => {
    refetchLb()
    refetchCh()
    refetchAct()
    refetchOffers()
  }, [refetchAct, refetchCh, refetchLb, refetchOffers])

  const levelInfo = user ? getLevelProgress(user.total_xp) : null
  const activities = recentActivities?.data ?? []
  const weeklyDistanceKm = getWeeklyDistanceKm(activities)
  const weeklyXp = getWeeklyXp(activities)
  const streakDays = getCurrentStreakDays(activities)
  const primaryFocus = getPrimaryTrainingFocus({
    activities,
    challenges: challenges ?? [],
  })
  const rewardHighlight = getRewardHighlight({
    offers: offers ?? [],
    user,
    membership,
  })
  const hasLoadingState = loadingLb || loadingCh || loadingAct || loadingOffers

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#6366F1" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.display_name?.split(' ')[0]} 👋</Text>
            <Text style={styles.clubName}>{activeClub?.name ?? 'Sin club activo'}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.avatarText}>{user?.display_name?.[0]?.toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        </View>

        {levelInfo && (
          <View style={styles.xpCard}>
            <View style={styles.xpRow}>
              <View>
                <Text style={styles.xpLevel}>Nivel {levelInfo.level.level}</Text>
                <Text style={styles.xpTitle}>{levelInfo.level.title}</Text>
              </View>
              <View style={styles.xpRight}>
                <Text style={styles.xpTotal}>{user!.total_xp.toLocaleString()} XP</Text>
                <Text style={styles.xpToNext}>+{levelInfo.xp_to_next} para nivel {levelInfo.level.level + 1}</Text>
              </View>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${levelInfo.progress_pct}%` as const }]} />
            </View>
          </View>
        )}

        <PrimaryFocusCard
          eyebrow="Hoy"
          title={primaryFocus.title}
          subtitle={primaryFocus.subtitle}
          progressLabel={primaryFocus.progressLabel}
          progressPct={primaryFocus.progressPct}
          ctaLabel={primaryFocus.ctaLabel}
          secondaryLabel="Ver historial"
          onPressPrimary={() => router.push('/(tabs)/track')}
          onPressSecondary={() => router.push('/history')}
        />

        <View style={styles.momentumRow}>
          <MomentumCard label="Racha" value={`${streakDays} dias`} helper="Consistencia reciente" />
          <MomentumCard label="Ultimos 7 dias" value={formatDistance(weeklyDistanceKm)} helper={`${weeklyXp} XP acumulados`} />
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/map')}>
            <Text style={styles.actionBtnIcon}>🗺</Text>
            <Text style={styles.actionBtnText}>Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/rewards')}>
            <Text style={styles.actionBtnIcon}>🎁</Text>
            <Text style={styles.actionBtnText}>Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/devices')}>
            <Text style={styles.actionBtnIcon}>⌚</Text>
            <Text style={styles.actionBtnText}>Wearables</Text>
          </TouchableOpacity>
        </View>

        {rewardHighlight && (
          <View style={styles.rewardHighlight}>
            <Text style={styles.rewardHighlightEyebrow}>Recompensa sugerida</Text>
            <Text style={styles.rewardHighlightTitle}>{rewardHighlight.title}</Text>
            <Text style={styles.rewardHighlightText}>{rewardHighlight.subtitle}</Text>
            <TouchableOpacity style={styles.rewardHighlightAction} onPress={() => router.push('/(tabs)/rewards')}>
              <Text style={styles.rewardHighlightActionText}>Ver recompensas</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeClub && (
          <Section title="Retos activos" onSeeAll={() => router.push('/history')}>
            {loadingCh ? (
              <ActivityIndicator color="#6366F1" style={{ marginVertical: 16 }} />
            ) : (challenges ?? []).length === 0 ? (
              <EmptyHint text="No hay retos activos" />
            ) : (
              (challenges ?? []).slice(0, 3).map((challenge) => (
                <ChallengeRow key={challenge.id} challenge={challenge} />
              ))
            )}
          </Section>
        )}

        {activeClub && (
          <Section title="Ranking semanal">
            {loadingLb ? (
              <ActivityIndicator color="#6366F1" style={{ marginVertical: 16 }} />
            ) : (leaderboard ?? []).length === 0 ? (
              <EmptyHint text="Sé el primero en registrar una actividad" />
            ) : (
              (leaderboard ?? []).slice(0, 5).map((entry) => (
                <LeaderboardRow key={entry.user_id} entry={entry} currentUserId={user?.id} />
              ))
            )}
          </Section>
        )}

        <Section title="Actividades recientes" onSeeAll={() => router.push('/history')}>
          {loadingAct ? (
            <ActivityIndicator color="#6366F1" style={{ marginVertical: 16 }} />
          ) : activities.length === 0 ? (
            <EmptyHint text="Aún no tienes actividades registradas" />
          ) : (
            activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />)
          )}
        </Section>

        {hasLoadingState && <ActivityIndicator color="#6366F1" style={styles.bottomLoader} />}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function Section({
  title, children, onSeeAll
}: { title: string; children: React.ReactNode; onSeeAll?: () => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <View style={styles.emptyHint}>
      <Text style={styles.emptyHintText}>{text}</Text>
    </View>
  )
}

function MomentumCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <View style={styles.momentumCard}>
      <Text style={styles.momentumLabel}>{label}</Text>
      <Text style={styles.momentumValue}>{value}</Text>
      <Text style={styles.momentumHelper}>{helper}</Text>
    </View>
  )
}

function ChallengeRow({ challenge }: { challenge: Challenge }) {
  const progress = challenge.progress ?? 0
  const pct = Math.min(100, (progress / challenge.criteria.target_value) * 100)
  const daysLeft = Math.ceil(
    (new Date(challenge.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <View style={styles.challengeRow}>
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeName}>{challenge.title}</Text>
        <Text style={styles.challengeMeta}>
          {progress.toFixed(1)} / {challenge.criteria.target_value} {challenge.criteria.unit}
          {'  ·  '}{daysLeft}d restantes
        </Text>
      </View>
      <View style={styles.challengeXP}>
        <Text style={styles.challengeXPText}>+{challenge.xp_reward} XP</Text>
      </View>
      <View style={styles.challengeBarBg}>
        <View style={[styles.challengeBarFill, { width: `${pct}%` as const }]} />
      </View>
    </View>
  )
}

function LeaderboardRow({ entry, currentUserId }: { entry: LeaderboardEntry; currentUserId?: string }) {
  const isMe = entry.user_id === currentUserId
  const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null

  return (
    <View style={[styles.lbRow, isMe && styles.lbRowMe]}>
      <Text style={styles.lbRank}>{medal ?? `#${entry.rank}`}</Text>
      <View style={styles.lbAvatarSmall}>
        <Text style={styles.lbAvatarText}>{entry.display_name[0].toUpperCase()}</Text>
      </View>
      <Text style={[styles.lbName, isMe && styles.lbNameMe]} numberOfLines={1}>
        {entry.display_name}
      </Text>
      <Text style={styles.lbValue}>{entry.value.toFixed(1)} km</Text>
    </View>
  )
}

function ActivityRow({ activity }: { activity: Activity }) {
  const date = new Date(activity.started_at)
  const label = date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <TouchableOpacity
      style={styles.actRow}
      onPress={() => router.push({ pathname: '/activity-summary', params: { activity_id: activity.id } })}
      activeOpacity={0.75}
    >
      <View style={styles.actIcon}>
        <Text style={styles.actIconText}>🏃</Text>
      </View>
      <View style={styles.actInfo}>
        <Text style={styles.actDate}>{label}</Text>
        <Text style={styles.actStats}>
          {formatDistance(activity.distance_km)} · {formatDuration(activity.duration_s)}
        </Text>
      </View>
      <View style={styles.actXP}>
        <Text style={styles.actXPText}>+{activity.xp_earned} XP</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 8,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  clubName: { fontSize: 13, color: '#A78BFA', marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  xpCard: {
    margin: 16,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  xpLevel: { fontSize: 13, color: '#A78BFA', fontWeight: '600' },
  xpTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  xpRight: { alignItems: 'flex-end' },
  xpTotal: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  xpToNext: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  xpBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  xpBarFill: { height: 6, backgroundColor: '#6366F1', borderRadius: 3 },
  momentumRow: { flexDirection: 'row', gap: 10, marginTop: 12, paddingHorizontal: 16 },
  momentumCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  momentumLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  momentumValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 6 },
  momentumHelper: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 4 },
  quickActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionBtnIcon: { fontSize: 18 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  rewardHighlight: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: 'rgba(16,185,129,0.14)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.2)',
  },
  rewardHighlightEyebrow: { color: '#6EE7B7', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  rewardHighlightTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginTop: 8 },
  rewardHighlightText: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 6, lineHeight: 18 },
  rewardHighlightAction: { marginTop: 12, alignSelf: 'flex-start' },
  rewardHighlightActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  seeAll: { fontSize: 13, color: '#A78BFA' },
  emptyHint: { paddingVertical: 16, alignItems: 'center' },
  emptyHintText: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },
  challengeRow: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  challengeInfo: { marginBottom: 8 },
  challengeName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  challengeMeta: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  challengeXP: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  challengeXPText: { color: '#FBBF24', fontSize: 11, fontWeight: '700' },
  challengeBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 },
  challengeBarFill: { height: 4, backgroundColor: '#6366F1', borderRadius: 2 },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lbRowMe: { backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 10, paddingHorizontal: 8 },
  lbRank: { width: 28, fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  lbAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lbAvatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  lbName: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  lbNameMe: { color: '#A78BFA', fontWeight: '600' },
  lbValue: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  actRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  actIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actIconText: { fontSize: 18 },
  actInfo: { flex: 1 },
  actDate: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  actStats: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginTop: 1 },
  actXP: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  actXPText: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  bottomLoader: { marginTop: 12 },
})
