import React from 'react'
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'

import { useAuthStore } from '@/stores/activity-store'

export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding)

  const handleContinue = () => {
    completeOnboarding()
    router.replace('/(auth)/sign-in')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido a LoyalRun</Text>
        <Text>1. Crea tu cuenta o inicia sesion.</Text>
        <Text>2. Elige un club deportivo.</Text>
        <Text>3. Registra actividades, gana XP y canjea beneficios.</Text>
        <Button title="Comenzar" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 30, fontWeight: '700' },
})
