import { cn } from '@/lib/utils';
import { levelOptions } from '@/lib/teamData';
import { LevelInfoButton } from '@/components/ui/LevelGuideModal';

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
        <LevelInfoButton className="ml-auto" />
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
                {/* Header with Badge and Tier */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{option.icon}</span>
                  <span className={cn(
                    'font-pixel text-sm px-2 py-0.5 border-2',
                    getBadgeColorClass(option.value, isSelected)
                  )}>
                    {option.label}
                  </span>
                  <span className="font-body text-[10px] text-muted-foreground">({option.tier})</span>
                </div>
                
                {/* Title */}
                <p className="font-pixel text-[10px] text-foreground ml-7 mb-1">
                  "{option.desc}"
                </p>
                
                {/* Characteristic */}
                <p className="font-body text-[9px] text-muted-foreground ml-7">
                  {option.characteristic}
                </p>
                
                {/* Operating Style */}
                <p className="font-body text-[8px] text-muted-foreground/80 ml-7 mt-0.5">
                  → {option.operatingStyle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
