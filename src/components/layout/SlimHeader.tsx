import { Link } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { PixelProfileIcon } from '@/components/ui/PixelProfileIcon';

export function SlimHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 bg-card border-b-4 border-border-dark shadow-[0_4px_0_hsl(var(--pixel-shadow))]">
      <div className="h-full max-w-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary border-2 border-primary-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))]">
            <span className="text-lg">⚽</span>
          </div>
          <h1 className="font-pixel text-[10px] text-foreground leading-tight">
            우리의<br/>풋살
          </h1>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <button className="relative w-9 h-9 bg-secondary border-2 border-border-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))] hover:bg-muted transition-colors">
            <Bell size={16} className="text-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent border border-accent-dark text-[8px] font-pixel text-accent-foreground flex items-center justify-center">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="w-9 h-9 bg-secondary border-2 border-border-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))] hover:bg-muted transition-colors">
            <Settings size={16} className="text-foreground" />
          </button>

          {/* Profile */}
          <Link to="/profile">
            <PixelProfileIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
