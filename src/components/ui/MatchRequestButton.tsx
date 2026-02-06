import { Swords } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MatchRequestButtonProps {
  className?: string;
  onClick?: () => void;
}

export function MatchRequestButton({ className, onClick }: MatchRequestButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast.success('매치 신청 준비 중!', {
        description: '상대팀을 찾고 있습니다 ⚽',
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full relative overflow-hidden',
        'bg-accent text-accent-foreground',
        'border-4 border-accent-dark',
        'font-pixel text-sm uppercase tracking-wider',
        'px-6 py-5',
        'transition-all duration-100',
        'hover:brightness-110',
        'active:translate-x-1 active:translate-y-1',
        'flex items-center justify-center gap-3',
        className
      )}
      style={{
        boxShadow: `
          6px 6px 0 hsl(var(--accent-dark)),
          inset -3px -3px 0 hsl(var(--accent-dark) / 0.4),
          inset 3px 3px 0 hsl(0 0% 100% / 0.25)
        `,
      }}
    >
      {/* Decorative pixel corners */}
      <span className="absolute top-1 left-1 w-2 h-2 bg-accent-foreground/20" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-accent-foreground/20" />
      <span className="absolute bottom-1 left-1 w-2 h-2 bg-accent-foreground/20" />
      <span className="absolute bottom-1 right-1 w-2 h-2 bg-accent-foreground/20" />
      
      <Swords size={24} strokeWidth={2.5} className="animate-pixel-pulse" />
      <span>⚔️ 매치 신청</span>
      <Swords size={24} strokeWidth={2.5} className="animate-pixel-pulse" style={{ animationDelay: '0.5s' }} />
    </button>
  );
}
