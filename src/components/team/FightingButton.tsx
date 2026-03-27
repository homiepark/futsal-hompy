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
    // Bounce animation
    setBouncing(true);
    setTimeout(() => setBouncing(false), 400);

    // Increment counter
    setCount((prev) => prev + 1);

    // Toast
    toast(`${teamName} 파이팅! 💪`);

    // Spawn confetti emojis
    const newEmojis: FloatingEmoji[] = CONFETTI_EMOJIS.map((emoji) => ({
      id: ++emojiIdCounter,
      emoji,
      left: Math.random() * 80 + 10, // 10% - 90%
      delay: Math.random() * 200,
    }));

    setFloatingEmojis((prev) => [...prev, ...newEmojis]);

    // Clean up after animation completes
    setTimeout(() => {
      setFloatingEmojis((prev) =>
        prev.filter((e) => !newEmojis.some((ne) => ne.id === e.id))
      );
    }, 1200);
  }, [teamName]);

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Floating emoji container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {floatingEmojis.map((item) => (
          <span
            key={item.id}
            className="absolute text-lg animate-emoji-float"
            style={{
              left: `${item.left}%`,
              bottom: '100%',
              animationDelay: `${item.delay}ms`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleClick}
        className={cn(
          'font-pixel text-[12px] px-6 py-3',
          'border-3 border-border-dark',
          'bg-accent text-accent-foreground',
          'active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
          'transition-all',
          bouncing && 'animate-pixel-bounce'
        )}
        style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
      >
        👊 파이팅!
      </button>

      {/* Counter */}
      {count > 0 && (
        <p className="font-pixel text-[8px] text-muted-foreground mt-2">
          오늘 {count}번 응원!
        </p>
      )}

    </div>
  );
}
