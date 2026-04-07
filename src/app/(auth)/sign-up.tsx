import React, { useState } from 'react'
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { Link, router } from 'expo-router'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Campos incompletos', 'Completa nombre, correo y password.')
      return
    }

    try {
      setIsSubmitting(true)
      await auth.signUp(email.trim(), password, displayName.trim())
      if (isDemoMode) {
        setUser(
          demoUser({
            email: email.trim(),
            display_name: displayName.trim(),
          })
        )
        router.replace('/select-club')
        return
      }
      Alert.alert(
        'Cuenta creada',
        'Si tu proyecto requiere confirmación por correo, revisa tu email antes de entrar.'
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
          keyboardType="email-address"
          placeholder="tu@correo.com"
          style={styles.input}
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

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
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
