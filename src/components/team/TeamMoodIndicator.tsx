'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const MOODS = [
  { emoji: '🔥', label: '열정' },
  { emoji: '😎', label: '여유' },
  { emoji: '💪', label: '훈련' },
  { emoji: '🎉', label: '파티' },
  { emoji: '⚔️', label: '전투' },
] as const;

interface TeamMoodIndicatorProps {
  teamId: string;
  isAdmin?: boolean;
}

export function TeamMoodIndicator({ teamId, isAdmin = false }: TeamMoodIndicatorProps) {
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
    <button
      className={cn(
        'border-2 border-border-dark bg-card px-3 py-2 flex items-center gap-2',
        isAdmin && 'cursor-pointer active:scale-95 transition-transform'
      )}
      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
      onClick={handleClick}
      disabled={!isAdmin}
    >
      <span className={cn('text-xl', bouncing && 'animate-pixel-bounce')}>
        {currentMood.emoji}
      </span>
      <div className="text-left">
        <span className="font-pixel text-[11px] text-foreground block">{currentMood.label}</span>
        {isAdmin && <span className="font-pixel text-[11px] text-muted-foreground">탭하여 변경</span>}
      </div>
    </button>
  );
}
