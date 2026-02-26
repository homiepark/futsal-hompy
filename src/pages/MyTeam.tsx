import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam, Team } from '@/contexts/TeamContext';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { Star, ChevronRight } from 'lucide-react';

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
    level: 'B',
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

export default function MyTeam() {
  const navigate = useNavigate();
  const { setActiveTeam } = useTeam();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user's teams
    setTimeout(() => {
      setUserTeams(mockUserTeams);
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    // If user has only 1 team, navigate directly
    if (!isLoading && userTeams.length === 1) {
      setActiveTeam(userTeams[0]);
      navigate(`/team/${userTeams[0].id}`, { replace: true });
    }
  }, [userTeams, isLoading, navigate, setActiveTeam]);

  const handleTeamSelect = (team: Team) => {
    setActiveTeam(team);
    navigate(`/team/${team.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">⚽</div>
          <p className="font-pixel text-[10px] text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // If no teams, show empty state
  if (userTeams.length === 0) {
    return (
      <div className="pb-24 max-w-lg mx-auto px-4">
        <div className="pt-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="font-pixel text-lg text-foreground mb-2">MY TEAM</h1>
          <p className="font-body text-muted-foreground mb-6">
            아직 소속된 팀이 없습니다
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary border-4 border-primary-dark text-primary-foreground font-pixel text-[10px] shadow-pixel hover:translate-y-[-2px] transition-transform"
          >
            팀 찾아보기
          </button>
        </div>
      </div>
    );
  }

  // Show team selection for multiple teams
  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-4 border-border-dark">
        <div className="px-4 py-4 text-center">
          <h1 className="font-pixel text-lg text-foreground">MY TEAM</h1>
          <p className="font-body text-xs text-muted-foreground mt-1">
            소속 팀을 선택하세요
          </p>
        </div>
      </div>

      {/* Team List */}
      <div className="px-4 py-6 space-y-4">
        {userTeams.map((team) => (
          <button
            key={team.id}
            onClick={() => handleTeamSelect(team)}
            className="w-full text-left"
          >
            <PixelCard className="hover:border-primary transition-colors group">
              <div className="flex items-center gap-4">
                {/* Team Emblem */}
                <div className="w-16 h-16 bg-muted border-4 border-border-dark flex items-center justify-center text-3xl shrink-0">
                  {team.emblem}
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-pixel text-sm text-foreground truncate">
                      {team.name}
                    </h2>
                    <span className={`px-2 py-0.5 text-[10px] font-pixel ${levelColors[team.level]}`}>
                      Lv.{team.level}
                    </span>
                  </div>
                  
                  {team.region && (
                    <p className="font-body text-xs text-muted-foreground mb-2">
                      📍 {team.region}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    <span className="font-pixel text-[8px]">{team.favorites}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight 
                  size={20} 
                  className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" 
                />
              </div>
            </PixelCard>
          </button>
        ))}
      </div>
    </div>
  );
}
