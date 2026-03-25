// @ts-nocheck
import { useState, useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { ImagePlus, X, Star, Upload, AlertCircle } from 'lucide-react'
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

const photoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  }
}

export function PhotosStep() {
  const { setValue, watch } = useFormContext()
  const photosFromForm = watch('photos')
  const photos = useMemo(() => photosFromForm || [], [photosFromForm])
  
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState(null)

  // Handle file selection
  const handleFiles = useCallback((files) => {
    setError(null)
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Files must be under 5MB')
        return false
      }
      return true
    })

    if (previews.length + validFiles.length > 6) {
      setError('Maximum 6 photos allowed')
      return
    }

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        setPreviews(prev => [...prev, base64])
        setValue('photos', [...photos, base64])
      }
      reader.readAsDataURL(file)
    })
  }, [photos, setValue, previews.length])

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  // Click to upload
  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = (e) => handleFiles(e.target.files)
    input.click()
  }

  // Remove photo
  const removePhoto = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    setValue('photos', newPreviews)
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-accent-400/20 rounded-xl flex items-center justify-center">
          <ImagePlus className="w-7 h-7 text-accent-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-surface-900">
          Add Your Photos
        </h2>
        <p className="text-surface-500 mt-2">
          Help roommates see who you are (up to 6 photos)
        </p>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-error-500/10 border border-error-500/20 rounded-lg text-error-600"
          >
            <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      <motion.div variants={itemVariants}>
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
            'transition-all duration-200',
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-surface-300 hover:border-surface-400 hover:bg-surface-50'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="flex flex-col items-center">
            {/* Upload Icon */}
            <motion.div 
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                isDragging ? 'bg-primary-100' : 'bg-surface-100'
              )}
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Upload 
                className={cn(
                  'w-8 h-8',
                  isDragging ? 'text-primary-600' : 'text-surface-400'
                )} 
                strokeWidth={1.5}
              />
            </motion.div>

            <p className="text-surface-700 font-medium mb-1">
              {isDragging ? 'Drop your photos here' : 'Drag & drop photos here'}
            </p>
            <p className="text-sm text-surface-400">
              or click to browse
            </p>
            <p className="text-xs text-surface-400 mt-2">
              PNG, JPG up to 5MB each
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Photo Previews */}
      <AnimatePresence mode="popLayout">
        {previews.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <label className="block text-sm font-medium text-surface-700 mb-3">
              Your Photos ({previews.length}/6)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {previews.map((preview, index) => (
                  <motion.div 
                    key={preview.slice(-20)}
                    variants={photoVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="relative group aspect-square"
                  >
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg ring-1 ring-surface-200"
                    />
                    
                    {/* Delete button */}
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePhoto(index)
                      }}
                      className={cn(
                        'absolute top-2 right-2 w-7 h-7',
                        'bg-error-500 text-white rounded-full',
                        'flex items-center justify-center',
                        'opacity-0 group-hover:opacity-100',
                        'shadow-lg transition-opacity duration-200'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </motion.button>
                    
                    {/* First photo badge */}
                    {index === 0 && (
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'absolute bottom-2 left-2 px-2.5 py-1',
                          'bg-primary-500 text-white text-xs font-medium',
                          'rounded-full flex items-center gap-1',
                          'shadow-lg'
                        )}
                      >
                        <Star className="w-3 h-3" strokeWidth={2} fill="currentColor" />
                        Main
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip */}
      <motion.div 
        variants={itemVariants}
        className="p-4 bg-surface-50 rounded-lg border border-surface-200"
      >
        <p className="text-sm text-surface-600">
          💡 <strong>Tip:</strong> Clear, well-lit photos of your face help build trust with potential roommates. Your first photo will be your main profile picture.
        </p>
      </motion.div>
    </motion.div>
  )
}
