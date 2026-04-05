import type { OnboardingFormData } from '@/types'

export type PreAuthQuestionnaireDraft = {
  hasRoom: boolean
  city: string
  minBudget: number
  maxBudget: number
  sleepSchedule: OnboardingFormData['sleepSchedule']
  cleanliness: number
  socialLevel: number
  genderPreference: OnboardingFormData['genderPreference']
  priorityOrder: OnboardingFormData['priorityOrder']
}

const STORAGE_KEY = 'flately.preauth.questionnaire.v1'

const SLEEP_SCHEDULE_VALUES: OnboardingFormData['sleepSchedule'][] = ['early-bird', 'flexible', 'night-owl']
const GENDER_PREFERENCE_VALUES: OnboardingFormData['genderPreference'][] = ['any', 'female', 'male']
const PRIORITY_KEYS: OnboardingFormData['priorityOrder'] = ['cleanliness', 'sleep', 'habits', 'social']

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function isDraft(value: unknown): value is PreAuthQuestionnaireDraft {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  const priorityOrder = record.priorityOrder

  const hasValidPriorityOrder =
    Array.isArray(priorityOrder) &&
    priorityOrder.length === PRIORITY_KEYS.length &&
    priorityOrder.every((item) => typeof item === 'string' && PRIORITY_KEYS.includes(item as OnboardingFormData['priorityOrder'][number])) &&
    new Set(priorityOrder).size === PRIORITY_KEYS.length

  const sleepSchedule = record.sleepSchedule
  const genderPreference = record.genderPreference

  const minBudget = record.minBudget
  const maxBudget = record.maxBudget
  const cleanliness = record.cleanliness
  const socialLevel = record.socialLevel

  return (
    typeof record.hasRoom === 'boolean' &&
    typeof record.city === 'string' &&
    typeof minBudget === 'number' && Number.isFinite(minBudget) && minBudget >= 0 &&
    typeof maxBudget === 'number' && Number.isFinite(maxBudget) && maxBudget >= minBudget &&
    typeof sleepSchedule === 'string' && SLEEP_SCHEDULE_VALUES.includes(sleepSchedule as OnboardingFormData['sleepSchedule']) &&
    typeof cleanliness === 'number' && Number.isFinite(cleanliness) && cleanliness >= 1 && cleanliness <= 5 &&
    typeof socialLevel === 'number' && Number.isFinite(socialLevel) && socialLevel >= 1 && socialLevel <= 5 &&
    typeof genderPreference === 'string' && GENDER_PREFERENCE_VALUES.includes(genderPreference as OnboardingFormData['genderPreference']) &&
    hasValidPriorityOrder
  )
}

export function readPreAuthQuestionnaireDraft(): PreAuthQuestionnaireDraft | null {
  if (!isBrowser()) {
    return null
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (isDraft(parsed)) {
      return parsed
    }
  } catch {
    // ignore and clear corrupted state
  }

  window.sessionStorage.removeItem(STORAGE_KEY)
  return null
}

export function savePreAuthQuestionnaireDraft(draft: PreAuthQuestionnaireDraft): void {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearPreAuthQuestionnaireDraft(): void {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(STORAGE_KEY)
}