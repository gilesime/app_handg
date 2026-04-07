import type { UserPreferences } from '@/types'

export const CONSENT_VERSION = '2026-04'

export function getDefaultUserPreferences(
  overrides?: Partial<UserPreferences>
): UserPreferences {
  return {
    units: 'km',
    notifications_enabled: false,
    privacy_mode: 'club_only',
    privacy_policy_accepted: false,
    data_use_accepted: false,
    marketing_push_enabled: false,
    marketing_email_enabled: false,
    in_app_notifications_enabled: false,
    communications_choice_recorded: false,
    consent_version: CONSENT_VERSION,
    consent_updated_at: undefined,
    ...overrides,
  }
}

export function normalizeUserPreferences(
  preferences?: Partial<UserPreferences> | null
): UserPreferences {
  return getDefaultUserPreferences({
    ...(preferences ?? {}),
    consent_version: preferences?.consent_version ?? CONSENT_VERSION,
  })
}

export function hasCompletedConsent(
  preferences?: Partial<UserPreferences> | null
): boolean {
  const normalized = normalizeUserPreferences(preferences)

  return (
    normalized.privacy_policy_accepted &&
    normalized.data_use_accepted &&
    normalized.communications_choice_recorded
  )
}

export function getConsentSummary(
  preferences?: Partial<UserPreferences> | null
): string {
  const normalized = normalizeUserPreferences(preferences)
  const enabledChannels: string[] = []

  if (normalized.notifications_enabled) enabledChannels.push('operativas')
  if (normalized.marketing_push_enabled) enabledChannels.push('push comercial')
  if (normalized.marketing_email_enabled) enabledChannels.push('email comercial')
  if (normalized.in_app_notifications_enabled) enabledChannels.push('mensajes in-app')

  if (enabledChannels.length === 0) {
    return 'Sin canales comerciales activos'
  }

  return enabledChannels.join(', ')
}
