import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TickerItem {
  id: string;
  message: string;
  type: 'match' | 'new_team' | 'result';
}

const defaultTicker: TickerItem[] = [
  { id: 'default', message: '새로운 매치 공고를 기다리는 중...', type: 'match' },
];

export function MatchTicker() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(defaultTicker);

  useEffect(() => {
    async function fetchTickerData() {
      try {
        const { data, error } = await supabase
          .from('match_posts')
          .select('id, team_id, location_name, match_date, status')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        if (!data || data.length === 0) return;

        // Fetch team names for the posts
        const teamIds = [...new Set(data.map(p => p.team_id))];
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', teamIds);

        const teamsMap = new Map(teamsData?.map(t => [t.id, t.name]) || []);

        const items: TickerItem[] = data.map(post => {
          const teamName = teamsMap.get(post.team_id) || '알 수 없는 팀';
          if (post.status === 'matched') {
            return {
              id: post.id,
              message: `🔥 ${teamName} 매치 성사!`,
              type: 'result' as const,
            };
          }
          return {
            id: post.id,
            message: `⚽ ${teamName}이(가) 매치 상대를 찾습니다!`,
            type: 'match' as const,
          };
        });

        if (items.length > 0) {
          setTickerItems(items);
        }
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      }
    }

    fetchTickerData();
  }, []);

  return (
    <div
      className="overflow-hidden bg-primary border-3 border-primary-dark mb-4"
      style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
    >
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 px-3 py-2 bg-accent text-accent-foreground border-r-3 border-accent-dark">
          <span className="font-pixel text-[11px] uppercase">LIVE</span>
        </div>

        {/* Scrolling Ticker */}
        <div className="flex-1 overflow-hidden">
          <div className="animate-ticker whitespace-nowrap py-2 px-4">
            {tickerItems.map((item, index) => (
              <span
                key={item.id}
                className={cn(
                  "inline-block mx-6 font-pixel text-[9px] text-primary-foreground",
                )}
              >
                {item.message}
                {index < tickerItems.length - 1 && (
                  <span className="mx-6 text-primary-foreground/50">•</span>
                )}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {tickerItems.map((item, index) => (
              <span
                key={`dup-${item.id}`}
                className="inline-block mx-6 font-pixel text-[9px] text-primary-foreground"
              >
                {item.message}
                {index < tickerItems.length - 1 && (
                  <span className="mx-6 text-primary-foreground/50">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
