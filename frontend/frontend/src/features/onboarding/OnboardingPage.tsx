// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth0 } from '@auth0/auth0-react'
import { apiRequest } from '@/services/api'

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18).max(99),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  bio: z.string().max(500).optional(),
  sleepSchedule: z.enum(['early-bird', 'night-owl', 'flexible']),
  cleanliness: z.number().min(1).max(5),
  noiseLevel: z.number().min(1).max(5),
  guestPolicy: z.enum(['never', 'rarely', 'sometimes', 'often']),
  smoking: z.enum(['no', 'outside', 'yes']),
  pets: z.enum(['no', 'have', 'love', 'allergic']),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  city: z.string().min(2),
  moveInDate: z.string().optional(),
  photos: z.array(z.string()).optional(),
  occupation: z.enum(['student', 'professional']).optional(),
})

const STEPS = [
  { key: '01', label: 'BASIC_INTEL' },
  { key: '02', label: 'LOCATION' },
  { key: '03', label: 'BUDGET' },
  { key: '04', label: 'HABITS' },
  { key: '05', label: 'REVIEW' },
]

function TileRadio({ name, value, checked, onChange, icon, label, desc, size = 'normal' }) {
  return (
    <label className="cursor-pointer group">
      <input className="sr-only-input hidden" name={name} type="radio" value={value} checked={checked} onChange={() => onChange(value)} />
      <div className={`tile-label rounded-[8px] border border-neutral-200 ${size === 'sm' ? 'p-4 h-24' : desc ? 'p-5 h-28' : 'p-5 h-32'} flex ${desc ? 'items-center justify-between' : size === 'sm' ? 'flex-col justify-center items-center' : 'flex-col justify-between'} hover:border-[#166534]/50 transition-all duration-200 relative bg-white`}
        style={checked ? { borderColor: '#166534', backgroundColor: '#F0FDF4', boxShadow: '0 0 0 1px #166534 inset' } : {}}
      >
        {!desc && icon && (
          <div className="flex justify-between items-start">
            <span className={`icon-main material-symbols-outlined transition-colors ${checked ? 'text-[#166534]' : 'text-neutral-400 group-hover:text-[#166534]'}`}>{icon}</span>
            <span className={`check-icon material-symbols-outlined text-[#166534] text-lg transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}>check_circle</span>
          </div>
        )}
        {desc ? (
          <>
            <div className="flex flex-col">
              <span className={`font-mono text-sm font-bold mb-1 transition-colors ${checked ? 'text-[#166534]' : 'text-neutral-900 group-hover:text-[#166534]'}`}>{label}</span>
              <span className="text-xs text-neutral-500 font-display">{desc}</span>
            </div>
            <span className={`icon-main material-symbols-outlined text-3xl transition-colors ${checked ? 'text-[#166534]' : 'text-neutral-300 group-hover:text-[#166534]'}`}>{icon}</span>
            <span className={`check-icon absolute top-3 right-3 material-symbols-outlined text-[#166534] text-lg transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}>check_circle</span>
          </>
        ) : (
          <>
            {size === 'sm' && <span className={`check-icon absolute top-2 right-2 material-symbols-outlined text-[#166534] text-sm transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}>check_circle</span>}
            <span className={`font-mono ${size === 'sm' ? 'text-lg' : 'text-sm'} font-bold transition-colors ${checked ? 'text-[#166534]' : 'text-neutral-900 group-hover:text-[#166534]'}`}>{label}</span>
          </>
        )}
      </div>
    </label>
  )
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()

  const methods = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: '', age: 25, gender: 'prefer-not-to-say', bio: '', sleepSchedule: 'flexible', cleanliness: 3, noiseLevel: 3, guestPolicy: 'sometimes', smoking: 'no', pets: 'no', budgetMin: 500, budgetMax: 1500, city: '', moveInDate: '', photos: [], occupation: undefined },
    mode: 'onChange',
  })

  const { handleSubmit, trigger, watch, setValue } = methods
  const stepFields = { 0: ['gender', 'age'], 1: ['city'], 2: ['budgetMin', 'budgetMax'], 3: ['smoking', 'pets'], 4: [] }

  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep]
    const isValid = fieldsToValidate.length === 0 || await trigger(fieldsToValidate)
    if (isValid && currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await apiRequest('/profiles/me', { method: 'POST', data: { name: data.name, age: data.age, gender: data.gender, bio: data.bio, city: data.city } }, getAccessTokenSilently)
      await apiRequest('/preferences/me', { method: 'POST', data: { minBudget: data.budgetMin, maxBudget: data.budgetMax, city: data.city, genderPreference: 'any', cleanliness: data.cleanliness, sleepSchedule: 3, smoking: data.smoking !== 'no', drinking: false, pets: data.pets !== 'no' && data.pets !== 'allergic', socialLevel: 3, weightCleanliness: 25, weightSleep: 25, weightHabits: 25, weightSocial: 25 } }, getAccessTokenSilently)
      navigate('/app')
    } catch (error) { console.error('Onboarding failed:', error) } finally { setIsSubmitting(false) }
  }

  return (
    <div className="bg-canvas font-display min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-6 md:px-12 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3 text-[#166534]">
          <div className="flex items-center justify-center size-8 bg-[#166534] text-white rounded-md">
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-900">Flately</h1>
        </div>
        <button className="text-xs font-mono font-bold text-neutral-400 hover:text-[#166534] transition-colors uppercase tracking-wide border-b border-transparent hover:border-[#166534] pb-0.5">
          [ Save_Draft ]
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-4 pb-20 px-4 sm:px-8">
        <div className="w-full max-w-[840px] bg-white border border-neutral-200 shadow-sm relative flex flex-col min-h-[600px] rounded-[8px] overflow-hidden">

          {/* Step Tabs */}
          <div className="grid grid-cols-5 w-full border-b border-neutral-200">
            {STEPS.map((step, i) => (
              <div
                key={step.key}
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className={`flex flex-col h-14 justify-center px-4 cursor-pointer transition-colors ${
                  i === currentStep ? 'border-b-2 border-[#166534] bg-mint' : 'border-r border-neutral-100 last:border-r-0 hover:bg-neutral-50'
                }`}
              >
                <span className={`text-[10px] md:text-xs font-mono tracking-wider truncate ${
                  i === currentStep ? 'font-bold text-[#166534]' : 'text-neutral-400'
                }`}>
                  {step.key}_{step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-grow p-6 md:p-10 space-y-10">
            {/* Title */}
            <div className="space-y-2 border-l-4 border-[#166534] pl-4">
              <h2 className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-neutral-900">Professional Profile Setup</h2>
              <p className="text-neutral-500 font-medium text-sm md:text-base max-w-lg leading-relaxed">Initialize matching parameters. Accuracy is critical for the roommate matching algorithm.</p>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {/* Step 1 — Basic Intel */}
                {currentStep === 0 && (
                  <>
                    <div className="space-y-3">
                      <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide select-none bg-mint inline-block px-2 py-1 rounded-sm border border-[#166534]/10">// SELECT_GENDER_IDENTITY</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <TileRadio name="gender" value="male" checked={watch('gender') === 'male'} onChange={(v) => setValue('gender', v)} icon="male" label="MALE" />
                        <TileRadio name="gender" value="female" checked={watch('gender') === 'female'} onChange={(v) => setValue('gender', v)} icon="female" label="FEMALE" />
                        <TileRadio name="gender" value="other" checked={watch('gender') === 'other'} onChange={(v) => setValue('gender', v)} icon="transgender" label="NON-BINARY" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide select-none bg-mint inline-block px-2 py-1 rounded-sm border border-[#166534]/10">// AGE_VECTOR_INPUT</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['18-22', '23-27', '28-35', '35+'].map(range => (
                          <TileRadio key={range} name="age" value={range} checked={watch('age') === (range === '18-22' ? 20 : range === '23-27' ? 25 : range === '28-35' ? 31 : 36)} onChange={() => setValue('age', range === '18-22' ? 20 : range === '23-27' ? 25 : range === '28-35' ? 31 : 36)} label={range} size="sm" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide select-none bg-mint inline-block px-2 py-1 rounded-sm border border-[#166534]/10">// OCCUPATION_STATUS</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TileRadio name="occupation" value="student" checked={watch('occupation') === 'student'} onChange={(v) => setValue('occupation', v)} icon="school" label="STUDENT" desc="University or College" />
                        <TileRadio name="occupation" value="professional" checked={watch('occupation') === 'professional'} onChange={(v) => setValue('occupation', v)} icon="work" label="PROFESSIONAL" desc="Full-time or Part-time" />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2 — Location */}
                {currentStep === 1 && (
                  <div className="space-y-3">
                    <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide select-none bg-mint inline-block px-2 py-1 rounded-sm border border-[#166534]/10">// TARGET_LOCATION</label>
                    <div>
                      <label className="text-sm font-medium text-neutral-700 block mb-1.5">City</label>
                      <input {...methods.register('city')} placeholder="Enter your target city..." className="w-full px-4 py-3 border border-neutral-200 rounded-[8px] text-sm focus:outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534] transition-colors" />
                    </div>
                  </div>
                )}

                {/* Step 3 — Budget */}
                {currentStep === 2 && (
                  <div className="space-y-3">
                    <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide select-none bg-mint inline-block px-2 py-1 rounded-sm border border-[#166534]/10">// BUDGET_PARAMETERS</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1.5">Budget Min ($)</label>
                        <input type="number" {...methods.register('budgetMin', { valueAsNumber: true })} className="w-full px-4 py-3 border border-neutral-200 rounded-[8px] text-sm focus:outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534] font-mono" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1.5">Budget Max ($)</label>
                        <input type="number" {...methods.register('budgetMax', { valueAsNumber: true })} className="w-full px-4 py-3 border border-neutral-200 rounded-[8px] text-sm focus:outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534] font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4 — Habits */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide select-none bg-mint inline-block px-2 py-1 rounded-sm border border-[#166534]/10">// SMOKING_PREFERENCE</label>
                      <div className="grid grid-cols-3 gap-4">
                        <TileRadio name="smoking" value="no" checked={watch('smoking') === 'no'} onChange={(v) => setValue('smoking', v)} label="NON-SMOKER" size="sm" />
                        <TileRadio name="smoking" value="outside" checked={watch('smoking') === 'outside'} onChange={(v) => setValue('smoking', v)} label="OUTSIDE ONLY" size="sm" />
                        <TileRadio name="smoking" value="yes" checked={watch('smoking') === 'yes'} onChange={(v) => setValue('smoking', v)} label="SMOKER" size="sm" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide select-none bg-mint inline-block px-2 py-1 rounded-sm border border-[#166534]/10">// PET_POLICY</label>
                      <div className="grid grid-cols-3 gap-4">
                        <TileRadio name="pets" value="no" checked={watch('pets') === 'no'} onChange={(v) => setValue('pets', v)} label="NO PETS" size="sm" />
                        <TileRadio name="pets" value="have" checked={watch('pets') === 'have'} onChange={(v) => setValue('pets', v)} label="HAVE PETS" size="sm" />
                        <TileRadio name="pets" value="love" checked={watch('pets') === 'love'} onChange={(v) => setValue('pets', v)} label="PET FRIENDLY" size="sm" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5 — Review */}
                {currentStep === 4 && (
                  <div className="border border-neutral-200 rounded-[8px] p-6 bg-neutral-50">
                    <label className="block font-mono text-xs font-bold text-[#166534] tracking-wide mb-4">// PROFILE_REVIEW</label>
                    <p className="text-sm text-neutral-600 font-medium">Review your profile parameters and submit to activate matching.</p>
                  </div>
                )}
              </form>
            </FormProvider>
          </div>

          {/* Action Button */}
          <div className="p-6 md:p-10 border-t border-neutral-200 bg-white">
            {currentStep < STEPS.length - 1 ? (
              <button onClick={handleNext} className="w-full rounded-[8px] bg-[#166534] text-white h-14 font-mono font-bold text-sm tracking-wide hover:bg-[#14532d] focus:ring-2 focus:ring-offset-2 focus:ring-[#166534] transition-all flex items-center justify-center gap-3 group shadow-lg shadow-[#166534]/20">
                PROCEED_TO_STEP_{String(currentStep + 2).padStart(2, '0')}
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            ) : (
              <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full rounded-[8px] bg-[#166534] text-white h-14 font-mono font-bold text-sm tracking-wide hover:bg-[#14532d] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#166534]/20">
                {isSubmitting ? 'PROCESSING...' : 'ACTIVATE_PROFILE'}
              </button>
            )}
          </div>
        </div>

        {/* Session ID */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="h-6 w-[1px] bg-neutral-300" />
          <div className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase flex items-center gap-2">
            <span>Session_ID: 8F92-B2A1-9900</span>
            <span className="size-1.5 rounded-full bg-[#166534] animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  )
}
