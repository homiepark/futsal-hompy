import { Home, Image, Users, Calendar, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: '홈', path: '/' },
  { icon: Image, label: '아카이브', path: '/archive' },
  { icon: Users, label: '매칭', path: '/matchmaking' },
  { icon: Calendar, label: '일정', path: '/schedule' },
  { icon: MapPin, label: '코트', path: '/courts' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-4 border-border-dark shadow-[0_-4px_0_hsl(var(--pixel-shadow))]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-1 border-2 transition-all',
                isActive 
                  ? 'bg-primary border-primary-dark text-primary-foreground shadow-pixel-sm' 
                  : 'border-transparent'
              )}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <span className="font-pixel text-[6px] uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
