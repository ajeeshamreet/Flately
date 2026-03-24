import { useFormContext, Controller } from 'react-hook-form'
// framer-motion available for future animations
import * as Slider from '@radix-ui/react-slider'
import { Sparkles, Volume2, Users, Cigarette, PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
}

export function PreferencesStep() {
  const { control, watch, register } = useFormContext()

  // Option configurations
  const guestOptions = [
    { value: 'never', label: 'Never', icon: '🚫' },
    { value: 'rarely', label: 'Rarely', icon: '🤏' },
    { value: 'sometimes', label: 'Sometimes', icon: '👋' },
    { value: 'often', label: 'Often', icon: '🎉' },
  ]

  const smokingOptions = [
    { value: 'no', label: 'No smoking', icon: '🚭' },
    { value: 'outside', label: 'Outside only', icon: '🚪' },
    { value: 'yes', label: "Don't mind", icon: '🚬' },
  ]

  const petOptions = [
    { value: 'no', label: 'No pets', icon: '❌' },
    { value: 'have', label: 'I have pets', icon: '🐕' },
    { value: 'love', label: 'Love pets', icon: '❤️' },
    { value: 'allergic', label: 'Allergic', icon: '🤧' },
  ]

  // Slider labels
  const cleanlinessLabels = ['Messy', 'Relaxed', 'Average', 'Tidy', 'Spotless']
  const noiseLabels = ['Silent', 'Quiet', 'Moderate', 'Lively', 'Party']

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-accent-400/20 rounded-xl flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-accent-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-surface-900">
          Your living preferences
        </h2>
        <p className="text-surface-500 mt-2">
          Help us find roommates with compatible lifestyles
        </p>
      </motion.div>

      {/* Cleanliness Slider */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-4">
          <Sparkles className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Cleanliness Level
        </label>
        <Controller
          name="cleanliness"
          control={control}
          render={({ field }) => (
            <div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-6"
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
                min={1}
                max={5}
                step={1}
              >
                <Slider.Track className="bg-surface-200 relative grow rounded-full h-2.5">
                  <Slider.Range className="absolute bg-linear-to-r from-primary-400 to-primary-600 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb 
                  className={cn(
                    'block w-6 h-6 bg-white rounded-full',
                    'shadow-md border-2 border-primary-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:ring-offset-2',
                    'cursor-grab active:cursor-grabbing',
                    'transition-transform hover:scale-110'
                  )}
                />
              </Slider.Root>
              {/* Labels */}
              <div className="flex justify-between mt-3 text-xs text-surface-500">
                {cleanlinessLabels.map((label, idx) => (
                  <span 
                    key={label}
                    className={cn(
                      'transition-all duration-200',
                      field.value === idx + 1 && 'text-primary-600 font-semibold scale-110'
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        />
      </motion.div>

      {/* Noise Level Slider */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-4">
          <Volume2 className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Noise Tolerance
        </label>
        <Controller
          name="noiseLevel"
          control={control}
          render={({ field }) => (
            <div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-6"
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
                min={1}
                max={5}
                step={1}
              >
                <Slider.Track className="bg-surface-200 relative grow rounded-full h-2.5">
                  <Slider.Range className="absolute bg-linear-to-r from-accent-400 to-accent-600 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb 
                  className={cn(
                    'block w-6 h-6 bg-white rounded-full',
                    'shadow-md border-2 border-accent-500',
                    'focus:outline-none focus:ring-2 focus:ring-accent-400/50 focus:ring-offset-2',
                    'cursor-grab active:cursor-grabbing',
                    'transition-transform hover:scale-110'
                  )}
                />
              </Slider.Root>
              <div className="flex justify-between mt-3 text-xs text-surface-500">
                {noiseLabels.map((label, idx) => (
                  <span 
                    key={label}
                    className={cn(
                      'transition-all duration-200',
                      field.value === idx + 1 && 'text-accent-600 font-semibold scale-110'
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        />
      </motion.div>

      {/* Guest Policy */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-3">
          <Users className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Guest Policy
        </label>
        <div className="grid grid-cols-4 gap-2">
          {guestOptions.map((option) => {
            const isSelected = watch('guestPolicy') === option.value
            return (
              <motion.label
                key={option.value}
                className={cn(
                  'flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer',
                  'transition-all duration-200',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-200 hover:border-surface-300'
                )}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register('guestPolicy')}
                />
                <span className="text-xl mb-1">{option.icon}</span>
                <span className={cn(
                  'text-xs font-medium',
                  isSelected ? 'text-primary-600' : 'text-surface-600'
                )}>
                  {option.label}
                </span>
              </motion.label>
            )
          })}
        </div>
      </motion.div>

      {/* Smoking */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-3">
          <Cigarette className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Smoking
        </label>
        <div className="grid grid-cols-3 gap-2">
          {smokingOptions.map((option) => {
            const isSelected = watch('smoking') === option.value
            return (
              <motion.label
                key={option.value}
                className={cn(
                  'flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer',
                  'transition-all duration-200',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-200 hover:border-surface-300'
                )}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register('smoking')}
                />
                <span className="text-xl mb-1">{option.icon}</span>
                <span className={cn(
                  'text-xs font-medium',
                  isSelected ? 'text-primary-600' : 'text-surface-600'
                )}>
                  {option.label}
                </span>
              </motion.label>
            )
          })}
        </div>
      </motion.div>

      {/* Pets */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-3">
          <PawPrint className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Pets
        </label>
        <div className="grid grid-cols-4 gap-2">
          {petOptions.map((option) => {
            const isSelected = watch('pets') === option.value
            return (
              <motion.label
                key={option.value}
                className={cn(
                  'flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer',
                  'transition-all duration-200',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-200 hover:border-surface-300'
                )}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register('pets')}
                />
                <span className="text-xl mb-1">{option.icon}</span>
                <span className={cn(
                  'text-xs font-medium text-center',
                  isSelected ? 'text-primary-600' : 'text-surface-600'
                )}>
                  {option.label}
                </span>
              </motion.label>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
