import { useState, useEffect } from 'react';
import { X, Loader2, Send, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface UserProfile {
  nickname: string;
  nickname_tag: string | null;
  preferred_position: string | null;
  years_of_experience: number;
  months_of_experience: number;
  real_name: string | null;
}

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  teamEmblem?: string;
  onSuccess?: () => void;
}

const positionLabels: Record<string, { label: string; emoji: string }> = {
  pivo: { label: '피보', emoji: '⚡' },
  ala: { label: '아라', emoji: '💨' },
  fixo: { label: '픽소', emoji: '🛡️' },
  goleiro: { label: '골레이로', emoji: '🧤' },
};

const getExperienceLabel = (years: number): string => {
  if (years < 1) return 'Newbie';
  if (years <= 3) return 'Rookie';
  if (years <= 5) return 'Regular';
  if (years <= 10) return 'Veteran';
  return 'Legend';
};

export function JoinRequestModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  teamEmblem = '⚽',
  onSuccess,
}: JoinRequestModalProps) {
  useBodyScrollLock(isOpen);
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
      setShowSuccess(false);
      setMessage('');
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, nickname_tag, preferred_position, years_of_experience, months_of_experience, real_name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('프로필 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) return;
    
    if (!message.trim()) {
      toast.error('한 줄 인사를 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      // Check for existing pending request
      const { data: existingRequest } = await supabase
        .from('team_join_requests')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        toast.error('이미 가입 신청을 보낸 팀입니다');
        onClose();
        return;
      }

      // Create join request
      const { error: joinError } = await supabase
        .from('team_join_requests')
        .insert({
          team_id: teamId,
          user_id: user.id,
          message: message.trim(),
          status: 'pending',
        });

      if (joinError) throw joinError;

      // Send notification message to team admin
      const { data: teamData } = await supabase
        .from('teams')
        .select('admin_user_id')
        .eq('id', teamId)
        .single();

      if (teamData?.admin_user_id) {
        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: teamData.admin_user_id,
          team_id: teamId,
          content: `새로운 입단 신청이 도착했습니다! ✉️\n\n신청자: ${profile.nickname}${profile.real_name ? ` (실명: ${profile.real_name})` : ''}\n포지션: ${profile.preferred_position || '미설정'}\n경력: ${profile.years_of_experience}년${profile.months_of_experience ? ` ${profile.months_of_experience}개월` : ''}\n\n"${message.trim()}"`,
          is_read: false,
        });
      }

      // Show success state
      setShowSuccess(true);
      onSuccess?.();
      
      // Auto-close after 2.5 seconds
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 2500);
    } catch (error: any) {
      console.error('Join request error:', error);
      toast.error('가입 신청 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Show success celebration
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div 
          className="relative w-full max-w-xs bg-card border-4 border-primary p-6 text-center animate-in zoom-in-95 duration-300"
          style={{ boxShadow: '6px 6px 0 hsl(var(--primary-dark))' }}
        >
          <div className="text-5xl mb-4 animate-bounce">🎉</div>
          <PartyPopper className="w-8 h-8 mx-auto text-accent mb-3" />
          <h3 className="font-pixel text-sm text-foreground mb-2">
            신청이 완료되었습니다!
          </h3>
          <p className="font-pixel text-[9px] text-muted-foreground">
            관리자의 승인을 기다려주세요 ⏳
          </p>
          <div className="mt-4 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className="text-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const position = profile?.preferred_position 
    ? positionLabels[profile.preferred_position] 
    : { label: '미설정', emoji: '❓' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Simplified */}
      <div 
        className="relative w-full max-w-sm bg-card border-4 border-border-dark animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-primary border-b-4 border-primary-dark p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send size={14} className="text-primary-foreground" />
            <span className="font-pixel text-[10px] text-primary-foreground">입단 신청서 보내기 ✉️</span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors border-2 border-primary-dark"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content - Simplified */}
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 size={28} className="animate-spin text-primary mb-3" />
              <p className="font-pixel text-[9px] text-muted-foreground">
                로딩 중...
              </p>
            </div>
          ) : profile ? (
            <div className="space-y-4">
              {/* Team Info - Compact */}
              <div className="flex items-center gap-3 p-3 bg-secondary/50 border-2 border-border-dark">
                <div 
                  className="w-12 h-12 bg-card border-2 border-border-dark flex items-center justify-center text-2xl"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  {teamEmblem}
                </div>
                <div>
                  <p className="font-pixel text-[11px] text-foreground font-bold">{teamName}</p>
                  <p className="font-pixel text-[8px] text-muted-foreground">팀에 가입 신청</p>
                </div>
              </div>

              {/* Compact Profile Summary */}
              <div className="p-3 bg-muted/50 border-2 border-dashed border-border">
                <p className="font-pixel text-[8px] text-muted-foreground mb-2">✅ 내 프로필로 신청됩니다</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-pixel text-[9px] text-foreground bg-secondary px-2 py-1 border border-border-dark">
                    {profile.nickname}
                  </span>
                  <span className="font-pixel text-[9px] text-foreground bg-secondary px-2 py-1 border border-border-dark">
                    {position.emoji} {position.label}
                  </span>
                  <span className="font-pixel text-[9px] text-foreground bg-secondary px-2 py-1 border border-border-dark">
                    {profile.years_of_experience}년{profile.months_of_experience ? ` ${profile.months_of_experience}개월` : ''}차
                  </span>
                </div>
              </div>

              {/* Simple Message Input */}
              <div>
                <label className="block mb-2">
                  <span className="font-pixel text-[10px] text-foreground">
                    💬 팀장님께 한 줄 인사를 남겨주세요
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="예: 열심히 활동하겠습니다! 🔥"
                  className={cn(
                    'w-full px-3 py-3 min-h-[70px] resize-none',
                    'bg-input border-3 border-border-dark',
                    'font-pixel text-[10px] placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:border-primary'
                  )}
                  style={{ boxShadow: 'inset 2px 2px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                  maxLength={150}
                />
                <p className="font-pixel text-[7px] text-muted-foreground text-right mt-1">
                  {message.length}/150
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-pixel text-[10px] text-destructive">
                프로필을 찾을 수 없습니다
              </p>
            </div>
          )}
        </div>

        {/* Footer - Buttons */}
        <div className="p-3 border-t-3 border-border-dark bg-muted/30 flex gap-2">
          <button
            onClick={onClose}
            className={cn(
              "flex-1 py-3 font-pixel text-[10px]",
              "bg-destructive/80 text-destructive-foreground",
              "border-3 border-destructive",
              "hover:bg-destructive transition-colors",
              "active:translate-y-0.5"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--destructive) / 0.5)' }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || !profile}
            className={cn(
              "flex-1 py-3 font-pixel text-[10px]",
              "flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground",
              "border-3 border-primary-dark",
              "hover:brightness-110 transition-all",
              "active:translate-y-0.5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>전송 중...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>신청하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
