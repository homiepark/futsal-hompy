import { Bell, Settings } from 'lucide-react';
import { PixelIcon } from '@/components/ui/PixelIcon';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-card border-b-4 border-border-dark shadow-pixel">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary border-2 border-primary-dark shadow-pixel-sm flex items-center justify-center">
            <span className="text-primary-foreground font-pixel text-[10px]">⚽</span>
          </div>
          <h1 className="font-pixel text-[10px] text-foreground">
            우리의풋살
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative">
            <PixelIcon icon={Bell} size="sm" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent border border-accent-dark text-[6px] font-pixel text-accent-foreground flex items-center justify-center">
              3
            </span>
          </button>
          <PixelIcon icon={Settings} size="sm" />
        </div>
      </div>
    </header>
  );
}
