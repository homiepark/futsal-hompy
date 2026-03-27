import { useState, useEffect, useCallback } from 'react';
import { Send, Heart, Loader2 } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface GuestbookEntry {
  id: string;
  author: string;
  authorUserId: string;
  message: string;
  date: string;
  likes: number;
  isLiked: boolean;
}

interface GuestbookProps {
  teamId?: string;
}

export function Guestbook({ teamId }: GuestbookProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);

    // Use player_guestbook_entries with target_user_id as teamId
    const { data, error } = await supabase
      .from('player_guestbook_entries')
      .select('id, author_user_id, message, created_at')
      .eq('target_user_id', teamId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Guestbook fetch error:', error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      // Fetch author profiles
      const authorIds = [...new Set(data.map(e => e.author_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.nickname]) || []);

      // Fetch likes
      const entryIds = data.map(e => e.id);
      const { data: likes } = await supabase
        .from('player_guestbook_likes')
        .select('entry_id, user_id')
        .in('entry_id', entryIds);

      const likeCountMap = new Map<string, number>();
      const userLikeSet = new Set<string>();
      likes?.forEach(l => {
        likeCountMap.set(l.entry_id, (likeCountMap.get(l.entry_id) || 0) + 1);
        if (l.user_id === user?.id) userLikeSet.add(l.entry_id);
      });

      const mapped: GuestbookEntry[] = data.map(e => ({
        id: e.id,
        author: profileMap.get(e.author_user_id) || '익명',
        authorUserId: e.author_user_id,
        message: e.message,
        date: format(new Date(e.created_at), 'yyyy.MM.dd'),
        likes: likeCountMap.get(e.id) || 0,
        isLiked: userLikeSet.has(e.id),
      }));

      setEntries(mapped);
    } else {
      setEntries([]);
    }

    setLoading(false);
  }, [teamId, user?.id]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (!teamId) return;

    setSending(true);
    const { error } = await supabase
      .from('player_guestbook_entries')
      .insert({
        target_user_id: teamId,
        author_user_id: user.id,
        message: newMessage.trim(),
      });

    if (error) {
      toast.error('방명록 작성에 실패했습니다');
      console.error('Guestbook send error:', error);
    } else {
      setNewMessage('');
      toast.success('방명록에 글을 남겼습니다!');
      fetchEntries();
    }
    setSending(false);
  };

  const handleLike = async (entryId: string, isLiked: boolean) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (isLiked) {
      await supabase
        .from('player_guestbook_likes')
        .delete()
        .eq('entry_id', entryId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('player_guestbook_likes')
        .insert({ entry_id: entryId, user_id: user.id });
    }

    // Optimistic update
    setEntries(prev => prev.map(e =>
      e.id === entryId
        ? { ...e, likes: isLiked ? e.likes - 1 : e.likes + 1, isLiked: !isLiked }
        : e
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">📝</span>
        <span>방명록</span>
      </div>

      <div className="p-2">
        {/* Message Input */}
        <div className="flex gap-1.5 mb-2">
          <input
            className="flex-1 px-2 py-1.5 bg-input border-2 border-border-dark font-pixel text-[9px] placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            placeholder={user ? '메시지를 남겨주세요...' : '로그인 후 작성 가능'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!user || sending}
            maxLength={200}
          />
          <PixelButton
            variant="primary"
            size="sm"
            className="px-2"
            onClick={handleSend}
            disabled={!user || sending || !newMessage.trim()}
          >
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          </PixelButton>
        </div>

        {/* Entries */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pixel-scrollbar">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 size={16} className="animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-4">
              <span className="text-2xl block mb-1">📝</span>
              <p className="font-pixel text-[8px] text-muted-foreground">
                아직 방명록이 없습니다. 첫 글을 남겨보세요!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-muted p-2 border-2 border-border-dark"
                style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.4)' }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-pixel text-[8px] text-primary">{entry.author}</span>
                  <span className="font-pixel text-[7px] text-muted-foreground">{entry.date}</span>
                </div>
                <p className="font-pixel text-[9px] text-foreground mb-1 leading-tight">{entry.message}</p>
                <button
                  onClick={() => handleLike(entry.id, entry.isLiked)}
                  className={`flex items-center gap-0.5 transition-transform hover:scale-110 ${
                    entry.isLiked ? 'text-accent' : 'text-muted-foreground'
                  }`}
                >
                  <Heart size={10} fill={entry.isLiked ? 'currentColor' : 'none'} />
                  <span className="font-pixel text-[7px]">{entry.likes}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
