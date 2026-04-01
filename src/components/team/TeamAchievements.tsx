'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TeamAchievementsProps {
  matchCount: number;
  memberCount: number;
  archiveCount: number;
}

interface Achievement {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  earned: boolean;
}

function getAchievements(
  matchCount: number,
  memberCount: number,
  archiveCount: number
): Achievement[] {
  return [
    { id: 'match-1', emoji: '⚽', label: '첫 매치!', desc: '매치 공고에 참여하면 획득!', earned: matchCount >= 1 },
    { id: 'match-5', emoji: '🏃', label: '5전 돌파', desc: '5번의 매치를 완료하세요!', earned: matchCount >= 5 },
    { id: 'match-10', emoji: '⚔️', label: '10전 용사', desc: '10번의 매치를 완료하세요!', earned: matchCount >= 10 },
    { id: 'match-20', emoji: '🏅', label: '베테랑', desc: '20번 이상의 매치를 완료하세요!', earned: matchCount >= 20 },
    { id: 'member-5', emoji: '👥', label: '5인 풋살단', desc: '팀원을 5명 이상 모으세요!', earned: memberCount >= 5 },
    { id: 'member-10', emoji: '🏠', label: '대가족', desc: '팀원을 10명 이상 모으세요!', earned: memberCount >= 10 },
    { id: 'archive-1', emoji: '📸', label: '첫 기록', desc: '팀 스토리에 첫 기록을 남기세요!', earned: archiveCount >= 1 },
    { id: 'archive-10', emoji: '📚', label: '추억 수집가', desc: '팀 스토리에 10개 이상 기록하세요!', earned: archiveCount >= 10 },
  ];
}

export function TeamAchievements({
  matchCount,
  memberCount,
  archiveCount,
}: TeamAchievementsProps) {
  const achievements = getAchievements(matchCount, memberCount, archiveCount);
  const sorted = [...achievements.filter(a => a.earned), ...achievements.filter(a => !a.earned)];
  const [selectedAchievement, setSelectedAchievement] = useState<{name: string; emoji: string; desc: string; earned: boolean} | null>(null);

  return (
    <div
      className="border-3 border-border-dark bg-card p-3"
      style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
    >
      <p className="font-pixel text-[8px] text-muted-foreground mb-2">
        팀 업적
      </p>
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
        {sorted.map((achievement) => (
          <div
            key={achievement.id}
            onClick={() => setSelectedAchievement({ name: achievement.label, emoji: achievement.emoji, desc: achievement.desc, earned: achievement.earned })}
            className={cn(
              'flex-shrink-0 flex flex-col items-center justify-center cursor-pointer',
              'border-3 border-border-dark p-2 min-w-[64px]',
              achievement.earned
                ? 'bg-accent/20 text-foreground'
                : 'bg-muted/50 text-muted-foreground opacity-50'
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <span className="text-xl leading-none">
              {achievement.earned ? achievement.emoji : '🔒'}
            </span>
            <span className="font-pixel text-[7px] mt-1 whitespace-nowrap">
              {achievement.label}
            </span>
          </div>
        ))}
      </div>

      {/* Achievement Detail Popup */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[240px] bg-card border-4 border-border-dark p-4 text-center"
            style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-4xl block mb-2">{selectedAchievement.emoji}</span>
            <p className="font-pixel text-[10px] text-foreground mb-1">{selectedAchievement.name}</p>
            {selectedAchievement.earned ? (
              <p className="font-pixel text-[8px] text-accent">획득 완료!</p>
            ) : (
              <p className="font-pixel text-[8px] text-muted-foreground">조건: {selectedAchievement.desc}</p>
            )}
            <p className="font-pixel text-[7px] text-muted-foreground mt-2">{selectedAchievement.desc}</p>
            <button
              onClick={() => setSelectedAchievement(null)}
              className="mt-3 px-4 py-1 bg-primary text-primary-foreground font-pixel text-[8px] border-2 border-border-dark hover:bg-primary/90"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
