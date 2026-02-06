import { cn } from '@/lib/utils';
import { levelOptions } from '@/lib/teamData';

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
