import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FavoriteTeam {
  id: string;
  emblem: string;
  name: string;
  region: string;
  level: string;
  photoUrl?: string;
}

interface FavoriteTeamsProps {
  teams: FavoriteTeam[];
}

const levelColors: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))] text-white',
  '2': 'bg-[hsl(var(--level-2))] text-white',
  '3': 'bg-[hsl(var(--level-3))] text-white',
  '4': 'bg-[hsl(var(--level-4))] text-white',
};

export function FavoriteTeams({ teams }: FavoriteTeamsProps) {
  const navigate = useNavigate();

  if (teams.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div
        className="bg-card border-4 border-border-dark overflow-hidden rounded-xl"
        style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-400 border-b-3 border-amber-600 px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⭐</span>
            <h2 className="font-pixel text-[12px] text-white">관심팀</h2>
          </div>
          <span className="font-pixel text-[9px] text-white/70">{teams.length}팀</span>
        </div>

        {/* Horizontal Scroll */}
        <div
          className="flex gap-3 overflow-x-auto p-3 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => navigate(`/team/${team.id}`)}
              className={cn(
                'flex-shrink-0 w-28 border-3 border-border-dark bg-secondary rounded-lg',
                'hover:border-primary hover:-translate-y-0.5 transition-all text-center p-2.5'
              )}
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              {/* Photo or Emblem */}
              <div className="w-14 h-14 mx-auto mb-2 border-2 border-border-dark rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {team.photoUrl ? (
                  <img src={team.photoUrl} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{team.emblem}</span>
                )}
              </div>
              <p className="font-pixel text-[11px] text-foreground truncate">{team.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className={cn('px-1 py-0.5 font-pixel text-[9px] rounded', levelColors[team.level] || 'bg-muted text-muted-foreground')}>
                  LV.{team.level}
                </span>
              </div>
              <p className="font-pixel text-[9px] text-muted-foreground mt-0.5 truncate">{team.region}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
