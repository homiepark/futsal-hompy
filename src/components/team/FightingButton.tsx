'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CONFETTI_EMOJIS = ['⚽', '🔥', '⭐', '💪', '🏆'];

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
  delay: number;
}

interface FightingButtonProps {
  teamName: string;
}

let emojiIdCounter = 0;

export function FightingButton({ teamName }: FightingButtonProps) {
  const [count, setCount] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  const handleClick = useCallback(() => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 400);
    setCount((prev) => prev + 1);
    toast(`${teamName} 파이팅! 💪`);

    const newEmojis: FloatingEmoji[] = CONFETTI_EMOJIS.map((emoji) => ({
      id: ++emojiIdCounter,
      emoji,
      left: Math.random() * 80 + 10,
      delay: Math.random() * 200,
    }));
    setFloatingEmojis((prev) => [...prev, ...newEmojis]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => !newEmojis.some((ne) => ne.id === e.id)));
    }, 1200);
  }, [teamName]);

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {floatingEmojis.map((item) => (
          <span key={item.id} className="absolute text-sm animate-emoji-float"
            style={{ left: `${item.left}%`, bottom: '100%', animationDelay: `${item.delay}ms` }}>
            {item.emoji}
          </span>
        ))}
      </div>
      <button
        onClick={handleClick}
        className={cn(
          'font-pixel text-[9px] px-3 py-2 border-2 border-border-dark',
          'bg-accent text-accent-foreground',
          'active:translate-x-[1px] active:translate-y-[1px] transition-all',
          bouncing && 'animate-pixel-bounce'
        )}
        style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
      >
        👊 파이팅! {count > 0 && <span className="text-[7px] opacity-80">({count})</span>}
      </button>
    </div>
  );
}
