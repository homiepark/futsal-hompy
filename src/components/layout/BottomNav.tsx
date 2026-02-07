import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ColorfulPixelNavIcon } from '@/components/ui/ColorfulPixelNavIcon';
import { useTeam } from '@/contexts/TeamContext';
import { usePendingJoinRequests } from '@/hooks/usePendingJoinRequests';

const navItems = [
  { icon: 'home' as const, label: '홈', path: '/' },
  { icon: 'archive' as const, label: 'MY TEAM', path: '/my-team' },
  { icon: 'matching' as const, label: '매칭', path: '/matchmaking' },
  { icon: 'mail' as const, label: '쪽지', path: '/messages' },
  { icon: 'calendar' as const, label: '일정', path: '/schedule' },
  { icon: 'map' as const, label: '코트', path: '/courts' },
];

export function BottomNav() {
  const location = useLocation();
  const { activeTeam } = useTeam();
  const { pendingCount } = usePendingJoinRequests();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-4 border-border-dark shadow-[0_-4px_0_hsl(var(--pixel-shadow))]">
      {/* Active Team Indicator */}
      {activeTeam && (
        <div className="bg-primary/10 border-b-2 border-primary/30 px-3 py-1.5 flex items-center justify-center gap-2">
          <span className="text-sm">{activeTeam.emblem}</span>
          <span className="font-pixel text-[8px] text-primary">{activeTeam.name}</span>
          <span className="font-body text-[10px] text-muted-foreground">활성 팀</span>
        </div>
      )}
      
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto">
        {navItems.map(({ icon, label, path }) => {
          const isActive = location.pathname === path;
          // Add team filter to archive/schedule/matching if active team
          const targetPath = activeTeam && (path === '/archive' || path === '/schedule' || path === '/matchmaking')
            ? `${path}?team=${activeTeam.id}`
            : path;

          // Show badge only on MY TEAM tab
          const showBadge = path === '/my-team' && pendingCount > 0;
            
          return (
            <Link
              key={path}
              to={targetPath}
              className={cn(
                'flex flex-col items-center justify-center gap-2 px-3 py-2 transition-colors relative',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-2 border-4 transition-all relative',
                isActive 
                  ? 'bg-primary border-primary-dark text-primary-foreground shadow-pixel-sm' 
                  : 'border-border-dark bg-secondary hover:bg-muted'
              )}>
                <ColorfulPixelNavIcon type={icon} isActive={isActive} />
                
                {/* Notification Badge */}
                {showBadge && (
                  <span 
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-accent border-2 border-accent-dark text-accent-foreground font-pixel text-[8px] px-1"
                    style={{ boxShadow: '1px 1px 0 hsl(var(--accent-dark))' }}
                  >
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span className="font-pixel text-[8px] uppercase tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}