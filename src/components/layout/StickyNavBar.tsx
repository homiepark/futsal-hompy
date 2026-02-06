import { Link } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { PixelProfileIcon } from '@/components/ui/PixelProfileIcon';
import { CategoryTabs } from '@/components/findteam/CategoryTabs';

export function StickyNavBar() {
  return (
    <div className="sticky top-0 z-40">
      {/* Main Nav Bar with Icons */}
      <div className="h-14 bg-card border-b-2 border-border-dark shadow-[0_2px_0_hsl(var(--pixel-shadow))]">
        <div className="h-full max-w-lg mx-auto px-4 flex items-center justify-end">

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
      </div>

      {/* Category Tabs */}
      <CategoryTabs />
    </div>
  );
}
