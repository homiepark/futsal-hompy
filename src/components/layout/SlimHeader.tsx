import { Link } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { PixelProfileIcon } from '@/components/ui/PixelProfileIcon';
import headerBg from '@/assets/header-bg.jpg';

export function SlimHeader() {
  return (
    <header 
      className="sticky top-0 z-40 h-20 border-b-4 border-border-dark shadow-[0_4px_0_hsl(var(--pixel-shadow))]"
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: '50% 65%',
      }}
    >
      {/* Dark overlay for better icon visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40" />
      
      <div className="relative h-full max-w-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo & Title - now hidden since it's in the background image */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-card/90 backdrop-blur-sm border-2 border-border-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))]">
            <span className="text-xl">⚽</span>
          </div>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <button className="relative w-10 h-10 bg-card/90 backdrop-blur-sm border-2 border-border-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors">
            <Bell size={18} className="text-foreground" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent border-2 border-accent-dark text-[8px] font-pixel text-accent-foreground flex items-center justify-center shadow-[1px_1px_0_hsl(var(--pixel-shadow))]">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="w-10 h-10 bg-card/90 backdrop-blur-sm border-2 border-border-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors">
            <Settings size={18} className="text-foreground" />
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
