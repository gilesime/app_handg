import { createClient } from '@supabase/supabase-js'
import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'

import { CONSENT_VERSION, normalizeUserPreferences } from '@/lib/consent'
import { isDemoMode } from '@/lib/demo-mode'
import type { User } from '@/types'

// ─── Supabase Client ──────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://demo.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'demo-anon-key'

// SecureStore adapter for Supabase Auth session persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export const auth = {
  signUp: async (
    email: string,
    password: string,
    displayName: string,
    {
      privacyPolicyAccepted,
      dataUseAccepted,
    }: {
      privacyPolicyAccepted: boolean
      dataUseAccepted: boolean
    }
  ) => {
    if (isDemoMode) {
      return {
        user: {
          id: 'demo-user',
          email,
          user_metadata: {
            display_name: displayName,
            privacy_policy_accepted: privacyPolicyAccepted,
            data_use_accepted: dataUseAccepted,
            communications_choice_recorded: false,
            consent_version: CONSENT_VERSION,
          },
        },
      }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          privacy_policy_accepted: privacyPolicyAccepted,
          data_use_accepted: dataUseAccepted,
          communications_choice_recorded: false,
          consent_version: CONSENT_VERSION,
        },
      },
    })
    if (error) throw error
    return data
  },

  signIn: async (email: string, password: string) => {
    if (isDemoMode) {
      return {
        user: {
          id: 'demo-user',
          email,
          user_metadata: { display_name: email.split('@')[0] ?? 'Demo Runner' },
        },
      }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  resetPassword: async (email: string) => {
    if (isDemoMode) {
      return { email }
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return data
  },

  signOut: async () => {
    if (isDemoMode) {
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  updateProfile: async (
    currentUser: User,
    {
      displayName,
      email,
    }: {
      displayName: string
      email: string
    }
  ): Promise<User> => {
    const nextDisplayName = displayName.trim()
    const nextEmail = email.trim().toLowerCase()

    if (!nextDisplayName || !nextEmail) {
      throw new Error('Nombre y correo son obligatorios.')
    }

    if (isDemoMode) {
      return {
        ...currentUser,
        display_name: nextDisplayName,
        email: nextEmail,
        preferences: normalizeUserPreferences(currentUser.preferences),
      }
    }

    const authUpdates: {
      email?: string
      data: { display_name: string }
    } = {
      data: { display_name: nextDisplayName },
    }

    if (nextEmail !== currentUser.email) {
      authUpdates.email = nextEmail
    }

    const { error: authError } = await supabase.auth.updateUser(authUpdates)
    if (authError) throw authError

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: currentUser.id,
          display_name: nextDisplayName,
          email: nextEmail,
          preferences: normalizeUserPreferences(currentUser.preferences),
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single()

    if (error) throw error

    return {
      ...currentUser,
      ...(data as Partial<User>),
      display_name: nextDisplayName,
      email: nextEmail,
      preferences: normalizeUserPreferences(
        (data as Partial<User>)?.preferences ?? currentUser.preferences
      ),
    }
  },

  updateConsentPreferences: async (
    currentUser: User,
    updates: Partial<User['preferences']>
  ): Promise<User> => {
    const nextPreferences = normalizeUserPreferences({
      ...currentUser.preferences,
      ...updates,
      consent_version: CONSENT_VERSION,
      consent_updated_at: new Date().toISOString(),
      communications_choice_recorded: true,
    })

    if (isDemoMode) {
      return {
        ...currentUser,
        preferences: nextPreferences,
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: currentUser.id,
          display_name: currentUser.display_name,
          email: currentUser.email,
          preferences: nextPreferences,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single()

    if (error) throw error

    return {
      ...currentUser,
      ...(data as Partial<User>),
      preferences: normalizeUserPreferences(
        (data as Partial<User>)?.preferences ?? nextPreferences
      ),
    }
  },

  requestPushPermission: async () => {
    const currentPermissions = await Notifications.getPermissionsAsync()

    if (
      currentPermissions.granted ||
      currentPermissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return true
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    })

    return (
      requestedPermissions.granted ||
      requestedPermissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    )
  },

  getSession: () => (isDemoMode ? Promise.resolve({ data: { session: null } }) : supabase.auth.getSession()),

  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    isDemoMode
      ? {
          data: {
            subscription: {
              unsubscribe: () => undefined,
            },
          },
        }
      : supabase.auth.onAuthStateChange(callback),
}

// ─── Database Helpers ─────────────────────────────────────────────────────────

export const db = {
  // Realtime subscription helper
  subscribe: <T>(
    table: string,
    filter: string,
    callback: (payload: T) => void
  ) => {
    return supabase
      .channel(`${table}:${filter}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter }, (payload) => {
        callback(payload.new as T)
      })
      .subscribe()
  },
}
