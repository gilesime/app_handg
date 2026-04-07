import React, { useState } from 'react'
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
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
    <AuthScaffold title="Recuperar password" subtitle="Te enviaremos un enlace de recuperacion al correo asociado a tu cuenta.">
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Correo electronico</Text>
        <Text style={styles.helperText}>Usa el mismo correo con el que inicias sesion en la app.</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="tu@correo.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

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
