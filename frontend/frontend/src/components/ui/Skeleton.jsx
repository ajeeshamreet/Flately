import { cn } from '@/lib/utils'

/**
 * Skeleton Component - Anti-AI-Smell v1.0
 * 
 * NO SPINNERS! Use skeleton screens that match layout.
 * Uses shimmer animation from CSS.
 */

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

// Pre-built skeleton shapes
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )} 
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }
  
  return (
    <Skeleton className={cn('rounded-full', sizes[size], className)} />
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}
