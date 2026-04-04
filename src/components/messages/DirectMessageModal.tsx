import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  teamId?: string;
  teamName?: string;
  isTeamInquiry?: boolean;
}

export function DirectMessageModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientAvatar,
  teamId,
  teamName,
  isTeamInquiry = false,
}: DirectMessageModalProps) {
  useBodyScrollLock(isOpen);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(true);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setShowEnvelope(true);
      // Animate envelope opening
      const timer = setTimeout(() => setShowEnvelope(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!recipientId) {
      toast.error('받는 사람을 선택해주세요');
      return;
    }
    if (!content.trim()) {
      toast.error('메시지 내용을 입력해주세요');
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Add [팀 문의] prefix for team inquiries
      const finalContent = isTeamInquiry 
        ? `[팀 문의] ${content}` 
        : content;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: recipientId,
          content: finalContent,
          team_id: teamId || null,
        });

      if (error) throw error;

      toast.success('쪽지를 보냈습니다! 📬');
      onClose();
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('메시지 전송에 실패했습니다');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Envelope Animation */}
      {showEnvelope && (
        <div className="absolute inset-0 flex items-center justify-center z-60 pointer-events-none">
          <div className="envelope-animation">
            {/* Envelope Body */}
            <div className="relative w-32 h-24">
              {/* Envelope back */}
              <div 
                className="absolute inset-0 bg-secondary border-4 border-border-dark"
                style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
              />
              {/* Envelope flap - opening animation */}
              <div 
                className="envelope-flap absolute top-0 left-0 right-0 h-12 bg-accent border-4 border-border-dark origin-top"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  animation: 'envelope-open 0.6s ease-out 0.3s forwards',
                }}
              />
              {/* Letter coming out */}
              <div 
                className="absolute left-2 right-2 bg-card border-2 border-border-dark"
                style={{
                  top: '50%',
                  height: '60%',
                  animation: 'letter-rise 0.5s ease-out 0.7s forwards',
                  transform: 'translateY(0)',
                }}
              >
                <div className="p-2">
                  <div className="h-1 bg-muted-foreground/30 w-3/4 mb-1" />
                  <div className="h-1 bg-muted-foreground/30 w-1/2" />
                </div>
              </div>
              {/* Sparkles */}
              <div className="absolute -top-4 -left-2 text-xl animate-pulse">✨</div>
              <div className="absolute -top-2 -right-4 text-lg animate-pulse delay-150">✨</div>
              <div className="absolute -bottom-2 left-1/2 text-xl animate-pulse delay-300">💌</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Content */}
      <div 
        className={cn(
          "relative w-full max-w-md bg-white border-4 border-border-dark transition-all duration-300",
          showEnvelope ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-primary border-b-4 border-primary-dark">
          <div className="flex items-center gap-2">
            <span className="text-xl">✉️</span>
            <h2 className="font-pixel text-[10px] text-primary-foreground uppercase">
              {isTeamInquiry ? '팀 문의 쪽지' : '쪽지 보내기'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <X size={14} className="text-primary-foreground" />
          </button>
        </div>

        {/* Recipient Display */}
        <div className="p-4 border-b-2 border-border-dark bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[9px] text-muted-foreground">받는 사람:</span>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center text-sm overflow-hidden"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {recipientAvatar ? (
                  <img src={recipientAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <span className="font-pixel text-xs text-foreground">{recipientName}</span>
              {teamName && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-pixel border border-primary">
                  {teamName} 관리자
                </span>
              )}
            </div>
          </div>
          
          {isTeamInquiry && (
            <div className="mt-3 flex items-center gap-2">
              <span 
                className="px-2 py-1 bg-accent text-accent-foreground text-[9px] font-pixel border-2 border-accent-dark"
                style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
              >
                🏷️ [팀 문의]
              </span>
              <span className="text-[9px] text-muted-foreground font-body">
                자동으로 태그가 추가됩니다
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메시지를 입력하세요..."
            rows={6}
            className="w-full px-4 py-3 bg-white text-gray-900 border-4 border-border-dark outline-none focus:border-primary resize-none font-body text-sm placeholder:text-gray-400"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          />
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
                : "bg-primary text-primary-foreground border-primary-dark hover:translate-y-[-2px]"
            )}
            style={{ 
              boxShadow: sending || !content.trim() 
                ? '3px 3px 0 hsl(var(--pixel-shadow))' 
                : '4px 4px 0 hsl(var(--primary-dark))' 
            }}
          >
            <Send size={14} />
            {sending ? '보내는 중...' : '쪽지 보내기'}
          </button>
        </div>
      </div>
    </div>
  );
}
