import {
  buildOnboardingPayloads,
  DEFAULT_FORM_DATA,
  derivePriorityOrder,
  mapInitialFormData,
} from '@/features/onboarding/onboarding.mapper'
import type { OnboardingFormData, Preference, Profile } from '@/types'

describe('onboarding.mapper', () => {
  it('derives priority order by descending backend weights', () => {
    const preference: Preference = {
      id: 'pref-1',
      userId: 'user-1',
      genderPreference: 'any',
      minBudget: 900,
      maxBudget: 1900,
      city: 'Toronto',
      cleanliness: 4,
      sleepSchedule: 3,
      smoking: false,
      drinking: false,
      pets: false,
      socialLevel: 3,
      weightCleanliness: 20,
      weightSleep: 30,
      weightHabits: 40,
      weightSocial: 10,
      createdAt: '2026-04-05T00:00:00.000Z',
      updatedAt: '2026-04-05T00:00:00.000Z',
    }

    expect(derivePriorityOrder(preference)).toEqual([
      'habits',
      'sleep',
      'cleanliness',
      'social',
    ])
  })

  it('maps onboarding form into profile/preference payloads with ranked weights', () => {
    const formData: OnboardingFormData = {
      ...DEFAULT_FORM_DATA,
      name: '  Riley  ',
      city: '  Austin ',
      smoking: 'outside' as const,
      pets: 'have' as const,
      photos: [],
      priorityOrder: ['social', 'cleanliness', 'sleep', 'habits'],
    }

    const { profilePayload, preferencePayload } = buildOnboardingPayloads(
      formData,
      'https://images.test/avatar.jpg',
    )

    expect(profilePayload).toMatchObject({
      name: 'Riley',
      city: 'Austin',
      onboardingCompleted: true,
      photos: ['https://images.test/avatar.jpg'],
    })

    expect(preferencePayload).toMatchObject({
      city: 'Austin',
      smoking: true,
      pets: true,
      weightSocial: 40,
      weightCleanliness: 30,
      weightSleep: 20,
      weightHabits: 10,
    })
  })

  it('uses fallback user name when profile is missing', () => {
    const profile: Profile | null = null
    const preference: Preference | null = null

    const mapped = mapInitialFormData(profile, preference, 'Jordan')

    expect(mapped.name).toBe('Jordan')
    expect(mapped.priorityOrder).toEqual(['cleanliness', 'sleep', 'habits', 'social'])
  })
})
