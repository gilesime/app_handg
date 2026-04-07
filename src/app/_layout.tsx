import React, { useEffect } from 'react'
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import type { User as SupabaseUser } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'
import { demoUser } from '@/lib/demo-data'
import { isDemoMode } from '@/lib/demo-mode'
import { useAuthStore, useClubStore } from '@/stores/activity-store'
import type { User } from '@/types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
    },
  },
})

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="light-content" />
          <AuthProvider />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

function AuthProvider() {
  const router = useRouter()
  const segments = useSegments()
  const {
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    setUser,
    setLoading,
  } = useAuthStore()
  const { activeClub } = useClubStore()

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user)
        setUser(profile)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user)
        setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setLoading, setUser])

  useEffect(() => {
    if (isLoading) return

    const rootSegment = segments[0]
    const inOnboarding = rootSegment === 'onboarding'
    const inAuthGroup = rootSegment === '(auth)'
    const inClubSelection = rootSegment === 'select-club'

    if (!hasCompletedOnboarding) {
      if (!inOnboarding) {
        router.replace('/onboarding')
      }
      return
    }

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in')
      }
      return
    }

    if (!activeClub) {
      if (!inClubSelection) {
        router.replace('/select-club')
      }
      return
    }

    if (inAuthGroup || inClubSelection) {
      router.replace('/(tabs)')
    }
  }, [activeClub, isAuthenticated, isLoading, router, segments])

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando LoyalRun...</Text>
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="select-club" />
      <Stack.Screen name="history" />
      <Stack.Screen name="devices" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activity-summary" options={{ presentation: 'modal' }} />
    </Stack>
  )
}

async function fetchProfile(sessionUser: SupabaseUser): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sessionUser.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (!data) {
    return {
      id: sessionUser.id,
      display_name:
        (sessionUser.user_metadata?.display_name as string | undefined) ??
        sessionUser.email?.split('@')[0] ??
        'Usuario',
      email: sessionUser.email ?? '',
      total_xp: 0,
      level: 1,
      preferences: {
        units: 'km',
        notifications_enabled: true,
        privacy_mode: 'club_only',
      },
      created_at: sessionUser.created_at ?? new Date().toISOString(),
    }
  }

  return data as User
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
  },
})