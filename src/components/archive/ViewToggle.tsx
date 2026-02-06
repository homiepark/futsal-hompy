import { Grid3X3, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'single';
  onViewChange: (view: 'grid' | 'single') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex border-2 border-border-dark shadow-pixel-sm overflow-hidden">
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 font-pixel text-[8px] uppercase transition-colors',
          view === 'grid' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-muted'
        )}
      >
        <Grid3X3 size={14} strokeWidth={2.5} />
        <span>그리드</span>
      </button>
      <button
        onClick={() => onViewChange('single')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 font-pixel text-[8px] uppercase transition-colors border-l-2 border-border-dark',
          view === 'single' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-muted'
        )}
      >
        <LayoutList size={14} strokeWidth={2.5} />
        <span>싱글</span>
      </button>
    </div>
  );
}
