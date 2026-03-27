import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Users, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PopularTeam {
  id: string;
  name: string;
  emblem: string;
  level: string;
  wins: number;
  memberCount: number;
}

const levelColors: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))]',
  '2': 'bg-[hsl(var(--level-2))]',
  '3': 'bg-[hsl(var(--level-3))]',
  '4': 'bg-[hsl(var(--level-4))]',
};

export function HotTeamsRanking() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<PopularTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, emblem, level')
          .order('created_at', { ascending: false })
          .limit(3);

        if (teamsError || !teamsData) {
          console.error('Failed to fetch teams:', teamsError);
          return;
        }

        const { data: membersData } = await supabase
          .from('team_members')
          .select('team_id');

        const memberCounts: Record<string, number> = {};
        if (membersData) {
          for (const m of membersData) {
            memberCounts[m.team_id] = (memberCounts[m.team_id] || 0) + 1;
          }
        }

        setTeams(
          teamsData.map((t) => ({
            id: t.id,
            name: t.name,
            emblem: t.emblem || '⚽',
            level: t.level?.toString() || '1',
            wins: 0,
            memberCount: memberCounts[t.id] || 0,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
            <Trophy size={14} className="text-accent" />
            이번 달 인기팀 TOP 3
          </h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-14 bg-muted animate-pulse border-3 border-border-dark" />
          ))}
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
            <Trophy size={14} className="text-accent" />
            이번 달 인기팀 TOP 3
          </h3>
        </div>
        <div className="bg-card border-3 border-border-dark p-4 text-center">
          <span className="font-pixel text-[8px] text-muted-foreground">등록된 팀이 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
          <Trophy size={14} className="text-accent" />
          이번 달 인기팀 TOP 3
        </h3>
        <button
          onClick={() => navigate('/')}
          className="font-pixel text-[8px] text-muted-foreground hover:text-primary flex items-center gap-0.5"
        >
          더보기 <ChevronRight size={10} />
        </button>
      </div>

      <div className="space-y-2">
        {teams.map((team, index) => (
          <button
            key={team.id}
            onClick={() => navigate(`/team/${team.id}`)}
            className="w-full flex items-center gap-3 p-2.5 bg-card border-3 border-border-dark hover:border-primary transition-colors"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            {/* Rank */}
            <div className={`w-7 h-7 flex items-center justify-center font-pixel text-[10px] text-white border-2 ${
              index === 0 ? 'bg-accent border-accent-dark' :
              index === 1 ? 'bg-primary border-primary-dark' :
              'bg-muted-foreground border-border-dark'
            }`}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
            >
              {index + 1}
            </div>

            {/* Team Info */}
            <span className="text-xl">{team.emblem}</span>
            <div className="flex-1 text-left min-w-0">
              <span className="font-pixel text-[9px] text-foreground block truncate">{team.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-1.5 py-0.5 text-[7px] font-pixel text-white ${levelColors[team.level]}`}>
                  LV.{team.level}
                </span>
                <span className="font-pixel text-[7px] text-muted-foreground flex items-center gap-0.5">
                  <Users size={8} /> {team.memberCount}명
                </span>
              </div>
            </div>

            {/* Win Count */}
            <div className="text-right shrink-0">
              <span className="font-pixel text-[10px] text-accent block">{team.wins}</span>
              <span className="font-pixel text-[7px] text-muted-foreground">승</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
