import { useState, useEffect } from 'react';
import { X, Check, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface JoinRequest {
  id: string;
  userId: string;
  nickname: string;
  avatarUrl?: string;
  position?: string;
  yearsOfExperience: number;
  monthsOfExperience: number;
  realName?: string;
  message?: string;
  createdAt: string;
}

interface JoinRequestNotificationProps {
  teamId: string;
  isAdmin: boolean;
}

const positionLabels: Record<string, string> = {
  pivo: '피보',
  ala: '아라',
  fixo: '픽소',
  goleiro: '골레이로',
};

export function JoinRequestNotification({ teamId, isAdmin }: JoinRequestNotificationProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !user || !teamId) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('team_join_requests')
        .select('id, user_id, message, created_at')
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return;

      // Fetch profiles
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url, preferred_position, years_of_experience, months_of_experience, real_name')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      setRequests(data.map(r => {
        const p = profileMap.get(r.user_id);
        return {
          id: r.id,
          userId: r.user_id,
          nickname: p?.nickname || '풋살러',
          avatarUrl: p?.avatar_url || undefined,
          position: p?.preferred_position || undefined,
          yearsOfExperience: p?.years_of_experience || 0,
          monthsOfExperience: (p as any)?.months_of_experience || 0,
          realName: p?.real_name || undefined,
          message: r.message || undefined,
          createdAt: r.created_at,
        };
      }));
    };

    fetchRequests();
  }, [teamId, isAdmin, user]);

  const handleAccept = async (request: JoinRequest) => {
    setProcessing(request.id);
    try {
      // Update request status
      await supabase
        .from('team_join_requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      // Add to team_members
      await supabase
        .from('team_members')
        .insert({ team_id: teamId, user_id: request.userId, role: 'member' });

      // Send message to applicant
      if (user) {
        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: request.userId,
          team_id: teamId,
          content: `입단 신청이 승인되었습니다! 🎉 팀에 오신 것을 환영합니다!`,
          is_read: false,
        });
      }

      setRequests(prev => prev.filter(r => r.id !== request.id));
      toast.success(`${request.nickname}님의 입단을 승인했습니다! 🎉`);
    } catch (err) {
      console.error('Accept error:', err);
      toast.error('승인에 실패했습니다');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: JoinRequest) => {
    setProcessing(request.id);
    try {
      await supabase
        .from('team_join_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      // Send message to applicant
      if (user) {
        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: request.userId,
          team_id: teamId,
          content: `입단 신청이 거절되었습니다.`,
          is_read: false,
        });
      }

      setRequests(prev => prev.filter(r => r.id !== request.id));
      toast.success(`${request.nickname}님의 입단을 거절했습니다`);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('거절에 실패했습니다');
    } finally {
      setProcessing(null);
    }
  };

  if (!isAdmin || requests.length === 0 || dismissed) return null;

  const expStr = (r: JoinRequest) => {
    if (r.yearsOfExperience > 0) {
      return `${r.yearsOfExperience}년${r.monthsOfExperience ? ` ${r.monthsOfExperience}개월` : ''}`;
    }
    return r.monthsOfExperience ? `${r.monthsOfExperience}개월` : '입문';
  };

  return (
    <div className="mx-4 mb-3">
      <div
        className="bg-accent/10 border-3 border-accent overflow-hidden"
        style={{ boxShadow: '3px 3px 0 hsl(var(--accent-dark))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-accent text-accent-foreground">
          <div className="flex items-center gap-2">
            <UserPlus size={14} />
            <span className="font-pixel text-[9px]">입단 신청 {requests.length}건</span>
          </div>
          <button onClick={() => setDismissed(true)} className="hover:opacity-70">
            <X size={14} />
          </button>
        </div>

        {/* Request List */}
        <div className="p-2 space-y-2 max-h-60 overflow-y-auto">
          {requests.map(request => (
            <div key={request.id} className="bg-card p-3 border-2 border-border-dark">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary border-2 border-border-dark overflow-hidden flex-shrink-0">
                  {request.avatarUrl ? (
                    <img src={request.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-pixel text-[10px] text-foreground font-bold">{request.nickname}</span>
                    {request.realName && (
                      <span className="font-pixel text-[11px] text-muted-foreground">({request.realName})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {request.position && (
                      <span className="font-pixel text-[11px] text-primary px-1.5 py-0.5 bg-primary/10 border border-primary/30">
                        {positionLabels[request.position] || request.position}
                      </span>
                    )}
                    <span className="font-pixel text-[11px] text-muted-foreground">경력 {expStr(request)}</span>
                  </div>
                  {request.message && (
                    <p className="font-pixel text-[11px] text-foreground mt-1.5 p-1.5 bg-muted border border-border-dark">
                      "{request.message}"
                    </p>
                  )}
                </div>
              </div>

              {/* Accept / Reject */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAccept(request)}
                  disabled={processing === request.id}
                  className="flex-1 py-1.5 bg-primary border-2 border-primary-dark font-pixel text-[11px] text-primary-foreground flex items-center justify-center gap-1 hover:brightness-110 disabled:opacity-50"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
                >
                  <Check size={10} /> 수락
                </button>
                <button
                  onClick={() => handleReject(request)}
                  disabled={processing === request.id}
                  className="flex-1 py-1.5 bg-muted border-2 border-border-dark font-pixel text-[11px] text-foreground flex items-center justify-center gap-1 hover:bg-secondary disabled:opacity-50"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  <X size={10} /> 거절
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
