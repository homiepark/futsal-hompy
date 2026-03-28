import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, UserPlus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { InvitationCard } from '@/components/messages/InvitationCard';
import { MessageBadge, getMessageType } from '@/components/messages/MessageBadge';
import { DirectMessageModal } from '@/components/messages/DirectMessageModal';
import { RecipientPicker } from '@/components/messages/RecipientPicker';
import { ApplicantCard } from '@/components/team/ApplicantCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Conversation {
  otherUserId: string;
  otherUserNickname: string;
  otherUserAvatar: string | null;
  latestMessage: string;
  latestMessageAt: string;
  unreadCount: number;
  teamId: string | null;
  teamName: string | null;
}

interface ConversationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  isMine: boolean;
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'team' | 'personal' | 'invites' | 'join-requests'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<{
    id: string;
    name: string;
    avatar?: string;
    teamId?: string;
    teamName?: string;
    isTeamInquiry?: boolean;
  } | null>(null);

  // Check if user is admin of any team (check both teams.admin_user_id AND team_members.role)
  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      // Check teams.admin_user_id
      const { data: ownedTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('admin_user_id', user.id)
        .limit(1);

      if (ownedTeams && ownedTeams.length > 0) {
        setIsAdmin(true);
        return;
      }

      // Also check team_members with role='admin'
      const { data: adminMembers } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .limit(1);

      setIsAdmin(!!(adminMembers && adminMembers.length > 0));
    };
    checkAdmin();
  }, [user]);

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

    if (state?.tab === 'join-requests' && isAdmin) {
      setActiveTab('join-requests');
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
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isAdmin]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      // Get all messages involving the current user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, is_read, created_at, team_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) {
        setConversations([]);
        return;
      }

      // Group by the other person's user_id
      const conversationMap = new Map<string, {
        otherUserId: string;
        latestMessage: string;
        latestMessageAt: string;
        unreadCount: number;
        teamId: string | null;
      }>();

      for (const msg of messages) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const existing = conversationMap.get(otherUserId);

        if (!existing) {
          conversationMap.set(otherUserId, {
            otherUserId,
            latestMessage: msg.content,
            latestMessageAt: msg.created_at,
            unreadCount: (!msg.is_read && msg.receiver_id === user.id) ? 1 : 0,
            teamId: msg.team_id,
          });
        } else {
          if (!msg.is_read && msg.receiver_id === user.id) {
            existing.unreadCount += 1;
          }
        }
      }

      // Fetch profiles for all other users
      const otherUserIds = Array.from(conversationMap.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', otherUserIds);

      const profileMap = new Map<string, { user_id: string; nickname: string; avatar_url: string | null }>(
        profiles?.map(p => [p.user_id, p]) || []
      );

      // Fetch team names for messages with team_id
      const teamIds = Array.from(new Set(
        Array.from(conversationMap.values())
          .map(c => c.teamId)
          .filter((id): id is string => id !== null)
      ));
      let teamMap = new Map<string, string>();
      if (teamIds.length > 0) {
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', teamIds);
        teamMap = new Map(teams?.map(t => [t.id, t.name]) || []);
      }

      const convList: Conversation[] = Array.from(conversationMap.values()).map(conv => {
        const profile = profileMap.get(conv.otherUserId);
        return {
          otherUserId: conv.otherUserId,
          otherUserNickname: profile?.nickname || '알 수 없음',
          otherUserAvatar: profile?.avatar_url || null,
          latestMessage: conv.latestMessage,
          latestMessageAt: conv.latestMessageAt,
          unreadCount: conv.unreadCount,
          teamId: conv.teamId,
          teamName: conv.teamId ? (teamMap.get(conv.teamId) || null) : null,
        };
      });

      // Sort by latest message time
      convList.sort((a, b) => new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime());

      setConversations(convList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('메시지를 불러오는 데 실패했습니다');
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Fetch conversation messages and mark as read
  const openConversation = useCallback(async (conv: Conversation) => {
    if (!user) return;
    setSelectedConversation(conv);
    setLoadingMessages(true);
    setReplyText('');

    try {
      // Fetch all messages between user and the other person
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, is_read, created_at')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${conv.otherUserId}),and(sender_id.eq.${conv.otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender profile
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('user_id', conv.otherUserId)
        .single();

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('user_id', user.id)
        .single();

      const convMessages: ConversationMessage[] = (messages || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_id === user.id
          ? (myProfile?.nickname || '나')
          : (otherProfile?.nickname || conv.otherUserNickname),
        senderAvatar: msg.sender_id === user.id
          ? (myProfile?.avatar_url || undefined)
          : (otherProfile?.avatar_url || undefined),
        content: msg.content,
        isRead: msg.is_read,
        createdAt: msg.created_at,
        isMine: msg.sender_id === user.id,
      }));

      setConversationMessages(convMessages);

      // Mark unread messages as read
      const unreadIds = (messages || [])
        .filter(m => !m.is_read && m.receiver_id === user.id)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds);

        // Update the conversation's unread count locally
        setConversations(prev =>
          prev.map(c =>
            c.otherUserId === conv.otherUserId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      toast.error('대화를 불러오는 데 실패했습니다');
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // Send a reply message
  const handleSendReply = async () => {
    if (!user || !selectedConversation || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.otherUserId,
          content: replyText.trim(),
          team_id: selectedConversation.teamId || null,
        });

      if (error) throw error;

      // Add the message locally
      const newMsg: ConversationMessage = {
        id: crypto.randomUUID(),
        senderId: user.id,
        senderName: '나',
        content: replyText.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
        isMine: true,
      };
      setConversationMessages(prev => [...prev, newMsg]);
      setReplyText('');

      // Update conversation list
      setConversations(prev =>
        prev.map(c =>
          c.otherUserId === selectedConversation.otherUserId
            ? { ...c, latestMessage: replyText.trim(), latestMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('메시지 전송에 실패했습니다');
    } finally {
      setSendingReply(false);
    }
  };

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    if (!user) return;
    setLoadingInvites(true);
    try {
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
  }, [user]);

  // Fetch join requests for teams where user is admin
  const fetchJoinRequests = useCallback(async () => {
    if (!user) return;
    setLoadingJoinRequests(true);
    try {
      // Get teams where user is admin
      const { data: adminTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('admin_user_id', user.id);

      if (teamsError) throw teamsError;
      if (!adminTeams || adminTeams.length === 0) {
        setJoinRequests([]);
        return;
      }

      const adminTeamIds = adminTeams.map(t => t.id);

      const { data: requestsData, error: requestsError } = await supabase
        .from('team_join_requests')
        .select('*')
        .in('team_id', adminTeamIds)
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
  }, [user]);

  // Initial load and tab changes
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'invites') {
      fetchInvitations();
    } else if (activeTab === 'join-requests' && isAdmin) {
      fetchJoinRequests();
    } else {
      fetchConversations();
    }
  }, [activeTab, user, isAdmin, fetchConversations, fetchInvitations, fetchJoinRequests]);

  // Handle approve join request
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

  // Handle reject join request
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
      setDirectMessageRecipient({
        id: request.user_id,
        name: request.profile?.nickname || '알 수 없음',
      });
      setShowDirectMessage(true);
    }
  };

  // Filter conversations based on active tab
  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'team') return !!conv.teamId;
    if (activeTab === 'personal') return !conv.teamId;
    return true;
  });

  const totalUnreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // Conversation detail view
  if (selectedConversation) {
    const messageType = getMessageType(
      selectedConversation.latestMessage,
      selectedConversation.teamId
    );

    return (
      <div className="pb-24 max-w-lg mx-auto">
        {/* Message Detail Header */}
        <div className="sticky top-0 z-40 bg-primary border-b-4 border-primary-dark p-4 flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedConversation(null);
              setConversationMessages([]);
              fetchConversations();
            }}
            className="w-8 h-8 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-primary-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center text-sm overflow-hidden">
              {selectedConversation.otherUserAvatar ? (
                <img
                  src={selectedConversation.otherUserAvatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                '👤'
              )}
            </div>
            <span className="text-primary-foreground">{selectedConversation.otherUserNickname}</span>
            {selectedConversation.teamName && (
              <MessageBadge type={messageType} />
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Messages */}
          {loadingMessages ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <PixelCard>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted border-2 border-border-dark flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </PixelCard>
                </div>
              ))}
            </div>
          ) : conversationMessages.length > 0 ? (
            conversationMessages.map(msg => (
              <PixelCard key={msg.id}>
                <div className={cn(
                  'flex items-start gap-3',
                  msg.isMine && 'flex-row-reverse'
                )}>
                  <div className="w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                    {msg.senderAvatar ? (
                      <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div className={cn('flex-1', msg.isMine && 'text-right')}>
                    <div className={cn(
                      'flex items-center gap-2 mb-2',
                      msg.isMine && 'flex-row-reverse'
                    )}>
                      <span className="text-foreground text-sm">{msg.senderName}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className={cn(
                      'text-foreground inline-block px-3 py-2 border-2 border-border-dark text-sm',
                      msg.isMine
                        ? 'bg-primary/10 rounded-l-lg rounded-br-lg'
                        : 'bg-card rounded-r-lg rounded-bl-lg'
                    )}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              </PixelCard>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              메시지가 없습니다
            </div>
          )}

          {/* Reply Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="답장 입력..."
              className="flex-1 px-4 py-3 bg-card border-4 border-border-dark shadow-[2px_2px_0_hsl(var(--pixel-shadow))] outline-none focus:border-primary"
              disabled={sendingReply}
            />
            <button
              onClick={handleSendReply}
              disabled={sendingReply || !replyText.trim()}
              className={cn(
                'w-12 h-12 border-4 flex items-center justify-center',
                sendingReply || !replyText.trim()
                  ? 'bg-muted border-border-dark cursor-not-allowed'
                  : 'bg-primary border-primary-dark shadow-[4px_4px_0_hsl(var(--primary-dark))]'
              )}
            >
              <Send size={20} className={cn(
                sendingReply || !replyText.trim() ? 'text-muted-foreground' : 'text-primary-foreground'
              )} />
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
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-primary-foreground" />
        </button>
        <h1 className="text-sm text-primary-foreground flex items-center gap-2">
          📬 쪽지함
          {totalUnreadCount > 0 && (
            <span className={cn(
              "px-2 py-0.5 text-accent-foreground text-xs border",
              "bg-accent border-accent-dark"
            )}>
              {totalUnreadCount}
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
            ...(isAdmin ? [{ key: 'join-requests', label: '입단신청', icon: '📋', badge: joinRequests.length }] : []),
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
        {activeTab === 'join-requests' && isAdmin ? (
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
          /* Conversations List */
          <div className="space-y-2">
            {loadingConversations ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 border-4 border-border-dark bg-card animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted border-2 border-border-dark flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const messageType = getMessageType(conv.latestMessage, conv.teamId);
                const isBroadcast = conv.latestMessage.startsWith('[📢 팀 공지]');

                return (
                  <button
                    key={conv.otherUserId}
                    onClick={() => openConversation(conv)}
                    className={cn(
                      'w-full text-left p-3 border-4 transition-all',
                      conv.unreadCount === 0
                        ? 'bg-card border-border-dark shadow-[3px_3px_0_hsl(var(--pixel-shadow))]'
                        : isBroadcast
                          ? 'bg-destructive/10 border-destructive shadow-[3px_3px_0_hsl(var(--destructive))] animate-pulse'
                          : 'bg-accent/10 border-accent shadow-[3px_3px_0_hsl(var(--accent-dark))]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                        {conv.otherUserAvatar ? (
                          <img
                            src={conv.otherUserAvatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'truncate font-pixel text-xs',
                              conv.unreadCount > 0 && 'text-foreground font-bold'
                            )}>
                              {conv.otherUserNickname}
                            </span>
                            <MessageBadge type={messageType} />
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDate(conv.latestMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.latestMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="flex-shrink-0 mt-1">
                          <span className={cn(
                            "px-1.5 py-0.5 text-[10px] font-pixel border",
                            isBroadcast
                              ? "bg-destructive text-white border-destructive animate-ping"
                              : "bg-accent text-accent-foreground border-accent-dark"
                          )}>
                            {conv.unreadCount}
                          </span>
                        </div>
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

        {/* New Message Button - 개인 쪽지 탭에서만 */}
        {activeTab === 'personal' && (
          <PixelButton
            variant="accent"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setShowRecipientPicker(true)}
          >
            <span>✉️</span>
            <span>새 쪽지 보내기</span>
          </PixelButton>
        )}
      </div>

      {/* Recipient Picker */}
      <RecipientPicker
        isOpen={showRecipientPicker}
        onClose={() => setShowRecipientPicker(false)}
        onSelect={(selected) => {
          setDirectMessageRecipient({
            id: selected.id,
            name: `${selected.nickname}#${selected.tag}`,
            avatar: selected.avatarUrl,
          });
          setShowRecipientPicker(false);
          setShowDirectMessage(true);
        }}
      />

      {/* Direct Message Modal */}
      {showDirectMessage && (
        <DirectMessageModal
          isOpen={showDirectMessage}
          onClose={() => {
            setShowDirectMessage(false);
            setDirectMessageRecipient(null);
            fetchConversations();
          }}
          recipientId={directMessageRecipient?.id || ''}
          recipientName={directMessageRecipient?.name || ''}
          recipientAvatar={directMessageRecipient?.avatar}
          teamId={directMessageRecipient?.teamId}
          teamName={directMessageRecipient?.teamName}
          isTeamInquiry={directMessageRecipient?.isTeamInquiry}
        />
      )}
    </div>
  );
}
