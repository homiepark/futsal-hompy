import { useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { InvitationCard } from '@/components/messages/InvitationCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
    content: '[팀 공지] 이번 주 토요일 훈련 장소가 변경되었습니다.',
    isRead: false,
    createdAt: '1시간 전',
    teamId: 'team1',
    teamName: 'FC 불꽃',
  },
  {
    id: '3',
    senderId: 'user2',
    senderName: '박매칭',
    content: '매칭 문의드립니다. 저희 팀과 한 번 경기하실래요?',
    isRead: true,
    createdAt: '어제',
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

export default function Messages() {
  const [activeTab, setActiveTab] = useState<'all' | 'team' | 'personal' | 'invites'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  useEffect(() => {
    if (activeTab === 'invites') {
      fetchInvitations();
    }
  }, [activeTab]);

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
        // Fetch team details
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

  const filteredMessages = mockMessages.filter(msg => {
    if (activeTab === 'team') return !!msg.teamId;
    if (activeTab === 'personal') return !msg.teamId;
    return true;
  });

  const unreadCount = mockMessages.filter(m => !m.isRead).length;

  if (selectedMessage) {
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
                  <span className="inline-block px-2 py-0.5 bg-accent/20 text-accent text-xs mb-2 border border-accent">
                    {selectedMessage.teamName} 팀 공지
                  </span>
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
            <span className="px-2 py-0.5 bg-accent border border-accent-dark text-accent-foreground text-xs">
              {unreadCount}
            </span>
          )}
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { key: 'all', label: '전체', icon: '📬' },
            { key: 'team', label: '팀', icon: '📢' },
            { key: 'personal', label: '개인', icon: '💬' },
            { key: 'invites', label: '초대', icon: '🎫', badge: invitations.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex-1 py-2 border-3 text-[10px] transition-all flex items-center justify-center gap-1 font-pixel',
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
        {activeTab === 'invites' ? (
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
              filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={cn(
                    'w-full text-left p-3 border-4 transition-all',
                    message.isRead
                      ? 'bg-card border-border-dark shadow-[3px_3px_0_hsl(var(--pixel-shadow))]'
                      : 'bg-accent/10 border-accent shadow-[3px_3px_0_hsl(var(--accent-dark))]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center text-lg flex-shrink-0">
                      {message.senderAvatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          'truncate',
                          !message.isRead && 'text-foreground'
                        )}>
                          {message.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {message.createdAt}
                        </span>
                      </div>
                      {message.teamName && (
                        <span className="inline-block px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] mt-1 border border-accent">
                          {message.teamName}
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {message.content}
                      </p>
                    </div>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              ))
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
    </div>
  );
}
