import { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import headerBanner from '@/assets/header-banner.jpg';
import { CategoryTabs } from '@/components/findteam/CategoryTabs';
import { TeamFilterBar } from '@/components/findteam/TeamFilterBar';
import { TeamListCard } from '@/components/findteam/TeamListCard';
import { cn } from '@/lib/utils';

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
  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="w-full relative">
        {/* Top Icons */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button className="w-9 h-9 bg-card/90 backdrop-blur-sm border-2 border-border-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors">
            <Bell size={18} className="text-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent border border-accent-dark text-[8px] font-pixel text-accent-foreground flex items-center justify-center">
              3
            </span>
          </button>
          <button className="w-9 h-9 bg-card/90 backdrop-blur-sm border-2 border-border-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors">
            <Settings size={18} className="text-foreground" />
          </button>
        </div>
        <img 
          src={headerBanner} 
          alt="우리의풋살 배너"
          className="w-full h-auto object-cover border-b-4 border-border-dark"
        />
      </div>

      {/* Category Navigation Tabs */}
      <CategoryTabs />

      {/* Filter Bar */}
      <TeamFilterBar />

      {/* Team List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body font-bold text-foreground flex items-center gap-2">
            <span className="text-primary">⚽</span>
            팀 목록
            <span className="text-sm text-muted-foreground">({sampleTeams.length}개)</span>
          </h2>
          <button className="text-xs font-body text-primary hover:underline">
            전체보기 →
          </button>
        </div>

        <div className="grid gap-3">
          {sampleTeams.map((team, index) => (
            <TeamListCard key={index} {...team} />
          ))}
        </div>
      </div>

      {/* Bottom Spacing for Nav */}
      <div className="h-20" />
    </div>
  );
};

export default Index;
