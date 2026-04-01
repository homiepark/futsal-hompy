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
    default: return null;
  }
}
