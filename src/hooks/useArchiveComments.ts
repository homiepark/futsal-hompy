import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ArchiveComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  nickname?: string;
}

export function useArchiveComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ArchiveComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('archive_post_comments')
      .select('id, user_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) return;

    // Fetch nicknames for comment authors
    const userIds = [...new Set((data || []).map(c => c.user_id))];
    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', userIds);
      profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p.nickname;
        return acc;
      }, {} as Record<string, string>);
    }

    const enriched = (data || []).map(c => ({
      ...c,
      nickname: profileMap[c.user_id] || '풋살러',
    }));
    setComments(enriched);
    setCommentsCount(enriched.length);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (!content.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('archive_post_comments')
        .insert({ post_id: postId, user_id: user.id, content: content.trim() });

      if (error) throw error;
      await fetchComments();
    } catch {
      toast.error('댓글 작성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await supabase.from('archive_post_comments').delete().eq('id', commentId);
      await fetchComments();
    } catch {
      toast.error('댓글 삭제에 실패했습니다');
    }
  };

  return { comments, commentsCount, addComment, deleteComment, loading };
}
