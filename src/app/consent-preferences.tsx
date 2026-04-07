import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { getConsentSummary, hasCompletedConsent, normalizeUserPreferences } from '@/lib/consent'
import { auth } from '@/lib/supabase'
import { useAuthStore, useClubStore } from '@/stores/activity-store'

export default function ConsentPreferencesScreen() {
  const { user, setUser } = useAuthStore()
  const { activeClub } = useClubStore()
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [dataUseAccepted, setDataUseAccepted] = useState(false)
  const [operationalPushEnabled, setOperationalPushEnabled] = useState(false)
  const [marketingPushEnabled, setMarketingPushEnabled] = useState(false)
  const [marketingEmailEnabled, setMarketingEmailEnabled] = useState(false)
  const [inAppNotificationsEnabled, setInAppNotificationsEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    const preferences = normalizeUserPreferences(user.preferences)
    setPrivacyAccepted(preferences.privacy_policy_accepted)
    setDataUseAccepted(preferences.data_use_accepted)
    setOperationalPushEnabled(preferences.notifications_enabled)
    setMarketingPushEnabled(preferences.marketing_push_enabled)
    setMarketingEmailEnabled(preferences.marketing_email_enabled)
    setInAppNotificationsEnabled(preferences.in_app_notifications_enabled)
  }, [user])

  const isFirstSetup = useMemo(
    () => (user ? !hasCompletedConsent(user.preferences) : true),
    [user]
  )

  const currentSummary = useMemo(
    () =>
      getConsentSummary({
        notifications_enabled: operationalPushEnabled,
        marketing_push_enabled: marketingPushEnabled,
        marketing_email_enabled: marketingEmailEnabled,
        in_app_notifications_enabled: inAppNotificationsEnabled,
      }),
    [inAppNotificationsEnabled, marketingEmailEnabled, marketingPushEnabled, operationalPushEnabled]
  )

  const handleBack = () => {
    if (!isFirstSetup && activeClub) {
      router.back()
      return
    }

    router.replace('/(auth)/sign-in')
  }

  const handleSave = async () => {
    if (!user) return

    if (!privacyAccepted || !dataUseAccepted) {
      Alert.alert(
        'Consentimiento requerido',
        'Para continuar necesitamos que aceptes la politica de privacidad y el uso de tus datos.'
      )
      return
    }

    let nextOperationalPush = operationalPushEnabled
    let nextMarketingPush = marketingPushEnabled

    if (nextOperationalPush || nextMarketingPush) {
      const pushGranted = await auth.requestPushPermission()
      if (!pushGranted) {
        nextOperationalPush = false
        nextMarketingPush = false
        setOperationalPushEnabled(false)
        setMarketingPushEnabled(false)
        Alert.alert(
          'Permiso de push no concedido',
          'Guardaremos tus preferencias, pero las notificaciones push quedaran desactivadas hasta que las permitas en el sistema.'
        )
      }
    }

    try {
      setIsSaving(true)
      const updatedUser = await auth.updateConsentPreferences(user, {
        privacy_policy_accepted: true,
        data_use_accepted: true,
        notifications_enabled: nextOperationalPush,
        marketing_push_enabled: nextMarketingPush,
        marketing_email_enabled: marketingEmailEnabled,
        in_app_notifications_enabled: inAppNotificationsEnabled,
      })

      setUser(updatedUser)

      if (isFirstSetup) {
        router.replace(activeClub ? '/(tabs)' : '/select-club')
        return
      }

      Alert.alert('Preferencias guardadas', 'Tus consentimientos y canales de comunicacion se actualizaron.')
      router.replace('/(tabs)/profile')
    } catch (error) {
      Alert.alert(
        'No se pudieron guardar las preferencias',
        error instanceof Error ? error.message : 'Error desconocido'
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacidad y comunicaciones</Text>
          <Text style={styles.subtitle}>
            Gestiona el consentimiento para comunicaciones operativas, promociones y mensajes dentro
            de la app.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consentimientos obligatorios</Text>
          <Text style={styles.cardHint}>
            Estos consentimientos habilitan el tratamiento de datos y el uso normal de la cuenta.
          </Text>

          <PreferenceRow
            title="Acepto la politica de privacidad"
            description="Confirmo que lei el aviso de privacidad y entiendo como se usan mis datos."
            value={privacyAccepted}
            onValueChange={setPrivacyAccepted}
          />
          <PreferenceRow
            title="Autorizo el uso de mis datos"
            description="Autorizo el tratamiento de datos para autenticacion, tracking, club, recompensas y soporte."
            value={dataUseAccepted}
            onValueChange={setDataUseAccepted}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Canales de comunicacion</Text>
          <Text style={styles.cardHint}>
            Puedes aceptar o rechazar comunicaciones comerciales por canal y cambiarlas despues desde perfil.
          </Text>

          <PreferenceRow
            title="Notificaciones operativas push"
            description="Alertas necesarias para actividad, seguridad de la cuenta y eventos clave del servicio."
            value={operationalPushEnabled}
            onValueChange={setOperationalPushEnabled}
          />
          <PreferenceRow
            title="Push comerciales"
            description="Promociones, campañas, retos, beneficios y novedades del club por push."
            value={marketingPushEnabled}
            onValueChange={setMarketingPushEnabled}
          />
          <PreferenceRow
            title="Email comercial"
            description="Correos con descuentos, recordatorios, nuevas recompensas y novedades."
            value={marketingEmailEnabled}
            onValueChange={setMarketingEmailEnabled}
          />
          <PreferenceRow
            title="Mensajes in-app"
            description="Avisos dentro de la app sobre promociones, retos o contenido recomendado."
            value={inAppNotificationsEnabled}
            onValueChange={setInAppNotificationsEnabled}
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen actual</Text>
          <Text style={styles.summaryText}>{currentSummary}</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.primaryButtonText}>
            {isSaving
              ? 'Guardando...'
              : isFirstSetup
                ? 'Guardar y continuar'
                : 'Guardar preferencias'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function PreferenceRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
        thumbColor={value ? '#4F46E5' : '#F9FAFB'}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  hero: {
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    marginBottom: 4,
  },
  backButtonText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardHint: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceText: {
    flex: 1,
    gap: 4,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  preferenceDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#EEF2FF',
    gap: 6,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4338CA',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
