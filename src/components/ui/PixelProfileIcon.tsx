import { cn } from '@/lib/utils';

interface PixelProfileIconProps {
  size?: number;
  className?: string;
}

// 10x10 pixel art profile icon (person silhouette with MY text area)
const profilePattern = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,2,2,2,2,1,0,0],
  [0,0,1,2,2,2,2,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,0,0,0,0],
  [0,3,3,3,3,3,3,3,3,0],
  [3,3,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,3],
  [0,3,3,0,0,0,0,3,3,0],
];

const colors: Record<number, string> = {
  1: 'hsl(35 60% 55%)',   // Hair/head outline
  2: 'hsl(30 50% 70%)',   // Face
  3: 'hsl(142 69% 52%)',  // Body (primary green)
};

export function PixelProfileIcon({ size = 3, className }: PixelProfileIconProps) {
  return (
    <div 
      className={cn(
        'relative rounded-full bg-card/95 backdrop-blur-sm border-3 border-border-dark p-2 shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors cursor-pointer',
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
        {profilePattern.map((row, y) =>
          row.map((pixel, x) => (
            pixel !== 0 && (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  left: x * size,
                  top: y * size,
                  backgroundColor: colors[pixel],
                }}
              />
            )
          ))
        )}
        {/* MY Text Overlay */}
        <div 
          className="absolute inset-0 flex items-end justify-center pb-1"
          style={{ top: size * 5 }}
        >
          <span 
            className="text-primary-foreground font-bold leading-none"
            style={{ 
              fontSize: size * 2.5,
              textShadow: '1px 1px 0 hsl(var(--primary-dark))',
            }}
          >
            MY
          </span>
        </div>
      </div>
    </div>
  );
}
