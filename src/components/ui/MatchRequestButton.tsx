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
        'font-pixel text-[10px] uppercase tracking-wider',
        'px-4 py-3',
        'transition-all duration-100',
        'hover:brightness-110',
        'active:translate-x-0.5 active:translate-y-0.5',
        'flex items-center justify-center gap-2',
        className
      )}
      style={{
        boxShadow: `
          4px 4px 0 hsl(var(--accent-dark)),
          inset -2px -2px 0 hsl(var(--accent-dark) / 0.4),
          inset 2px 2px 0 hsl(0 0% 100% / 0.25)
        `,
      }}
    >
      <Swords size={18} strokeWidth={2.5} className="animate-pixel-pulse" />
      <span>⚔️ 매치 신청</span>
      <Swords size={18} strokeWidth={2.5} className="animate-pixel-pulse" style={{ animationDelay: '0.5s' }} />
    </button>
  );
}
