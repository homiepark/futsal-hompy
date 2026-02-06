import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { ApplicantCard } from '@/components/team/ApplicantCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface JoinRequest {
  id: string;
  user_id: string;
  team_id: string;
  message: string | null;
  status: string;
  created_at: string;
  profile?: {
    nickname: string;
    nickname_tag: string | null;
    real_name: string | null;
    avatar_url: string | null;
    years_of_experience: number;
    preferred_position: string | null;
  };
}

export default function JoinRequestManagement() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, [teamId]);

  const fetchPendingRequests = async () => {
    if (!teamId) return;

    setLoading(true);
    try {
      // Fetch pending join requests for this team
      const { data: requestsData, error: requestsError } = await supabase
        .from('team_join_requests')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (requestsData && requestsData.length > 0) {
        // Fetch profiles for each request
        const userIds = requestsData.map(r => r.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, nickname, nickname_tag, real_name, avatar_url, years_of_experience, preferred_position')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Merge profile data with requests
        const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        const enrichedRequests = requestsData.map(req => ({
          ...req,
          profile: profileMap.get(req.user_id) || {
            nickname: '알 수 없음',
            nickname_tag: null,
            real_name: null,
            avatar_url: null,
            years_of_experience: 0,
            preferred_position: null,
          },
        }));

        setRequests(enrichedRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('신청 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    try {
      // Update request status to approved
      const { error: updateError } = await supabase
        .from('team_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add user to team members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: request.team_id,
          user_id: request.user_id,
          role: 'member',
        });

      if (memberError) throw memberError;

      toast.success(`${request.profile?.nickname}님의 가입을 승인했습니다!`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('승인 처리 중 오류가 발생했습니다');
    }
  };

  const handleReject = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    try {
      const { error } = await supabase
        .from('team_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`${request.profile?.nickname}님의 가입을 거절했습니다`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('거절 처리 중 오류가 발생했습니다');
    }
  };

  const handleMessage = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      // Navigate to messages with this user
      navigate('/messages', { state: { recipientId: request.user_id } });
    }
  };

  const handleBack = () => {
    navigate(`/team/${teamId}`);
  };

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-3 border-border-dark">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="pixel-back-btn">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="font-pixel text-sm text-foreground">입단 신청 관리</h1>
            <p className="font-pixel text-[9px] text-muted-foreground mt-0.5">
              {requests.length}건의 신청
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="kairo-panel p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted border-2 border-border-dark" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          // Applicant cards
          <div className="space-y-4">
            {requests.map((request) => (
              <ApplicantCard
                key={request.id}
                id={request.id}
                nickname={request.profile?.nickname || '알 수 없음'}
                nicknameTag={request.profile?.nickname_tag || undefined}
                realName={request.profile?.real_name || undefined}
                avatarUrl={request.profile?.avatar_url || undefined}
                yearsOfExperience={request.profile?.years_of_experience || 0}
                preferredPosition={request.profile?.preferred_position || 'MF'}
                message={request.message || undefined}
                onApprove={handleApprove}
                onReject={handleReject}
                onMessage={handleMessage}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="kairo-panel p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-secondary border-3 border-border-dark flex items-center justify-center"
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              <UserPlus size={32} className="text-muted-foreground animate-pixel-pulse" />
            </div>
            <p className="font-pixel text-sm text-foreground mb-2">
              아직 새로운 입단 신청이 없어요!
            </p>
            <p className="text-xs text-muted-foreground">
              새로운 팀원이 가입 신청을 하면 여기에 표시됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
