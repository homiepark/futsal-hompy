import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Image, FileText, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PreferredRegion {
  region: string;
  district: string;
}

interface NewsItem {
  id: string;
  teamId: string;
  teamName: string;
  teamEmblem: string;
  teamLevel: string;
  district: string;
  type: 'photo' | 'intro' | 'match' | 'recruit';
  content: string;
  tags: string[];
  updatedAt: string;
}

interface NeighborhoodNewsProps {
  userRegions: PreferredRegion[];
  userId?: string;
  isGuest?: boolean;
  onGuestClick?: (teamName: string) => void;
}

const levelColors: Record<string, string> = {
  'S': 'bg-accent text-accent-foreground border-accent-dark',
  'A': 'bg-primary text-primary-foreground border-primary-dark',
  'B': 'bg-primary/70 text-primary-foreground border-primary-dark/70',
  'C': 'bg-primary/50 text-primary-foreground border-primary-dark/50',
};

export function NeighborhoodNews({ userRegions, userId, isGuest = false, onGuestClick }: NeighborhoodNewsProps) {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchNeighborhoodNews = async () => {
      if (!userRegions || userRegions.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data: teams, error } = await supabase
          .from('teams')
          .select('id, name, emblem, level, district, region, banner_url, photo_url, introduction, updated_at')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const matchingTeams = (teams || []).filter(team =>
          userRegions.some(r => r.region === team.region && r.district === team.district)
        );

        const items: NewsItem[] = [];

        matchingTeams.forEach(team => {
          const baseTags = [`#${team.district}`];
          
          // Add photo news
          if (team.banner_url || team.photo_url) {
            items.push({
              id: `photo-${team.id}`,
              teamId: team.id,
              teamName: team.name,
              teamEmblem: team.emblem,
              teamLevel: team.level,
              district: team.district || '',
              type: 'photo',
              content: team.banner_url || team.photo_url || '',
              tags: [...baseTags, '#새사진'],
              updatedAt: team.updated_at,
            });
          }

          // Add intro news
          if (team.introduction) {
            items.push({
              id: `intro-${team.id}`,
              teamId: team.id,
              teamName: team.name,
              teamEmblem: team.emblem,
              teamLevel: team.level,
              district: team.district || '',
              type: 'intro',
              content: team.introduction,
              tags: [...baseTags, '#팀소개'],
              updatedAt: team.updated_at,
            });
          }

        });

        // Fetch real match posts for matching teams
        const matchingTeamIds = matchingTeams.map(t => t.id);
        if (matchingTeamIds.length > 0) {
          const { data: matchPosts } = await supabase
            .from('match_posts')
            .select('id, team_id, location_name, match_date, status, created_at')
            .in('team_id', matchingTeamIds)
            .order('created_at', { ascending: false })
            .limit(10);

          if (matchPosts) {
            const teamMap = new Map(matchingTeams.map(t => [t.id, t]));
            matchPosts.forEach(post => {
              const team = teamMap.get(post.team_id);
              if (!team) return;
              const baseTags = [`#${team.district}`];
              items.push({
                id: `match-${post.id}`,
                teamId: team.id,
                teamName: team.name,
                teamEmblem: team.emblem,
                teamLevel: team.level,
                district: team.district || '',
                type: 'match',
                content: post.status === 'matched'
                  ? `${team.level}급 매치 성사!`
                  : `${post.location_name}에서 매치 상대 모집중`,
                tags: [...baseTags, post.status === 'matched' ? `#${team.level}급_매치성사` : '#매치모집'],
                updatedAt: post.created_at,
              });
            });
          }

          // Fetch real team notices for matching teams
          const { data: notices } = await supabase
            .from('team_notices')
            .select('id, team_id, content, created_at')
            .in('team_id', matchingTeamIds)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10);

          if (notices) {
            const teamMap = new Map(matchingTeams.map(t => [t.id, t]));
            notices.forEach(notice => {
              const team = teamMap.get(notice.team_id);
              if (!team) return;
              const baseTags = [`#${team.district}`];
              items.push({
                id: `notice-${notice.id}`,
                teamId: team.id,
                teamName: team.name,
                teamEmblem: team.emblem,
                teamLevel: team.level,
                district: team.district || '',
                type: 'recruit',
                content: notice.content,
                tags: [...baseTags, '#팀공지'],
                updatedAt: notice.created_at,
              });
            });
          }
        }

        items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setNewsItems(items.slice(0, 12));
      } catch (error) {
        console.error('Error fetching neighborhood news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoodNews();
  }, [userRegions]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('news-carousel');
    if (!container) return;
    
    const scrollAmount = 200;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  const handleCardClick = (teamId: string, teamName: string) => {
    if (isGuest && onGuestClick) {
      onGuestClick(teamName);
      return;
    }
    navigate(`/team/${teamId}`);
  };

  const getTypeIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'photo': return <Image size={10} />;
      case 'intro': return <FileText size={10} />;
      case 'match': return <Trophy size={10} />;
      case 'recruit': return <Users size={10} />;
    }
  };

  const getTypeBg = (type: NewsItem['type']) => {
    switch (type) {
      case 'photo': return 'bg-primary/80';
      case 'intro': return 'bg-accent/80';
      case 'match': return 'bg-green-500/80';
      case 'recruit': return 'bg-purple-500/80';
    }
  };

  if (!userRegions || userRegions.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div 
          className="bg-card border-4 border-accent p-4"
          style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📰</span>
            <h2 className="font-pixel text-[11px] text-foreground">우리동네 풋살팀 소식</h2>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className="flex-shrink-0 w-44 h-36 bg-muted border-4 border-border-dark animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="px-4 py-3">
        <div 
          className="bg-card border-4 border-accent p-4"
          style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📰</span>
            <h2 className="font-pixel text-[11px] text-foreground">우리동네 풋살팀 소식</h2>
          </div>
          <div className="text-center py-6">
            <p className="font-pixel text-[10px] text-muted-foreground">
              아직 동네 소식이 없어요 🌿
            </p>
            <p className="font-pixel text-[8px] text-muted-foreground mt-2">
              {userRegions.map(r => r.district).join(', ')}에 팀이 생기면 알려드릴게요!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div 
        className="bg-card border-4 border-accent overflow-hidden"
        style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 border-b-3 border-accent-dark px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📰</span>
            <h2 className="font-pixel text-[10px] text-accent-foreground">우리동네 풋살팀 소식</h2>
            <span className="px-2 py-0.5 bg-accent-foreground/20 text-accent-foreground font-pixel text-[7px] animate-pulse">
              LIVE
            </span>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="w-6 h-6 flex items-center justify-center bg-accent-dark/30 border-2 border-accent-dark hover:bg-accent-dark/50 transition-colors"
            >
              <ChevronLeft size={14} className="text-accent-foreground" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-6 h-6 flex items-center justify-center bg-accent-dark/30 border-2 border-accent-dark hover:bg-accent-dark/50 transition-colors"
            >
              <ChevronRight size={14} className="text-accent-foreground" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="p-3">
          <div 
            id="news-carousel"
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            {newsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleCardClick(item.teamId, item.teamName)}
                className={cn(
                  'flex-shrink-0 w-40 border-4 border-border-dark bg-secondary transition-all',
                  'hover:border-primary hover:scale-[1.02] hover:-translate-y-1',
                  'text-left'
                )}
                style={{ 
                  boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))',
                  imageRendering: 'pixelated',
                }}
              >
                {/* Content Area */}
                <div className="relative h-20 overflow-hidden bg-muted">
                  {item.type === 'photo' ? (
                    <img 
                      src={item.content} 
                      alt={`${item.teamName} 소식`}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'auto' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="p-2 h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <p className="font-pixel text-[8px] text-foreground text-center line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className={cn(
                    "absolute top-1 right-1 w-5 h-5 flex items-center justify-center border border-border-dark text-white",
                    getTypeBg(item.type)
                  )}>
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Level Badge */}
                  <div className={cn(
                    "absolute top-1 left-1 px-1.5 py-0.5 font-pixel text-[7px] border",
                    levelColors[item.teamLevel]
                  )}>
                    {item.teamLevel}급
                  </div>
                </div>

                {/* Tags */}
                <div className="px-2 py-1.5 bg-muted/50 border-t-2 border-border-dark overflow-hidden">
                  <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {item.tags.slice(0, 2).map((tag, i) => (
                      <span 
                        key={i}
                        className="flex-shrink-0 px-1.5 py-0.5 bg-primary/20 text-primary font-pixel text-[6px] border border-primary/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Info Footer */}
                <div className="p-2 border-t-2 border-border-dark bg-card">
                  <div className="flex items-center gap-2">
                    <span className="text-base flex-shrink-0">{item.teamEmblem}</span>
                    <p className="font-pixel text-[8px] text-foreground truncate flex-1">
                      {item.teamName}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Region Pills Footer */}
        <div className="px-3 py-2 bg-secondary/50 border-t-3 border-border flex flex-wrap gap-1.5 items-center">
          <span className="font-pixel text-[7px] text-muted-foreground mr-1">📍 내 동네:</span>
          {userRegions.map((r) => (
            <span
              key={`${r.region}-${r.district}`}
              className="px-2 py-0.5 bg-accent/20 text-accent font-pixel text-[7px] border border-accent/50"
            >
              {r.district}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
