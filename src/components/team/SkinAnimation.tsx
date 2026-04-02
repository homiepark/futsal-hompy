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

// 픽셀 아트 브라질 선수 SVG (노랑 유니폼, 초록 반바지, 10번)
function SambaPlayer({ pose, scale = 1 }: { pose: 'run' | 'kick' | 'dribble' | 'celebrate'; scale?: number }) {
  const s = 2 * scale; // pixel unit size
  // 공통: 갈색 피부, 검은 머리, 노랑 저지, 초록 반바지, 검은 축구화
  const skin = '#8D6E4C';
  const hair = '#1A1A1A';
  const jersey = '#FDD835';
  const jerseyBorder = '#F9A825';
  const shorts = '#2E7D32';
  const shoes = '#1A1A1A';
  const number = '#1565C0';

  if (pose === 'run') {
    return (
      <svg width={14*s} height={22*s} viewBox={`0 0 ${14*s} ${22*s}`} style={{ imageRendering: 'pixelated' }}>
        {/* Hair */}
        <rect x={4*s} y={0} width={6*s} height={3*s} fill={hair} />
        <rect x={3*s} y={1*s} width={1*s} height={2*s} fill={hair} />
        {/* Face */}
        <rect x={4*s} y={3*s} width={6*s} height={4*s} fill={skin} />
        <rect x={5*s} y={4*s} width={s} height={s} fill={hair} /> {/* eye L */}
        <rect x={8*s} y={4*s} width={s} height={s} fill={hair} /> {/* eye R */}
        {/* Jersey */}
        <rect x={3*s} y={7*s} width={8*s} height={6*s} fill={jersey} />
        <rect x={3*s} y={7*s} width={8*s} height={s} fill={jerseyBorder} /> {/* collar */}
        <rect x={1*s} y={8*s} width={2*s} height={4*s} fill={jersey} /> {/* arm L */}
        <rect x={11*s} y={8*s} width={2*s} height={4*s} fill={jersey} /> {/* arm R */}
        <rect x={6*s} y={9*s} width={2*s} height={2*s} fill={number} /> {/* 10 */}
        {/* Arms skin */}
        <rect x={1*s} y={12*s} width={2*s} height={s} fill={skin} />
        <rect x={11*s} y={12*s} width={2*s} height={s} fill={skin} />
        {/* Shorts */}
        <rect x={3*s} y={13*s} width={8*s} height={3*s} fill={shorts} />
        {/* Legs - running pose */}
        <rect x={4*s} y={16*s} width={2*s} height={3*s} fill={skin} /> {/* L leg forward */}
        <rect x={8*s} y={16*s} width={2*s} height={2*s} fill={skin} /> {/* R leg back */}
        {/* Shoes */}
        <rect x={3*s} y={19*s} width={3*s} height={2*s} fill={shoes} />
        <rect x={9*s} y={18*s} width={2*s} height={2*s} fill={shoes} />
      </svg>
    );
  }

  if (pose === 'kick') {
    return (
      <svg width={16*s} height={22*s} viewBox={`0 0 ${16*s} ${22*s}`} style={{ imageRendering: 'pixelated' }}>
        {/* Hair */}
        <rect x={4*s} y={0} width={6*s} height={3*s} fill={hair} />
        {/* Face */}
        <rect x={4*s} y={3*s} width={6*s} height={4*s} fill={skin} />
        <rect x={5*s} y={4*s} width={s} height={s} fill={hair} />
        <rect x={8*s} y={4*s} width={s} height={s} fill={hair} />
        {/* Jersey - leaning back */}
        <rect x={3*s} y={7*s} width={8*s} height={6*s} fill={jersey} />
        <rect x={3*s} y={7*s} width={8*s} height={s} fill={jerseyBorder} />
        <rect x={0} y={8*s} width={3*s} height={3*s} fill={jersey} /> {/* arm back */}
        <rect x={11*s} y={7*s} width={2*s} height={4*s} fill={jersey} /> {/* arm up */}
        <rect x={6*s} y={9*s} width={2*s} height={2*s} fill={number} />
        <rect x={0} y={11*s} width={2*s} height={s} fill={skin} />
        <rect x={11*s} y={11*s} width={2*s} height={s} fill={skin} />
        {/* Shorts */}
        <rect x={3*s} y={13*s} width={8*s} height={3*s} fill={shorts} />
        {/* Legs - kicking */}
        <rect x={4*s} y={16*s} width={2*s} height={4*s} fill={skin} /> {/* standing leg */}
        <rect x={10*s} y={14*s} width={2*s} height={2*s} fill={skin} /> {/* kick leg */}
        <rect x={12*s} y={13*s} width={3*s} height={2*s} fill={shoes} /> {/* kick foot */}
        <rect x={3*s} y={20*s} width={3*s} height={2*s} fill={shoes} />
      </svg>
    );
  }

  if (pose === 'celebrate') {
    return (
      <svg width={14*s} height={22*s} viewBox={`0 0 ${14*s} ${22*s}`} style={{ imageRendering: 'pixelated' }}>
        {/* Hair */}
        <rect x={4*s} y={0} width={6*s} height={3*s} fill={hair} />
        {/* Face */}
        <rect x={4*s} y={3*s} width={6*s} height={4*s} fill={skin} />
        <rect x={5*s} y={4*s} width={s} height={s} fill={hair} />
        <rect x={8*s} y={4*s} width={s} height={s} fill={hair} />
        <rect x={6*s} y={5.5*s} width={2*s} height={s} fill="#E53935" /> {/* smile */}
        {/* Jersey */}
        <rect x={3*s} y={7*s} width={8*s} height={6*s} fill={jersey} />
        <rect x={3*s} y={7*s} width={8*s} height={s} fill={jerseyBorder} />
        <rect x={6*s} y={9*s} width={2*s} height={2*s} fill={number} />
        {/* Arms UP - celebrating */}
        <rect x={1*s} y={3*s} width={2*s} height={5*s} fill={jersey} /> {/* L arm up */}
        <rect x={11*s} y={3*s} width={2*s} height={5*s} fill={jersey} /> {/* R arm up */}
        <rect x={0} y={2*s} width={2*s} height={2*s} fill={skin} /> {/* L hand */}
        <rect x={12*s} y={2*s} width={2*s} height={2*s} fill={skin} /> {/* R hand */}
        {/* Shorts */}
        <rect x={3*s} y={13*s} width={8*s} height={3*s} fill={shorts} />
        {/* Legs - standing */}
        <rect x={4*s} y={16*s} width={2*s} height={4*s} fill={skin} />
        <rect x={8*s} y={16*s} width={2*s} height={4*s} fill={skin} />
        <rect x={3*s} y={20*s} width={3*s} height={2*s} fill={shoes} />
        <rect x={8*s} y={20*s} width={3*s} height={2*s} fill={shoes} />
      </svg>
    );
  }

  // dribble (default)
  return (
    <svg width={14*s} height={22*s} viewBox={`0 0 ${14*s} ${22*s}`} style={{ imageRendering: 'pixelated' }}>
      {/* Hair */}
      <rect x={4*s} y={0} width={6*s} height={3*s} fill={hair} />
      <rect x={10*s} y={1*s} width={s} height={s} fill={hair} />
      {/* Face */}
      <rect x={4*s} y={3*s} width={6*s} height={4*s} fill={skin} />
      <rect x={5*s} y={4*s} width={s} height={s} fill={hair} />
      <rect x={8*s} y={4*s} width={s} height={s} fill={hair} />
      {/* Jersey */}
      <rect x={3*s} y={7*s} width={8*s} height={6*s} fill={jersey} />
      <rect x={3*s} y={7*s} width={8*s} height={s} fill={jerseyBorder} />
      <rect x={1*s} y={9*s} width={2*s} height={3*s} fill={jersey} />
      <rect x={11*s} y={8*s} width={2*s} height={4*s} fill={jersey} />
      <rect x={6*s} y={9*s} width={2*s} height={2*s} fill={number} />
      <rect x={1*s} y={12*s} width={2*s} height={s} fill={skin} />
      <rect x={11*s} y={12*s} width={2*s} height={s} fill={skin} />
      {/* Shorts */}
      <rect x={3*s} y={13*s} width={8*s} height={3*s} fill={shorts} />
      {/* Legs */}
      <rect x={4*s} y={16*s} width={2*s} height={3*s} fill={skin} />
      <rect x={8*s} y={16*s} width={2*s} height={3*s} fill={skin} />
      <rect x={3*s} y={19*s} width={3*s} height={2*s} fill={shoes} />
      <rect x={8*s} y={19*s} width={3*s} height={2*s} fill={shoes} />
    </svg>
  );
}

// 축구공 SVG
function SambaBall({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: 'pixelated' }}>
      <circle cx="6" cy="6" r="5" fill="white" stroke="#333" strokeWidth="0.8" />
      <path d="M6 1.5 L7.5 4 L6 5 L4.5 4 Z" fill="#333" />
      <path d="M9.5 5 L8 6.5 L9 8.5" fill="none" stroke="#333" strokeWidth="0.6" />
      <path d="M2.5 5 L4 6.5 L3 8.5" fill="none" stroke="#333" strokeWidth="0.6" />
    </svg>
  );
}

// 코치 캐릭터 (캡모자, 남색+초록+노랑 패턴 유니폼, 검은 반바지, 흰 축구화)
function SambaCoach({ scale = 1, pose = 'stand' }: { scale?: number; pose?: 'stand' | 'lifting' }) {
  const s = 2 * scale;
  const cap = '#1A1A1A';
  const capBrim = '#333';
  const skin = '#C8A882';
  const jerseyDark = '#1A237E';
  const jerseyGreen = '#2E7D32';
  const jerseyYellow = '#FDD835';
  const shortColor = '#1A1A1A';
  const shoeColor = '#EEEEEE';

  if (pose === 'lifting') {
    // 리프팅 포즈: 한 발로 공을 올리는 모습
    return (
      <svg width={16*s} height={26*s} viewBox={`0 0 ${16*s} ${26*s}`} style={{ imageRendering: 'pixelated' }}>
        {/* Cap */}
        <rect x={4*s} y={0} width={7*s} height={2*s} fill={cap} />
        <rect x={3*s} y={2*s} width={9*s} height={s} fill={capBrim} />
        {/* Face */}
        <rect x={5*s} y={3*s} width={6*s} height={4*s} fill={skin} />
        <rect x={6*s} y={4*s} width={s} height={s} fill="#333" />
        <rect x={9*s} y={4*s} width={s} height={s} fill="#333" />
        <rect x={7*s} y={6*s} width={2*s} height={0.5*s} fill="#888" /> {/* smile */}
        {/* Jersey - pattern stripes */}
        <rect x={3*s} y={7*s} width={10*s} height={7*s} fill={jerseyDark} />
        <rect x={3*s} y={8*s} width={10*s} height={s} fill={jerseyGreen} />
        <rect x={3*s} y={10*s} width={10*s} height={s} fill={jerseyYellow} />
        <rect x={3*s} y={12*s} width={10*s} height={s} fill={jerseyGreen} />
        {/* "Futsal" text area */}
        <rect x={5*s} y={9*s} width={6*s} height={s} fill={jerseyYellow} opacity={0.8} />
        {/* Arms */}
        <rect x={1*s} y={8*s} width={2*s} height={4*s} fill={jerseyDark} />
        <rect x={13*s} y={8*s} width={2*s} height={4*s} fill={jerseyDark} />
        <rect x={1*s} y={12*s} width={2*s} height={s} fill={skin} />
        <rect x={13*s} y={12*s} width={2*s} height={s} fill={skin} />
        {/* Shorts */}
        <rect x={4*s} y={14*s} width={8*s} height={3*s} fill={shortColor} />
        {/* Standing leg */}
        <rect x={5*s} y={17*s} width={2*s} height={5*s} fill={skin} />
        <rect x={4*s} y={22*s} width={3*s} height={2*s} fill={shoeColor} />
        {/* Lifting leg - raised with ball */}
        <rect x={9*s} y={15*s} width={2*s} height={3*s} fill={skin} />
        <rect x={10*s} y={13*s} width={3*s} height={2*s} fill={shoeColor} /> {/* foot up */}
        {/* Ball on foot */}
        <circle cx={12.5*s} cy={12*s} r={1.5*s} fill="white" stroke="#333" strokeWidth={0.3*s} />
        <path d={`M${12*s} ${11*s} L${13*s} ${12*s} L${12*s} ${13*s}`} fill="#333" opacity={0.5} />
      </svg>
    );
  }

  // stand pose
  return (
    <svg width={14*s} height={24*s} viewBox={`0 0 ${14*s} ${24*s}`} style={{ imageRendering: 'pixelated' }}>
      {/* Cap */}
      <rect x={3*s} y={0} width={7*s} height={2*s} fill={cap} />
      <rect x={2*s} y={2*s} width={9*s} height={s} fill={capBrim} />
      {/* Face */}
      <rect x={4*s} y={3*s} width={6*s} height={4*s} fill={skin} />
      <rect x={5*s} y={4*s} width={s} height={s} fill="#333" />
      <rect x={8*s} y={4*s} width={s} height={s} fill="#333" />
      {/* Jersey */}
      <rect x={3*s} y={7*s} width={8*s} height={7*s} fill={jerseyDark} />
      <rect x={3*s} y={8*s} width={8*s} height={s} fill={jerseyGreen} />
      <rect x={3*s} y={10*s} width={8*s} height={s} fill={jerseyYellow} />
      <rect x={3*s} y={12*s} width={8*s} height={s} fill={jerseyGreen} />
      <rect x={5*s} y={9*s} width={4*s} height={s} fill={jerseyYellow} opacity={0.8} />
      {/* Arms */}
      <rect x={1*s} y={8*s} width={2*s} height={4*s} fill={jerseyDark} />
      <rect x={11*s} y={8*s} width={2*s} height={4*s} fill={jerseyDark} />
      <rect x={1*s} y={12*s} width={2*s} height={s} fill={skin} />
      <rect x={11*s} y={12*s} width={2*s} height={s} fill={skin} />
      {/* Wristband */}
      <rect x={0} y={11*s} width={s} height={s} fill="#333" />
      {/* Shorts */}
      <rect x={3*s} y={14*s} width={8*s} height={3*s} fill={shortColor} />
      {/* Legs */}
      <rect x={4*s} y={17*s} width={2*s} height={4*s} fill={skin} />
      <rect x={8*s} y={17*s} width={2*s} height={4*s} fill={skin} />
      <rect x={3*s} y={21*s} width={3*s} height={2*s} fill={shoeColor} />
      <rect x={8*s} y={21*s} width={3*s} height={2*s} fill={shoeColor} />
    </svg>
  );
}

// 리프팅 선수 (노랑 유니폼) - export해서 TeamHome 공지 위에 사용
export function SambaLiftingPlayer({ scale = 1.5 }: { scale?: number }) {
  const s = 2 * scale;
  const skin = '#8D6E4C';
  const hair = '#1A1A1A';
  const jersey = '#FDD835';
  const jerseyBorder = '#F9A825';
  const shorts = '#2E7D32';
  const shoes = '#1A1A1A';
  const number = '#1565C0';

  return (
    <div className="animate-samba-lifting inline-flex flex-col items-center">
      {/* Ball above head - bouncing */}
      <div className="animate-samba-ball-bounce mb-1">
        <SambaBall size={Math.round(10 * scale)} />
      </div>
      <svg width={16*s} height={22*s} viewBox={`0 0 ${16*s} ${22*s}`} style={{ imageRendering: 'pixelated' }}>
        {/* Hair */}
        <rect x={5*s} y={0} width={6*s} height={3*s} fill={hair} />
        <rect x={4*s} y={1*s} width={s} height={2*s} fill={hair} />
        {/* Face */}
        <rect x={5*s} y={3*s} width={6*s} height={4*s} fill={skin} />
        <rect x={6*s} y={4*s} width={s} height={s} fill={hair} />
        <rect x={9*s} y={4*s} width={s} height={s} fill={hair} />
        {/* Jersey */}
        <rect x={4*s} y={7*s} width={8*s} height={6*s} fill={jersey} />
        <rect x={4*s} y={7*s} width={8*s} height={s} fill={jerseyBorder} />
        <rect x={7*s} y={9*s} width={2*s} height={2*s} fill={number} />
        {/* Arms - one raised for balance */}
        <rect x={2*s} y={6*s} width={2*s} height={4*s} fill={jersey} />
        <rect x={12*s} y={8*s} width={2*s} height={4*s} fill={jersey} />
        <rect x={1*s} y={5*s} width={2*s} height={2*s} fill={skin} />
        <rect x={12*s} y={12*s} width={2*s} height={s} fill={skin} />
        {/* Shorts */}
        <rect x={4*s} y={13*s} width={8*s} height={3*s} fill={shorts} />
        {/* Standing leg */}
        <rect x={5*s} y={16*s} width={2*s} height={4*s} fill={skin} />
        <rect x={4*s} y={20*s} width={3*s} height={2*s} fill={shoes} />
        {/* Lifting leg - raised */}
        <rect x={9*s} y={14*s} width={2*s} height={3*s} fill={skin} />
        <rect x={10*s} y={12*s} width={3*s} height={2*s} fill={shoes} />
      </svg>
    </div>
  );
}

// Samba Special Animation
function SambaAnimation() {
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
      {/* Confetti */}
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
            opacity: 0.6,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Player 1 - 드리블하며 왼→오 */}
      <div
        className="absolute animate-samba-run"
        style={{
          top: '68%',
          opacity: 0.75,
          ['--start-x' as any]: '-10vw',
          ['--end-x' as any]: '110vw',
          animationDuration: '14s',
          animationDelay: '0s',
        }}
      >
        <div className="animate-samba-bob">
          <SambaPlayer pose="run" scale={1.2} />
        </div>
      </div>
      {/* Ball following player 1 */}
      <div
        className="absolute animate-samba-run"
        style={{
          top: '80%',
          opacity: 0.7,
          ['--start-x' as any]: '-6vw',
          ['--end-x' as any]: '114vw',
          animationDuration: '14s',
          animationDelay: '0.2s',
        }}
      >
        <div className="animate-samba-ball-bounce">
          <SambaBall size={14} />
        </div>
      </div>

      {/* Player 2 - 킥 포즈로 오→왼 */}
      <div
        className="absolute animate-samba-run"
        style={{
          top: '45%',
          opacity: 0.65,
          ['--start-x' as any]: '110vw',
          ['--end-x' as any]: '-10vw',
          animationDuration: '18s',
          animationDelay: '5s',
          transform: 'scaleX(-1)',
        }}
      >
        <div className="animate-samba-bob">
          <SambaPlayer pose="kick" scale={1} />
        </div>
      </div>

      {/* Player 3 - 세리머니 */}
      <div
        className="absolute animate-samba-run"
        style={{
          top: '58%',
          opacity: 0.7,
          ['--start-x' as any]: '-15vw',
          ['--end-x' as any]: '115vw',
          animationDuration: '20s',
          animationDelay: '10s',
        }}
      >
        <div className="animate-samba-celebrate">
          <SambaPlayer pose="celebrate" scale={0.9} />
        </div>
      </div>

      {/* Player 4 - 드리블 오→왼 (작게) */}
      <div
        className="absolute animate-samba-run"
        style={{
          top: '30%',
          opacity: 0.55,
          ['--start-x' as any]: '105vw',
          ['--end-x' as any]: '-10vw',
          animationDuration: '22s',
          animationDelay: '3s',
          transform: 'scaleX(-1)',
        }}
      >
        <SambaPlayer pose="dribble" scale={0.7} />
      </div>
      <div
        className="absolute animate-samba-run"
        style={{
          top: '38%',
          opacity: 0.6,
          ['--start-x' as any]: '108vw',
          ['--end-x' as any]: '-8vw',
          animationDuration: '22s',
          animationDelay: '3.3s',
          transform: 'scaleX(-1)',
        }}
      >
        <div className="animate-samba-ball-bounce">
          <SambaBall size={10} />
        </div>
      </div>

      {/* 하단 잔디 라인 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 animate-samba-grass"
        style={{
          background: 'repeating-linear-gradient(90deg, #2E7D32 0px, #2E7D32 8px, #4CAF50 8px, #4CAF50 16px)',
          opacity: 0.4,
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
