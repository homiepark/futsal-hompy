import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FavoriteStarButton } from '@/components/ui/FavoriteStarButton';

interface TeamListCardProps {
  id?: string;
  emblem: string;
  photoUrl?: string;
  name: string;
  region: string;
  level: string;
  trainingTime: string;
  memberCount: number;
  matchCount?: number;
  avgExperience?: number;
  mannerScore?: number;
  isFavorited?: boolean;
  onFavoriteToggle?: (isFavorited: boolean) => void;
}

export function TeamListCard({
  id,
  emblem,
  photoUrl,
  name,
  region,
  level,
  trainingTime,
  memberCount,
  matchCount = 0,
  avgExperience,
  mannerScore,
  isFavorited,
  onFavoriteToggle,
}: TeamListCardProps) {
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
      className="bg-card border-3 border-border-dark p-3 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
      style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
    >
      <div className="flex items-start gap-3">
        {/* Team Photo or Emblem */}
        <div className="w-12 h-12 bg-field-green border-2 border-border-dark flex items-center justify-center overflow-hidden shrink-0"
          style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{emblem}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Team Name & Favorite */}
          <div className="flex items-center gap-2 mb-1">
            <FavoriteStarButton
              initialFavorited={isFavorited}
              onToggle={onFavoriteToggle}
            />
            <h3 className="font-pixel text-[10px] text-foreground truncate">{name}</h3>
            <div className={cn('px-1.5 py-0.5 border font-pixel text-[8px] shrink-0',
              level === '4' ? 'bg-[hsl(var(--level-4))] text-white border-[hsl(var(--level-4))]' :
              level === '3' ? 'bg-[hsl(var(--level-3))] text-white border-[hsl(var(--level-3))]' :
              level === '2' ? 'bg-[hsl(var(--level-2))] text-white border-[hsl(var(--level-2))]' :
              'bg-[hsl(var(--level-1))] text-white border-[hsl(var(--level-1))]'
            )}>
              LV.{level}
            </div>
          </div>

          {/* Region & Training */}
          <div className="mt-1.5 flex items-center gap-2 font-pixel text-[8px] text-muted-foreground">
            <span>📍 {region}</span>
            <span>•</span>
            <span>⏰ {trainingTime}</span>
          </div>

          {/* Member Count */}
          <div className="mt-0.5 font-pixel text-[8px] text-muted-foreground">
            👥 {memberCount}명 활동중
          </div>
        </div>
      </div>
    </div>
  );
}
