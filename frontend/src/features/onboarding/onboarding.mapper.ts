import type { OnboardingFormData, Preference, Profile } from '@/types'

export type PriorityKey = OnboardingFormData['priorityOrder'][number]

export const PRIORITY_WEIGHTS: number[] = [40, 30, 20, 10]

export const PRIORITY_LABELS: Record<PriorityKey, string> = {
  cleanliness: 'Cleanliness',
  sleep: 'Sleep schedule',
  habits: 'Habits (smoking/drinking/pets)',
  social: 'Social life',
}

export const DEFAULT_FORM_DATA: OnboardingFormData = {
  name: '',
  age: 24,
  gender: 'prefer-not-to-say',
  bio: '',
  occupation: 'professional',
  photos: [],
  hasRoom: false,
  city: '',
  minBudget: 500,
  maxBudget: 1200,
  sleepSchedule: 'flexible',
  noiseLevel: 3,
  guestPolicy: 'sometimes',
  smoking: 'no',
  pets: 'no',
  drinking: false,
  cleanliness: 3,
  socialLevel: 3,
  genderPreference: 'any',
  priorityOrder: ['cleanliness', 'sleep', 'habits', 'social'],
}

const GENDER_VALUES: OnboardingFormData['gender'][] = ['male', 'female', 'other', 'prefer-not-to-say']
const OCCUPATION_VALUES: OnboardingFormData['occupation'][] = ['student', 'professional']
const SLEEP_VALUES: OnboardingFormData['sleepSchedule'][] = ['early-bird', 'flexible', 'night-owl']
const GUEST_POLICY_VALUES: OnboardingFormData['guestPolicy'][] = ['never', 'rarely', 'sometimes', 'often']
const SMOKING_VALUES: OnboardingFormData['smoking'][] = ['no', 'outside', 'yes']
const PET_VALUES: OnboardingFormData['pets'][] = ['no', 'have', 'love', 'allergic']
const GENDER_PREFERENCE_VALUES: OnboardingFormData['genderPreference'][] = ['male', 'female', 'any']

function pickEnum<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback
}

function clampNumber(
  value: number | null | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(min, Math.min(max, value))
}

function sanitizePriorityOrder(order: Preference | null): OnboardingFormData['priorityOrder'] {
  const derived = derivePriorityOrder(order)
  const unique = new Set(derived)
  if (unique.size !== DEFAULT_FORM_DATA.priorityOrder.length) {
    return DEFAULT_FORM_DATA.priorityOrder
  }
  return derived
}

export function toSleepScore(value: OnboardingFormData['sleepSchedule']): number {
  if (value === 'early-bird') {
    return 1
  }

  if (value === 'night-owl') {
    return 5
  }

  return 3
}

export function derivePriorityOrder(preference: Preference | null): PriorityKey[] {
  if (!preference) {
    return DEFAULT_FORM_DATA.priorityOrder
  }

  return [
    { key: 'cleanliness' as const, weight: preference.weightCleanliness },
    { key: 'sleep' as const, weight: preference.weightSleep },
    { key: 'habits' as const, weight: preference.weightHabits },
    { key: 'social' as const, weight: preference.weightSocial },
  ]
    .sort((a, b) => b.weight - a.weight)
    .map((entry) => entry.key)
}

export function mapInitialFormData(
  profile: Profile | null,
  preference: Preference | null,
  fallbackName: string,
): OnboardingFormData {
  if (!profile && !preference) {
    return {
      ...DEFAULT_FORM_DATA,
      name: fallbackName,
    }
  }

  return {
    ...DEFAULT_FORM_DATA,
    name: profile?.name || fallbackName || '',
    age: clampNumber(profile?.age ?? null, DEFAULT_FORM_DATA.age, 18, 99),
    gender: pickEnum(profile?.gender ?? null, GENDER_VALUES, DEFAULT_FORM_DATA.gender),
    bio: profile?.bio || '',
    occupation: pickEnum(
      profile?.occupation ?? null,
      OCCUPATION_VALUES,
      DEFAULT_FORM_DATA.occupation,
    ),
    photos: profile?.photos && profile.photos.length > 0 ? profile.photos : [],
    hasRoom: profile?.hasRoom ?? DEFAULT_FORM_DATA.hasRoom,
    city: profile?.city || preference?.city || '',
    minBudget: clampNumber(preference?.minBudget ?? null, DEFAULT_FORM_DATA.minBudget, 0, 50000),
    maxBudget: clampNumber(preference?.maxBudget ?? null, DEFAULT_FORM_DATA.maxBudget, 0, 50000),
    sleepSchedule: pickEnum(
      profile?.sleepSchedule ?? null,
      SLEEP_VALUES,
      DEFAULT_FORM_DATA.sleepSchedule,
    ),
    noiseLevel: clampNumber(profile?.noiseLevel ?? null, DEFAULT_FORM_DATA.noiseLevel, 1, 5),
    guestPolicy: pickEnum(
      profile?.guestPolicy ?? null,
      GUEST_POLICY_VALUES,
      DEFAULT_FORM_DATA.guestPolicy,
    ),
    smoking: pickEnum(profile?.smoking ?? null, SMOKING_VALUES, DEFAULT_FORM_DATA.smoking),
    pets: pickEnum(profile?.pets ?? null, PET_VALUES, DEFAULT_FORM_DATA.pets),
    drinking: preference?.drinking ?? DEFAULT_FORM_DATA.drinking,
    cleanliness: clampNumber(
      preference?.cleanliness ?? null,
      DEFAULT_FORM_DATA.cleanliness,
      1,
      5,
    ),
    socialLevel: clampNumber(
      preference?.socialLevel ?? null,
      DEFAULT_FORM_DATA.socialLevel,
      1,
      5,
    ),
    genderPreference: pickEnum(
      preference?.genderPreference ?? null,
      GENDER_PREFERENCE_VALUES,
      DEFAULT_FORM_DATA.genderPreference,
    ),
    priorityOrder: sanitizePriorityOrder(preference),
  }
}

function getPriorityWeights(
  priorityOrder: OnboardingFormData['priorityOrder'],
): Record<PriorityKey, number> {
  const entries = priorityOrder.map((key, index) => [
    key,
    PRIORITY_WEIGHTS[index],
  ])
  return Object.fromEntries(entries) as Record<PriorityKey, number>
}

export function buildOnboardingPayloads(
  formData: OnboardingFormData,
  authUserPicture?: string | null,
) {
  const assignedWeights = getPriorityWeights(formData.priorityOrder)

  const profilePayload = {
    name: formData.name.trim(),
    age: formData.age,
    gender: formData.gender,
    bio: formData.bio.trim(),
    photos:
      formData.photos.length > 0
        ? formData.photos
        : authUserPicture
          ? [authUserPicture]
          : [],
    city: formData.city.trim(),
    hasRoom: formData.hasRoom,
    occupation: formData.occupation,
    sleepSchedule: formData.sleepSchedule,
    noiseLevel: formData.noiseLevel,
    guestPolicy: formData.guestPolicy,
    smoking: formData.smoking,
    pets: formData.pets,
    onboardingCompleted: true,
  }

  const preferencePayload = {
    genderPreference: formData.genderPreference,
    minBudget: formData.minBudget,
    maxBudget: formData.maxBudget,
    city: formData.city.trim(),
    cleanliness: formData.cleanliness,
    sleepSchedule: toSleepScore(formData.sleepSchedule),
    smoking: formData.smoking !== 'no',
    drinking: formData.drinking,
    pets: formData.pets === 'have' || formData.pets === 'love',
    socialLevel: formData.socialLevel,
    weightCleanliness: assignedWeights.cleanliness,
    weightSleep: assignedWeights.sleep,
    weightHabits: assignedWeights.habits,
    weightSocial: assignedWeights.social,
  }

  return {
    profilePayload,
    preferencePayload,
  }
}