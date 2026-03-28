const hasSupabaseEnv =
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)

export const isDemoMode =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ||
  (!hasSupabaseEnv && process.env.EXPO_PUBLIC_DEMO_MODE !== 'false')
