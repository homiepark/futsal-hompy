import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TickerItem {
  id: string;
  message: string;
  type: 'match' | 'new_team' | 'result';
}

// Mock ticker data - would be replaced with real-time data
const mockTickerData: TickerItem[] = [
  { id: '1', message: '🔥 FC번개 vs 선데이풋살 매치 성사!', type: 'match' },
  { id: '2', message: '⚽ 강남구에 새로운 팀 "올드보이즈" 등장', type: 'new_team' },
  { id: '3', message: '🏆 레이디스FC 3연승 달성!', type: 'result' },
  { id: '4', message: '📍 마포구 위클리킥 매치 상대 모집중', type: 'match' },
  { id: '5', message: '⭐ 송파구 매너왕 팀 선정: 올드보이즈', type: 'result' },
];

export function MatchTicker() {
  const [tickerItems] = useState<TickerItem[]>(mockTickerData);

  return (
    <div 
      className="overflow-hidden bg-primary border-3 border-primary-dark mb-4"
      style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
    >
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 px-3 py-2 bg-accent text-accent-foreground border-r-3 border-accent-dark">
          <span className="font-pixel text-[8px] uppercase">LIVE</span>
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
