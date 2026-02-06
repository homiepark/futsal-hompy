import { cn } from '@/lib/utils';

interface PixelProfileIconProps {
  size?: number;
  className?: string;
}

// 8x8 pixel art profile icon (person silhouette)
const profilePattern = [
  [0,0,1,1,1,1,0,0],
  [0,1,2,2,2,2,1,0],
  [0,1,2,2,2,2,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,3,3,0,0,0],
  [0,3,3,3,3,3,3,0],
  [3,3,3,3,3,3,3,3],
  [3,3,0,0,0,0,3,3],
];

const colors: Record<number, string> = {
  1: 'hsl(40 60% 70%)',   // Hair outline
  2: 'hsl(30 50% 65%)',   // Face
  3: 'hsl(142 69% 52%)',  // Body (primary green)
};

export function PixelProfileIcon({ size = 3, className }: PixelProfileIconProps) {
  return (
    <div 
      className={cn(
        'relative rounded-full bg-secondary border-2 border-border-dark p-1.5 shadow-[2px_2px_0_hsl(var(--pixel-shadow))] hover:bg-muted transition-colors cursor-pointer overflow-hidden',
        className
      )}
    >
      <div 
        className="relative"
        style={{
          width: size * 8,
          height: size * 8,
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
      </div>
    </div>
  );
}
