import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PixelNavIcon } from '@/components/ui/PixelNavIcon';

const navItems = [
  { icon: 'home' as const, label: '홈', path: '/' },
  { icon: 'archive' as const, label: '아카이브', path: '/archive' },
  { icon: 'matching' as const, label: '매칭', path: '/matchmaking' },
  { icon: 'calendar' as const, label: '일정', path: '/schedule' },
  { icon: 'map' as const, label: '코트', path: '/courts' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-4 border-border-dark shadow-[0_-4px_0_hsl(var(--pixel-shadow))]">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto">
        {navItems.map(({ icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center gap-2 px-3 py-2 transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-2 border-4 transition-all',
                isActive 
                  ? 'bg-primary border-primary-dark text-primary-foreground shadow-pixel-sm' 
                  : 'border-border-dark bg-secondary hover:bg-muted'
              )}>
                <PixelNavIcon type={icon} isActive={isActive} />
              </div>
              <span className="font-pixel text-[8px] uppercase tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
