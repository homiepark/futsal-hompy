import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeam, Team } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const levelColors: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))] text-white',
  '2': 'bg-[hsl(var(--level-2))] text-white',
  '3': 'bg-[hsl(var(--level-3))] text-white',
  '4': 'bg-[hsl(var(--level-4))] text-white',
};

interface TeamSwitcherProps {
  className?: string;
}

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const navigate = useNavigate();
  const { activeTeam, setActiveTeam } = useTeam();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!user) return;

    async function fetchTeams() {
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name, emblem, photo_url, level, region, district)')
        .eq('user_id', user!.id);

      if (!error && data) {
        const teams: Team[] = data
          .filter((row: any) => row.teams)
          .map((row: any) => {
            const t = row.teams;
            return {
              id: t.id,
              name: t.name,
              emblem: t.emblem,
              photoUrl: t.photo_url || undefined,
              level: t.level || '1',
              favorites: 0,
              region: [t.region, t.district].filter(Boolean).join(' ') || undefined,
            };
          });
        setUserTeams(teams);
      }
    }

    fetchTeams();
  }, [user]);

  const otherTeams = userTeams.filter(t => t.id !== activeTeam?.id);

  const handleTeamSwitch = (team: Team) => {
    setActiveTeam(team);
    setIsOpen(false);
    navigate(`/team/${team.id}`);
  };

  if (!activeTeam || otherTeams.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-card border-3 border-border-dark hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
      >
        <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-sm shrink-0">
          {activeTeam.photoUrl ? (
            <img src={activeTeam.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">{activeTeam.emblem}</span>
          )}
        </div>
        <span className="font-pixel text-[10px] text-foreground">{activeTeam.name}</span>
        <span className={`px-1.5 py-0.5 text-[8px] font-pixel ${levelColors[activeTeam.level] || ''}`}>
          {activeTeam.level}
        </span>
        <RefreshCw
          size={12}
          className={cn(
            'text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 min-w-[180px] bg-card border-3 border-border-dark z-50"
            style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="px-3 py-2 border-b-2 border-border">
              <span className="font-pixel text-[8px] text-muted-foreground">팀 전환</span>
            </div>
            {otherTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSwitch(team)}
                className="w-full flex items-center gap-2 px-3 py-3 text-left hover:bg-muted transition-colors border-b-2 border-border last:border-b-0"
              >
                <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-sm shrink-0">
                  {team.photoUrl ? (
                    <img src={team.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{team.emblem}</span>
                  )}
                </div>
                <span className="font-pixel text-[10px] text-foreground flex-1">{team.name}</span>
                <span className={`px-1.5 py-0.5 text-[8px] font-pixel ${levelColors[team.level] || ''}`}>
                  LV.{team.level}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
