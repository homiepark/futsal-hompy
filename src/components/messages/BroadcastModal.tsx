import { useState } from 'react';
import { X, Send, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface TeamMember {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  members: TeamMember[];
}

export function BroadcastModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  members,
}: BroadcastModalProps) {
  useBodyScrollLock(isOpen);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) {
      toast.error('메시지 내용을 입력해주세요');
      return;
    }

    if (members.length === 0) {
      toast.error('팀원이 없습니다');
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Create messages for all team members (excluding sender)
      const messagesToSend = members
        .filter(m => m.id !== user.id)
        .map(member => ({
          sender_id: user.id,
          receiver_id: member.id,
          content: `[📢 팀 공지] ${content}`,
          team_id: teamId,
        }));

      if (messagesToSend.length === 0) {
        toast.error('보낼 팀원이 없습니다');
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert(messagesToSend);

      if (error) throw error;

      toast.success(`${messagesToSend.length}명의 팀원에게 공지를 보냈습니다! 📢`);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('공지 전송에 실패했습니다');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  // Default avatars for members without custom avatars
  const avatarEmojis = ['👤', '🧑', '👦', '👧', '🧒', '👨', '👩', '🧔'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md bg-card border-4 border-border-dark animate-scale-in"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-accent border-b-4 border-accent-dark">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <h2 className="font-pixel text-[10px] text-accent-foreground uppercase">
              팀 전체 공지
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 bg-accent-foreground/20 border-2 border-accent-dark flex items-center justify-center hover:bg-accent-foreground/30 transition-colors"
          >
            <X size={14} className="text-accent-foreground" />
          </button>
        </div>

        {/* Team Info */}
        <div className="p-4 border-b-2 border-border-dark bg-muted/30">
          <p className="font-pixel text-xs text-foreground mb-1">
            전체 팀원에게 전하는 소식
          </p>
          <p className="text-[10px] text-muted-foreground font-body">
            {teamName} • {members.length}명의 팀원
          </p>
        </div>

        {/* Message Content */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="팀원들에게 전달할 메시지를 입력하세요..."
            rows={5}
            className="w-full px-4 py-3 bg-background border-4 border-border-dark outline-none focus:border-accent resize-none font-body text-sm"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          />
        </div>

        {/* Member Avatars Preview */}
        <div className="px-4 pb-4">
          <p className="font-pixel text-[8px] text-muted-foreground uppercase mb-2">
            📨 받는 사람 ({members.length}명)
          </p>
          <div className="flex flex-wrap gap-1">
            {members.slice(0, 12).map((member, idx) => (
              <div
                key={member.id}
                className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center text-sm relative group"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                title={member.nickname}
              >
                {member.avatarUrl ? (
                  <img 
                    src={member.avatarUrl} 
                    alt={member.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{avatarEmojis[idx % avatarEmojis.length]}</span>
                )}
                {/* Hover tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[8px] font-pixel whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {member.nickname}
                </div>
              </div>
            ))}
            {members.length > 12 && (
              <div
                className="w-8 h-8 bg-muted border-2 border-border-dark flex items-center justify-center text-[8px] font-pixel text-muted-foreground"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                +{members.length - 12}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t-2 border-border-dark bg-muted/20">
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className={cn(
              "w-full py-3 border-4 font-pixel text-[10px] uppercase flex items-center justify-center gap-2 transition-all",
              sending || !content.trim()
                ? "bg-muted text-muted-foreground border-border-dark cursor-not-allowed"
                : "bg-accent text-accent-foreground border-accent-dark hover:translate-y-[-2px]"
            )}
            style={{ 
              boxShadow: sending || !content.trim() 
                ? '3px 3px 0 hsl(var(--pixel-shadow))' 
                : '4px 4px 0 hsl(var(--accent-dark))' 
            }}
          >
            <Users size={14} />
            {sending ? '보내는 중...' : `${members.length}명에게 공지 보내기`}
          </button>
        </div>
      </div>
    </div>
  );
}
