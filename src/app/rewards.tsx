import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, Alert, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useClubStore } from '../../stores/activity-store'
import { useAuthStore } from '../../stores/activity-store'
import { rewardsApi } from '../../services/api'
import type { BusinessOffer, RewardTransaction } from '../../types'

export default function RewardsScreen() {
  const { activeClub, membership } = useClubStore()
  const { user } = useAuthStore()
  const [selectedOffer, setSelectedOffer] = useState<BusinessOffer | null>(null)
  const [qrTransaction, setQrTransaction] = useState<RewardTransaction | null>(null)

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers', activeClub?.id],
    queryFn: () => rewardsApi.getOffers(activeClub!.id),
    enabled: !!activeClub,
  })

  const redeemMutation = useMutation({
    mutationFn: (offer_id: string) => rewardsApi.generateRedemption(offer_id),
    onSuccess: (transaction) => {
      setQrTransaction(transaction)
      setSelectedOffer(null)
    },
    onError: (e: any) => Alert.alert('Error al canjear', e.message),
  })

  const userPoints = membership?.club_xp ?? 0
  const userXP = user?.total_xp ?? 0

  if (!activeClub) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin club activo</Text>
          <Text style={styles.emptySubtitle}>Únete a un club para ver ofertas</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recompensas</Text>
        <View style={styles.balancePills}>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>XP</Text>
            <Text style={styles.pillValue}>{userXP.toLocaleString()}</Text>
          </View>
          <View style={[styles.pill, styles.pillPoints]}>
            <Text style={styles.pillLabel}>Puntos</Text>
            <Text style={styles.pillValue}>{userPoints.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Offers list */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6366F1" />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin ofertas disponibles</Text>
              <Text style={styles.emptySubtitle}>Los negocios irán agregando beneficios</Text>
            </View>
          }
          renderItem={({ item }) => (
            <OfferCard
              offer={item}
              userXP={userXP}
              userPoints={userPoints}
              onPress={() => setSelectedOffer(item)}
            />
          )}
        />
      )}

      {/* Offer detail modal */}
      <Modal visible={!!selectedOffer} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedOffer && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalBusiness}>{selectedOffer.business.name}</Text>
                  <Text style={styles.modalTitle}>{selectedOffer.title}</Text>
                  <Text style={styles.modalDescription}>{selectedOffer.description}</Text>
                </View>

                <View style={styles.costRow}>
                  {selectedOffer.xp_cost && (
                    <View style={styles.costBadge}>
                      <Text style={styles.costBadgeText}>{selectedOffer.xp_cost} XP</Text>
                    </View>
                  )}
                  {selectedOffer.points_cost && (
                    <View style={[styles.costBadge, styles.costBadgePoints]}>
                      <Text style={styles.costBadgeText}>{selectedOffer.points_cost} pts</Text>
                    </View>
                  )}
                </View>

                <View style={styles.discountBanner}>
                  <Text style={styles.discountText}>
                    {selectedOffer.discount_type === 'percentage'
                      ? `${selectedOffer.discount_value}% de descuento`
                      : `$${selectedOffer.discount_value} de descuento`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    redeemMutation.isPending && styles.redeemButtonDisabled,
                  ]}
                  onPress={() => redeemMutation.mutate(selectedOffer.id)}
                  disabled={redeemMutation.isPending}
                >
                  {redeemMutation.isPending ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.redeemButtonText}>Canjear oferta</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setSelectedOffer(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* QR Modal */}
      <Modal visible={!!qrTransaction} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>¡Listo para canjear!</Text>
            <Text style={styles.qrSubtitle}>Muestra este código al negocio</Text>
            <View style={styles.qrBox}>
              {/* In production, render QR using react-native-qrcode-svg */}
              <Text style={styles.qrCode}>{qrTransaction?.qr_code}</Text>
            </View>
            <Text style={styles.qrExpiry}>
              Válido por 30 minutos
            </Text>
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={() => setQrTransaction(null)}
            >
              <Text style={styles.redeemButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function OfferCard({
  offer, userXP, userPoints, onPress
}: {
  offer: BusinessOffer
  userXP: number
  userPoints: number
  onPress: () => void
}) {
  const canAfford =
    (!offer.xp_cost || userXP >= offer.xp_cost) &&
    (!offer.points_cost || userPoints >= offer.points_cost)

  const expiresDate = new Date(offer.expires_at)
  const daysLeft = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <TouchableOpacity
      style={[styles.offerCard, !canAfford && styles.offerCardDisabled]}
      onPress={onPress}
      disabled={!canAfford}
      activeOpacity={0.75}
    >
      <View style={styles.offerHeader}>
        <View style={styles.offerInfo}>
          <Text style={styles.offerBusiness}>{offer.business.name}</Text>
          <Text style={styles.offerTitle}>{offer.title}</Text>
        </View>
        <View style={styles.discountChip}>
          <Text style={styles.discountChipText}>
            {offer.discount_type === 'percentage'
              ? `-${offer.discount_value}%`
              : `-$${offer.discount_value}`}
          </Text>
        </View>
      </View>

      <View style={styles.offerFooter}>
        <View style={styles.costTags}>
          {offer.xp_cost && (
            <Text style={styles.costTag}>{offer.xp_cost} XP</Text>
          )}
          {offer.points_cost && (
            <Text style={styles.costTag}>{offer.points_cost} puntos</Text>
          )}
        </View>
        <Text style={styles.expiryTag}>
          {daysLeft <= 0 ? 'Vence hoy' : `${daysLeft}d restantes`}
        </Text>
      </View>

      {!canAfford && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedText}>🔒 XP insuficiente</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    padding: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  balancePills: { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  pillPoints: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  pillLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  pillValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  list: { padding: 16, gap: 12 },
  offerCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  offerCardDisabled: { opacity: 0.5 },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  offerInfo: { flex: 1, marginRight: 12 },
  offerBusiness: { fontSize: 12, color: '#A78BFA', marginBottom: 4, fontWeight: '600' },
  offerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  discountChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  discountChipText: { color: '#34D399', fontSize: 14, fontWeight: '700' },
  offerFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
  costTags: { flexDirection: 'row', gap: 6 },
  costTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  expiryTag: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  lockedOverlay: {
    position: 'absolute',
    bottom: 0, right: 0,
    backgroundColor: 'rgba(15,15,26,0.8)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderTopLeftRadius: 8,
  },
  lockedText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    gap: 16,
  },
  modalHeader: { gap: 6 },
  modalBusiness: { fontSize: 13, color: '#A78BFA', fontWeight: '600' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  modalDescription: { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 20 },
  costRow: { flexDirection: 'row', gap: 8 },
  costBadge: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.5)',
  },
  costBadgePoints: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderColor: 'rgba(245,158,11,0.5)',
  },
  costBadgeText: { color: '#FFFFFF', fontWeight: '600' },
  discountBanner: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: 12, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  discountText: { color: '#34D399', fontSize: 20, fontWeight: '700' },
  redeemButton: {
    backgroundColor: '#6366F1', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  redeemButtonDisabled: { opacity: 0.5 },
  redeemButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  cancelButton: { alignItems: 'center', paddingVertical: 8 },
  cancelButtonText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },

  // QR modal
  qrCard: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    gap: 12, alignItems: 'center',
  },
  qrTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  qrSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  qrBox: {
    width: 220, height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginVertical: 8,
  },
  qrCode: { fontSize: 10, color: '#0F0F1A', textAlign: 'center', padding: 8 },
  qrExpiry: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
})
