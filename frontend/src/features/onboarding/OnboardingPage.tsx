import { type ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setProfile } from '@/features/profile/profileSlice'
import { runtimeConfig } from '@/config/runtimeConfig'
import { uploadImageToCloudinary } from '@/services/cloudinary'
import { toApiErrorMessage } from '@/services/api'
import { getMyPreferences, saveMyPreferences } from '@/services/preferences.transport'
import { getMyProfile, saveMyProfile } from '@/services/profile.transport'
import {
  buildOnboardingPayloads,
  DEFAULT_FORM_DATA,
  mapInitialFormData,
  PRIORITY_LABELS,
  PRIORITY_WEIGHTS,
} from '@/features/onboarding/onboarding.mapper'
import {
  clearPreAuthQuestionnaireDraft,
  readPreAuthQuestionnaireDraft,
} from '@/features/preauth/preauth.storage'
import type { OnboardingFormData } from '@/types'

export function OnboardingPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_FORM_DATA)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [manualPhotoUrl, setManualPhotoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      try {
        const [profile, preference] = await Promise.all([
          getMyProfile(),
          getMyPreferences(),
        ])

        if (cancelled) {
          return
        }

        if (profile?.onboardingCompleted) {
          navigate('/app', { replace: true })
          return
        }

        const mapped = mapInitialFormData(profile, preference, authUser?.name || '')
        const draft = readPreAuthQuestionnaireDraft()

        if (!profile && !preference && draft) {
          setFormData({
            ...mapped,
            hasRoom: draft.hasRoom,
            city: draft.city,
            minBudget: draft.minBudget,
            maxBudget: draft.maxBudget,
            sleepSchedule: draft.sleepSchedule,
            cleanliness: draft.cleanliness,
            socialLevel: draft.socialLevel,
            genderPreference: draft.genderPreference,
            priorityOrder: draft.priorityOrder,
          })
        } else {
          setFormData(mapped)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(toApiErrorMessage(loadError, 'Failed to load onboarding data'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [authUser?.name, navigate])

  function updateField<K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K],
  ): void {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function movePriority(index: number, direction: -1 | 1): void {
    setFormData((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.priorityOrder.length) {
        return prev
      }

      const nextOrder = [...prev.priorityOrder]
      const [item] = nextOrder.splice(index, 1)
      nextOrder.splice(nextIndex, 0, item)

      return {
        ...prev,
        priorityOrder: nextOrder,
      }
    })
  }

  async function onUploadImage(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setError(null)
    setUploading(true)
    try {
      const uploadedUrl = await uploadImageToCloudinary(file)
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, uploadedUrl],
      }))
    } catch (uploadError) {
      setError(toApiErrorMessage(uploadError, 'Image upload failed'))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function removePhoto(url: string): void {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo !== url),
    }))
  }

  function addPhotoFromUrl(): void {
    const candidate = manualPhotoUrl.trim()

    if (!candidate) {
      return
    }

    try {
      const parsedUrl = new URL(candidate)
      if (!/^https?:$/.test(parsedUrl.protocol)) {
        throw new Error('INVALID_PROTOCOL')
      }

      setFormData((prev) => {
        if (prev.photos.includes(parsedUrl.toString())) {
          return prev
        }

        return {
          ...prev,
          photos: [...prev.photos, parsedUrl.toString()],
        }
      })

      setManualPhotoUrl('')
      setError(null)
    } catch {
      setError('Photo URL must be a valid http(s) address.')
    }
  }

  function validateCurrentStep(): string | null {
    if (step === 1) {
      if (formData.name.trim().length < 2) {
        return 'Name must be at least 2 characters.'
      }
      if (!Number.isFinite(formData.age) || formData.age < 18 || formData.age > 99) {
        return 'Age must be between 18 and 99.'
      }
    }

    if (step === 2) {
      if (formData.city.trim().length < 2) {
        return 'City is required.'
      }
    }

    if (step === 3) {
      if (formData.minBudget < 0 || formData.maxBudget < 0) {
        return 'Budget values must be positive.'
      }
      if (formData.maxBudget < formData.minBudget) {
        return 'Maximum budget must be greater than or equal to minimum budget.'
      }
    }

    if (step === 5) {
      if (new Set(formData.priorityOrder).size !== 4) {
        return 'Priority ranking must include all four categories.'
      }
    }

    return null
  }

  function goNext(): void {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setStep((prev) => Math.min(prev + 1, 6))
  }

  function goBack(): void {
    setError(null)
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function submitOnboarding(): Promise<void> {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const { profilePayload, preferencePayload } = buildOnboardingPayloads(
        formData,
        authUser?.picture,
      )

      const savedProfile = await saveMyProfile(profilePayload)
      await saveMyPreferences(preferencePayload)
      clearPreAuthQuestionnaireDraft()
      dispatch(setProfile(savedProfile))
      navigate('/app', { replace: true })
    } catch (submitError) {
      setError(toApiErrorMessage(submitError, 'Failed to finish onboarding'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading onboarding data...</p>
  }

  return (
    <section className="rounded-lg border border-neutral-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Onboarding</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Step {step} of 6</h2>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-500">
          No mock data. Saved directly to backend.
        </p>
      </div>

      <div className="mt-5 space-y-5">
        {step === 1 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Step 1: Identity
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-border px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-slate-700">Age</span>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={formData.age}
                  onChange={(event) => updateField('age', Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-neutral-border px-3 py-2"
                />
              </label>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Gender</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {(['male', 'female', 'other', 'prefer-not-to-say'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => updateField('gender', gender)}
                    className={[
                      'rounded-md border px-3 py-2 text-sm capitalize',
                      formData.gender === gender
                        ? 'border-primary bg-mint text-primary'
                        : 'border-neutral-border text-slate-700',
                    ].join(' ')}
                  >
                    {gender.replaceAll('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Occupation</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(['student', 'professional'] as const).map((occupation) => (
                  <button
                    key={occupation}
                    type="button"
                    onClick={() => updateField('occupation', occupation)}
                    className={[
                      'rounded-md border px-3 py-2 text-sm capitalize',
                      formData.occupation === occupation
                        ? 'border-primary bg-mint text-primary'
                        : 'border-neutral-border text-slate-700',
                    ].join(' ')}
                  >
                    {occupation}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Bio</span>
              <textarea
                value={formData.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                rows={4}
                maxLength={500}
                className="mt-1 w-full rounded-md border border-neutral-border px-3 py-2"
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Photos</p>
                <p className="text-xs text-slate-500">
                  Cloudinary: {runtimeConfig.cloudinaryCloudName ? 'configured' : 'not configured'}
                </p>
              </div>

              {!runtimeConfig.cloudinaryCloudName ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Cloudinary is not configured in this environment. You can still continue by adding
                  photo URLs manually below.
                </p>
              ) : null}

              <input
                type="file"
                accept="image/*"
                onChange={onUploadImage}
                disabled={uploading}
                aria-label="Upload profile photo"
                title="Upload profile photo"
                className="block w-full text-sm text-slate-600"
              />

              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  type="url"
                  value={manualPhotoUrl}
                  onChange={(event) => setManualPhotoUrl(event.target.value)}
                  className="w-full rounded-md border border-neutral-border px-3 py-2 text-sm"
                  placeholder="https://example.com/photo.jpg"
                />
                <button
                  type="button"
                  onClick={addPhotoFromUrl}
                  className="rounded-md border border-neutral-border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add URL
                </button>
              </div>

              {uploading ? <p className="text-sm text-slate-500">Uploading image...</p> : null}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {formData.photos.map((photo) => (
                  <div key={photo} className="overflow-hidden rounded-md border border-neutral-border">
                    <img src={photo} alt="Uploaded profile" className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo)}
                      className="w-full border-t border-neutral-border px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Step 2: Housing Situation
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateField('hasRoom', true)}
                className={[
                  'rounded-md border px-4 py-5 text-left',
                  formData.hasRoom
                    ? 'border-primary bg-mint text-primary'
                    : 'border-neutral-border text-slate-700',
                ].join(' ')}
              >
                <p className="font-semibold">I have a room</p>
                <p className="mt-1 text-sm">Looking for a compatible flatmate to join.</p>
              </button>
              <button
                type="button"
                onClick={() => updateField('hasRoom', false)}
                className={[
                  'rounded-md border px-4 py-5 text-left',
                  !formData.hasRoom
                    ? 'border-primary bg-mint text-primary'
                    : 'border-neutral-border text-slate-700',
                ].join(' ')}
              >
                <p className="font-semibold">I am looking for a room</p>
                <p className="mt-1 text-sm">Need a place with a compatible flatmate.</p>
              </button>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">City</span>
              <input
                type="text"
                value={formData.city}
                onChange={(event) => updateField('city', event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-border px-3 py-2"
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Step 3: Budget
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Minimum Budget</span>
                <input
                  type="number"
                  min={0}
                  value={formData.minBudget}
                  onChange={(event) => updateField('minBudget', Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-neutral-border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Maximum Budget</span>
                <input
                  type="number"
                  min={0}
                  value={formData.maxBudget}
                  onChange={(event) => updateField('maxBudget', Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-neutral-border px-3 py-2"
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Step 4: Lifestyle and Habits
            </h3>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Sleep Schedule</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(['early-bird', 'flexible', 'night-owl'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('sleepSchedule', option)}
                    className={[
                      'rounded-md border px-3 py-2 text-sm',
                      formData.sleepSchedule === option
                        ? 'border-primary bg-mint text-primary'
                        : 'border-neutral-border text-slate-700',
                    ].join(' ')}
                  >
                    {option.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Noise Level ({formData.noiseLevel}/5)</span>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.noiseLevel}
                onChange={(event) => updateField('noiseLevel', Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Guest Policy</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {(['never', 'rarely', 'sometimes', 'often'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('guestPolicy', option)}
                    className={[
                      'rounded-md border px-3 py-2 text-sm capitalize',
                      formData.guestPolicy === option
                        ? 'border-primary bg-mint text-primary'
                        : 'border-neutral-border text-slate-700',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Smoking</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(['no', 'outside', 'yes'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateField('smoking', option)}
                      className={[
                        'rounded-md border px-3 py-2 text-sm capitalize',
                        formData.smoking === option
                          ? 'border-primary bg-mint text-primary'
                          : 'border-neutral-border text-slate-700',
                      ].join(' ')}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Pets</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(['no', 'have', 'love', 'allergic'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateField('pets', option)}
                      className={[
                        'rounded-md border px-3 py-2 text-sm capitalize',
                        formData.pets === option
                          ? 'border-primary bg-mint text-primary'
                          : 'border-neutral-border text-slate-700',
                      ].join(' ')}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Do you drink?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => updateField('drinking', value)}
                    className={[
                      'rounded-md border px-3 py-2 text-sm',
                      formData.drinking === value
                        ? 'border-primary bg-mint text-primary'
                        : 'border-neutral-border text-slate-700',
                    ].join(' ')}
                  >
                    {value ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">
                Cleanliness ({formData.cleanliness}/5)
              </span>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.cleanliness}
                onChange={(event) => updateField('cleanliness', Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Social Level ({formData.socialLevel}/5)</span>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.socialLevel}
                onChange={(event) => updateField('socialLevel', Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Step 5: What Matters Most
            </h3>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Gender Preference</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(['any', 'male', 'female'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField('genderPreference', option)}
                    className={[
                      'rounded-md border px-3 py-2 text-sm capitalize',
                      formData.genderPreference === option
                        ? 'border-primary bg-mint text-primary'
                        : 'border-neutral-border text-slate-700',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Rank priorities (top to bottom)</p>
              {formData.priorityOrder.map((key, index) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md border border-neutral-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      #{index + 1} {PRIORITY_LABELS[key]}
                    </p>
                    <p className="text-xs text-slate-500">Weight: {PRIORITY_WEIGHTS[index]}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => movePriority(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-neutral-border px-2 py-1 text-xs disabled:opacity-40"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => movePriority(index, 1)}
                      disabled={index === formData.priorityOrder.length - 1}
                      className="rounded border border-neutral-border px-2 py-1 text-xs disabled:opacity-40"
                    >
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Step 6: Review and Launch
            </h3>

            <div className="grid gap-3 rounded-md border border-neutral-border p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Identity</p>
                <p className="mt-1 text-sm text-slate-700">
                  {formData.name}, {formData.age} - {formData.occupation}
                </p>
                <p className="mt-1 text-sm text-slate-700">{formData.city}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Housing</p>
                <p className="mt-1 text-sm text-slate-700">
                  {formData.hasRoom ? 'Has a room' : 'Looking for a room'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Budget: {formData.minBudget} - {formData.maxBudget}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Lifestyle</p>
                <p className="mt-1 text-sm text-slate-700">
                  {formData.sleepSchedule}, guests {formData.guestPolicy}, smoking {formData.smoking}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Pets: {formData.pets}, drinking: {formData.drinking ? 'yes' : 'no'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Preference Priorities
                </p>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {formData.priorityOrder.map((key, index) => (
                    <li key={key}>
                      {index + 1}. {PRIORITY_LABELS[key]} ({PRIORITY_WEIGHTS[index]}%)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1 || submitting}
          className="rounded-md border border-neutral-border px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
        >
          Back
        </button>

        {step < 6 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={submitting || uploading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submitOnboarding}
            disabled={submitting || uploading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Finish onboarding'}
          </button>
        )}
      </div>
    </section>
  )
}
