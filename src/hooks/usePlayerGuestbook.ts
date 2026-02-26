import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GuestbookEntry {
  id: string;
  authorNickname: string;
  message: string;
  date: string;
  likes: number;
  isLikedByMe: boolean;
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
      .select('id, message, created_at, author_user_id')
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(10);

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

    // Fetch like counts
    const entryIds = rawEntries.map(e => e.id);
    const { data: likeCounts } = await supabase
      .from('player_guestbook_likes')
      .select('entry_id')
      .in('entry_id', entryIds);

    const likeCountMap = new Map<string, number>();
    (likeCounts || []).forEach(l => {
      likeCountMap.set(l.entry_id, (likeCountMap.get(l.entry_id) || 0) + 1);
    });

    // Fetch my likes
    let myLikes = new Set<string>();
    if (user) {
      const { data: myLikeData } = await supabase
        .from('player_guestbook_likes')
        .select('entry_id')
        .eq('user_id', user.id)
        .in('entry_id', entryIds);
      myLikes = new Set((myLikeData || []).map(l => l.entry_id));
    }

    setEntries(rawEntries.map(e => ({
      id: e.id,
      authorNickname: profileMap.get(e.author_user_id) || '풋살러',
      message: e.message,
      date: new Date(e.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', ''),
      likes: likeCountMap.get(e.id) || 0,
      isLikedByMe: myLikes.has(e.id),
    })));
    setLoading(false);
  }, [targetUserId, user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const submitEntry = async (message: string) => {
    if (!user || !targetUserId || !message.trim()) return;
    await supabase.from('player_guestbook_entries').insert({
      target_user_id: targetUserId,
      author_user_id: user.id,
      message: message.trim(),
    });
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

  return { entries, loading, submitEntry, toggleLike };
}
