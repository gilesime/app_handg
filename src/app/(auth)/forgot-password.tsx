import React, { useState } from 'react'
import { Alert, Button, StyleSheet, TextInput } from 'react-native'
import { Link } from 'expo-router'

import { AuthScaffold } from '@/components/wireframe/AuthScaffold'
import { auth } from '@/lib/supabase'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Correo requerido', 'Ingresa un correo para recuperar tu acceso.')
      return
    }

    try {
      setIsSubmitting(true)
      await auth.resetPassword(email.trim())
      Alert.alert('Correo enviado', 'Revisa tu email para continuar con la recuperacion.')
    } catch (error) {
      Alert.alert('No se pudo enviar el correo', getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthScaffold title="Recuperar password" subtitle="Envio basico de recovery email con Supabase Auth.">
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Correo"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <Button
        title={isSubmitting ? 'Enviando...' : 'Enviar enlace'}
        onPress={handleReset}
        disabled={isSubmitting}
      />

      <Link href="/(auth)/sign-in" style={styles.link}>
        Volver a iniciar sesion
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
