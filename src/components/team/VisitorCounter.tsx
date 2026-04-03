import { useState, useEffect } from 'react';

interface VisitorCounterProps {
  todayCount: number;
  totalCount: number;
}

export function VisitorCounter({ todayCount, totalCount }: VisitorCounterProps) {
  const [displayTotal, setDisplayTotal] = useState(0);

  // Animate counter on mount
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(totalCount / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= totalCount) {
        current = totalCount;
        clearInterval(timer);
      }
      setDisplayTotal(current);
    }, 30);
    return () => clearInterval(timer);
  }, [totalCount]);

  const padNumber = (num: number, length: number) => {
    return String(num).padStart(length, '0');
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-card border-3 border-border-dark"
      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
    >
      {/* Today */}
      <div className="flex items-center gap-1.5">
        <span className="font-pixel text-[11px] text-muted-foreground">TODAY</span>
        <div className="flex gap-[2px]">
          {padNumber(todayCount, 4).split('').map((digit, i) => (
            <span
              key={`today-${i}`}
              className="w-[14px] h-[18px] bg-primary/10 border border-primary/30 flex items-center justify-center font-pixel text-[10px] text-primary"
            >
              {digit}
            </span>
          ))}
        </div>
      </div>

      <span className="text-border-dark">|</span>

      {/* Total */}
      <div className="flex items-center gap-1.5">
        <span className="font-pixel text-[11px] text-muted-foreground">TOTAL</span>
        <div className="flex gap-[2px]">
          {padNumber(displayTotal, 6).split('').map((digit, i) => (
            <span
              key={`total-${i}`}
              className="w-[14px] h-[18px] bg-accent/10 border border-accent/30 flex items-center justify-center font-pixel text-[10px] text-accent"
            >
              {digit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
