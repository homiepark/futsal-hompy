import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Clock, MapPin } from 'lucide-react';

interface LiveMatch {
  id: string;
  teamA: { name: string; emblem: string; level: string };
  teamB: { name: string; emblem: string; level: string };
  location: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'recruiting';
}

const mockLiveMatches: LiveMatch[] = [
  {
    id: '1',
    teamA: { name: 'FC 불꽃', emblem: '🔥', level: '3' },
    teamB: { name: 'FC 번개', emblem: '⚡', level: '3' },
    location: '강남 풋살파크',
    date: '오늘',
    time: '14:00',
    status: 'upcoming',
  },
  {
    id: '2',
    teamA: { name: '스틸러스', emblem: '⚔️', level: '4' },
    teamB: { name: '???', emblem: '❓', level: '' },
    location: '상암 월드컵 풋살장',
    date: '내일',
    time: '19:00',
    status: 'recruiting',
  },
];

export function LiveMatchBanner() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % mockLiveMatches.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const match = mockLiveMatches[currentIndex];

  const statusConfig = {
    upcoming: { label: '오늘 경기', color: 'bg-primary text-primary-foreground', dotColor: 'bg-primary' },
    live: { label: 'LIVE', color: 'bg-accent text-accent-foreground', dotColor: 'bg-accent animate-pulse' },
    recruiting: { label: '상대 모집중', color: 'bg-accent text-accent-foreground', dotColor: 'bg-accent' },
  };

  const config = statusConfig[match.status];

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => navigate('/matchmaking')}
        className="w-full bg-card border-3 border-border-dark overflow-hidden hover:border-primary transition-colors"
        style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-primary/10 border-b-2 border-border px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Swords size={12} className="text-primary" />
            <span className="font-pixel text-[8px] text-primary">매치 현황</span>
          </div>
          <span className={`px-2 py-0.5 font-pixel text-[7px] ${config.color} border border-current/20`}>
            {config.label}
          </span>
        </div>

        {/* Match Content */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {/* Team A */}
            <div className="flex-1 text-center">
              <span className="text-2xl block">{match.teamA.emblem}</span>
              <span className="font-pixel text-[9px] text-foreground block mt-1">{match.teamA.name}</span>
              {match.teamA.level && (
                <span className="font-pixel text-[7px] text-muted-foreground">LV.{match.teamA.level}</span>
              )}
            </div>

            {/* VS */}
            <div className="px-3">
              <span className="font-pixel text-[14px] text-accent">VS</span>
            </div>

            {/* Team B */}
            <div className="flex-1 text-center">
              <span className="text-2xl block">{match.teamB.emblem}</span>
              <span className="font-pixel text-[9px] text-foreground block mt-1">{match.teamB.name}</span>
              {match.teamB.level && (
                <span className="font-pixel text-[7px] text-muted-foreground">LV.{match.teamB.level}</span>
              )}
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-border">
            <span className="font-pixel text-[7px] text-muted-foreground flex items-center gap-1">
              <Clock size={8} /> {match.date} {match.time}
            </span>
            <span className="font-pixel text-[7px] text-muted-foreground flex items-center gap-1">
              <MapPin size={8} /> {match.location}
            </span>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-2">
          {mockLiveMatches.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 border border-border-dark ${i === currentIndex ? config.dotColor : 'bg-muted'}`}
            />
          ))}
        </div>
      </button>
    </div>
  );
}
