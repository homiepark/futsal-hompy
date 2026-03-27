'use client';

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
  earned: boolean;
}

function getAchievements(
  matchCount: number,
  memberCount: number,
  archiveCount: number
): Achievement[] {
  return [
    { id: 'match-1', emoji: '⚽', label: '첫 매치!', earned: matchCount >= 1 },
    { id: 'match-5', emoji: '🏃', label: '5전 돌파', earned: matchCount >= 5 },
    { id: 'match-10', emoji: '⚔️', label: '10전 용사', earned: matchCount >= 10 },
    { id: 'match-20', emoji: '🏅', label: '베테랑', earned: matchCount >= 20 },
    { id: 'member-5', emoji: '👥', label: '5인 풋살단', earned: memberCount >= 5 },
    { id: 'member-10', emoji: '🏠', label: '대가족', earned: memberCount >= 10 },
    { id: 'archive-1', emoji: '📸', label: '첫 기록', earned: archiveCount >= 1 },
    { id: 'archive-10', emoji: '📚', label: '추억 수집가', earned: archiveCount >= 10 },
  ];
}

export function TeamAchievements({
  matchCount,
  memberCount,
  archiveCount,
}: TeamAchievementsProps) {
  const achievements = getAchievements(matchCount, memberCount, archiveCount);

  return (
    <div
      className="border-3 border-border-dark bg-card p-3"
      style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
    >
      <p className="font-pixel text-[8px] text-muted-foreground mb-2">
        팀 업적
      </p>
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              'flex-shrink-0 flex flex-col items-center justify-center',
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
    </div>
  );
}
