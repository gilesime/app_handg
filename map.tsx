import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { useQuery } from '@tanstack/react-query'
import { useClubStore } from '../../stores/activity-store'
import { rewardsApi } from '../../services/api'
import type { BusinessOffer } from '../../types'

export default function MapScreen() {
  const { activeClub } = useClubStore()
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<BusinessOffer | null>(null)

  useEffect(() => {
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((loc) => {
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        })
      })
      .catch(() => {})
  }, [])

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers', activeClub?.id],
    queryFn: () => rewardsApi.getOffers(activeClub!.id),
    enabled: !!activeClub,
  })

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Negocios cercanos</Text>
        <Text style={styles.subtitle}>
          {(offers ?? []).length} ofertas disponibles
        </Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        region={
          userLocation
            ? { ...userLocation, latitudeDelta: 0.03, longitudeDelta: 0.03 }
            : undefined
        }
        customMapStyle={darkMapStyle}
      >
        {/* User radius */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={2000}
            fillColor="rgba(99,102,241,0.08)"
            strokeColor="rgba(99,102,241,0.3)"
            strokeWidth={1}
          />
        )}

        {/* Business markers */}
        {(offers ?? []).map((offer) => (
          <Marker
            key={offer.id}
            coordinate={{
              latitude: offer.business.latitude,
              longitude: offer.business.longitude,
            }}
            onPress={() => setSelectedOffer(offer)}
          >
            <View style={[
              styles.marker,
              selectedOffer?.id === offer.id && styles.markerSelected
            ]}>
              <Text style={styles.markerText}>🎁</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#6366F1" />
        </View>
      )}

      {/* Selected offer card */}
      {selectedOffer && (
        <View style={styles.offerCard}>
          <View style={styles.offerCardHeader}>
            <View style={styles.offerCardInfo}>
              <Text style={styles.offerCardBusiness}>{selectedOffer.business.name}</Text>
              <Text style={styles.offerCardTitle}>{selectedOffer.title}</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                {selectedOffer.discount_type === 'percentage'
                  ? `-${selectedOffer.discount_value}%`
                  : `-$${selectedOffer.discount_value}`}
              </Text>
            </View>
          </View>

          <View style={styles.offerCardFooter}>
            <Text style={styles.offerCardAddress}>{selectedOffer.business.address}</Text>
            <TouchableOpacity
              style={styles.viewOfferBtn}
              onPress={() => setSelectedOffer(null)}
            >
              <Text style={styles.viewOfferBtnText}>Ver oferta →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 100, alignSelf: 'center',
    backgroundColor: 'rgba(15,15,26,0.8)', borderRadius: 20,
    padding: 12,
  },
  marker: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(26,26,46,0.95)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#6366F1',
    shadowColor: '#6366F1', shadowOpacity: 0.4,
    shadowRadius: 8, elevation: 4,
  },
  markerSelected: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.15)' },
  markerText: { fontSize: 20 },

  offerCard: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    backgroundColor: '#1A1A2E', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  offerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  offerCardInfo: { flex: 1, marginRight: 12 },
  offerCardBusiness: { fontSize: 12, color: '#A78BFA', fontWeight: '600', marginBottom: 2 },
  offerCardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  discountBadge: {
    backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)',
  },
  discountBadgeText: { color: '#34D399', fontWeight: '700', fontSize: 14 },
  offerCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerCardAddress: { color: 'rgba(255,255,255,0.4)', fontSize: 12, flex: 1, marginRight: 8 },
  viewOfferBtn: {
    backgroundColor: '#6366F1', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  viewOfferBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
})

// Google Maps dark style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c4a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1520' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e3a' }] },
]
