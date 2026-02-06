import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PixelIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'accent';
  className?: string;
}

const sizeClasses = {
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-3',
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 24,
};

const variantClasses = {
  default: 'bg-secondary border-border-dark',
  primary: 'bg-primary border-primary-dark text-primary-foreground',
  accent: 'bg-accent border-accent-dark text-accent-foreground',
};

export function PixelIcon({ icon: Icon, size = 'md', variant = 'default', className }: PixelIconProps) {
  return (
    <div 
      className={cn(
        'inline-flex items-center justify-center border-2 shadow-pixel-sm',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Icon size={iconSizes[size]} strokeWidth={2.5} />
    </div>
  );
}
