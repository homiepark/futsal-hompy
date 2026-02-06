import { cn } from '@/lib/utils';

type IconType = 'home' | 'archive' | 'matching' | 'calendar' | 'map';

interface PixelNavIconProps {
  type: IconType;
  isActive?: boolean;
  className?: string;
}

// 8x8 pixel art patterns for each icon (1 = filled, 0 = empty)
const iconPatterns: Record<IconType, number[][]> = {
  home: [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,0,1,1,0,1,1],
    [1,1,0,1,1,0,1,1],
  ],
  archive: [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1],
  ],
  matching: [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  calendar: [
    [0,1,0,0,0,0,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1],
    [1,1,1,1,1,1,1,1],
  ],
  map: [
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,0,0],
    [0,1,1,1,1,1,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,1,1,0,0,0],
  ],
};

export function PixelNavIcon({ type, isActive, className }: PixelNavIconProps) {
  const pattern = iconPatterns[type];
  const pixelSize = 3; // Size of each pixel in the icon
  
  return (
    <div 
      className={cn(
        'relative',
        className
      )}
      style={{
        width: pixelSize * 8,
        height: pixelSize * 8,
      }}
    >
      {pattern.map((row, y) =>
        row.map((pixel, x) => (
          pixel === 1 && (
            <div
              key={`${x}-${y}`}
              className={cn(
                'absolute',
                isActive ? 'bg-primary-foreground' : 'bg-current'
              )}
              style={{
                width: pixelSize,
                height: pixelSize,
                left: x * pixelSize,
                top: y * pixelSize,
              }}
            />
          )
        ))
      )}
    </div>
  );
}
