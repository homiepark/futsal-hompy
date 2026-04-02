import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.3,
  }));
}

// Sakura (Cherry Blossom) Animation
function SakuraAnimation() {
  const [particles] = useState(() => generateParticles(12));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-sakura-fall"
          style={{
            left: `${p.x}%`,
            top: `-${p.size}px`,
            fontSize: `${p.size + 6}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
}

// Snow Animation
function SnowAnimation() {
  const [particles] = useState(() => generateParticles(20));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-snow-fall"
          style={{
            left: `${p.x}%`,
            top: `-${p.size}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            animationDuration: `${p.duration + 2}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

// Sparkle Animation
function SparkleAnimation() {
  const [particles] = useState(() => generateParticles(8));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-sparkle-twinkle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size + 2}px`,
            animationDuration: `${p.duration * 0.5}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          ✦
        </div>
      ))}
    </div>
  );
}

// Bubble Animation
function BubbleAnimation() {
  const [particles] = useState(() => generateParticles(10));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-bubble-rise"
          style={{
            left: `${p.x}%`,
            bottom: `-${p.size}px`,
            width: `${p.size + 4}px`,
            height: `${p.size + 4}px`,
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)',
            animationDuration: `${p.duration + 3}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

// Fire Animation
function FireAnimation() {
  const [particles] = useState(() => generateParticles(8));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-fire-rise"
          style={{
            left: `${p.x}%`,
            bottom: '0px',
            fontSize: `${p.size + 6}px`,
            animationDuration: `${p.duration * 0.6}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {['🔥', '🧡', '💛'][p.id % 3]}
        </div>
      ))}
    </div>
  );
}

// Football Animation
function FootballAnimation() {
  const [particles] = useState(() => generateParticles(5));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-football-bounce"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size + 4}px`,
            animationDuration: `${p.duration * 0.8}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity * 0.6,
          }}
        >
          ⚽
        </div>
      ))}
    </div>
  );
}

// Samba Special Animation - 픽셀 캐릭터들이 드리블하며 움직임
function SambaAnimation() {
  const characters = [
    { id: 0, emoji: '🏃', startX: -10, endX: 110, y: 75, duration: 12, delay: 0, size: 22, flip: false },
    { id: 1, emoji: '⚽', startX: -5, endX: 115, y: 78, duration: 12, delay: 0.3, size: 14, flip: false },
    { id: 2, emoji: '🏃', startX: 110, endX: -10, y: 55, duration: 15, delay: 4, size: 18, flip: true },
    { id: 3, emoji: '⚽', startX: 115, endX: -5, y: 58, duration: 15, delay: 4.2, size: 12, flip: true },
    { id: 4, emoji: '🤸', startX: -15, endX: 115, y: 40, duration: 18, delay: 8, size: 16, flip: false },
    { id: 5, emoji: '🥅', startX: 88, endX: 88, y: 72, duration: 0, delay: 0, size: 20, flip: false },
  ];

  const confetti = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 4 + 6,
    size: Math.random() * 6 + 4,
    color: i % 2 === 0 ? '#FDD835' : '#2E7D32',
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Confetti particles - 노랑/초록 */}
      {confetti.map(c => (
        <div
          key={`confetti-${c.id}`}
          className="absolute animate-samba-confetti"
          style={{
            left: `${c.x}%`,
            top: '-8px',
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            opacity: 0.25,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Characters running across */}
      {characters.map(char => (
        <div
          key={`char-${char.id}`}
          className={char.duration > 0 ? 'absolute animate-samba-run' : 'absolute'}
          style={{
            top: `${char.y}%`,
            left: char.duration > 0 ? undefined : `${char.startX}%`,
            fontSize: `${char.size}px`,
            opacity: 0.2,
            transform: char.flip ? 'scaleX(-1)' : 'none',
            ['--start-x' as any]: `${char.startX}vw`,
            ['--end-x' as any]: `${char.endX}vw`,
            animationDuration: char.duration > 0 ? `${char.duration}s` : undefined,
            animationDelay: char.duration > 0 ? `${char.delay}s` : undefined,
          }}
        >
          {char.emoji}
        </div>
      ))}

      {/* 하단 잔디 라인 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 animate-samba-grass"
        style={{
          background: 'repeating-linear-gradient(90deg, #2E7D32 0px, #2E7D32 8px, #4CAF50 8px, #4CAF50 16px)',
          opacity: 0.15,
        }}
      />
    </div>
  );
}

interface SkinAnimationProps {
  animation?: string;
}

export function SkinAnimation({ animation }: SkinAnimationProps) {
  if (!animation) return null;

  switch (animation) {
    case 'sakura': return <SakuraAnimation />;
    case 'snow': return <SnowAnimation />;
    case 'sparkle': return <SparkleAnimation />;
    case 'bubbles': return <BubbleAnimation />;
    case 'fire': return <FireAnimation />;
    case 'football': return <FootballAnimation />;
    case 'samba': return <SambaAnimation />;
    default: return null;
  }
}
