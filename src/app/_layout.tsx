import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import type { User as SupabaseUser } from '@supabase/supabase-js'

import { getDefaultUserPreferences, hasCompletedConsent, normalizeUserPreferences } from '@/lib/consent'
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
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="consent-preferences" />
            <Stack.Screen name="select-club" />
            <Stack.Screen name="history" />
            <Stack.Screen name="devices" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="activity-summary" options={{ presentation: 'modal' }} />
          </Stack>
          <AuthGate />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

function AuthGate() {
  const [canNavigate, setCanNavigate] = useState(false)
  const rootNavigationState = useRootNavigationState()
  const router = useRouter()
  const segments = useSegments()
  const {
    user,
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    setUser,
    setLoading,
  } = useAuthStore()
  const { activeClub } = useClubStore()

  useEffect(() => {
    if (!rootNavigationState?.key) return

    const timeoutId = setTimeout(() => {
      setCanNavigate(true)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [rootNavigationState?.key])

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
    if (!rootNavigationState?.key || !canNavigate || isLoading) return

    const rootSegment = segments[0] as string | undefined
    const inOnboarding = rootSegment === 'onboarding'
    const inAuthGroup = rootSegment === '(auth)'
    const inConsentPreferences = rootSegment === 'consent-preferences'
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

    if (user && !hasCompletedConsent(user.preferences)) {
      if (!inConsentPreferences) {
        router.replace('/consent-preferences' as never)
      }
      return
    }

    if (!activeClub) {
      if (!inClubSelection) {
        router.replace('/select-club')
      }
      return
    }

    if (inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [activeClub, canNavigate, isAuthenticated, isLoading, rootNavigationState?.key, router, segments, user])

  if (!isLoading) return null

  return (
    <View pointerEvents="none" style={styles.loadingOverlay}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Cargando LoyalRun...</Text>
    </View>
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
      preferences: normalizeUserPreferences({
        ...getDefaultUserPreferences(),
        privacy_policy_accepted: Boolean(sessionUser.user_metadata?.privacy_policy_accepted),
        data_use_accepted: Boolean(sessionUser.user_metadata?.data_use_accepted),
        communications_choice_recorded: Boolean(sessionUser.user_metadata?.communications_choice_recorded),
        consent_version:
          (sessionUser.user_metadata?.consent_version as string | undefined) ??
          getDefaultUserPreferences().consent_version,
      }),
      created_at: sessionUser.created_at ?? new Date().toISOString(),
    }
  }

  return {
    ...(data as User),
    preferences: normalizeUserPreferences((data as User).preferences),
  }
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
  },
})
