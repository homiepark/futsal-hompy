import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  type: 'post' | 'notice';
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
  '1': 'bg-[hsl(var(--level-1))] text-white border-[hsl(var(--level-1))]',
  '2': 'bg-[hsl(var(--level-2))] text-white border-[hsl(var(--level-2))]',
  '3': 'bg-[hsl(var(--level-3))] text-white border-[hsl(var(--level-3))]',
  '4': 'bg-[hsl(var(--level-4))] text-white border-[hsl(var(--level-4))]',
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
        // 동네 팀 목록 가져오기
        const { data: teams, error } = await supabase
          .from('teams')
          .select('id, name, emblem, level, district, region')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const matchingTeams = (teams || []).filter(team =>
          userRegions.some(r => r.region === team.region && r.district === team.district)
        );

        const items: NewsItem[] = [];
        const matchingTeamIds = matchingTeams.map(t => t.id);

        if (matchingTeamIds.length > 0) {
          const teamMap = new Map(matchingTeams.map(t => [t.id, t]));

          // 새 게시글 (archive_posts)
          const { data: posts } = await supabase
            .from('archive_posts')
            .select('id, team_id, content, image_url, created_at')
            .in('team_id', matchingTeamIds)
            .order('created_at', { ascending: false })
            .limit(10);

          if (posts) {
            posts.forEach(post => {
              const team = teamMap.get(post.team_id);
              if (!team) return;
              items.push({
                id: `post-${post.id}`,
                teamId: team.id,
                teamName: team.name,
                teamEmblem: team.emblem,
                teamLevel: team.level,
                district: team.district || '',
                type: 'post',
                content: post.image_url || (post.content ? post.content.slice(0, 50) : '새 게시글'),
                tags: [],
                updatedAt: post.created_at,
              });
            });
          }

          // 팀 공지 (team_notices)
          const { data: notices } = await supabase
            .from('team_notices')
            .select('id, team_id, content, created_at')
            .in('team_id', matchingTeamIds)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10);

          if (notices) {
            notices.forEach(notice => {
              const team = teamMap.get(notice.team_id);
              if (!team) return;
              items.push({
                id: `notice-${notice.id}`,
                teamId: team.id,
                teamName: team.name,
                teamEmblem: team.emblem,
                teamLevel: team.level,
                district: team.district || '',
                type: 'notice',
                content: notice.content,
                tags: [],
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

  const getTypeLabel = (type: NewsItem['type']) => {
    switch (type) {
      case 'post': return '📸 새 게시글';
      case 'notice': return '📢 공지';
    }
  };

  const getTypeBg = (type: NewsItem['type']) => {
    switch (type) {
      case 'post': return 'bg-primary text-primary-foreground border-primary-dark';
      case 'notice': return 'bg-accent text-accent-foreground border-accent-dark';
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
            <h2 className="font-pixel text-xs text-foreground">우리동네 풋살팀 소식</h2>
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
            <h2 className="font-pixel text-xs text-foreground">우리동네 풋살팀 소식</h2>
          </div>
          <div className="text-center py-6">
            <p className="font-pixel text-[11px] text-muted-foreground">
              아직 동네 소식이 없어요 🌿
            </p>
            <p className="font-pixel text-[11px] text-muted-foreground mt-2">
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
            <h2 className="font-pixel text-xs text-accent-foreground">우리동네 풋살팀 소식</h2>
            <span className="px-2 py-0.5 bg-accent-foreground/20 text-accent-foreground font-pixel text-[11px] animate-pulse">
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
                  {item.type === 'post' && item.content.startsWith('http') ? (
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
                      <p className="font-pixel text-[11px] text-foreground text-center line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  )}

                  {/* Type Label */}
                  <div className={cn(
                    "absolute top-1 left-1 px-1.5 py-0.5 font-pixel text-[11px] border",
                    getTypeBg(item.type)
                  )}>
                    {getTypeLabel(item.type)}
                  </div>
                </div>

                {/* Team Info Footer */}
                <div className="p-2 border-t-2 border-border-dark bg-card">
                  <div className="flex items-center gap-2">
                    <span className="text-base flex-shrink-0">{item.teamEmblem}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[11px] text-foreground truncate">{item.teamName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1 py-0.5 font-pixel text-[11px] ${levelColors[item.teamLevel] || 'bg-muted text-muted-foreground'}`}>
                          LV.{item.teamLevel}
                        </span>
                        <span className="font-pixel text-[11px] text-muted-foreground">
                          {item.district}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Region Pills Footer */}
        <div className="px-3 py-2 bg-secondary/50 border-t-3 border-border flex flex-wrap gap-1.5 items-center">
          <span className="font-pixel text-[11px] text-muted-foreground mr-1">📍 내 동네:</span>
          {userRegions.map((r) => (
            <span
              key={`${r.region}-${r.district}`}
              className="px-2 py-0.5 bg-accent/20 text-accent font-pixel text-[11px] border border-accent/50"
            >
              {r.district}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
