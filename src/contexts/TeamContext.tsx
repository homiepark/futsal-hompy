import { createContext, useContext, useState, ReactNode } from 'react';

export interface Team {
  id: string;
  name: string;
  emblem: string;
  photoUrl?: string;
  level: 'S' | 'A' | 'B' | 'C';
  favorites: number;
  region?: string;
  description?: string;
  foundedYear?: number;
}

interface TeamContextType {
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  clearActiveTeam: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);

  const setActiveTeam = (team: Team | null) => {
    setActiveTeamState(team);
  };

  const clearActiveTeam = () => {
    setActiveTeamState(null);
  };

  return (
    <TeamContext.Provider value={{ activeTeam, setActiveTeam, clearActiveTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
