import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePendingJoinRequests() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    fetchPendingCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('pending-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_join_requests',
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPendingCount = async () => {
    if (!user) return;

    try {
      // Get teams where user is admin
      const { data: adminTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('admin_user_id', user.id);

      if (!adminTeams || adminTeams.length === 0) {
        setPendingCount(0);
        setLoading(false);
        return;
      }

      const teamIds = adminTeams.map(t => t.id);

      // Count pending requests for those teams
      const { count, error } = await supabase
        .from('team_join_requests')
        .select('*', { count: 'exact', head: true })
        .in('team_id', teamIds)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return { pendingCount, loading, refetch: fetchPendingCount };
}
