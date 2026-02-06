import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn('pixel-input w-full', className)}
        {...props}
      />
    );
  }
);

PixelInput.displayName = 'PixelInput';
