// @ts-nocheck
import { useFormContext, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import * as Slider from '@radix-ui/react-slider'
import { DollarSign, MapPin, Calendar, Wallet, Check } from 'lucide-react'
import { Input } from '@/components/ui'
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

export function BudgetStep() {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext()
  
  const budgetMin = watch('budgetMin')
  const budgetMax = watch('budgetMax')

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Quick budget presets
  const budgetPresets = [
    { label: 'Budget', min: 300, max: 600, icon: '💰' },
    { label: 'Moderate', min: 600, max: 1000, icon: '🏠' },
    { label: 'Comfortable', min: 1000, max: 1500, icon: '🌟' },
    { label: 'Premium', min: 1500, max: 2500, icon: '✨' },
  ]

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-success-400/20 rounded-xl flex items-center justify-center">
          <Wallet className="w-7 h-7 text-success-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-surface-900">
          Budget & Location
        </h2>
        <p className="text-surface-500 mt-2">
          Set your budget range and preferred area
        </p>
      </motion.div>

      {/* Budget Range Slider */}
      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-surface-700">
            <DollarSign className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
            Monthly Budget
          </label>
          <motion.span 
            key={`${budgetMin}-${budgetMax}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full"
          >
            {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
          </motion.span>
        </div>

        <Controller
          name="budgetRange"
          control={control}
          render={() => (
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-6"
              value={[budgetMin, budgetMax]}
              onValueChange={([min, max]) => {
                setValue('budgetMin', min)
                setValue('budgetMax', max)
              }}
              min={200}
              max={5000}
              step={50}
              minStepsBetweenThumbs={2}
            >
              <Slider.Track className="bg-surface-200 relative grow rounded-full h-2.5">
                <Slider.Range className="absolute bg-linear-to-r from-primary-400 via-accent-500 to-accent-400 rounded-full h-full" />
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
          )}
        />

        {/* Budget scale */}
        <div className="flex justify-between mt-3 text-xs text-surface-400">
          <span>$200</span>
          <span>$1,000</span>
          <span>$2,000</span>
          <span>$3,500</span>
          <span>$5,000</span>
        </div>
      </motion.div>

      {/* Quick Budget Presets */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          Quick Select
        </label>
        <div className="grid grid-cols-4 gap-2">
          {budgetPresets.map((preset) => {
            const isSelected = budgetMin === preset.min && budgetMax === preset.max
            return (
              <motion.button
                key={preset.label}
                type="button"
                onClick={() => {
                  setValue('budgetMin', preset.min)
                  setValue('budgetMax', preset.max)
                }}
                className={cn(
                  'relative px-3 py-3 rounded-lg text-sm font-medium',
                  'transition-all duration-200',
                  isSelected
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                )}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className="block text-lg mb-1">{preset.icon}</span>
                {preset.label}
                {isSelected && (
                  <motion.div 
                    layoutId="budget-check"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* City Input */}
      <motion.div variants={itemVariants}>
        <Input
          label={
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
              Preferred City or Area
            </span>
          }
          placeholder="e.g., San Francisco, Brooklyn, Austin"
          error={errors.city?.message}
          {...register('city')}
        />
      </motion.div>

      {/* Move-in Date */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
          <Calendar className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Move-in Date 
          <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'border-surface-200 hover:border-surface-300',
            'transition-shadow duration-200'
          )}
          {...register('moveInDate')}
        />
      </motion.div>
    </motion.div>
  )
}
