import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface PixelProfileIconProps {
  size?: number;
  className?: string;
}

export function PixelProfileIcon({ size = 4, className }: PixelProfileIconProps) {
  return (
    <Link 
      to="/profile"
      className={cn(
        'relative flex items-center justify-center bg-red-500 border-3 border-red-700 shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-red-400 transition-colors cursor-pointer',
        className
      )}
      style={{
        width: size * 12,
        height: size * 11,
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 100%, 75% 100%, 75% 85%, 25% 85%, 25% 100%, 0% 100%, 0% 15%)',
      }}
    >
      {/* Collar */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 bg-white border-b-2 border-red-700"
        style={{
          width: size * 4,
          height: size * 2,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        }}
      />
      
      {/* MY Text - Large and Centered */}
      <span 
        className="font-bold text-white leading-none z-10"
        style={{ 
          fontSize: size * 4.5,
          textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
          letterSpacing: '-1px',
          marginTop: size * 1.5,
        }}
      >
        MY
      </span>
    </Link>
  );
}
