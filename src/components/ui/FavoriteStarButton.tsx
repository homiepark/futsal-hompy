import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FavoriteStarButtonProps {
  initialFavorited?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
}

export function FavoriteStarButton({ initialFavorited = false, onToggle, className }: FavoriteStarButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !isFavorited;
    setIsFavorited(newValue);
    onToggle?.(newValue);
  };

  // 8x8 pixel star pattern
  const starPattern = [
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
    [1,0,0,0,0,0,0,1],
  ];

  const pixelSize = 2;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative transition-transform hover:scale-110 active:scale-95',
        isFavorited && 'animate-pixel-bounce',
        className
      )}
      style={{
        width: pixelSize * 8,
        height: pixelSize * 8,
      }}
      aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
    >
      {starPattern.map((row, y) =>
        row.map((pixel, x) => (
          pixel === 1 && (
            <div
              key={`${x}-${y}`}
              className="absolute"
              style={{
                width: pixelSize,
                height: pixelSize,
                left: x * pixelSize,
                top: y * pixelSize,
                backgroundColor: isFavorited 
                  ? 'hsl(45 93% 55%)' // Yellow gold
                  : 'hsl(40 20% 70%)', // Gray
              }}
            />
          )
        ))
      )}
    </button>
  );
}
