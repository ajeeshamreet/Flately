// @ts-nocheck
import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Calendar, Users, FileText, Check } from 'lucide-react'
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

export function BasicInfoStep() {
  const { register, formState: { errors }, watch } = useFormContext()
  const selectedGender = watch('gender')

  const genderOptions = [
    { value: 'male', label: 'Male', icon: User },
    { value: 'female', label: 'Female', icon: User },
    { value: 'other', label: 'Other', icon: Users },
    { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: Users },
  ]

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
          <User className="w-7 h-7 text-primary-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-surface-900">
          Let's start with the basics
        </h2>
        <p className="text-surface-500 mt-2">
          Tell us a bit about yourself
        </p>
      </motion.div>

      {/* Name Input */}
      <motion.div variants={itemVariants}>
        <Input
          label="Full Name"
          placeholder="Enter your name"
          error={errors.name?.message}
          {...register('name')}
        />
      </motion.div>

      {/* Age Input */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
          <Calendar className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Age
        </label>
        <input
          type="number"
          min="18"
          max="99"
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-shadow duration-200',
            errors.age 
              ? 'border-error-500' 
              : 'border-surface-200 hover:border-surface-300'
          )}
          {...register('age', { valueAsNumber: true })}
        />
        {errors.age && (
          <p className="mt-1.5 text-sm text-error-500">{errors.age.message}</p>
        )}
      </motion.div>

      {/* Gender Selection */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-3">
          <Users className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Gender
        </label>
        <div className="grid grid-cols-2 gap-3">
          {genderOptions.map((option) => {
            const isSelected = selectedGender === option.value
            
            return (
              <motion.label
                key={option.value}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg border-2 cursor-pointer',
                  'transition-all duration-200',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-200 hover:border-surface-300 text-surface-700'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register('gender')}
                />
                {isSelected && (
                  <Check className="w-4 h-4 text-primary-500" strokeWidth={2} />
                )}
                <span className="font-medium">{option.label}</span>
              </motion.label>
            )
          })}
        </div>
        {errors.gender && (
          <p className="mt-2 text-sm text-error-500">{errors.gender.message}</p>
        )}
      </motion.div>

      {/* Bio Textarea */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-2">
          <FileText className="w-4 h-4 text-surface-400" strokeWidth={1.5} />
          Bio 
          <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={4}
          placeholder="Tell potential roommates about yourself..."
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'placeholder:text-surface-400',
            'transition-shadow duration-200',
            errors.bio 
              ? 'border-error-500' 
              : 'border-surface-200 hover:border-surface-300'
          )}
          {...register('bio')}
        />
        {errors.bio && (
          <p className="mt-1.5 text-sm text-error-500">{errors.bio.message}</p>
        )}
      </motion.div>
    </motion.div>
  )
}
