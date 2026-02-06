import { Star, Camera } from 'lucide-react';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { cn } from '@/lib/utils';

interface TeamHeaderProps {
  name: string;
  emblem: string;
  photoUrl?: string;
  level: 'S' | 'A' | 'B' | 'C';
  favorites: number;
  region?: string;
  isAdmin?: boolean;
  onPhotoEdit?: () => void;
}

const levelColors = {
  S: 'bg-[hsl(45,100%,50%)] border-[hsl(45,100%,35%)] text-foreground shadow-[0_0_12px_hsl(45,100%,50%)]',
  A: 'bg-accent border-accent-dark text-accent-foreground',
  B: 'bg-primary border-primary-dark text-primary-foreground',
  C: 'bg-secondary border-border-dark text-foreground',
};

export function TeamHeader({
  name,
  emblem,
  photoUrl,
  level,
  favorites,
  region,
  isAdmin = false,
  onPhotoEdit,
}: TeamHeaderProps) {
  return (
    <div className="relative">
      {/* Background Banner */}
      <div className="h-28 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 border-b-4 border-border-dark" />

      {/* Team Info Overlay */}
      <div className="px-4 -mt-12">
        <div className="flex items-end gap-4">
          {/* Team Photo */}
          <div className="relative">
            <div className="w-24 h-24 bg-muted border-4 border-border-dark shadow-pixel overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-field-green text-4xl">
                  {emblem}
                </div>
              )}
            </div>
            {isAdmin && (
              <button 
                onClick={onPhotoEdit}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent border-2 border-accent-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))]"
              >
                <Camera size={14} className="text-accent-foreground" />
              </button>
            )}
          </div>

          {/* Team Name & Info */}
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-pixel text-sm text-foreground">{name}</h1>
              <div className={cn(
                'px-2 py-0.5 border-2 font-pixel text-[10px]',
                levelColors[level]
              )}>
                LV.{level}
              </div>
            </div>
            {region && (
              <p className="font-body text-xs text-muted-foreground">{region}</p>
            )}
          </div>

          {/* Favorites */}
          <div className="flex items-center gap-1 pb-2">
            <Star size={16} className="text-[hsl(45,100%,50%)] fill-[hsl(45,100%,50%)]" />
            <span className="font-pixel text-[10px] text-foreground">{favorites}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
