import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow } from 'date-fns';

interface LiveMatch {
  id: string;
  teamA: { name: string; emblem: string; level: string };
  teamB: { name: string; emblem: string; level: string };
  location: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'recruiting';
}

export function LiveMatchBanner() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: matchData, error: matchError } = await supabase
          .from('match_posts')
          .select('id, team_id, match_date, match_time_start, location_name, status')
          .eq('status', 'open')
          .gte('match_date', today)
          .order('match_date', { ascending: true })
          .limit(3);

        if (matchError || !matchData || matchData.length === 0) {
          setMatches([]);
          return;
        }

        const teamIds = [...new Set(matchData.map((m) => m.team_id))];
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name, emblem, level')
          .in('id', teamIds);

        const teamsMap: Record<string, { name: string; emblem: string; level: string }> = {};
        if (teamsData) {
          for (const t of teamsData) {
            teamsMap[t.id] = {
              name: t.name,
              emblem: t.emblem || '⚽',
              level: t.level?.toString() || '1',
            };
          }
        }

        const liveMatches: LiveMatch[] = matchData.map((m) => {
          const team = teamsMap[m.team_id] || { name: '알 수 없음', emblem: '⚽', level: '1' };
          const matchDate = new Date(m.match_date + 'T00:00:00');
          let dateLabel = format(matchDate, 'M/d');
          if (isToday(matchDate)) dateLabel = '오늘';
          else if (isTomorrow(matchDate)) dateLabel = '내일';

          return {
            id: m.id,
            teamA: team,
            teamB: { name: '???', emblem: '❓', level: '' },
            location: m.location_name || '미정',
            date: dateLabel,
            time: m.match_time_start ? m.match_time_start.slice(0, 5) : '',
            status: 'recruiting' as const,
          };
        });

        setMatches(liveMatches);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  useEffect(() => {
    if (matches.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % matches.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [matches.length]);

  if (loading) {
    return null;
  }

  if (matches.length === 0) {
    return null;
  }

  const match = matches[currentIndex];

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
          {matches.map((_, i) => (
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
