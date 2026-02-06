import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, Mail, Plus } from 'lucide-react';
import { SimpleHeader } from '@/components/findteam/SimpleHeader';
import { AdvancedFilterBar, FilterState, initialFilterState } from '@/components/findteam/AdvancedFilterBar';
import { TeamListCard } from '@/components/findteam/TeamListCard';
import { PixelProfileIcon } from '@/components/ui/PixelProfileIcon';
import { cn } from '@/lib/utils';
import topBanner from '@/assets/top-banner.jpg';

interface Team {
  emblem: string;
  name: string;
  region: string;
  district?: string;
  gender?: string;
  level: 'S' | 'A' | 'B' | 'C';
  trainingTime: string;
  trainingDays?: string[];
  memberCount: number;
  isFavorited: boolean;
}

const initialTeams: Team[] = [
  { emblem: '⚽', name: 'FC 번개', region: '서울', district: '강남구', gender: '남성', level: 'S', trainingTime: '오전 (06-12시)', trainingDays: ['토', '일'], memberCount: 18, isFavorited: true },
  { emblem: '🦁', name: '라이언즈 FC', region: '경기', district: '성남시', gender: '남성', level: 'A', trainingTime: '저녁 (18-24시)', trainingDays: ['월', '수', '금'], memberCount: 15, isFavorited: false },
  { emblem: '🔥', name: '화이터스', region: '서울', district: '마포구', gender: '혼성', level: 'A', trainingTime: '오후 (12-18시)', trainingDays: ['토'], memberCount: 20, isFavorited: true },
  { emblem: '⭐', name: '스타킥', region: '인천', district: '연수구', gender: '여성', level: 'B', trainingTime: '저녁 (18-24시)', trainingDays: ['화', '목'], memberCount: 12, isFavorited: false },
  { emblem: '🌊', name: '블루웨이브', region: '부산', district: '해운대구', gender: '남성', level: 'B', trainingTime: '오전 (06-12시)', trainingDays: ['토', '일'], memberCount: 16, isFavorited: false },
  { emblem: '🦅', name: '이글스 FC', region: '대구', district: '수성구', gender: '혼성', level: 'C', trainingTime: '오후 (12-18시)', trainingDays: ['일'], memberCount: 10, isFavorited: true },
  { emblem: '🐯', name: '타이거즈', region: '서울', district: '송파구', gender: '남성', level: 'S', trainingTime: '오전 (06-12시)', trainingDays: ['토'], memberCount: 22, isFavorited: false },
  { emblem: '🌟', name: '스타FC 여성팀', region: '경기', district: '용인시', gender: '여성', level: 'A', trainingTime: '오후 (12-18시)', trainingDays: ['수', '토'], memberCount: 14, isFavorited: false },
];

const Index = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [listView, setListView] = useState<'all' | 'favorites'>('all');

  const handleFavoriteToggle = (teamName: string, isFavorited: boolean) => {
    setTeams(prev => prev.map(team => 
      team.name === teamName ? { ...team, isFavorited } : team
    ));
  };

  // Real-time filtering
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      // Team name search
      if (filters.teamName && !team.name.toLowerCase().includes(filters.teamName.toLowerCase())) {
        return false;
      }
      // Gender filter
      if (filters.genders.length > 0 && team.gender && !filters.genders.includes(team.gender)) {
        return false;
      }
      // Region filter
      if (filters.region && team.region !== filters.region) {
        return false;
      }
      // District filter
      if (filters.district && team.district !== filters.district) {
        return false;
      }
      // Level filter
      if (filters.levels.length > 0 && !filters.levels.includes(team.level)) {
        return false;
      }
      // Days filter
      if (filters.days.length > 0 && team.trainingDays) {
        const hasMatchingDay = filters.days.some(day => team.trainingDays?.includes(day));
        if (!hasMatchingDay) return false;
      }
      // Time slot filter
      if (filters.timeSlot && team.trainingTime !== filters.timeSlot) {
        return false;
      }
      return true;
    });
  }, [teams, filters]);

  const displayedTeams = listView === 'favorites' 
    ? filteredTeams.filter(t => t.isFavorited) 
    : filteredTeams;

  const favoriteCount = filteredTeams.filter(t => t.isFavorited).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="w-full relative">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <Link 
            to="/messages"
            className="relative w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors"
          >
            <Mail size={22} className="text-foreground" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent border-2 border-accent-dark text-[10px] text-accent-foreground flex items-center justify-center shadow-[1px_1px_0_hsl(var(--pixel-shadow))]">
              2
            </span>
          </Link>
          <button className="relative w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors">
            <Bell size={22} className="text-foreground" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent border-2 border-accent-dark text-[10px] text-accent-foreground flex items-center justify-center shadow-[1px_1px_0_hsl(var(--pixel-shadow))]">
              3
            </span>
          </button>
          <Link 
            to="/settings"
            className="w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors"
          >
            <Settings size={22} className="text-foreground" />
          </Link>
          <Link to="/profile">
            <PixelProfileIcon size={3} />
          </Link>
        </div>
        <img 
          src={topBanner} 
          alt="우리의풋살 배너"
          className="w-full h-auto object-cover border-b-4 border-border-dark"
        />
      </div>

      {/* Simple Header - Just auth button */}
      <div className="sticky top-0 z-40">
        <SimpleHeader />
      </div>

      {/* Page Title */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-pixel text-lg text-foreground flex items-center gap-2">
          ⚽ 전체 팀 목록
          <span className="text-sm text-muted-foreground">({filteredTeams.length}개)</span>
        </h1>
      </div>

      {/* Create Team CTA */}
      <div className="px-4 pb-2">
        <button
          onClick={() => navigate('/create-team')}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'bg-accent text-accent-foreground',
            'border-4 border-accent-dark',
            'font-pixel text-[10px] uppercase tracking-wider',
            'px-4 py-3',
            'transition-all duration-100',
            'hover:brightness-110',
            'active:translate-x-0.5 active:translate-y-0.5'
          )}
          style={{
            boxShadow: `
              4px 4px 0 hsl(var(--accent-dark)),
              inset -2px -2px 0 hsl(var(--accent-dark) / 0.4),
              inset 2px 2px 0 hsl(0 0% 100% / 0.25)
            `,
          }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>🏆 팀 만들기</span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <AdvancedFilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Team List */}
      <div className="p-4">
        {/* List View Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setListView('all')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 font-body text-sm border-4 transition-all',
              listView === 'all'
                ? 'bg-primary text-primary-foreground border-primary-dark shadow-[4px_4px_0_hsl(var(--primary-dark))]'
                : 'bg-card text-foreground border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))] hover:bg-muted'
            )}
          >
            <span>⚽</span>
            <span className="font-bold">전체 팀</span>
            <span className="text-xs opacity-80">({filteredTeams.length})</span>
          </button>
          <button
            onClick={() => setListView('favorites')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 font-body text-sm border-4 transition-all',
              listView === 'favorites'
                ? 'bg-accent text-accent-foreground border-accent-dark shadow-[4px_4px_0_hsl(var(--accent-dark))]'
                : 'bg-card text-foreground border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))] hover:bg-muted'
            )}
          >
            <span>⭐</span>
            <span className="font-bold">관심 팀</span>
            <span className="text-xs opacity-80">({favoriteCount})</span>
          </button>
        </div>

        {/* Teams Grid */}
        {displayedTeams.length > 0 ? (
          <div className="grid gap-3">
            {displayedTeams.map((team) => (
              <TeamListCard 
                key={team.name} 
                {...team} 
                region={`${team.region} ${team.district || ''}`}
                onFavoriteToggle={(isFavorited) => handleFavoriteToggle(team.name, isFavorited)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border-4 border-border-dark p-8 text-center shadow-[4px_4px_0_hsl(var(--pixel-shadow))]">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-body text-muted-foreground">
              {listView === 'favorites' ? '관심 팀이 없습니다' : '검색 결과가 없습니다'}
            </p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {listView === 'favorites' ? '팀 카드의 별 아이콘을 눌러 추가해보세요!' : '필터 조건을 변경해보세요'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-20" />
    </div>
  );
};

export default Index;
