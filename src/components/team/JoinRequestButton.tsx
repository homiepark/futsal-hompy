import { useState } from 'react';
import { UserPlus, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface JoinRequestButtonProps {
  teamId: string;
  teamName: string;
  hasRequested?: boolean;
  isMember?: boolean;
  onRequest?: () => Promise<void>;
  className?: string;
}

export function JoinRequestButton({
  teamId,
  teamName,
  hasRequested = false,
  isMember = false,
  onRequest,
  className,
}: JoinRequestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(hasRequested);

  const handleRequest = async () => {
    if (requested || isMember) return;
    
    setLoading(true);
    try {
      if (onRequest) {
        await onRequest();
      }
      setRequested(true);
      toast.success('가입 신청 완료!', {
        description: `${teamName} 팀에 가입 신청을 보냈습니다.`,
      });
    } catch (error) {
      toast.error('가입 신청 실패', {
        description: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isMember) {
    return (
      <button
        disabled
        className={cn(
          'flex items-center justify-center gap-2',
          'bg-muted text-muted-foreground',
          'border-3 border-border-dark',
          'font-pixel text-[9px] uppercase',
          'px-3 py-2',
          'cursor-not-allowed',
          className
        )}
        style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
      >
        <Check size={14} />
        <span>팀원</span>
      </button>
    );
  }

  if (requested) {
    return (
      <button
        disabled
        className={cn(
          'flex items-center justify-center gap-2',
          'bg-secondary text-secondary-foreground',
          'border-3 border-border-dark',
          'font-pixel text-[9px] uppercase',
          'px-3 py-2',
          'cursor-not-allowed',
          className
        )}
        style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
      >
        <Check size={14} />
        <span>신청 완료</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className={cn(
        'flex items-center justify-center gap-2',
        'bg-primary text-primary-foreground',
        'border-3 border-primary-dark',
        'font-pixel text-[9px] uppercase',
        'px-3 py-2',
        'transition-all duration-100',
        'hover:brightness-110',
        'active:translate-x-0.5 active:translate-y-0.5',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <UserPlus size={14} />
      )}
      <span>⚽ 가입 신청</span>
    </button>
  );
}
