import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PixelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'level-1' | 'level-2' | 'level-3' | 'level-4';
}

const variantClasses = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  'level-1': 'level-1',
  'level-2': 'level-2',
  'level-3': 'level-3',
  'level-4': 'level-4',
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
