import { useState, useEffect } from 'react';
import { UserPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { JoinRequestModal } from './JoinRequestModal';
import { AuthRequiredModal } from '@/components/ui/AuthRequiredModal';

interface JoinRequestButtonProps {
  teamId: string;
  teamName: string;
  teamEmblem?: string;
  isMember?: boolean;
  className?: string;
}

export function JoinRequestButton({
  teamId,
  teamName,
  teamEmblem,
  isMember = false,
  className,
}: JoinRequestButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check for existing pending request on mount
  useEffect(() => {
    if (user && teamId) {
      checkExistingRequest();
    } else {
      setChecking(false);
    }
  }, [user, teamId]);

  const checkExistingRequest = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('team_join_requests')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      setHasRequested(!!data);
    } catch {
      // No existing request
      setHasRequested(false);
    } finally {
      setChecking(false);
    }
  };

  const handleClick = () => {
    // Auth guard - show popup if not logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleSuccess = () => {
    setHasRequested(true);
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

  if (hasRequested) {
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
    <>
      <button
        onClick={handleClick}
        disabled={checking}
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
        <UserPlus size={14} />
        <span>⚽ 입단 신청하기</span>
      </button>

      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        teamId={teamId}
        teamName={teamName}
        teamEmblem={teamEmblem}
        onSuccess={handleSuccess}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="먼저 로그인을 해주세요!"
      />
    </>
  );
}