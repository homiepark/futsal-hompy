import { useState } from 'react';
import { X, Swords, Send } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchPostId: string;
  targetTeamName: string;
  targetTeamEmblem: string;
  targetTeamAdminId: string;
  myTeam: { id: string; name: string; emblem: string };
  myUserId: string;
  onSuccess: () => void;
}

export function ChallengeModal({
  isOpen,
  onClose,
  matchPostId,
  targetTeamName,
  targetTeamEmblem,
  targetTeamAdminId,
  myTeam,
  myUserId,
  onSuccess,
}: ChallengeModalProps) {
  useBodyScrollLock(isOpen);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSending(true);
    try {
      // 1. Create match application
      const { error: appError } = await supabase
        .from('match_applications')
        .insert({
          match_post_id: matchPostId,
          applicant_team_id: myTeam.id,
          applied_by_user_id: myUserId,
          message: message.trim() || `${myTeam.name}팀이 도전합니다!`,
        });

      if (appError) throw appError;

      // 2. Send notification message to the match poster's admin
      if (targetTeamAdminId) {
        const notifContent = `[⚔️ 매치 도전] ${myTeam.emblem} ${myTeam.name}팀이 도전 신청했습니다!\n\n${message.trim() || '한 판 하시죠!'}`;

        await supabase.from('messages').insert({
          sender_id: myUserId,
          receiver_id: targetTeamAdminId,
          content: notifContent,
        });
      }

      toast.success('도전 신청 완료! 상대팀에게 쪽지도 보냈습니다 ⚔️');
      setMessage('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Challenge error:', error);
      if (error?.code === '23505') {
        toast.info('이미 도전 신청한 공고입니다');
      } else {
        toast.error('도전 신청에 실패했습니다');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-accent text-accent-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords size={14} />
            <span className="font-pixel text-[10px]">매치 도전!</span>
          </div>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* VS Display */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <span className="text-2xl block">{myTeam.emblem}</span>
              <span className="font-pixel text-[8px] text-foreground">{myTeam.name}</span>
            </div>
            <span className="font-pixel text-[14px] text-accent">VS</span>
            <div className="text-center">
              <span className="text-2xl block">{targetTeamEmblem}</span>
              <span className="font-pixel text-[8px] text-foreground">{targetTeamName}</span>
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="font-pixel text-[8px] text-muted-foreground block mb-1.5">
              상대팀에게 한마디 (선택)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="안녕하세요! 좋은 경기 기대합니다 ⚽"
              maxLength={200}
              className="w-full pixel-input h-20 resize-none"
            />
            <span className="font-pixel text-[6px] text-muted-foreground">{message.length}/200</span>
          </div>

          <p className="font-pixel text-[7px] text-muted-foreground bg-primary/5 border border-primary/20 p-2">
            💡 도전 신청과 함께 상대팀 관리자에게 쪽지가 전송됩니다. 쪽지함에서 계속 소통할 수 있어요!
          </p>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full py-3 bg-accent text-accent-foreground font-pixel text-[10px] border-3 border-accent-dark hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ boxShadow: '3px 3px 0 hsl(var(--accent-dark))' }}
          >
            <Send size={12} />
            {sending ? '전송 중...' : '⚔️ 도전 신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
