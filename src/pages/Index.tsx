import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Mail, Plus } from 'lucide-react';
import { SimpleHeader } from '@/components/findteam/SimpleHeader';
import { TeamListCard } from '@/components/findteam/TeamListCard';
import { HotTeamsRanking } from '@/components/home/HotTeamsRanking';
import { MyTeamNews } from '@/components/home/MyTeamNews';
import { FavoriteTeams } from '@/components/home/FavoriteTeams';
import { CompactFilterBar } from '@/components/home/CompactFilterBar';
import { GuestAuthPrompt } from '@/components/home/GuestAuthPrompt';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getTimeSlot } from '@/lib/teamData';
import topBanner from '@/assets/top-banner.jpg';

interface Team {
  id: string;
  emblem: string;
  photo_url: string | null;
  name: string;
  region: string | null;
  district: string | null;
  gender: string | null;
  level: string;
  training_time: string | null;
  training_days: string[] | null;
  training_start_time: string | null;
  training_end_time: string | null;
  memberCount?: number;
  isFavorited: boolean;
}

interface PreferredRegion {
  region: string;
  district: string;
}

interface FilterState {
  teamName: string;
  levels: string[];
  genders: string[];
  selectedRegions: PreferredRegion[];
  days: string[];
  timeSlot: string;
}

const initialFilterState: FilterState = {
  teamName: '',
  levels: [],
  genders: [],
  selectedRegions: [],
  days: [],
  timeSlot: '',
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [listMode, setListMode] = useState<'filter' | 'all'>('filter');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('team-favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) { setUnreadCount(0); return; }
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);
        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    fetchUnreadCount();
  }, [user]);

  // Fetch teams from Supabase
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const { data: membersData } = await supabase
          .from('team_members')
          .select('team_id');

        const memberCounts: Record<string, number> = {};
        if (membersData) {
          for (const m of membersData) {
            memberCounts[m.team_id] = (memberCounts[m.team_id] || 0) + 1;
          }
        }

        const teamsWithFavorites = (data || []).map(team => ({
          ...team,
          memberCount: memberCounts[team.id] || 0,
          isFavorited: favorites.has(team.id),
        }));

        setTeams(teamsWithFavorites);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [favorites]);

  const handleFavoriteToggle = (teamId: string, isFavorited: boolean) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFavorited) { next.add(teamId); } else { next.delete(teamId); }
      localStorage.setItem('team-favorites', JSON.stringify([...next]));
      return next;
    });
    setTeams(prev => prev.map(team =>
      team.id === teamId ? { ...team, isFavorited } : team
    ));
  };

  // Filtered teams (지역 필터 적용)
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      if (filters.teamName && !team.name.toLowerCase().includes(filters.teamName.toLowerCase())) return false;
      if (filters.genders.length > 0 && team.gender && !filters.genders.includes(team.gender)) return false;
      if (filters.selectedRegions && filters.selectedRegions.length > 0) {
        const matchesAnyRegion = filters.selectedRegions.some(
          r => team.region === r.region && team.district === r.district
        );
        if (!matchesAnyRegion) return false;
      }
      if (filters.levels.length > 0 && !filters.levels.includes(team.level)) return false;
      if (filters.days.length > 0 && team.training_days) {
        const hasMatchingDay = filters.days.some(day => team.training_days?.includes(day));
        if (!hasMatchingDay) return false;
      }
      if (filters.timeSlot && team.training_start_time) {
        const teamTimeSlot = getTimeSlot(team.training_start_time);
        if (teamTimeSlot !== filters.timeSlot) return false;
      }
      return true;
    });
  }, [teams, filters]);

  // 전체팀 보기 (가나다순)
  const allTeamsSorted = useMemo(() => {
    return [...teams].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [teams]);

  // 필터 모드에서 필터가 설정되었는지 확인
  const hasActiveFilters = filters.teamName || filters.levels.length > 0 || filters.genders.length > 0 || (filters.selectedRegions && filters.selectedRegions.length > 0) || filters.days.length > 0 || filters.timeSlot;

  // 표시할 팀 목록
  const displayedTeams = listMode === 'all' ? allTeamsSorted : (hasActiveFilters ? filteredTeams : []);

  // Favorite teams for carousel
  const favoriteTeams = useMemo(() => {
    return teams.filter(t => t.isFavorited).map(t => ({
      id: t.id,
      emblem: t.emblem,
      name: t.name,
      region: formatRegion(t),
      level: t.level,
      photoUrl: t.photo_url || undefined,
    }));
  }, [teams]);

  // Helper functions
  function formatTrainingTime(team: Team): string {
    if (team.training_days && team.training_days.length > 0) {
      const daysStr = team.training_days.join(', ');
      if (team.training_start_time && team.training_end_time) {
        return `${daysStr} ${team.training_start_time}-${team.training_end_time}`;
      }
      return daysStr;
    }
    return team.training_time || '미정';
  }

  function formatRegion(team: Team): string {
    if (team.region && team.district) return `${team.region} ${team.district}`;
    return team.region || '미정';
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%),
          repeating-linear-gradient(0deg, hsl(var(--field-green) / 0.08) 0px, hsl(var(--field-green) / 0.08) 4px, transparent 4px, transparent 8px),
          repeating-linear-gradient(90deg, hsl(var(--field-green) / 0.05) 0px, hsl(var(--field-green) / 0.05) 4px, transparent 4px, transparent 8px)
        `,
      }}
    >
      {/* Top Banner */}
      <div className="w-full relative">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <Link
            to="/messages"
            className="relative w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors"
          >
            <Mail size={22} className="text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent border-2 border-accent-dark text-[10px] text-accent-foreground flex items-center justify-center shadow-[1px_1px_0_hsl(var(--pixel-shadow))]">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className="w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors"
          >
            <Settings size={22} className="text-foreground" />
          </Link>
        </div>
        <img
          src={topBanner}
          alt="우리의풋살 배너"
          className="w-full h-auto object-cover border-b-4 border-border-dark"
        />
      </div>

      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-40">
        <SimpleHeader />
      </div>

      {/* NEW 팀 창단 축하 🎉 */}
      <HotTeamsRanking />

      {/* Create Team CTA */}
      <div className="px-4 pb-1">
        <button
          onClick={() => navigate('/create-team')}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'bg-accent text-accent-foreground',
            'border-3 border-accent-dark rounded-xl',
            'font-pixel text-[11px]',
            'px-4 py-2.5',
            'transition-all duration-100',
            'hover:brightness-110',
            'active:translate-x-0.5 active:translate-y-0.5'
          )}
          style={{ boxShadow: '3px 3px 0 hsl(var(--accent-dark))' }}
        >
          <Plus size={14} strokeWidth={3} />
          <span>🏆 새 팀 만들기</span>
        </button>
      </div>

      {/* My Team News - for logged-in users */}
      {user && <MyTeamNews userId={user.id} />}

      {/* Guest Auth Prompt */}
      {!user && <GuestAuthPrompt />}

      {/* Favorite Teams Carousel */}
      <FavoriteTeams teams={favoriteTeams} />

      {/* Team Discovery Section */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🔍</span>
          <h2 className="font-pixel text-[11px] text-foreground">팀 찾기</h2>
        </div>

        {/* Mode Toggle: 전체팀 / 지역설정 */}
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => setListMode('all')}
            className={cn(
              'px-3 py-1.5 font-pixel text-[11px] border-2 rounded-lg transition-all',
              listMode === 'all'
                ? 'bg-primary text-primary-foreground border-primary-dark shadow-[2px_2px_0_hsl(var(--primary-dark))]'
                : 'bg-card text-foreground border-border-dark hover:bg-muted'
            )}
          >
            ⚽ 전체팀 보기
          </button>
          <button
            onClick={() => setListMode('filter')}
            className={cn(
              'px-3 py-1.5 font-pixel text-[11px] border-2 rounded-lg transition-all',
              listMode === 'filter'
                ? 'bg-primary text-primary-foreground border-primary-dark shadow-[2px_2px_0_hsl(var(--primary-dark))]'
                : 'bg-card text-foreground border-border-dark hover:bg-muted'
            )}
          >
            📍 지역/조건 검색
          </button>
        </div>
      </div>

      {/* Filters (only in filter mode) */}
      {listMode === 'filter' && (
        <CompactFilterBar
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Team List */}
      <div className="px-4 pb-4">
        {listMode === 'filter' && hasActiveFilters && (
          <p className="font-pixel text-[9px] text-muted-foreground mb-2">
            검색 결과 {filteredTeams.length}팀
          </p>
        )}

        {listMode === 'filter' && !hasActiveFilters ? (
          <div
            className="bg-card border-3 border-border-dark p-6 text-center rounded-xl"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-pixel text-[11px] text-muted-foreground">팀 이름을 검색하거나</p>
            <p className="font-pixel text-[11px] text-muted-foreground">지역/조건을 설정해보세요!</p>
          </div>
        ) : loading ? (
          <div
            className="bg-card border-3 border-border-dark p-8 text-center rounded-xl"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="text-4xl mb-3 animate-pulse">⚽</div>
            <p className="font-pixel text-[11px] text-muted-foreground">팀 목록을 불러오는 중...</p>
          </div>
        ) : displayedTeams.length > 0 ? (
          <div className="grid gap-3">
            {displayedTeams.map((team) => (
              <TeamListCard
                key={team.id}
                id={team.id}
                emblem={team.emblem}
                photoUrl={team.photo_url || undefined}
                name={team.name}
                region={formatRegion(team)}
                level={team.level}
                trainingTime={formatTrainingTime(team)}
                memberCount={team.memberCount || 0}
                isFavorited={team.isFavorited}
                onFavoriteToggle={(isFavorited) => handleFavoriteToggle(team.id, isFavorited)}
              />
            ))}
          </div>
        ) : (
          <div
            className="bg-card border-3 border-border-dark p-8 text-center rounded-xl"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-pixel text-[11px] text-muted-foreground">검색 결과가 없습니다</p>
            <p className="font-pixel text-[11px] text-muted-foreground mt-2">필터 조건을 변경해보세요</p>
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-20" />
    </div>
  );
};

export default Index;
