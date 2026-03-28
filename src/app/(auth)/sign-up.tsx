import React, { useState } from 'react'
import { Alert, Button, StyleSheet, TextInput } from 'react-native'
import { Link, router } from 'expo-router'

import { AuthScaffold } from '@/components/wireframe/AuthScaffold'
import { auth } from '@/lib/supabase'

export default function SignUpScreen() {
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
    <AuthScaffold title="Crear cuenta" subtitle="Wireframe funcional para registrar usuarios nuevos.">
        <TextInput
          placeholder="Nombre visible"
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />
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
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
  link: { marginTop: 8 },
})
