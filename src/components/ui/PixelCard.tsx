import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'frame' | 'decorated';
}

export const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseClasses = {
      default: 'pixel-card',
      frame: 'pixel-frame',
      decorated: 'pixel-card hompy-decoration',
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PixelCard.displayName = 'PixelCard';
