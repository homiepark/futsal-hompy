import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { supabase } from '@/integrations/supabase/client';

interface TeamMiniRoomProps {
  userId: string;
}

interface UserTeam {
  id: string;
  name: string;
  emblem: string;
  level: string;
  introduction: string | null;
  banner_url: string | null;
}

const levelVariants = {
  'S': 'level-s',
  'A': 'level-a',
  'B': 'level-b',
  'C': 'level-c',
} as const;

// Animated text display component
function AnimatedShoutout({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    let index = 0;
    setDisplayText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={cn(isComplete && "animate-pulse")}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
}

export function TeamMiniRoom({ userId }: TeamMiniRoomProps) {
  const navigate = useNavigate();
  const [team, setTeam] = useState<UserTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState({ today: 0, total: 0 });

  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        // Fetch team where user is admin
        const { data: teams, error } = await supabase
          .from('teams')
          .select('id, name, emblem, level, introduction, banner_url')
          .eq('admin_user_id', userId)
          .limit(1);

        if (error) throw error;

        if (teams && teams.length > 0) {
          setTeam(teams[0]);
          
          // Mock visit counts (would be real data in production)
          setVisitCount({
            today: Math.floor(Math.random() * 50) + 10,
            total: Math.floor(Math.random() * 500) + 100,
          });
        }
      } catch (error) {
        console.error('Error fetching user team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeam();
  }, [userId]);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div 
          className="bg-card border-4 border-primary p-4 animate-pulse"
          style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
        >
          <div className="h-24 bg-muted" />
        </div>
      </div>
    );
  }

  if (!team) {
    return null; // Don't show if user has no team
  }

  const shoutout = team.introduction?.slice(0, 50) || "우리 팀에 오신 것을 환영합니다! ⚽";

  return (
    <div className="px-4 py-3">
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary border-4 border-primary"
        style={{ boxShadow: '5px 5px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 bg-accent" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-accent" />
        <div className="absolute bottom-0 left-0 w-3 h-3 bg-accent" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent" />

        {/* Header with "Mini Room" title */}
        <div className="bg-gradient-to-r from-primary to-primary/80 border-b-3 border-primary-dark px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🏠</span>
            <h2 className="font-pixel text-[10px] text-primary-foreground">나의 팀 미니홈</h2>
          </div>
          
          {/* Visit Counters - Cyworld style */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-dark/50 border border-primary-foreground/30">
              <Eye size={10} className="text-primary-foreground/80" />
              <span className="font-pixel text-[7px] text-primary-foreground/80">TODAY</span>
              <span className="font-pixel text-[9px] text-accent font-bold">{visitCount.today}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-dark/50 border border-primary-foreground/30">
              <span className="font-pixel text-[7px] text-primary-foreground/80">TOTAL</span>
              <span className="font-pixel text-[9px] text-primary-foreground font-bold">{visitCount.total}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="flex gap-4">
            {/* Team Emblem */}
            <button
              onClick={() => navigate(`/team/${team.id}`)}
              className="flex-shrink-0"
            >
              <div 
                className="w-20 h-20 bg-field-green border-4 border-primary-dark flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
              >
                <span className="text-4xl">{team.emblem}</span>
              </div>
            </button>

            {/* Team Info */}
            <div className="flex-1 min-w-0">
              {/* Team Name & Level */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => navigate(`/team/${team.id}`)}
                  className="font-pixel text-sm text-foreground font-bold hover:text-primary transition-colors"
                >
                  {team.name}
                </button>
                <PixelBadge 
                  variant={levelVariants[team.level as keyof typeof levelVariants]} 
                  className="text-[8px]"
                >
                  Lv.{team.level}
                </PixelBadge>
              </div>

              {/* Animated Shout-out Message Bubble */}
              <div 
                className="relative bg-secondary border-3 border-border-dark p-3"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {/* Speech bubble pointer */}
                <div 
                  className="absolute -left-2 top-3 w-0 h-0"
                  style={{
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '8px solid hsl(var(--border-dark))',
                  }}
                />
                <div 
                  className="absolute -left-[5px] top-3 w-0 h-0"
                  style={{
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderRight: '7px solid hsl(var(--secondary))',
                  }}
                />
                
                <div className="flex items-start gap-2">
                  <MessageCircle size={12} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="font-pixel text-[9px] text-foreground leading-relaxed">
                    <AnimatedShoutout text={shoutout} />
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate(`/team/${team.id}`)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground font-pixel text-[8px] border-2 border-primary-dark hover:brightness-110 transition-all"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
                >
                  🏠 팀 홈 가기
                </button>
                <button
                  onClick={() => navigate('/matchmaking')}
                  className="px-3 py-1.5 bg-accent text-accent-foreground font-pixel text-[8px] border-2 border-accent-dark hover:brightness-110 transition-all"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
                >
                  ⚔️ 매칭 찾기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative pattern */}
        <div className="h-2 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-t-2 border-border" />
      </div>
    </div>
  );
}
