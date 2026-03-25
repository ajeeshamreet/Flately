// @ts-nocheck
import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const spring = { type: 'spring', stiffness: 400, damping: 25 }

export const Card = forwardRef(({ 
  children, 
  className, 
  hoverable = true,
  variant = 'default',
  ...props 
}, ref) => {
  const Component = hoverable ? motion.div : 'div'
  
  const variants = {
    default: 'bg-white border-surface-200',
    elevated: 'bg-white shadow-xl border-surface-100',
    glass: 'bg-white/80 backdrop-blur-xl border-white/20',
    gradient: 'bg-gradient-to-br from-white to-surface-50 border-surface-200',
  }

  const hoverProps = hoverable ? {
    whileHover: { y: -4, scale: 1.01 },
    transition: spring
  } : {}

  return (
    <Component
      ref={ref}
      className={cn(
        'rounded-2xl border',
        'shadow-lg shadow-surface-900/5',
        hoverable && 'hover:shadow-xl hover:shadow-primary-500/10',
        'transition-shadow duration-300',
        variants[variant],
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  )
})

Card.displayName = 'Card'

export function CardHeader({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        'px-6 py-4',
        'border-b border-surface-100',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        'px-6 py-4',
        'border-t border-surface-100',
        'bg-surface-50/50',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
