import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NewTeam {
  id: string;
  name: string;
  emblem: string;
  photoUrl: string;
  level: string;
  memberCount: number;
  createdAt: string;
}

const levelColors: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))]',
  '2': 'bg-[hsl(var(--level-2))]',
  '3': 'bg-[hsl(var(--level-3))]',
  '4': 'bg-[hsl(var(--level-4))]',
};

export function HotTeamsRanking() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<NewTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, emblem, photo_url, level, created_at')
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
            photoUrl: (t as any).photo_url || '',
            level: t.level?.toString() || '1',
            memberCount: memberCounts[t.id] || 0,
            createdAt: t.created_at,
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
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-pixel text-xs text-foreground flex items-center gap-2">
            🎉 NEW 팀 창단을 축하합니다!
          </h3>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-32 h-36 bg-muted animate-pulse border-3 border-border-dark" />
          ))}
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-pixel text-xs text-foreground flex items-center gap-2">
            🎉 NEW 팀 창단을 축하합니다!
          </h3>
        </div>
        <div className="bg-card border-3 border-border-dark p-4 text-center">
          <span className="font-pixel text-[11px] text-muted-foreground">아직 등록된 팀이 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-accent" />
        <h3 className="font-pixel text-xs text-foreground">
          NEW 팀 창단을 축하합니다!
        </h3>
        <span className="text-base">🎉</span>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => navigate(`/team/${team.id}`)}
            className="flex-shrink-0 w-32 bg-card border-3 border-border-dark hover:border-primary transition-all hover:scale-[1.02] text-center overflow-hidden"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            {/* NEW Badge + Emblem Area */}
            <div className="relative bg-gradient-to-b from-accent/20 to-transparent pt-2 pb-3 px-2">
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-accent text-accent-foreground font-pixel text-[11px] border border-accent-dark animate-pulse">
                NEW
              </span>
              {team.photoUrl ? (
                <div className="w-14 h-14 mx-auto border-3 border-border-dark overflow-hidden">
                  <img src={team.photoUrl} alt={team.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 mx-auto bg-field-green border-3 border-border-dark flex items-center justify-center">
                  <span className="text-2xl">{team.emblem}</span>
                </div>
              )}
            </div>

            {/* Team Info */}
            <div className="px-2 pb-2.5 pt-1 border-t-2 border-border">
              <p className="font-pixel text-[11px] text-foreground truncate">{team.name}</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className={`px-1.5 py-0.5 text-[8px] font-pixel text-white ${levelColors[team.level]}`}>
                  LV.{team.level}
                </span>
                <span className="font-pixel text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <Users size={8} /> {team.memberCount}
                </span>
              </div>
              <p className="font-pixel text-[11px] text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true, locale: ko })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
