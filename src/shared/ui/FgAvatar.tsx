import { User } from 'lucide-react'
import type { ImgHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type FgAvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'profile'

const avatarSizeClasses: Record<FgAvatarSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
  xl: 'h-24 w-24',
  profile: 'h-28 w-28',
}

export interface FgAvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  fallback?: string
  size?: FgAvatarSize
}

export function FgAvatar({ alt = '', className, fallback, size = 'md', src, ...props }: FgAvatarProps) {
  const initials = fallback?.slice(0, 2)

  if (src) {
    return (
      <img
        alt={alt}
        className={cn('rounded-pill border border-line object-cover', avatarSizeClasses[size], className)}
        src={src}
        {...props}
      />
    )
  }

  return (
    <span
      aria-label={alt || fallback || '사용자'}
      className={cn(
        'inline-flex items-center justify-center rounded-pill border border-line bg-line-soft text-faint',
        avatarSizeClasses[size],
        className,
      )}
      role="img"
    >
      {initials ? <span className="text-label text-muted">{initials}</span> : <User aria-hidden className="h-1/2 w-1/2" />}
    </span>
  )
}
