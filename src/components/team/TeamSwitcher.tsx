import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeam, Team } from '@/contexts/TeamContext';

// Mock user's teams - would come from Supabase
const mockUserTeams: Team[] = [
  {
    id: 'fc-bulkkot',
    name: 'FC 불꽃',
    emblem: '🔥',
    level: '3',
    favorites: 128,
    region: '서울 강남구',
  },
  {
    id: 'thunder-fc',
    name: '썬더 FC',
    emblem: '⚡',
    level: '4',
    favorites: 256,
    region: '서울 마포구',
  },
  {
    id: 'blue-wave',
    name: '블루웨이브',
    emblem: '🌊',
    level: '2',
    favorites: 64,
    region: '인천 연수구',
  },
];

const levelColors: Record<string, string> = {
  S: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
  A: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  B: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
  C: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
};

interface TeamSwitcherProps {
  className?: string;
}

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const navigate = useNavigate();
  const { activeTeam, setActiveTeam } = useTeam();
  const [isOpen, setIsOpen] = useState(false);

  // Filter out current team from options
  const otherTeams = mockUserTeams.filter(t => t.id !== activeTeam?.id);

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
        className="flex items-center gap-2 px-3 py-2 bg-card border-4 border-border-dark shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_hsl(var(--pixel-shadow))] transition-all"
      >
        <span className="text-lg">{activeTeam.emblem}</span>
        <span className="font-pixel text-[10px] text-foreground">{activeTeam.name}</span>
        <span className={`px-1.5 py-0.5 text-[8px] font-pixel ${levelColors[activeTeam.level]}`}>
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
          <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-card border-4 border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))] z-50">
            <div className="px-3 py-2 border-b-2 border-border">
              <span className="font-pixel text-[8px] text-muted-foreground">팀 전환</span>
            </div>
            {otherTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSwitch(team)}
                className="w-full flex items-center gap-2 px-3 py-3 text-left hover:bg-muted transition-colors border-b-2 border-border last:border-b-0"
              >
                <span className="text-lg">{team.emblem}</span>
                <span className="font-pixel text-[10px] text-foreground flex-1">{team.name}</span>
                <span className={`px-1.5 py-0.5 text-[8px] font-pixel ${levelColors[team.level]}`}>
                  {team.level}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
