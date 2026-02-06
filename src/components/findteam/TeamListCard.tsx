import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FavoriteStarButton } from '@/components/ui/FavoriteStarButton';
import { LevelInfoButton } from '@/components/ui/LevelGuideModal';

interface TeamListCardProps {
  id?: string;
  emblem: string;
  name: string;
  region: string;
  level: 'S' | 'A' | 'B' | 'C';
  trainingTime: string;
  memberCount: number;
  isFavorited?: boolean;
  onFavoriteToggle?: (isFavorited: boolean) => void;
}

const levelColors = {
  S: 'bg-accent text-accent-foreground border-accent-dark',
  A: 'bg-primary text-primary-foreground border-primary-dark',
  B: 'bg-primary/70 text-primary-foreground border-primary-dark/70',
  C: 'bg-primary/50 text-primary-foreground border-primary-dark/50',
};

export function TeamListCard({ id, emblem, name, region, level, trainingTime, memberCount, isFavorited, onFavoriteToggle }: TeamListCardProps) {
  const navigate = useNavigate();
  
  // Generate ID from name if not provided
  const teamId = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣-]/g, '');

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on favorite button or level info
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/team/${teamId}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-card border-4 border-border-dark p-3 shadow-[4px_4px_0_hsl(var(--pixel-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_hsl(var(--pixel-shadow))] transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Pixel Emblem */}
        <div className="w-12 h-12 bg-field-green border-2 border-border-dark flex items-center justify-center text-2xl shadow-[2px_2px_0_hsl(var(--pixel-shadow))]">
          {emblem}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Team Name & Level & Favorite */}
          <div className="flex items-center gap-2">
            <FavoriteStarButton 
              initialFavorited={isFavorited} 
              onToggle={onFavoriteToggle} 
            />
            <h3 className="font-body font-bold text-foreground truncate">{name}</h3>
            <span className={cn(
              "px-2 py-1 text-[10px] font-pixel border-2 shadow-[2px_2px_0_hsl(var(--pixel-shadow))]",
              levelColors[level]
            )}>
              Lv.{level}
            </span>
            <LevelInfoButton />
          </div>
          
          {/* Region & Training */}
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground font-body">
            <span>📍 {region}</span>
            <span>•</span>
            <span>⏰ {trainingTime}</span>
          </div>
          
          {/* Member Count */}
          <div className="mt-1 text-xs text-muted-foreground font-body">
            👥 {memberCount}명 활동중
          </div>
        </div>
      </div>
    </div>
  );
}
