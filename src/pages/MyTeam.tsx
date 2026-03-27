import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTeam, Team } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PixelCard } from '@/components/ui/PixelCard';
import { Star, ChevronRight } from 'lucide-react';

const levelColors: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))] text-white',
  '2': 'bg-[hsl(var(--level-2))] text-white',
  '3': 'bg-[hsl(var(--level-3))] text-white',
  '4': 'bg-[hsl(var(--level-4))] text-white',
};

export default function MyTeam() {
  const navigate = useNavigate();
  const { setActiveTeam } = useTeam();
  const { user, loading: authLoading } = useAuth();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchUserTeams = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, role, teams(id, name, emblem, level, region, district, banner_url, photo_url, description, introduction, instagram_url, youtube_url)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to fetch user teams:', error);
        setIsLoading(false);
        return;
      }

      const teams: Team[] = (data ?? [])
        .filter((row) => row.teams)
        .map((row) => {
          const t = row.teams as any;
          return {
            id: t.id,
            name: t.name,
            emblem: t.emblem,
            level: t.level,
            favorites: 0,
            region: [t.region, t.district].filter(Boolean).join(' ') || undefined,
            photoUrl: t.photo_url ?? undefined,
            bannerUrl: t.banner_url ?? undefined,
            description: t.description ?? undefined,
            introduction: t.introduction ?? undefined,
            instagramUrl: t.instagram_url ?? undefined,
            youtubeUrl: t.youtube_url ?? undefined,
          };
        });

      setUserTeams(teams);
      setIsLoading(false);
    };

    fetchUserTeams();
  }, [user, authLoading]);

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">⚽</div>
          <p className="font-pixel text-[10px] text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="pb-24 max-w-lg mx-auto px-4">
        <div className="pt-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="font-pixel text-lg text-foreground mb-2">MY TEAM</h1>
          <p className="font-body text-muted-foreground mb-6">
            로그인이 필요합니다
          </p>
          <Link
            to="/auth"
            className="inline-block px-6 py-3 bg-primary border-4 border-primary-dark text-primary-foreground font-pixel text-[10px] shadow-pixel hover:translate-y-[-2px] transition-transform"
          >
            로그인하기
          </Link>
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
                    <span className={`px-2 py-0.5 text-[10px] font-pixel ${levelColors[team.level] || ''}`}>
                      LV.{team.level}
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
