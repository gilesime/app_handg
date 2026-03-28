import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

import { isDemoMode } from '@/lib/demo-mode'

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
  signUp: async (email: string, password: string, displayName: string) => {
    if (isDemoMode) {
      return {
        user: {
          id: 'demo-user',
          email,
          user_metadata: { display_name: displayName },
        },
      }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
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
