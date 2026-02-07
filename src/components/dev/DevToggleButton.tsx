import { useDev } from '@/contexts/DevContext';
import { cn } from '@/lib/utils';

export function DevToggleButton() {
  const { isDevAdmin, toggleDevAdmin } = useDev();

  return (
    <button
      onClick={toggleDevAdmin}
      className={cn(
        'fixed bottom-24 right-3 z-50',
        'px-2 py-1.5',
        'font-pixel text-[8px]',
        'border-2 transition-all duration-100',
        'active:translate-y-0.5',
        'opacity-50 hover:opacity-100',
        isDevAdmin
          ? 'bg-accent text-accent-foreground border-accent-dark shadow-[2px_2px_0_hsl(var(--accent-dark))]'
          : 'bg-secondary text-secondary-foreground border-border-dark shadow-[2px_2px_0_hsl(var(--pixel-shadow))]'
      )}
    >
      {isDevAdmin ? '👑 팀장 모드 ON' : '[팀장 권한 얻기]'}
    </button>
  );
}
