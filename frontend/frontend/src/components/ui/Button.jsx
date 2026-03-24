import { forwardRef } from 'react'
// framer-motion available for future animations
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
  secondary: 'bg-surface-100 text-surface-800 hover:bg-surface-200 shadow-sm hover:shadow-md',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
  ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
  danger: 'bg-error-500 text-white hover:bg-error-600 shadow-lg shadow-error-500/25',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
}

const spring = { type: 'spring', stiffness: 400, damping: 25 }

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'rounded-xl',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={spring}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin h-4 w-4" />
      )}
      {children}
    </motion.button>
  )
})

Button.displayName = 'Button'
