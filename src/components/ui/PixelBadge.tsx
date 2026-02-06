import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PixelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'level-s' | 'level-a' | 'level-b' | 'level-c';
}

const variantClasses = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  'level-s': 'level-s',
  'level-a': 'level-a',
  'level-b': 'level-b',
  'level-c': 'level-c',
};

export const PixelBadge = forwardRef<HTMLSpanElement, PixelBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('pixel-badge', variantClasses[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

PixelBadge.displayName = 'PixelBadge';
