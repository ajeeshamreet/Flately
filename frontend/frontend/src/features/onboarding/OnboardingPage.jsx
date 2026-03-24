import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

import { Stepper } from '@/components/common/Stepper'
import { Button, Card, CardContent, NoiseLayer } from '@/components/ui'

// Step Components
import { BasicInfoStep } from './steps/BasicInfoStep'
import { LifestyleStep } from './steps/LifestyleStep'
import { PreferencesStep } from './steps/PreferencesStep'
import { BudgetStep } from './steps/BudgetStep'
import { PhotosStep } from './steps/PhotosStep'

/**
 * OnboardingPage - Anti-AI-Smell v1.0
 * 
 * Features:
 * - Framer Motion page transitions
 * - Lucide icons (not inline SVG!)
 * - CSS variables for OKLCH colors
 * - AnimatePresence for step transitions
 */

// Zod schema for validation
const onboardingSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'Must be 18 or older').max(99, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  
  // Step 2: Lifestyle
  sleepSchedule: z.enum(['early-bird', 'night-owl', 'flexible']),
  
  // Step 3: Preferences
  cleanliness: z.number().min(1).max(5),
  noiseLevel: z.number().min(1).max(5),
  guestPolicy: z.enum(['never', 'rarely', 'sometimes', 'often']),
  smoking: z.enum(['no', 'outside', 'yes']),
  pets: z.enum(['no', 'have', 'love', 'allergic']),
  
  // Step 4: Budget
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  city: z.string().min(2, 'Please enter a city'),
  moveInDate: z.string().optional(),
  
  // Step 5: Photos
  photos: z.array(z.string()).optional(),
})

const STEPS = ['Basic Info', 'Lifestyle', 'Preferences', 'Budget', 'Photos']

// Animation variants for step transitions
const pageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.2 }
  }),
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0) // For animation direction
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // React Hook Form with Zod
  const methods = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      age: 25,
      gender: 'prefer-not-to-say',
      bio: '',
      sleepSchedule: 'flexible',
      cleanliness: 3,
      noiseLevel: 3,
      guestPolicy: 'sometimes',
      smoking: 'no',
      pets: 'no',
      budgetMin: 500,
      budgetMax: 1500,
      city: '',
      moveInDate: '',
      photos: [],
    },
    mode: 'onChange',
  })

  const { handleSubmit, trigger } = methods

  // Fields to validate per step
  const stepFields = {
    0: ['name', 'age', 'gender'],
    1: ['sleepSchedule'],
    2: ['cleanliness', 'noiseLevel', 'guestPolicy', 'smoking', 'pets'],
    3: ['budgetMin', 'budgetMax', 'city'],
    4: ['photos'],
  }

  // Handle Next button
  const handleNext = async () => {
    const fieldsToValidate = stepFields[currentStep]
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid && currentStep < STEPS.length - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    }
  }

  // Handle Back button
  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  // Final submission
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting onboarding data:', data)
      // TODO: Call API to save profile
      // await api.post('/profiles', data)
      
      navigate('/app')
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step components array for cleaner rendering
  const stepComponents = [
    <BasicInfoStep key="basic" />,
    <LifestyleStep key="lifestyle" />,
    <PreferencesStep key="preferences" />,
    <BudgetStep key="budget" />,
    <PhotosStep key="photos" />,
  ]

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 relative">
      <NoiseLayer />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <h1 className="text-heading-2 text-surface-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-surface-600">
            Help us find your perfect roommate match
          </p>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        >
          <Stepper 
            steps={STEPS} 
            currentStep={currentStep} 
            className="mb-8"
          />
        </motion.div>

        {/* Form Card */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="pt-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {stepComponents[currentStep]}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  loading={isSubmitting}
                >
                  <CheckCircle className="w-4 h-4 mr-2" strokeWidth={2} />
                  Complete Profile
                </Button>
              )}
            </motion.div>
          </form>
        </FormProvider>

        {/* Progress indicator text */}
        <motion.p 
          className="text-center text-sm text-surface-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Step {currentStep + 1} of {STEPS.length}
        </motion.p>
      </div>
    </div>
  )
}
