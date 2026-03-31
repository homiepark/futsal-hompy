import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Swords, Mail, CalendarDays, MapPin } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { usePendingJoinRequests } from '@/hooks/usePendingJoinRequests';

const navItems = [
  { icon: Home, label: '홈', path: '/' },
  { icon: Users, label: 'MY팀', path: '/my-team' },
  { icon: Swords, label: '매칭', path: '/matchmaking' },
  { icon: Mail, label: '쪽지', path: '/messages' },
  { icon: CalendarDays, label: '일정', path: '/schedule' },
  { icon: MapPin, label: '코트', path: '/courts' },
];

export function BottomNav() {
  const location = useLocation();
  const { activeTeam } = useTeam();
  const { pendingCount } = usePendingJoinRequests();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-3 border-border-dark"
      style={{ boxShadow: '0 -2px 0 hsl(var(--pixel-shadow) / 0.3)' }}
    >
      {/* Active Team Indicator */}
      {activeTeam && (
        <div className="bg-primary/10 border-b-2 border-primary/30 px-3 py-1 flex items-center justify-center gap-2">
          <span className="text-sm">{activeTeam.emblem || '⚽'}</span>
          <span className="font-pixel text-[8px] text-primary">{activeTeam.name}</span>
          <span className="font-body text-[10px] text-muted-foreground">활성 팀</span>
        </div>
      )}
      
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const targetPath = activeTeam && (path === '/archive' || path === '/schedule' || path === '/matchmaking')
            ? `${path}?team=${activeTeam.id}`
            : path;

          const showBadge = path === '/my-team' && pendingCount > 0;
            
          return (
            <Link
              key={path}
              to={targetPath}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-all relative min-w-[48px]',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              )}
            >
              <div className={cn(
                'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all',
                isActive 
                  ? 'bg-primary/15 border-2 border-primary/30' 
                  : 'bg-transparent'
              )}>
                <Icon 
                  size={isActive ? 22 : 20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all"
                />
                
                {/* Notification Badge */}
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center bg-accent border-2 border-card text-accent-foreground text-[9px] font-bold rounded-full px-1">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] leading-none transition-all',
                isActive ? 'font-bold text-primary' : 'font-medium'
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
