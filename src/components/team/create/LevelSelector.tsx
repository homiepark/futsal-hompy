import { cn } from '@/lib/utils';

const levelOptions = [
  { 
    value: 'S', 
    label: 'S급', 
    desc: '선수/세미프로 수준',
    detail: '엘리트 퍼포먼스 & 전술'
  },
  { 
    value: 'A', 
    label: 'A급', 
    desc: '고급 아마추어 수준',
    detail: '경험 많은 선수들, 경쟁적 플레이'
  },
  { 
    value: 'B', 
    label: 'B급', 
    desc: '중급 아마추어 수준',
    detail: '탄탄한 기본기, 페어플레이 중시'
  },
  { 
    value: 'C', 
    label: 'C급', 
    desc: '입문/초급 수준',
    detail: '배움과 즐거움에 초점'
  },
];

interface LevelSelectorProps {
  value: string;
  onChange: (level: string) => void;
}

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  return (
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">🏅</span>
        <span>팀 레벨</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-1 gap-2">
          {levelOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'p-3 text-left border-3 transition-all',
                value === option.value
                  ? 'bg-primary/20 border-primary'
                  : 'bg-muted border-border-dark hover:bg-muted/70'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-pixel text-sm px-2 py-0.5 border-2',
                  value === option.value 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-accent text-accent-foreground border-border-dark'
                )}>
                  {option.label}
                </span>
                <span className="font-pixel text-[10px] text-foreground">{option.desc}</span>
              </div>
              <p className="font-pixel text-[8px] text-muted-foreground mt-1 ml-1">
                💡 {option.detail}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
