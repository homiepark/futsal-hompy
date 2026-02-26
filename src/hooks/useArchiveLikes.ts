import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useArchiveLikes(postId: string) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLikes = useCallback(async () => {
    const { count } = await supabase
      .from('archive_post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    setLikesCount(count ?? 0);

    if (user) {
      const { data } = await supabase
        .from('archive_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsLiked(!!data);
    }
  }, [postId, user]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const toggleLike = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      if (isLiked) {
        await supabase
          .from('archive_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('archive_post_likes')
          .insert({ post_id: postId, user_id: user.id });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch {
      toast.error('오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return { likesCount, isLiked, toggleLike, loading };
}
