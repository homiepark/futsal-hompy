import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MatchCelebrationProps {
  isVisible: boolean;
  opponentTeamName: string;
  onComplete: () => void;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  delay: number;
  endX: number;
  endY: number;
}

const FIREWORK_COLORS = [
  'hsl(var(--accent))',      // Gold
  'hsl(var(--primary))',     // Green
  'hsl(45, 100%, 60%)',      // Bright Gold
  'hsl(120, 70%, 50%)',      // Bright Green
  'hsl(0, 80%, 60%)',        // Red
  'hsl(280, 70%, 60%)',      // Purple
];

export function MatchCelebration({
  isVisible,
  opponentTeamName,
  onComplete,
}: MatchCelebrationProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [phase, setPhase] = useState<'fireworks' | 'message' | 'fadeout'>('fireworks');

  // Generate fireworks
  const generateFireworks = useCallback(() => {
    const newFireworks: Firework[] = [];
    const newParticles: Particle[] = [];

    // Create multiple fireworks at different positions
    for (let i = 0; i < 8; i++) {
      const x = 15 + Math.random() * 70; // 15% to 85% of screen width
      const y = 20 + Math.random() * 40; // 20% to 60% of screen height
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

      newFireworks.push({
        id: i,
        x,
        y,
        color,
        size: 8 + Math.random() * 8,
        delay: i * 200,
      });

      // Create particles for each firework
      for (let j = 0; j < 12; j++) {
        const angle = (j / 12) * 2 * Math.PI;
        const distance = 30 + Math.random() * 50;
        newParticles.push({
          id: i * 12 + j,
          x,
          y,
          color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
          size: 4 + Math.random() * 4,
          angle: (j / 12) * 360,
          distance,
          delay: i * 200 + 100,
          // Pre-calculate end positions
          endX: Math.cos(angle) * distance,
          endY: Math.sin(angle) * distance,
        });
      }
    }

    setFireworks(newFireworks);
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (isVisible) {
      generateFireworks();
      setPhase('fireworks');
      setShowMessage(false);

      // Show message after initial fireworks
      const messageTimeout = setTimeout(() => {
        setShowMessage(true);
        setPhase('message');
      }, 800);

      // Start fadeout
      const fadeoutTimeout = setTimeout(() => {
        setPhase('fadeout');
      }, 2500);

      // Complete animation
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => {
        clearTimeout(messageTimeout);
        clearTimeout(fadeoutTimeout);
        clearTimeout(completeTimeout);
      };
    }
  }, [isVisible, generateFireworks, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-black/80 transition-opacity duration-500",
        phase === 'fadeout' && "opacity-0"
      )}
    >
      {/* Pixel Art Fireworks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main firework explosions */}
        {fireworks.map((fw) => (
          <div
            key={fw.id}
            className="absolute animate-ping"
            style={{
              left: `${fw.x}%`,
              top: `${fw.y}%`,
              width: `${fw.size}px`,
              height: `${fw.size}px`,
              backgroundColor: fw.color,
              animationDelay: `${fw.delay}ms`,
              animationDuration: '0.6s',
              imageRendering: 'pixelated',
            }}
          />
        ))}

        {/* Particle explosions */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size}px ${p.color}`,
              animation: `firework-particle-${p.id} 1s ease-out forwards`,
              animationDelay: `${p.delay}ms`,
              imageRendering: 'pixelated',
            } as React.CSSProperties}
          />
        ))}

        {/* Sparkle effects */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute text-lg animate-pulse"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 60}%`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '0.5s',
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Celebratory Message Box */}
      {showMessage && (
        <div
          className={cn(
            "relative z-10 w-[90%] max-w-md p-6",
            "bg-card border-4 border-accent",
            "animate-in zoom-in-95 duration-300"
          )}
          style={{
            boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))',
            animation: 'message-bounce 0.5s ease-out',
          }}
        >
          {/* Decorative corners */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-accent" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-accent" />

          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center gap-2 mb-2">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '100ms' }}>⚽</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>🎉</span>
            </div>
            <h2 
              className="font-pixel text-sm text-accent font-bold tracking-wider"
              style={{ textShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              🏆 MATCH CONFIRMED! 🏆
            </h2>
          </div>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-4" />

          {/* Message */}
          <div 
            className="text-center space-y-3 p-4 bg-secondary/50 border-3 border-border-dark"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <p className="font-pixel text-[11px] text-foreground leading-relaxed">
              축하합니다!
            </p>
            <p className="font-pixel text-[11px] text-foreground leading-relaxed">
              새로운 매치가 성사되었습니다.
            </p>
            <p className="font-pixel text-[10px] text-primary font-bold mt-2">
              VS {opponentTeamName}
            </p>
            <p className="font-pixel text-[10px] text-muted-foreground mt-3">
              그라운드에서 뵙겠습니다! ⚽
            </p>
          </div>

          {/* Footer hint */}
          <p className="text-center font-pixel text-[8px] text-muted-foreground mt-4 animate-pulse">
            채팅방으로 이동합니다...
          </p>
        </div>
      )}

      {/* Dynamic CSS for particle animations */}
      <style>{`
        ${particles.map((p) => `
          @keyframes firework-particle-${p.id} {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(${p.endX}px, ${p.endY}px) scale(0);
              opacity: 0;
            }
          }
        `).join('')}

        @keyframes message-bounce {
          0% {
            transform: scale(0.3) translateY(50px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(-10px);
          }
          70% {
            transform: scale(0.95) translateY(5px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
