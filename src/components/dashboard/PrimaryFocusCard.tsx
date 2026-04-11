// Branch: feat/ux-competitive-wireframes
// Business need: create a single high-priority block on home so runners know
// what to do next without scanning multiple cards.

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export function PrimaryFocusCard({
  eyebrow,
  title,
  subtitle,
  progressLabel,
  progressPct,
  ctaLabel,
  secondaryLabel,
  onPressPrimary,
  onPressSecondary,
}: {
  eyebrow: string
  title: string
  subtitle: string
  progressLabel: string
  progressPct: number
  ctaLabel: string
  secondaryLabel: string
  onPressPrimary: () => void
  onPressSecondary: () => void
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progreso semanal</Text>
        <Text style={styles.progressValue}>{progressLabel}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` as const }]} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryAction} onPress={onPressPrimary}>
          <Text style={styles.primaryActionText}>{ctaLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} onPress={onPressSecondary}>
          <Text style={styles.secondaryActionText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#17172A',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eyebrow: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.62)', fontSize: 14, marginTop: 6, lineHeight: 20 },
  progressHeader: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  progressValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  progressTrack: {
    marginTop: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: '#6366F1' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  primaryAction: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  secondaryAction: {
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryActionText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
})
