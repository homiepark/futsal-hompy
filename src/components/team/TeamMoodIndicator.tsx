'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const MOODS = [
  { emoji: '🔥', label: '열정모드' },
  { emoji: '😎', label: '여유모드' },
  { emoji: '💪', label: '훈련모드' },
  { emoji: '🎉', label: '파티모드' },
  { emoji: '⚔️', label: '전투모드' },
] as const;

interface TeamMoodIndicatorProps {
  teamId: string;
  isAdmin: boolean;
}

export function TeamMoodIndicator({ teamId, isAdmin }: TeamMoodIndicatorProps) {
  const [moodIndex, setMoodIndex] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  const currentMood = MOODS[moodIndex];

  const handleClick = () => {
    if (!isAdmin) return;
    setBouncing(true);
    setMoodIndex((prev) => (prev + 1) % MOODS.length);
  };

  useEffect(() => {
    if (!bouncing) return;
    const timer = setTimeout(() => setBouncing(false), 500);
    return () => clearTimeout(timer);
  }, [bouncing]);

  return (
    <div
      className={cn(
        'border-3 border-border-dark bg-card p-4 text-center',
        isAdmin && 'cursor-pointer active:scale-95 transition-transform'
      )}
      style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
      onClick={handleClick}
      role={isAdmin ? 'button' : undefined}
      tabIndex={isAdmin ? 0 : undefined}
      onKeyDown={isAdmin ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); } : undefined}
    >
      <p className="font-pixel text-[8px] text-muted-foreground mb-2">
        팀 무드
      </p>
      <div
        className={cn(
          'text-5xl mb-2 inline-block',
          bouncing && 'animate-pixel-bounce'
        )}
      >
        {currentMood.emoji}
      </div>
      <p className="font-pixel text-[10px] text-foreground">
        {currentMood.label}
      </p>
      {isAdmin && (
        <p className="font-pixel text-[7px] text-muted-foreground mt-2">
          탭하여 변경
        </p>
      )}
    </div>
  );
}
