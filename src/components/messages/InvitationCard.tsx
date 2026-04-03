import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvitationCardProps {
  id: string;
  teamId: string;
  teamName: string;
  teamEmblem: string;
  message: string | null;
  createdAt: string;
  onRespond: () => void;
}

export function InvitationCard({
  id,
  teamId,
  teamName,
  teamEmblem,
  message,
  createdAt,
  onRespond,
}: InvitationCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) throw memberError;

      toast.success(`${teamName} 팀에 가입되었습니다!`);
      onRespond();
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('가입 처리 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'declined' })
        .eq('id', id);

      if (error) throw error;

      toast.success('초대를 거절했습니다');
      onRespond();
    } catch (error) {
      console.error('Decline error:', error);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kairo-panel p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-accent/10 border-b-2 border-border-dark">
        <div 
          className="w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center text-xl"
          style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
        >
          {teamEmblem}
        </div>
        <div className="flex-1">
          <p className="font-pixel text-[9px] text-accent uppercase">팀 초대</p>
          <p className="font-pixel text-sm text-foreground">{teamName}</p>
        </div>
        <span className="font-pixel text-[11px] text-muted-foreground">{createdAt}</span>
      </div>

      {/* Message */}
      {message && (
        <div className="p-3 bg-card">
          <p className="text-sm text-foreground leading-relaxed">{message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex border-t-2 border-border-dark">
        <button
          onClick={handleDecline}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive font-pixel text-[10px] uppercase transition-colors border-r-2 border-border-dark disabled:opacity-50"
        >
          <X size={14} />
          거절
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-pixel text-[10px] uppercase transition-colors disabled:opacity-50"
        >
          <Check size={14} />
          수락
        </button>
      </div>
    </div>
  );
}
