import { useFormContext } from 'react-hook-form'
// framer-motion available for future animations
import { Sun, Moon, Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  }
}

export function LifestyleStep() {
  const { register, watch, formState: { errors } } = useFormContext()
  const selectedSchedule = watch('sleepSchedule')

  const scheduleOptions = [
    {
      value: 'early-bird',
      label: 'Early Bird',
      description: 'I wake up early and go to bed early',
      icon: Sun,
      emoji: '🌅',
      color: 'accent',
    },
    {
      value: 'night-owl',
      label: 'Night Owl',
      description: 'I stay up late and sleep in',
      icon: Moon,
      emoji: '🌙',
      color: 'primary',
    },
    {
      value: 'flexible',
      label: 'Flexible',
      description: 'My schedule varies day to day',
      icon: Clock,
      emoji: '⚖️',
      color: 'success',
    },
  ]

  const colorMap = {
    accent: {
      border: 'border-accent-500',
      bg: 'bg-accent-400/10',
      ring: 'ring-accent-400/30',
      iconBg: 'bg-accent-400/20',
      iconText: 'text-accent-600',
      check: 'bg-accent-500 text-white',
    },
    primary: {
      border: 'border-primary-500',
      bg: 'bg-primary-100',
      ring: 'ring-primary-300',
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-600',
      check: 'bg-primary-500 text-white',
    },
    success: {
      border: 'border-success-500',
      bg: 'bg-success-400/10',
      ring: 'ring-success-400/30',
      iconBg: 'bg-success-400/20',
      iconText: 'text-success-600',
      check: 'bg-success-500 text-white',
    },
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
          <Moon className="w-7 h-7 text-primary-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-surface-900">
          What's your sleep schedule?
        </h2>
        <p className="text-surface-500 mt-2">
          This helps us match you with compatible roommates
        </p>
      </motion.div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {scheduleOptions.map((option) => {
          const isSelected = selectedSchedule === option.value
          const colors = colorMap[option.color]
          
          return (
            <motion.label
              key={option.value}
              variants={cardVariants}
              className={cn(
                'flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer',
                'transition-all duration-200',
                isSelected
                  ? cn(colors.border, colors.bg, 'ring-4', colors.ring)
                  : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
              )}
              whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Hidden radio */}
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register('sleepSchedule')}
              />
              
              {/* Icon */}
              <motion.div 
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center text-3xl',
                  isSelected ? cn(colors.iconBg, 'shadow-sm') : 'bg-surface-100'
                )}
                animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              >
                {option.emoji}
              </motion.div>
              
              {/* Text */}
              <div className="flex-1">
                <div className="font-semibold text-surface-900">{option.label}</div>
                <div className="text-sm text-surface-500">{option.description}</div>
              </div>
              
              {/* Checkmark */}
              <motion.div 
                className={cn(
                  'w-7 h-7 rounded-full border-2 flex items-center justify-center',
                  isSelected
                    ? colors.check
                    : 'border-surface-300 bg-white'
                )}
                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {isSelected && (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                )}
              </motion.div>
            </motion.label>
          )
        })}
      </div>

      {errors.sleepSchedule && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-error-500 text-center"
        >
          {errors.sleepSchedule.message}
        </motion.p>
      )}
    </motion.div>
  )
}
