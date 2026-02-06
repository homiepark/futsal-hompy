import { useState, useEffect } from 'react';
import { X, Star, Users, Check, XIcon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { PixelButton } from '@/components/ui/PixelButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChallengeApplication {
  id: string;
  match_post_id: string;
  applicant_team_id: string;
  message: string | null;
  status: string;
  created_at: string;
  applicant_team?: {
    id: string;
    name: string;
    emblem: string;
    level: string;
  };
}

interface ChallengeNotificationProps {
  application: ChallengeApplication;
  onClose: () => void;
  onAction: () => void;
}

const levelVariants = {
  'S': 'level-s',
  'A': 'level-a',
  'B': 'level-b',
  'C': 'level-c',
} as const;

export function ChallengeNotification({
  application,
  onClose,
  onAction,
}: ChallengeNotificationProps) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const team = application.applicant_team;

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      // Update application status
      const { error: appError } = await supabase
        .from('match_applications')
        .update({ status: 'accepted' })
        .eq('id', application.id);

      if (appError) throw appError;

      // Update match post status to matched
      const { error: postError } = await supabase
        .from('match_posts')
        .update({ status: 'matched' })
        .eq('id', application.match_post_id);

      if (postError) throw postError;

      toast.success('매칭이 성사되었습니다! 🎉', {
        description: `${team?.name}팀과의 대결이 확정되었습니다.`,
      });

      onAction();
      onClose();
      
      // Navigate to messages for direct chat
      navigate('/messages');
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('match_applications')
        .update({ status: 'rejected' })
        .eq('id', application.id);

      if (error) throw error;

      toast.info('도전 신청을 거절했습니다');
      onAction();
      onClose();
    } catch (error) {
      console.error('Error declining challenge:', error);
      toast.error('처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewProfile = () => {
    if (team) {
      navigate(`/team/${team.id}`);
    }
  };

  if (!team) return null;

  const teamLevel = (team.level || 'C') as 'S' | 'A' | 'B' | 'C';

  return (
    <div 
      className="fixed bottom-24 right-4 z-50 w-80 animate-in slide-in-from-right-5"
      style={{ 
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div 
        className="bg-card border-4 border-accent overflow-hidden"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 border-b-4 border-accent-dark px-4 py-3 flex items-center justify-between">
          <h3 className="font-pixel text-[10px] text-accent-foreground flex items-center gap-2">
            <span className="text-lg animate-pulse">⚔️</span>
            도전 신청이 왔습니다!
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-accent-dark/30 hover:bg-accent-dark/50 transition-colors border-2 border-accent-dark"
          >
            <X size={12} className="text-accent-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Challenger Team Info */}
          <div 
            className="flex items-center gap-3 p-3 bg-secondary/50 border-3 border-border-dark"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <div 
              className="w-12 h-12 bg-field-green border-3 border-primary-dark flex items-center justify-center"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <span className="text-xl">{team.emblem}</span>
            </div>
            <div className="flex-1">
              <p className="font-pixel text-[11px] text-foreground font-bold">{team.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <PixelBadge variant={levelVariants[teamLevel]} className="text-[8px]">
                  Lv.{teamLevel}
                </PixelBadge>
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-accent fill-accent" />
                  <span className="font-pixel text-[8px] text-accent">4.5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {application.message && (
            <div className="px-3 py-2 bg-primary/10 border-2 border-primary/30">
              <p className="font-pixel text-[8px] text-foreground leading-relaxed">
                "{application.message}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
          <PixelButton
            variant="primary"
            size="sm"
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 bg-primary hover:bg-primary/90 border-primary-dark"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <Check size={14} className="mr-1" />
            수락
          </PixelButton>
          <PixelButton
            variant="default"
            size="sm"
            onClick={handleDecline}
            disabled={isProcessing}
            className="flex-1 bg-destructive hover:bg-destructive/90 border-destructive text-destructive-foreground"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <XIcon size={14} className="mr-1" />
            거절
          </PixelButton>
          </div>

          <PixelButton
            variant="default"
            size="sm"
            onClick={handleViewProfile}
            className="w-full"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <User size={14} className="mr-1" />
            팀 프로필 보기
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

// Hook to subscribe to challenge notifications
export function useChallengeNotifications(teamId: string | null) {
  const [notifications, setNotifications] = useState<ChallengeApplication[]>([]);

  useEffect(() => {
    if (!teamId) return;

    // Fetch existing pending applications for this team's posts
    async function fetchPendingApplications() {
      const { data: posts } = await supabase
        .from('match_posts')
        .select('id')
        .eq('team_id', teamId)
        .eq('status', 'open');

      if (!posts || posts.length === 0) return;

      const postIds = posts.map(p => p.id);

      const { data: applications } = await supabase
        .from('match_applications')
        .select('*')
        .in('match_post_id', postIds)
        .eq('status', 'pending');

      if (applications && applications.length > 0) {
        // Fetch team info for each application
        const teamIds = [...new Set(applications.map(a => a.applicant_team_id))];
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name, emblem, level')
          .in('id', teamIds);

        const teamsMap = new Map(teams?.map(t => [t.id, t]) || []);

        const enrichedApps = applications.map(app => ({
          ...app,
          applicant_team: teamsMap.get(app.applicant_team_id),
        }));

        setNotifications(enrichedApps);
      }
    }

    fetchPendingApplications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('challenge-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_applications',
        },
        async (payload) => {
          const newApp = payload.new as ChallengeApplication;
          
          // Check if this application is for one of our posts
          const { data: post } = await supabase
            .from('match_posts')
            .select('team_id')
            .eq('id', newApp.match_post_id)
            .single();

          if (post?.team_id === teamId) {
            // Fetch team info
            const { data: team } = await supabase
              .from('teams')
              .select('id, name, emblem, level')
              .eq('id', newApp.applicant_team_id)
              .single();

            setNotifications(prev => [...prev, { ...newApp, applicant_team: team || undefined }]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, dismissNotification };
}
