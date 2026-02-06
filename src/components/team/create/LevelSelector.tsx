import { cn } from '@/lib/utils';
import { levelOptions } from '@/lib/teamData';

interface LevelSelectorProps {
  value: string;
  onChange: (level: string) => void;
}

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  const getLevelColorClass = (level: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-muted border-border-dark hover:bg-muted/70';
    const colors: Record<string, string> = {
      S: 'bg-accent/20 border-accent',
      A: 'bg-primary/20 border-primary',
      B: 'bg-primary/15 border-primary/70',
      C: 'bg-primary/10 border-primary/50',
    };
    return colors[level] || 'bg-primary/20 border-primary';
  };

  const getBadgeColorClass = (level: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-secondary text-secondary-foreground border-border-dark';
    const colors: Record<string, string> = {
      S: 'bg-accent text-accent-foreground border-accent-dark',
      A: 'bg-primary text-primary-foreground border-primary-dark',
      B: 'bg-primary/80 text-primary-foreground border-primary-dark/80',
      C: 'bg-primary/60 text-primary-foreground border-primary-dark/60',
    };
    return colors[level] || 'bg-primary text-primary-foreground border-primary';
  };

  return (
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">🏅</span>
        <span>팀 레벨</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-1 gap-2">
          {levelOptions.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  'p-3 text-left border-3 transition-all',
                  getLevelColorClass(option.value, isSelected)
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{option.icon}</span>
                  <span className={cn(
                    'font-pixel text-sm px-2 py-0.5 border-2',
                    getBadgeColorClass(option.value, isSelected)
                  )}>
                    {option.label}
                  </span>
                  <span className="font-pixel text-[10px] text-foreground">{option.desc}</span>
                </div>
                <p className="font-pixel text-[8px] text-muted-foreground mt-1 ml-7">
                  {option.detail}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
