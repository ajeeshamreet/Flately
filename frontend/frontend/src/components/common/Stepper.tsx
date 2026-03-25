// @ts-nocheck
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Stepper - Anti-AI-Smell v1.0
 * 
 * Features:
 * - Framer Motion spring animations
 * - Lucide Check icon (not inline SVG!)
 * - OKLCH colors via Tailwind v4
 * - Animated progress bar
 */

export function Stepper({ steps, currentStep, className }) {
  const progress = (currentStep / (steps.length - 1)) * 100

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden" />
        
        {/* Filled progress - animated */}
        <motion.div 
          className="absolute top-0 left-0 h-2.5 bg-linear-to-r from-primary-400 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={index} className="flex flex-col items-center">
              {/* Circle */}
              <motion.div 
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  'transition-colors duration-300',
                  isCompleted && 'bg-primary-500 text-white',
                  isCurrent && 'bg-primary-500 text-white ring-4 ring-primary-200',
                  isUpcoming && 'bg-surface-200 text-surface-500'
                )}
                initial={false}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              
              {/* Label - hidden on mobile */}
              <motion.span 
                className={cn(
                  'mt-2 text-sm hidden sm:block',
                  'transition-colors duration-200',
                  (isCompleted || isCurrent) 
                    ? 'text-primary-600 font-medium' 
                    : 'text-surface-500'
                )}
              >
                {step}
              </motion.span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
