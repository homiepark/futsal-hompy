import { cn } from '@/lib/utils';

interface PixelProfileIconProps {
  size?: number;
  className?: string;
}

// 10x10 pixel art jersey/uniform icon
const jerseyPattern = [
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,1,0,0,0,0,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
];

export function PixelProfileIcon({ size = 4, className }: PixelProfileIconProps) {
  return (
    <div 
      className={cn(
        'relative bg-card/95 backdrop-blur-sm border-3 border-border-dark p-2 shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors cursor-pointer',
        className
      )}
    >
      <div 
        className="relative"
        style={{
          width: size * 10,
          height: size * 10,
        }}
      >
        {/* Jersey base */}
        {jerseyPattern.map((row, y) =>
          row.map((pixel, x) => (
            pixel === 1 && (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  left: x * size,
                  top: y * size,
                  backgroundColor: 'hsl(142 69% 52%)', // Primary green
                }}
              />
            )
          ))
        )}
        
        {/* Collar accent */}
        <div 
          className="absolute"
          style={{
            width: size * 4,
            height: size,
            left: size * 3,
            top: size * 2,
            backgroundColor: 'hsl(27 97% 58%)', // Orange accent
          }}
        />
        
        {/* MY Text Overlay - Centered and Large */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
        >
          <span 
            className="font-bold text-white leading-none"
            style={{ 
              fontSize: size * 4,
              textShadow: '2px 2px 0 hsl(var(--primary-dark)), -1px -1px 0 hsl(var(--primary-dark))',
              letterSpacing: '-1px',
            }}
          >
            MY
          </span>
        </div>
      </div>
    </div>
  );
}
