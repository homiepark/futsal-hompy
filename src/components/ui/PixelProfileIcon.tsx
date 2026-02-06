import { cn } from '@/lib/utils';

interface PixelProfileIconProps {
  size?: number;
  className?: string;
}

export function PixelProfileIcon({ size = 4, className }: PixelProfileIconProps) {
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:opacity-90 transition-opacity cursor-pointer',
        className
      )}
      style={{
        width: size * 12,
        height: size * 11,
        backgroundColor: 'hsl(0 72% 50%)',
        border: '3px solid hsl(0 72% 35%)',
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 100%, 75% 100%, 75% 85%, 25% 85%, 25% 100%, 0% 100%, 0% 15%)',
      }}
    >
      {/* Collar */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: size * 4,
          height: size * 2,
          backgroundColor: 'white',
          borderBottom: '2px solid hsl(0 72% 35%)',
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
    </div>
  );
}
