import { cn } from '@/lib/utils';
import { genderOptions, GenderValue } from '@/lib/teamData';
import { Check } from 'lucide-react';

interface GenderSelectorProps {
  value: GenderValue;
  onChange: (gender: GenderValue) => void;
}

export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">👥</span>
        <span>팀 성별</span>
      </div>
      <div className="p-3">
        <div className="flex gap-2">
          {genderOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex-1 py-2.5 px-3 font-body text-sm border-3 transition-all flex items-center justify-center gap-1.5',
                value === option.value
                  ? 'bg-primary text-primary-foreground border-primary-dark'
                  : 'bg-muted border-border-dark hover:bg-muted/70'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              {value === option.value && <Check size={12} />}
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
