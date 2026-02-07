import { useState, useEffect } from 'react';
import { ArrowLeft, Send, UserPlus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { InvitationCard } from '@/components/messages/InvitationCard';
import { MessageBadge, getMessageType } from '@/components/messages/MessageBadge';
import { DirectMessageModal } from '@/components/messages/DirectMessageModal';
import { ApplicantCard } from '@/components/team/ApplicantCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useDev } from '@/contexts/DevContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  teamId?: string;
  teamName?: string;
}

interface Invitation {
  id: string;
  team_id: string;
  message: string | null;
  created_at: string;
  team?: {
    name: string;
    emblem: string;
  };
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'user1',
    senderName: '김풋살',
    content: '안녕하세요! 다음 경기 참가 가능하신가요?',
    isRead: false,
    createdAt: '10분 전',
  },
  {
    id: '2',
    senderId: 'team1',
    senderName: 'FC 불꽃',
    senderAvatar: '🔥',
    content: '[📢 팀 공지] 이번 주 토요일 훈련 장소가 변경되었습니다.',
    isRead: false,
    createdAt: '1시간 전',
    teamId: 'team1',
    teamName: 'FC 불꽃',
  },
  {
    id: '3',
    senderId: 'user2',
    senderName: '박매칭',
    content: '[팀 문의] 저희 팀과 매칭 가능한지 문의드립니다.',
    isRead: true,
    createdAt: '어제',
    teamId: 'team2',
    teamName: '스피드FC',
  },
  {
    id: '4',
    senderId: 'user3',
    senderName: '이코치',
    content: '레슨 관련해서 연락드렸습니다.',
    isRead: true,
    createdAt: '3일 전',
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}

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

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDevAdmin } = useDev();
  const [activeTab, setActiveTab] = useState<'all' | 'team' | 'personal' | 'invites' | 'join-requests'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<{
    id: string;
    name: string;
    avatar?: string;
    teamId?: string;
    teamName?: string;
    isTeamInquiry?: boolean;
  } | null>(null);

  // Check for direct message mode or tab from navigation state
  useEffect(() => {
    const state = location.state as { 
      directMessage?: boolean; 
      recipientId?: string; 
      recipientName?: string;
      teamId?: string;
      teamName?: string;
      tab?: string;
    } | null;
    
    if (state?.tab === 'join-requests' && isDevAdmin) {
      setActiveTab('join-requests');
      // Clear the state to prevent issues on refresh
      window.history.replaceState({}, document.title);
    } else if (state?.directMessage && state.recipientId) {
      setDirectMessageRecipient({
        id: state.recipientId,
        name: state.recipientName || '팀 관리자',
        teamId: state.teamId,
        teamName: state.teamName,
        isTeamInquiry: true,
      });
      setShowDirectMessage(true);
      // Clear the state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isDevAdmin]);

  useEffect(() => {
    if (activeTab === 'invites') {
      fetchInvitations();
    } else if (activeTab === 'join-requests' && isDevAdmin) {
      fetchJoinRequests();
    }
  }, [activeTab, isDevAdmin]);

  const fetchInvitations = async () => {
    setLoadingInvites(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('team_invitations')
        .select('id, team_id, message, created_at')
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const teamIds = data.map(inv => inv.team_id);
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name, emblem')
          .in('id', teamIds);

        const teamMap = new Map(teams?.map(t => [t.id, t]) || []);
        const enriched = data.map(inv => ({
          ...inv,
          team: teamMap.get(inv.team_id) || { name: '알 수 없는 팀', emblem: '⚽' },
        }));
        setInvitations(enriched);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvites(false);
    }
  };

  const fetchJoinRequests = async () => {
    setLoadingJoinRequests(true);
    try {
      // For demo, we'll fetch all pending requests (in real app, filter by admin's team)
      const { data: requestsData, error: requestsError } = await supabase
        .from('team_join_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (requestsData && requestsData.length > 0) {
        const userIds = requestsData.map(r => r.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, nickname, nickname_tag, real_name, avatar_url, years_of_experience, preferred_position')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

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

        setJoinRequests(enrichedRequests);
      } else {
        setJoinRequests([]);
      }
    } catch (error) {
      console.error('Error fetching join requests:', error);
    } finally {
      setLoadingJoinRequests(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      const { error: updateError } = await supabase
        .from('team_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: request.team_id,
          user_id: request.user_id,
          role: 'member',
        });

      if (memberError) throw memberError;

      toast.success(`${request.profile?.nickname}님의 가입을 승인했습니다!`);
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('승인 처리 중 오류가 발생했습니다');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      const { error } = await supabase
        .from('team_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`${request.profile?.nickname}님의 가입을 거절했습니다`);
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('거절 처리 중 오류가 발생했습니다');
    }
  };

  const handleMessageApplicant = (requestId: string) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (request) {
      navigate('/messages', { state: { recipientId: request.user_id } });
    }
  };

  const filteredMessages = mockMessages.filter(msg => {
    if (activeTab === 'team') return !!msg.teamId;
    if (activeTab === 'personal') return !msg.teamId;
    return true;
  });

  const unreadCount = mockMessages.filter(m => !m.isRead).length;
  const hasBroadcast = mockMessages.some(m => m.content.startsWith('[📢 팀 공지]') && !m.isRead);

  if (selectedMessage) {
    const messageType = getMessageType(selectedMessage.content, selectedMessage.teamId);
    
    return (
      <div className="pb-24 max-w-lg mx-auto">
        {/* Message Detail Header */}
        <div className="sticky top-0 z-40 bg-primary border-b-4 border-primary-dark p-4 flex items-center gap-3">
          <button 
            onClick={() => setSelectedMessage(null)}
            className="w-8 h-8 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-primary-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center text-sm">
              {selectedMessage.senderAvatar || '👤'}
            </div>
            <span className="text-primary-foreground">{selectedMessage.senderName}</span>
            <MessageBadge type={messageType} />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Message Content */}
          <PixelCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center text-lg flex-shrink-0">
                {selectedMessage.senderAvatar || '👤'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-foreground">{selectedMessage.senderName}</span>
                  <span className="text-xs text-muted-foreground">{selectedMessage.createdAt}</span>
                </div>
                {selectedMessage.teamName && (
                  <MessageBadge type={messageType} className="mb-2" />
                )}
                <p className="text-foreground">{selectedMessage.content}</p>
              </div>
            </div>
          </PixelCard>

          {/* Reply Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="답장 입력..."
              className="flex-1 px-4 py-3 bg-card border-4 border-border-dark shadow-[2px_2px_0_hsl(var(--pixel-shadow))] outline-none focus:border-primary"
            />
            <button className="w-12 h-12 bg-primary border-4 border-primary-dark flex items-center justify-center shadow-[4px_4px_0_hsl(var(--primary-dark))]">
              <Send size={20} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary border-b-4 border-primary-dark p-4 flex items-center gap-3">
        <Link to="/profile" className="w-8 h-8 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center">
          <ArrowLeft size={18} className="text-primary-foreground" />
        </Link>
        <h1 className="text-sm text-primary-foreground flex items-center gap-2">
          📬 쪽지함
          {unreadCount > 0 && (
            <span className={cn(
              "px-2 py-0.5 text-accent-foreground text-xs border",
              hasBroadcast 
                ? "bg-destructive border-destructive animate-pulse" 
                : "bg-accent border-accent-dark"
            )}>
              {unreadCount}
            </span>
          )}
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 flex-wrap">
          {[
            { key: 'all', label: '전체', icon: '📬' },
            { key: 'team', label: '팀', icon: '📢', color: 'primary' },
            { key: 'personal', label: '개인', icon: '💬', color: 'accent' },
            { key: 'invites', label: '초대', icon: '🎫', badge: invitations.length },
            ...(isDevAdmin ? [{ key: 'join-requests', label: '입단신청', icon: '📋', badge: joinRequests.length }] : []),
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex-1 min-w-[60px] py-2 border-3 text-[10px] transition-all flex items-center justify-center gap-1 font-pixel',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground border-primary-dark shadow-[2px_2px_0_hsl(var(--primary-dark))]'
                  : 'bg-card text-foreground border-border-dark shadow-[2px_2px_0_hsl(var(--pixel-shadow))]'
              )}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1 bg-accent text-accent-foreground text-[8px] border border-accent-dark">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'join-requests' && isDevAdmin ? (
          /* Join Requests Tab (Admin Only) */
          <div className="space-y-4">
            {loadingJoinRequests ? (
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
            ) : joinRequests.length > 0 ? (
              joinRequests.map((request) => (
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
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onMessage={handleMessageApplicant}
                />
              ))
            ) : (
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
        ) : activeTab === 'invites' ? (
          /* Invitations Tab */
          <div className="space-y-3">
            {loadingInvites ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                로딩 중...
              </div>
            ) : invitations.length > 0 ? (
              invitations.map((inv) => (
                <InvitationCard
                  key={inv.id}
                  id={inv.id}
                  teamId={inv.team_id}
                  teamName={inv.team?.name || '알 수 없는 팀'}
                  teamEmblem={inv.team?.emblem || '⚽'}
                  message={inv.message}
                  createdAt={formatDate(inv.created_at)}
                  onRespond={fetchInvitations}
                />
              ))
            ) : (
              <div className="kairo-panel p-8 text-center">
                <span className="text-4xl block mb-3">🎫</span>
                <p className="font-pixel text-sm text-foreground mb-1">초대가 없습니다</p>
                <p className="text-xs text-muted-foreground">팀에서 초대하면 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        ) : (
          /* Messages List */
          <div className="space-y-2">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => {
                const messageType = getMessageType(message.content, message.teamId);
                const isBroadcast = message.content.startsWith('[📢 팀 공지]');
                
                return (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={cn(
                      'w-full text-left p-3 border-4 transition-all',
                      message.isRead
                        ? 'bg-card border-border-dark shadow-[3px_3px_0_hsl(var(--pixel-shadow))]'
                        : isBroadcast
                          ? 'bg-destructive/10 border-destructive shadow-[3px_3px_0_hsl(var(--destructive))] animate-pulse'
                          : 'bg-accent/10 border-accent shadow-[3px_3px_0_hsl(var(--accent-dark))]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center text-lg flex-shrink-0">
                        {message.senderAvatar || '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'truncate font-pixel text-xs',
                              !message.isRead && 'text-foreground font-bold'
                            )}>
                              {message.senderName}
                            </span>
                            <MessageBadge type={messageType} />
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {message.createdAt}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.content}
                        </p>
                      </div>
                      {!message.isRead && (
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0 mt-2",
                          isBroadcast ? "bg-destructive animate-ping" : "bg-accent"
                        )} />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">📭</span>
                <p>메시지가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* New Message Button */}
        {activeTab !== 'invites' && (
          <PixelButton variant="accent" className="w-full flex items-center justify-center gap-2">
            <span>✉️</span>
            <span>새 쪽지 보내기</span>
          </PixelButton>
        )}
      </div>

      {/* Direct Message Modal */}
      {directMessageRecipient && (
        <DirectMessageModal
          isOpen={showDirectMessage}
          onClose={() => {
            setShowDirectMessage(false);
            setDirectMessageRecipient(null);
          }}
          recipientId={directMessageRecipient.id}
          recipientName={directMessageRecipient.name}
          recipientAvatar={directMessageRecipient.avatar}
          teamId={directMessageRecipient.teamId}
          teamName={directMessageRecipient.teamName}
          isTeamInquiry={directMessageRecipient.isTeamInquiry}
        />
      )}
    </div>
  );
}
