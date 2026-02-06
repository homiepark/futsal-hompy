import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelBadge } from '@/components/ui/PixelBadge';

interface RecommendedTeam {
  id: string;
  name: string;
  emblem: string;
  region: string;
  district: string;
  level: 'S' | 'A' | 'B' | 'C';
  mannerScore: number;
  matchTime: string;
  tags: string[];
}

interface RecommendedMatchesProps {
  teams: RecommendedTeam[];
  userDistricts: string[];
}

const levelVariants = {
  'S': 'level-s',
  'A': 'level-a',
  'B': 'level-b',
  'C': 'level-c',
} as const;

export function RecommendedMatches({ teams, userDistricts }: RecommendedMatchesProps) {
  const navigate = useNavigate();

  if (teams.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2 mb-3">
        <span className="text-accent">⭐</span>
        추천 매치
        <span className="px-2 py-0.5 bg-accent/20 text-accent text-[8px] border border-accent/50 rounded">
          AI 추천
        </span>
      </h3>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => navigate(`/team/${team.id}`)}
            className="flex-shrink-0 w-44 bg-card border-3 border-border-dark p-3 cursor-pointer hover:border-primary transition-colors"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            {/* Team Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-field-green border-2 border-primary-dark flex items-center justify-center">
                <span className="text-lg">{team.emblem}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-pixel text-[9px] text-foreground truncate">{team.name}</p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={8} />
                  <span className="font-pixel text-[7px]">{team.district}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {team.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "px-1.5 py-0.5 font-pixel text-[7px] border",
                    tag === '내 동네 팀' && "bg-primary/20 text-primary border-primary/50",
                    tag === '실력 비슷' && "bg-accent/20 text-accent border-accent/50",
                    tag === '첫 대결' && "bg-secondary text-secondary-foreground border-border"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between">
              <PixelBadge variant={levelVariants[team.level]} className="text-[7px]">
                Lv.{team.level}
              </PixelBadge>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-accent fill-accent" />
                <span className="font-pixel text-[8px] text-accent">{team.mannerScore.toFixed(1)}</span>
              </div>
            </div>

            {/* Match Time */}
            <div className="mt-2 flex items-center gap-1 text-muted-foreground">
              <Clock size={8} />
              <span className="font-pixel text-[7px]">{team.matchTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
