import { useState, useEffect } from 'react';
import { X, Calendar, Trophy, Send, Heart, Pencil, Check, Trash2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerGuestbook } from '@/hooks/usePlayerGuestbook';
import { useAuth } from '@/contexts/AuthContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DirectMessageModal } from '@/components/messages/DirectMessageModal';

interface PlayerStats {
  id: string;
  userId?: string;
  nickname: string;
  realName?: string;
  avatarUrl?: string;
  position: 'pivo' | 'ala' | 'fixo' | 'goleiro';
  positions?: string[];
  yearsOfExperience: number;
  monthsOfExperience?: number;
  isAdmin?: boolean;
  role?: string;
  joinDate?: string;
  bio?: string;
  staffCareerYears?: number | null;
  staffCareerNote?: string | null;
}

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerStats | null;
}

const positionInfo = {
  pivo: { label: '피보', emoji: '⚡', color: 'bg-accent/20 border-accent text-accent', fullName: 'Pivô (공격수)' },
  ala: { label: '아라', emoji: '💨', color: 'bg-primary/20 border-primary text-primary', fullName: 'Ala (측면)' },
  fixo: { label: '픽소', emoji: '🛡️', color: 'bg-blue-500/20 border-blue-500 text-blue-600', fullName: 'Fixo (수비수)' },
  goleiro: { label: '골레이로', emoji: '🧤', color: 'bg-green-500/20 border-green-500 text-green-600', fullName: 'Goleiro (골키퍼)' },
};

export function PlayerStatsModal({ isOpen, onClose, player }: PlayerStatsModalProps) {
  useBodyScrollLock(isOpen);
  const [guestbookMessage, setGuestbookMessage] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [displayBio, setDisplayBio] = useState('');
  const { user } = useAuth();
  const { entries: guestbookEntries, submitEntry, toggleLike, deleteEntry, updateEntry } = usePlayerGuestbook(player?.userId);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryText, setEditingEntryText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showDM, setShowDM] = useState(false);

  const isOwnProfile = !!user && !!player?.userId && user.id === player.userId;

  // Load bio from profile
  useEffect(() => {
    if (!player?.userId) return;
    const loadBio = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('bio')
        .eq('user_id', player.userId!)
        .single();
      const bio = (data as any)?.bio || '';
      setDisplayBio(bio);
      setBioText(bio);
    };
    loadBio();
  }, [player?.userId]);

  if (!isOpen || !player) return null;

  const info = positionInfo[player.position];

  const handleSubmitGuestbook = async () => {
    if (!guestbookMessage.trim()) return;
    await submitEntry(guestbookMessage);
    setGuestbookMessage('');
  };

  const handleSaveBio = async () => {
    if (!user || !player.userId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bioText.trim() } as any)
      .eq('user_id', player.userId);

    if (error) {
      toast.error('저장에 실패했습니다');
      return;
    }
    setDisplayBio(bioText.trim());
    setIsEditingBio(false);
    toast.success('한줄 소개가 저장되었습니다!');
  };

  // Format experience string
  const expStr = player.yearsOfExperience > 0
    ? `${player.yearsOfExperience}년${player.monthsOfExperience ? ` ${player.monthsOfExperience}개월` : ''}`
    : player.monthsOfExperience
      ? `${player.monthsOfExperience}개월`
      : '입문';

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-12 pb-24 px-4">
      {/* Backdrop - no close on click */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm kairo-panel animate-in fade-in zoom-in-95 duration-200 max-h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="kairo-panel-header justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>선수 카드</span>
          </div>
          <button
            onClick={() => {
              setReplyingToId(null);
              setReplyText('');
              setEditingEntryId(null);
              setShowDM(false);
              onClose();
            }}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 pixel-scrollbar">
          {/* Player Header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 bg-secondary border-4 border-border-dark overflow-hidden">
                {player.avatarUrl ? (
                  <img
                    src={player.avatarUrl}
                    alt={player.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-muted">
                    👤
                  </div>
                )}
              </div>
              {player.isAdmin && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-accent border-2 border-accent-dark flex items-center justify-center text-sm">
                  👑
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 mb-1">
                <h3 className="font-pixel text-sm text-foreground truncate">
                  {player.nickname}
                </h3>
                {player.realName && (
                  <span className="font-body text-xs text-muted-foreground shrink-0">
                    ({player.realName})
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {(player.positions?.length ? player.positions : [player.position]).map((pos, i) => {
                  const posInfo = positionInfo[pos as keyof typeof positionInfo];
                  if (!posInfo) return null;
                  return (
                    <div key={pos} className={cn(
                      'inline-flex items-center gap-1 px-2 py-1',
                      'border-2 text-[9px] font-pixel',
                      posInfo.color
                    )}>
                      {i === 0 && <span className="text-[11px]">★</span>}
                      <span>{posInfo.emoji}</span>
                      <span>{posInfo.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="font-pixel text-[11px] text-muted-foreground">
                {info.fullName}
              </p>
            </div>
          </div>

          {/* Staff Role Badge (감독/코치) */}
          {(player.role === 'manager' || player.role === 'coach') && (
            <div className="bg-primary/10 border-2 border-primary/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{player.role === 'manager' ? '👔' : '📋'}</span>
                <span className="font-pixel text-[11px] text-primary">
                  {player.role === 'manager' ? '감독' : '코치'}
                </span>
              </div>
              <div className="font-pixel text-[11px] text-muted-foreground">
                {player.staffCareerYears ? (
                  <span>지도 경력 {player.staffCareerYears}년</span>
                ) : (
                  <span>지도 경력 미입력</span>
                )}
                {player.staffCareerNote && (
                  <span className="ml-1 text-foreground/70">· {player.staffCareerNote}</span>
                )}
              </div>
            </div>
          )}

          {/* Personal Bio Section */}
          <div className="kairo-section">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-pixel text-[11px] text-muted-foreground uppercase">💬 한줄 소개</p>
              {isOwnProfile && !isEditingBio && (
                <button
                  onClick={() => { setBioText(displayBio); setIsEditingBio(true); }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil size={10} />
                </button>
              )}
            </div>
            {isEditingBio ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="한줄 소개를 입력하세요..."
                  className="w-full px-2 py-1.5 bg-input border-2 border-border-dark font-pixel text-[11px] focus:outline-none focus:border-primary"
                  maxLength={50}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveBio()}
                />
                <div className="flex gap-1.5 justify-end">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-2 py-1 border-2 border-border-dark bg-muted font-pixel text-[11px] text-muted-foreground"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="px-2 py-1 border-2 border-primary-dark bg-primary font-pixel text-[11px] text-primary-foreground flex items-center gap-1"
                  >
                    <Check size={8} />
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="bg-muted/50 border-2 border-border-dark p-2"
                style={{ boxShadow: 'inset 1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
              >
                <p className="font-pixel text-[11px] text-foreground leading-relaxed">
                  {displayBio || (isOwnProfile ? '한줄 소개를 작성해보세요! ✏️' : '아직 자기소개가 없습니다 ✨')}
                </p>
              </div>
            )}
          </div>

          {/* Stats Grid - Simplified: Only Join Date & Career */}
          <div className="grid grid-cols-2 gap-2">
            {/* Join Date */}
            <div className="kairo-section flex items-center gap-2">
              <Calendar size={14} className="text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-pixel text-[11px] text-muted-foreground uppercase">가입일</p>
                <p className="font-pixel text-[11px] text-foreground truncate">
                  {player.joinDate || '-'}
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="kairo-section flex items-center gap-2">
              <Trophy size={14} className="text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-pixel text-[11px] text-muted-foreground uppercase">경력</p>
                <p className="font-pixel text-[11px] text-foreground">
                  {expStr}
                </p>
              </div>
            </div>
          </div>

          {/* Player Guestbook Section */}
          <div className="kairo-section">
            <p className="font-pixel text-[11px] text-muted-foreground uppercase mb-2">📝 선수 방명록</p>

            {/* Guestbook Input */}
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 px-3 py-2 bg-input border-2 border-border-dark font-pixel text-[11px] placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder="응원 메시지를 남겨주세요..."
                value={guestbookMessage}
                onChange={(e) => setGuestbookMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuestbook()}
                maxLength={50}
              />
              <button
                onClick={handleSubmitGuestbook}
                className="px-3 py-2 bg-primary border-2 border-primary-dark hover:brightness-110 transition-all"
                style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
              >
                <Send size={14} className="text-primary-foreground" />
              </button>
            </div>

            {/* Guestbook Entries */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pixel-scrollbar">
              {guestbookEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-muted/50 p-3 border-2 border-border-dark"
                  style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-pixel text-[11px] text-primary">{entry.authorNickname}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[11px] text-muted-foreground">{entry.date}</span>
                      {user?.id === entry.authorUserId && (
                        <>
                          <button
                            onClick={() => { setEditingEntryId(entry.id); setEditingEntryText(entry.message); }}
                            className="text-muted-foreground hover:text-primary transition-colors p-1"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingEntryId === entry.id ? (
                    <div className="flex gap-1.5 mb-1">
                      <input
                        value={editingEntryText}
                        onChange={(e) => setEditingEntryText(e.target.value)}
                        className="flex-1 px-2 py-1 bg-input border-2 border-border-dark font-pixel text-[11px] focus:outline-none focus:border-primary"
                        maxLength={50}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { updateEntry(entry.id, editingEntryText); setEditingEntryId(null); }
                        }}
                      />
                      <button onClick={() => { updateEntry(entry.id, editingEntryText); setEditingEntryId(null); }} className="text-primary p-1"><Check size={14} /></button>
                      <button onClick={() => setEditingEntryId(null)} className="text-muted-foreground p-1"><X size={14} /></button>
                    </div>
                  ) : (
                    <p className="font-pixel text-[11px] text-foreground mb-1.5 leading-relaxed">{entry.message}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(entry.id)}
                      className={cn(
                        "flex items-center gap-1 p-1 hover:scale-110 transition-transform",
                        entry.isLikedByMe ? "text-accent" : "text-muted-foreground"
                      )}
                    >
                      <Heart size={14} fill={entry.isLikedByMe ? "currentColor" : "none"} />
                      <span className="font-pixel text-[11px]">{entry.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyingToId(replyingToId === entry.id ? null : entry.id)}
                      className={cn(
                        "flex items-center gap-1 p-1 transition-colors",
                        replyingToId === entry.id ? "text-primary" : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <MessageCircle size={14} />
                      <span className="font-pixel text-[11px]">{entry.replies.length ? entry.replies.length : '댓글'}</span>
                    </button>
                  </div>

                  {/* Replies */}
                  {entry.replies.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 border-border space-y-1.5">
                      {entry.replies.map(reply => (
                        <div key={reply.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-[11px] text-primary">{reply.authorNickname}</span>
                            <span className="font-pixel text-[11px] text-muted-foreground">{reply.date}</span>
                            {user?.id === reply.authorUserId && (
                              <button
                                onClick={() => deleteEntry(reply.id)}
                                className="text-muted-foreground hover:text-destructive p-0.5"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                          <p className="font-pixel text-[11px] text-foreground leading-tight">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingToId === entry.id && user && (
                    <div className="flex gap-1.5 mt-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="댓글 입력..."
                        className="flex-1 px-2 py-1.5 bg-input border-2 border-border-dark font-pixel text-[11px] focus:outline-none focus:border-primary"
                        maxLength={100}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && replyText.trim()) {
                            submitEntry(replyText, entry.id);
                            setReplyText('');
                            setReplyingToId(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (replyText.trim()) {
                            submitEntry(replyText, entry.id);
                            setReplyText('');
                            setReplyingToId(null);
                          }
                        }}
                        className="text-primary p-1"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {guestbookEntries.length === 0 && (
                <p className="font-pixel text-[11px] text-muted-foreground text-center py-3">
                  아직 방명록이 없어요. 첫 번째 응원을 남겨보세요! 💪
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setReplyingToId(null);
                setReplyText('');
                setEditingEntryId(null);
                setShowDM(false);
                onClose();
              }}
              className="flex-1 py-2 bg-muted border-3 border-border-dark font-pixel text-[11px] text-foreground hover:bg-secondary transition-colors"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              닫기
            </button>
            <button
              onClick={() => setShowDM(true)}
              disabled={!user || isOwnProfile}
              className="flex-1 py-2 bg-primary border-3 border-primary-dark font-pixel text-[11px] text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
              style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
            >
              쪽지 보내기
            </button>
          </div>
        </div>

        {/* Direct Message Modal */}
        {player?.userId && (
          <DirectMessageModal
            isOpen={showDM}
            onClose={() => setShowDM(false)}
            recipientId={player.userId}
            recipientName={player.nickname}
            recipientAvatar={player.avatarUrl}
          />
        )}
      </div>
    </div>
  );
}
