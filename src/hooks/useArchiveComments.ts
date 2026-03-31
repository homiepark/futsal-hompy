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
  avatar_url?: string;
  parent_id?: string | null;
  replies?: ArchiveComment[];
}

export function useArchiveComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ArchiveComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('archive_post_comments')
      .select('id, user_id, content, created_at, parent_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) return;

    // Fetch nicknames and avatars for comment authors
    const userIds = [...new Set((data || []).map(c => c.user_id))];
    let profileMap: Record<string, { nickname: string; avatar_url: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', userIds);
      profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = { nickname: p.nickname, avatar_url: p.avatar_url };
        return acc;
      }, {} as Record<string, { nickname: string; avatar_url: string | null }>);
    }

    const allComments = (data || []).map(c => ({
      ...c,
      parent_id: (c as any).parent_id || null,
      nickname: profileMap[c.user_id]?.nickname || '풋살러',
      avatar_url: profileMap[c.user_id]?.avatar_url || undefined,
      replies: [] as ArchiveComment[],
    }));

    // Build tree: separate root comments and replies
    const rootComments: ArchiveComment[] = [];
    const replyMap = new Map<string, ArchiveComment[]>();

    allComments.forEach(c => {
      if (c.parent_id) {
        const existing = replyMap.get(c.parent_id) || [];
        existing.push(c);
        replyMap.set(c.parent_id, existing);
      } else {
        rootComments.push(c);
      }
    });

    // Attach replies to parent comments
    rootComments.forEach(c => {
      c.replies = replyMap.get(c.id) || [];
    });

    setComments(rootComments);
    setCommentsCount(allComments.length);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (!content.trim()) return;
    setLoading(true);

    try {
      const insertData: any = { post_id: postId, user_id: user.id, content: content.trim() };
      if (parentId) insertData.parent_id = parentId;

      const { error } = await supabase
        .from('archive_post_comments')
        .insert(insertData);

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
