import React, { useState } from 'react'
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { Link, router } from 'expo-router'

import { AuthScaffold } from '@/components/wireframe/AuthScaffold'
import { demoUser } from '@/lib/demo-data'
import { isDemoMode } from '@/lib/demo-mode'
import { auth } from '@/lib/supabase'
import { useAuthStore } from '@/stores/activity-store'

export default function SignInScreen() {
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Ingresa correo y password.')
      return
    }

    try {
      setIsSubmitting(true)
      await auth.signIn(email.trim(), password)
      if (isDemoMode) {
        setUser(
          demoUser({
            email: email.trim(),
            display_name: email.split('@')[0] ?? 'Demo Runner',
          })
        )
      }
      router.replace('/select-club')
    } catch (error) {
      Alert.alert('No se pudo iniciar sesión', getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthScaffold title="Iniciar sesión" subtitle="Accede con tu cuenta para continuar al flujo principal de LoyalRun.">
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Correo electronico</Text>
          <Text style={styles.helperText}>Ingresa el correo con el que registraste tu cuenta.</Text>
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
          <Text style={styles.helperText}>Escribe tu clave para entrar a tu cuenta.</Text>
        <TextInput
          placeholder="Tu password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        </View>

        <Button
          title={isSubmitting ? 'Entrando...' : 'Entrar'}
          onPress={handleSignIn}
          disabled={isSubmitting}
        />

        <Link href="/(auth)/sign-up" style={styles.link}>
          Crear una cuenta
        </Link>
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Olvide mi password
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
