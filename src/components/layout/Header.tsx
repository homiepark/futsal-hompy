import { Bell, Settings } from 'lucide-react';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { MailIcon } from '@/components/layout/MailIcon';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function GoalIcon() {
  return (
    <div className="w-8 h-8 relative flex items-center justify-center">
      {/* Goal frame */}
      <div className="absolute inset-0 border-2 border-foreground rounded-t-sm" 
           style={{ 
             borderBottom: 'none',
             background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, hsl(var(--foreground) / 0.15) 3px, hsl(var(--foreground) / 0.15) 4px), repeating-linear-gradient(0deg, transparent 0px, transparent 3px, hsl(var(--foreground) / 0.15) 3px, hsl(var(--foreground) / 0.15) 4px)'
           }} 
      />
      {/* Soccer ball */}
      <span className="text-lg relative top-0.5">⚽</span>
    </div>
  );
}

export function Header() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasBroadcast, setHasBroadcast] = useState(false);

  useEffect(() => {
    if (!user) { setUnreadCount(0); setHasBroadcast(false); return; }

    const fetchCounts = async () => {
      const { count: msgCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      const { count: invCount } = await supabase
        .from('team_invitations')
        .select('id', { count: 'exact', head: true })
        .eq('invited_user_id', user.id)
        .eq('status', 'pending');

      const total = (msgCount || 0) + (invCount || 0);
      setUnreadCount(total);
      setHasBroadcast(total > 0);
    };

    fetchCounts();

    const msgChannel = supabase
      .channel('header-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchCounts())
      .subscribe();

    const invChannel = supabase
      .channel('header-invitations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_invitations', filter: `invited_user_id=eq.${user.id}` }, () => fetchCounts())
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(invChannel);
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-card border-b-4 border-border-dark shadow-pixel">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <GoalIcon />
          <h1 className="text-base text-foreground" style={{ fontFamily: 'NeoDunggeunmo, monospace' }}>
            우리의풋살
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Mail Icon with broadcast blinking */}
          <MailIcon 
            unreadCount={unreadCount} 
            hasBroadcast={hasBroadcast}
          />
          <button className="relative">
            <PixelIcon icon={Bell} size="sm" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent border border-accent-dark text-[11px] font-pixel text-accent-foreground flex items-center justify-center">
              3
            </span>
          </button>
          <PixelIcon icon={Settings} size="sm" />
        </div>
      </div>
    </header>
  );
}
