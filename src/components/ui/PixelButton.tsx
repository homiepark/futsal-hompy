import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'pixel-btn bg-secondary text-secondary-foreground',
  primary: 'pixel-btn pixel-btn-primary',
  accent: 'pixel-btn pixel-btn-accent',
  ghost: 'font-pixel text-xs uppercase hover:bg-muted px-4 py-3 transition-colors',
};

const sizeClasses = {
  sm: 'text-[8px] px-2 py-1',
  md: 'text-[10px] px-4 py-2',
  lg: 'text-xs px-6 py-3',
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          'disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';
