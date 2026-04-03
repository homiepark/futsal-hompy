import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  emblem: string;
  photoUrl?: string;
}

interface TeamSelectorProps {
  teams: Team[];
  selectedTeam: string;
  onSelect: (teamId: string) => void;
  showAllOption?: boolean;
}

export function TeamSelector({ teams, selectedTeam, onSelect, showAllOption = true }: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const allTeams = showAllOption 
    ? [{ id: 'all', name: '전체 팀', emblem: '📋' }, ...teams]
    : teams;
  
  const currentTeam = allTeams.find(t => t.id === selectedTeam) || allTeams[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border-4 border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_hsl(var(--pixel-shadow))] transition-all"
      >
        <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-sm shrink-0">
          {currentTeam.photoUrl ? (
            <img src={currentTeam.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">{currentTeam.emblem}</span>
          )}
        </div>
        <span className="font-body font-bold text-foreground">{currentTeam.name}</span>
        <ChevronDown 
          size={16} 
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
          <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-card border-4 border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))] z-50">
            {allTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  onSelect(team.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted transition-colors border-b-2 border-border last:border-b-0',
                  selectedTeam === team.id && 'bg-primary/10'
                )}
              >
                <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-sm shrink-0">
                  {team.photoUrl ? (
                    <img src={team.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{team.emblem}</span>
                  )}
                </div>
                <span className="font-body text-foreground">{team.name}</span>
                {selectedTeam === team.id && (
                  <span className="ml-auto text-primary font-pixel text-[11px]">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
