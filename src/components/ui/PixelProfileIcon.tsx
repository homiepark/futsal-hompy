import { cn } from '@/lib/utils';

interface PixelProfileIconProps {
  size?: number;
  className?: string;
}

export function PixelProfileIcon({ size = 4, className }: PixelProfileIconProps) {
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center cursor-pointer',
        className
      )}
      style={{
        width: size * 14,
        height: size * 11,
      }}
    >
      {/* Left Sleeve */}
      <div 
        className="absolute"
        style={{
          left: 0,
          top: size * 1,
          width: size * 3,
          height: size * 4,
          backgroundColor: 'hsl(0 72% 50%)',
          border: '2px solid hsl(0 72% 35%)',
          borderRadius: '0 0 4px 4px',
        }}
      />
      
      {/* Right Sleeve */}
      <div 
        className="absolute"
        style={{
          right: 0,
          top: size * 1,
          width: size * 3,
          height: size * 4,
          backgroundColor: 'hsl(0 72% 50%)',
          border: '2px solid hsl(0 72% 35%)',
          borderRadius: '0 0 4px 4px',
        }}
      />
      
      {/* Main Body */}
      <div 
        className="absolute flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))]"
        style={{
          left: size * 2,
          top: 0,
          width: size * 10,
          height: size * 11,
          backgroundColor: 'hsl(0 72% 50%)',
          border: '3px solid hsl(0 72% 35%)',
          borderRadius: '4px 4px 0 0',
        }}
      >
        {/* Collar */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: size * 3,
            height: size * 1.5,
            backgroundColor: 'white',
            borderBottom: '2px solid hsl(0 72% 35%)',
            borderRadius: '0 0 50% 50%',
          }}
        />
        
        {/* MY Text */}
        <span 
          className="font-bold text-white leading-none z-10"
          style={{ 
            fontSize: size * 4,
            textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
            letterSpacing: '-1px',
            marginTop: size * 1,
          }}
        >
          MY
        </span>
      </div>
    </div>
  );
}
