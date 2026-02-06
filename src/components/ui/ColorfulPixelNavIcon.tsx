import { cn } from '@/lib/utils';

type IconType = 'home' | 'archive' | 'matching' | 'calendar' | 'map';

interface ColorfulPixelNavIconProps {
  type: IconType;
  isActive?: boolean;
  className?: string;
}

// Color codes for each pixel: 0=empty, 1=main, 2=dark, 3=accent, 4=highlight
// Each icon has its own color palette
const iconData: Record<IconType, { pattern: number[][]; colors: Record<number, string> }> = {
  // Green-roofed house
  home: {
    pattern: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1],
      [2,3,3,3,3,3,3,2],
      [2,3,4,4,4,4,3,2],
      [2,3,4,5,5,4,3,2],
      [2,3,4,5,5,4,3,2],
    ],
    colors: {
      1: 'hsl(142 69% 52%)', // Green roof
      2: 'hsl(30 30% 35%)',  // Brown outline
      3: 'hsl(40 50% 85%)',  // Cream wall
      4: 'hsl(40 60% 75%)',  // Window frame
      5: 'hsl(200 70% 65%)', // Window glass
    }
  },
  // Two players with arms around shoulders
  archive: {
    pattern: [
      [0,1,1,0,0,1,1,0],
      [0,2,2,0,0,2,2,0],
      [0,0,3,3,3,3,0,0],
      [0,3,3,3,3,3,3,0],
      [3,3,4,3,3,4,3,3],
      [0,0,3,0,0,3,0,0],
      [0,0,3,0,0,3,0,0],
      [0,3,3,0,0,3,3,0],
    ],
    colors: {
      1: 'hsl(40 60% 70%)',  // Hair/head
      2: 'hsl(30 50% 60%)',  // Face
      3: 'hsl(27 97% 58%)',  // Orange jersey
      4: 'hsl(0 0% 100%)',   // Jersey number
    }
  },
  // Two crossed swords
  matching: {
    pattern: [
      [1,0,0,0,0,0,0,2],
      [0,1,0,0,0,0,2,0],
      [0,0,1,0,0,2,0,0],
      [0,0,0,3,3,0,0,0],
      [0,0,0,3,3,0,0,0],
      [0,0,2,0,0,1,0,0],
      [0,2,0,0,0,0,1,0],
      [4,0,0,0,0,0,0,4],
    ],
    colors: {
      1: 'hsl(220 15% 70%)', // Silver blade
      2: 'hsl(220 15% 70%)', // Silver blade
      3: 'hsl(45 80% 55%)',  // Gold cross
      4: 'hsl(0 70% 50%)',   // Red handle
    }
  },
  // Red-marked calendar
  calendar: {
    pattern: [
      [0,1,0,0,0,0,1,0],
      [2,2,2,2,2,2,2,2],
      [3,3,3,3,3,3,3,3],
      [4,4,4,4,4,4,4,4],
      [4,5,5,4,6,4,4,4],
      [4,4,4,4,4,4,4,4],
      [4,4,6,4,4,5,5,4],
      [4,4,4,4,4,4,4,4],
    ],
    colors: {
      1: 'hsl(30 30% 40%)',   // Ring hooks
      2: 'hsl(0 70% 55%)',    // Red header
      3: 'hsl(0 60% 45%)',    // Red header dark
      4: 'hsl(0 0% 100%)',    // White paper
      5: 'hsl(0 70% 55%)',    // Red mark
      6: 'hsl(220 15% 70%)',  // Gray date
    }
  },
  // Green futsal pitch
  map: {
    pattern: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,3,3,2,2,1],
      [1,2,1,1,1,1,2,1],
      [1,2,1,4,4,1,2,1],
      [1,2,1,4,4,1,2,1],
      [1,2,1,1,1,1,2,1],
      [1,2,2,3,3,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    colors: {
      1: 'hsl(142 55% 42%)', // Dark green
      2: 'hsl(142 65% 50%)', // Light green
      3: 'hsl(0 0% 100%)',   // White lines (goal)
      4: 'hsl(0 0% 100%)',   // White center circle
    }
  },
};

export function ColorfulPixelNavIcon({ type, isActive, className }: ColorfulPixelNavIconProps) {
  const { pattern, colors } = iconData[type];
  const pixelSize = 3;
  
  return (
    <div 
      className={cn(
        'relative transition-opacity',
        isActive ? 'opacity-100' : 'opacity-70',
        className
      )}
      style={{
        width: pixelSize * 8,
        height: pixelSize * 8,
      }}
    >
      {pattern.map((row, y) =>
        row.map((pixel, x) => (
          pixel !== 0 && (
            <div
              key={`${x}-${y}`}
              className="absolute"
              style={{
                width: pixelSize,
                height: pixelSize,
                left: x * pixelSize,
                top: y * pixelSize,
                backgroundColor: colors[pixel],
              }}
            />
          )
        ))
      )}
    </div>
  );
}
