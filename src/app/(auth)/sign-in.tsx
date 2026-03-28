import React, { useState } from 'react'
import { Alert, Button, StyleSheet, TextInput } from 'react-native'
import { Link, router } from 'expo-router'

import { AuthScaffold } from '@/components/wireframe/AuthScaffold'
import { auth } from '@/lib/supabase'

export default function SignInScreen() {
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
      router.replace('/select-club')
    } catch (error) {
      Alert.alert('No se pudo iniciar sesión', getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthScaffold title="Iniciar sesión" subtitle="Accede para continuar al flujo principal del app.">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Correo"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

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
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
  link: { marginTop: 8 },
})
