import React, { useState } from 'react'
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Link, router } from 'expo-router'

import { normalizeUserPreferences } from '@/lib/consent'
import { AuthScaffold } from '@/components/wireframe/AuthScaffold'
import { demoUser } from '@/lib/demo-data'
import { isDemoMode } from '@/lib/demo-mode'
import { auth } from '@/lib/supabase'
import { useAuthStore } from '@/stores/activity-store'

export default function SignUpScreen() {
  const setUser = useAuthStore((state) => state.setUser)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false)
  const [acceptedDataUse, setAcceptedDataUse] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Campos incompletos', 'Completa nombre, correo y password.')
      return
    }

    if (!acceptedPrivacyPolicy || !acceptedDataUse) {
      Alert.alert(
        'Consentimiento requerido',
        'Necesitamos que aceptes la politica de privacidad y el uso de tus datos para crear tu cuenta.'
      )
      return
    }

    try {
      setIsSubmitting(true)
      await auth.signUp(email.trim(), password, displayName.trim(), {
        privacyPolicyAccepted: acceptedPrivacyPolicy,
        dataUseAccepted: acceptedDataUse,
      })
      if (isDemoMode) {
        setUser(
          demoUser({
            email: email.trim(),
            display_name: displayName.trim(),
            preferences: normalizeUserPreferences({
              privacy_policy_accepted: true,
              data_use_accepted: true,
              communications_choice_recorded: false,
            }),
          })
        )
        router.replace('/consent-preferences' as never)
        return
      }
      Alert.alert(
        'Cuenta creada',
        'Si tu proyecto requiere confirmacion por correo, revisa tu email antes de entrar. Tus preferencias comerciales las podras definir al iniciar sesion.'
      )
      router.replace('/(auth)/sign-in')
    } catch (error) {
      Alert.alert('No se pudo crear la cuenta', getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthScaffold title="Crear cuenta" subtitle="Completa estos datos para abrir tu cuenta y entrar al flujo principal.">
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre visible</Text>
          <Text style={styles.helperText}>Asi apareceras en rankings, perfil y retos del club.</Text>
        <TextInput
          placeholder="Ej. Gilberto"
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Correo electronico</Text>
          <Text style={styles.helperText}>Usaremos este correo para iniciar sesion y confirmar tu cuenta si aplica.</Text>
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
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.helperText}>Elige una clave segura para proteger tu cuenta.</Text>
        <TextInput
          placeholder="Minimo 8 caracteres"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        </View>

        <View style={styles.checkboxGroup}>
          <CheckboxRow
            checked={acceptedPrivacyPolicy}
            label="Acepto la politica de privacidad."
            description="Confirmo que lei el aviso de privacidad y entiendo el tratamiento general de mi informacion."
            onPress={() => setAcceptedPrivacyPolicy((value) => !value)}
          />
          <CheckboxRow
            checked={acceptedDataUse}
            label="Autorizo el uso de mis datos para operar la cuenta."
            description="Incluye autenticacion, actividad deportiva, club, recompensas y soporte dentro de LoyalRun."
            onPress={() => setAcceptedDataUse((value) => !value)}
          />
          <Text style={styles.legalNote}>
            Las preferencias de comunicaciones comerciales y notificaciones se configuran en el siguiente paso.
          </Text>
        </View>

        <Button
          title={isSubmitting ? 'Creando...' : 'Crear cuenta'}
          onPress={handleSignUp}
          disabled={isSubmitting}
        />

        <Link href="/(auth)/sign-in" style={styles.link}>
          Ya tengo cuenta
        </Link>
    </AuthScaffold>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error desconocido'
}

function CheckboxRow({
  checked,
  label,
  description,
  onPress,
}: {
  checked: boolean
  label: string
  description: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </View>
      <View style={styles.checkboxContent}>
        <Text style={styles.checkboxLabel}>{label}</Text>
        <Text style={styles.checkboxDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    borderColor: '#4F46E5',
    backgroundColor: '#4F46E5',
  },
  checkboxMark: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  checkboxContent: {
    flex: 1,
    gap: 3,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  checkboxDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  legalNote: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
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
  link: { marginTop: 8 },
})
