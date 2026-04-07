import type { WearableSessionDraft } from '@/types/wearables'

const sessionDrafts: WearableSessionDraft[] = []

export const wearablesService = {
  async createSessionDraft(session: WearableSessionDraft): Promise<WearableSessionDraft> {
    sessionDrafts.unshift(session)
    return session
  },

  async listSessionDrafts(): Promise<WearableSessionDraft[]> {
    return sessionDrafts
  },
}
