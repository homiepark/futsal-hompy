import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GuestbookReply {
  id: string;
  authorUserId: string;
  authorNickname: string;
  message: string;
  date: string;
}

export interface GuestbookEntry {
  id: string;
  authorUserId: string;
  authorNickname: string;
  message: string;
  date: string;
  likes: number;
  isLikedByMe: boolean;
  replies: GuestbookReply[];
}

export function usePlayerGuestbook(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);

    const { data: rawEntries } = await supabase
      .from('player_guestbook_entries')
      .select('id, message, created_at, author_user_id, parent_id')
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: true });

    if (!rawEntries || rawEntries.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // Fetch author profiles
    const authorIds = [...new Set(rawEntries.map(e => e.author_user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, nickname, nickname_tag')
      .in('user_id', authorIds);

    const profileMap = new Map(
      (profiles || []).map(p => [p.user_id, `${p.nickname}${p.nickname_tag ? '#' + p.nickname_tag : ''}`])
    );

    // Fetch like counts (only for root entries)
    const rootIds = rawEntries.filter(e => !(e as any).parent_id).map(e => e.id);
    const likeCountMap = new Map<string, number>();
    let myLikes = new Set<string>();

    if (rootIds.length > 0) {
      const { data: likeCounts } = await supabase
        .from('player_guestbook_likes')
        .select('entry_id')
        .in('entry_id', rootIds);
      (likeCounts || []).forEach(l => {
        likeCountMap.set(l.entry_id, (likeCountMap.get(l.entry_id) || 0) + 1);
      });

      if (user) {
        const { data: myLikeData } = await supabase
          .from('player_guestbook_likes')
          .select('entry_id')
          .eq('user_id', user.id)
          .in('entry_id', rootIds);
        myLikes = new Set((myLikeData || []).map(l => l.entry_id));
      }
    }

    const formatDate = (created_at: string) => {
      const d = new Date(created_at);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    };

    // Separate root entries and replies
    const rootEntries = rawEntries.filter(e => !(e as any).parent_id);
    const replyEntries = rawEntries.filter(e => (e as any).parent_id);

    const replyMap = new Map<string, GuestbookReply[]>();
    replyEntries.forEach(r => {
      const parentId = (r as any).parent_id;
      const existing = replyMap.get(parentId) || [];
      existing.push({
        id: r.id,
        authorUserId: r.author_user_id,
        authorNickname: profileMap.get(r.author_user_id) || '풋살러',
        message: r.message,
        date: formatDate(r.created_at),
      });
      replyMap.set(parentId, existing);
    });

    // Build entries with replies, newest first for display
    const mapped: GuestbookEntry[] = rootEntries.reverse().map(e => ({
      id: e.id,
      authorUserId: e.author_user_id,
      authorNickname: profileMap.get(e.author_user_id) || '풋살러',
      message: e.message,
      date: formatDate(e.created_at),
      likes: likeCountMap.get(e.id) || 0,
      isLikedByMe: myLikes.has(e.id),
      replies: replyMap.get(e.id) || [],
    }));

    setEntries(mapped);
    setLoading(false);
  }, [targetUserId, user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const submitEntry = async (message: string, parentId?: string) => {
    if (!user || !targetUserId || !message.trim()) return;
    const insertData: any = {
      target_user_id: targetUserId,
      author_user_id: user.id,
      message: message.trim(),
    };
    if (parentId) insertData.parent_id = parentId;
    await supabase.from('player_guestbook_entries').insert(insertData);
    await fetchEntries();
  };

  const toggleLike = async (entryId: string) => {
    if (!user) return;
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    if (entry.isLikedByMe) {
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
    await fetchEntries();
  };

  const deleteEntry = async (entryId: string) => {
    if (!user) return;
    await supabase.from('player_guestbook_entries').delete().eq('id', entryId);
    await fetchEntries();
  };

  const updateEntry = async (entryId: string, newMessage: string) => {
    if (!user || !newMessage.trim()) return;
    await supabase
      .from('player_guestbook_entries')
      .update({ message: newMessage.trim() })
      .eq('id', entryId);
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, message: newMessage.trim() } : e));
  };

  return { entries, loading, submitEntry, toggleLike, deleteEntry, updateEntry };
}
