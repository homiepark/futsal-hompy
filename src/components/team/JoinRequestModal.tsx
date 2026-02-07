import { useState, useEffect } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfile {
  nickname: string;
  nickname_tag: string | null;
  preferred_position: string | null;
  years_of_experience: number;
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, nickname_tag, preferred_position, years_of_experience')
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
      toast.error('소개 메시지를 입력해주세요');
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
          content: `새로운 입단 신청이 도착했습니다! ✉️\n\n신청자: ${profile.nickname}\n포지션: ${profile.preferred_position || '미설정'}\n경력: ${profile.years_of_experience}년\n\n"${message.trim()}"`,
          is_read: false,
        });
      }

      toast.success('가입 신청 완료!', {
        description: `${teamName} 팀에 가입 신청을 보냈습니다.`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Join request error:', error);
      toast.error('가입 신청 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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

      {/* Modal */}
      <div className="relative w-full max-w-sm kairo-panel animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="kairo-panel-header justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={14} />
            <span>입단 신청</span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-primary mb-3" />
              <p className="font-pixel text-[9px] text-muted-foreground">
                프로필 정보 불러오는 중...
              </p>
            </div>
          ) : profile ? (
            <div className="space-y-4">
              {/* Team Info */}
              <div className="text-center pb-3 border-b-2 border-border-dark">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary border-3 border-border-dark text-2xl mb-2"
                  style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
                >
                  {teamEmblem}
                </div>
                <p className="font-pixel text-sm text-foreground">{teamName}</p>
                <p className="font-pixel text-[8px] text-muted-foreground">에 가입 신청합니다</p>
              </div>

              {/* Profile Summary */}
              <div className="kairo-section">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-[8px] text-muted-foreground uppercase">신청자 정보</span>
                  <span className="font-pixel text-[7px] text-primary">자동으로 불러옴</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {/* Nickname */}
                  <div className="text-center p-2 bg-muted border-2 border-border-dark">
                    <p className="font-pixel text-[7px] text-muted-foreground mb-1">닉네임</p>
                    <p className="font-pixel text-[9px] text-foreground truncate">
                      {profile.nickname}
                    </p>
                    {profile.nickname_tag && (
                      <p className="font-pixel text-[7px] text-muted-foreground">
                        #{profile.nickname_tag}
                      </p>
                    )}
                  </div>
                  
                  {/* Position */}
                  <div className="text-center p-2 bg-muted border-2 border-border-dark">
                    <p className="font-pixel text-[7px] text-muted-foreground mb-1">포지션</p>
                    <p className="text-lg">{position.emoji}</p>
                    <p className="font-pixel text-[8px] text-foreground">{position.label}</p>
                  </div>
                  
                  {/* Experience */}
                  <div className="text-center p-2 bg-muted border-2 border-border-dark">
                    <p className="font-pixel text-[7px] text-muted-foreground mb-1">경력</p>
                    <p className="font-pixel text-[9px] text-foreground">
                      {getExperienceLabel(profile.years_of_experience)}
                    </p>
                    <p className="font-pixel text-[7px] text-muted-foreground">
                      {profile.years_of_experience}년
                    </p>
                  </div>
                </div>
              </div>

              {/* Introduction Message */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-[9px] text-foreground">
                    소개 메시지 <span className="text-accent">*</span>
                  </span>
                  <span className="font-pixel text-[7px] text-muted-foreground">
                    {message.length}/200
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="예: 안녕하세요! 열심히 활동하고 싶습니다 🔥"
                  className={cn(
                    'w-full px-3 py-2 min-h-[80px] resize-none',
                    'bg-input border-3 border-border-dark',
                    'font-pixel text-[10px] placeholder:text-muted-foreground',
                    'focus:outline-none focus:border-primary'
                  )}
                  maxLength={200}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-pixel text-[10px] text-destructive">
                프로필 정보를 불러올 수 없습니다
              </p>
              <p className="font-pixel text-[8px] text-muted-foreground mt-2">
                프로필 설정을 먼저 완료해주세요
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-3 border-border-dark bg-muted/50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || !profile}
            className={cn(
              'flex-1 py-2.5 border-3 font-pixel text-[9px] transition-all',
              'flex items-center justify-center gap-2',
              'bg-primary text-primary-foreground border-primary-dark',
              'hover:brightness-110',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
          >
            {submitting ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>신청 중...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>신청 완료</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
