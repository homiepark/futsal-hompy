import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageButtonProps {
  label?: string;
  variant?: 'default' | 'admin';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export function MessageButton({ 
  label = '쪽지', 
  variant = 'default',
  size = 'sm',
  className,
  onClick 
}: MessageButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast.info('쪽지 기능 준비 중...', {
        description: '곧 메시지를 보낼 수 있습니다!',
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 font-pixel uppercase transition-all',
        'border-2 shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        variant === 'default' && 'bg-secondary text-secondary-foreground border-border-dark hover:bg-muted',
        variant === 'admin' && 'bg-primary text-primary-foreground border-primary-dark hover:brightness-110',
        size === 'sm' && 'text-[8px] px-2 py-1.5',
        size === 'md' && 'text-[10px] px-3 py-2',
        className
      )}
    >
      <Mail size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}
