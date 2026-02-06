import { Star, Camera } from 'lucide-react';
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
  S: 'bg-[hsl(45,100%,50%)] border-[hsl(45,100%,35%)] text-foreground shadow-[0_0_8px_hsl(45,100%,50%)]',
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
      {/* Background Banner - Kairosoft striped pattern */}
      <div 
        className="h-20 border-b-4 border-border-dark"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              hsl(var(--primary) / 0.2) 0px,
              hsl(var(--primary) / 0.2) 10px,
              hsl(var(--accent) / 0.15) 10px,
              hsl(var(--accent) / 0.15) 20px
            )
          `
        }}
      />

      {/* Team Info - Compact */}
      <div className="px-3 -mt-10">
        <div className="flex items-end gap-3">
          {/* Team Photo - Kairosoft frame */}
          <div className="relative">
            <div 
              className="w-20 h-20 bg-muted border-4 border-border-dark overflow-hidden"
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-3xl">
                  {emblem}
                </div>
              )}
            </div>
            {isAdmin && (
              <button 
                onClick={onPhotoEdit}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent border-2 border-accent-dark flex items-center justify-center"
                style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
              >
                <Camera size={12} className="text-accent-foreground" />
              </button>
            )}
          </div>

          {/* Team Name & Info */}
          <div className="flex-1 pb-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="font-pixel text-xs text-foreground leading-tight">{name}</h1>
              <div className={cn(
                'px-1.5 py-0.5 border-2 font-pixel text-[8px]',
                levelColors[level]
              )}>
                LV.{level}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {region && (
                <p className="font-pixel text-[8px] text-muted-foreground">{region}</p>
              )}
              <div className="flex items-center gap-0.5">
                <Star size={12} className="text-[hsl(45,100%,50%)] fill-[hsl(45,100%,50%)]" />
                <span className="font-pixel text-[8px] text-foreground">{favorites}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
