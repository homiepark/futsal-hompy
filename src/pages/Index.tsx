import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, Mail } from 'lucide-react';
import { StickyNavBar } from '@/components/layout/StickyNavBar';
import { TeamFilterBar } from '@/components/findteam/TeamFilterBar';
import { TeamListCard } from '@/components/findteam/TeamListCard';
import { PixelProfileIcon } from '@/components/ui/PixelProfileIcon';
import { cn } from '@/lib/utils';
import topBanner from '@/assets/top-banner.jpg';

interface Team {
  emblem: string;
  name: string;
  region: string;
  level: 'S' | 'A' | 'B' | 'C';
  trainingTime: string;
  memberCount: number;
  isFavorited: boolean;
}

const initialTeams: Team[] = [
  { emblem: '⚽', name: 'FC 번개', region: '서울 강남', level: 'S', trainingTime: '주말 오전 9시', memberCount: 18, isFavorited: true },
  { emblem: '🦁', name: '라이언즈 FC', region: '경기 성남', level: 'A', trainingTime: '평일 저녁 7시', memberCount: 15, isFavorited: false },
  { emblem: '🔥', name: '화이터스', region: '서울 마포', level: 'A', trainingTime: '주말 오후 2시', memberCount: 20, isFavorited: true },
  { emblem: '⭐', name: '스타킥', region: '인천 연수', level: 'B', trainingTime: '평일 저녁 8시', memberCount: 12, isFavorited: false },
  { emblem: '🌊', name: '블루웨이브', region: '부산 해운대', level: 'B', trainingTime: '주말 오전 10시', memberCount: 16, isFavorited: false },
  { emblem: '🦅', name: '이글스 FC', region: '대구 수성', level: 'C', trainingTime: '주말 오후 4시', memberCount: 10, isFavorited: true },
];

const Index = () => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [listView, setListView] = useState<'all' | 'favorites'>('all');

  const handleFavoriteToggle = (index: number, isFavorited: boolean) => {
    setTeams(prev => prev.map((team, i) => 
      i === index ? { ...team, isFavorited } : team
    ));
  };

  const displayedTeams = listView === 'favorites' 
    ? teams.filter(t => t.isFavorited) 
    : teams;

  const favoriteCount = teams.filter(t => t.isFavorited).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner - Full Image with Icons Overlay */}
      <div className="w-full relative">
        {/* Icons on top-right of banner */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {/* Messages */}
          <Link 
            to="/messages"
            className="relative w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors"
          >
            <Mail size={22} className="text-foreground" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent border-2 border-accent-dark text-[10px] text-accent-foreground flex items-center justify-center shadow-[1px_1px_0_hsl(var(--pixel-shadow))]">
              2
            </span>
          </Link>

          {/* Notification */}
          <button className="relative w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors">
            <Bell size={22} className="text-foreground" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent border-2 border-accent-dark text-[10px] text-accent-foreground flex items-center justify-center shadow-[1px_1px_0_hsl(var(--pixel-shadow))]">
              3
            </span>
          </button>

          {/* Settings */}
          <Link 
            to="/settings"
            className="w-11 h-11 bg-card/95 backdrop-blur-sm border-3 border-border-dark flex items-center justify-center shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors"
          >
            <Settings size={22} className="text-foreground" />
          </Link>

          {/* Profile */}
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

      {/* Sticky Navigation Bar with Tabs */}
      <StickyNavBar />

      {/* Filter Bar */}
      <TeamFilterBar />

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
            <span className="text-xs opacity-80">({teams.length})</span>
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

        {/* Team List Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body font-bold text-foreground flex items-center gap-2">
            <span className={listView === 'favorites' ? 'text-accent' : 'text-primary'}>
              {listView === 'favorites' ? '⭐' : '⚽'}
            </span>
            {listView === 'favorites' ? '관심 팀 목록' : '팀 목록'}
            <span className="text-sm text-muted-foreground">({displayedTeams.length}개)</span>
          </h2>
          <button className="text-xs font-body text-primary hover:underline">
            전체보기 →
          </button>
        </div>

        {/* Teams Grid */}
        {displayedTeams.length > 0 ? (
          <div className="grid gap-3">
            {displayedTeams.map((team, index) => (
              <TeamListCard 
                key={team.name} 
                {...team} 
                onFavoriteToggle={(isFavorited) => {
                  const originalIndex = teams.findIndex(t => t.name === team.name);
                  handleFavoriteToggle(originalIndex, isFavorited);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border-4 border-border-dark p-8 text-center shadow-[4px_4px_0_hsl(var(--pixel-shadow))]">
            <div className="text-4xl mb-3">⭐</div>
            <p className="font-body text-muted-foreground">아직 관심 팀이 없습니다</p>
            <p className="font-body text-sm text-muted-foreground mt-1">팀 카드의 별 아이콘을 눌러 추가해보세요!</p>
          </div>
        )}
      </div>

      {/* Bottom Spacing for Nav */}
      <div className="h-20" />
    </div>
  );
};

export default Index;
