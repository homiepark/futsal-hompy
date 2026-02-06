import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Image, FileText } from 'lucide-react';
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
  district: string;
  type: 'photo' | 'intro';
  content: string; // image URL or intro text
  updatedAt: string;
}

interface NeighborhoodNewsProps {
  userRegions: PreferredRegion[];
  userId?: string;
}

export function NeighborhoodNews({ userRegions, userId }: NeighborhoodNewsProps) {
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
        // Fetch teams from user's preferred regions
        const { data: teams, error } = await supabase
          .from('teams')
          .select('id, name, emblem, district, region, banner_url, photo_url, introduction, updated_at')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Filter teams that match any of the user's preferred regions
        const matchingTeams = (teams || []).filter(team =>
          userRegions.some(r => r.region === team.region && r.district === team.district)
        );

        // Create news items from team data
        const items: NewsItem[] = [];

        matchingTeams.forEach(team => {
          // Add photo news if banner or photo exists
          if (team.banner_url || team.photo_url) {
            items.push({
              id: `photo-${team.id}`,
              teamId: team.id,
              teamName: team.name,
              teamEmblem: team.emblem,
              district: team.district || '',
              type: 'photo',
              content: team.banner_url || team.photo_url || '',
              updatedAt: team.updated_at,
            });
          }

          // Add intro news if introduction exists
          if (team.introduction) {
            items.push({
              id: `intro-${team.id}`,
              teamId: team.id,
              teamName: team.name,
              teamEmblem: team.emblem,
              district: team.district || '',
              type: 'intro',
              content: team.introduction,
              updatedAt: team.updated_at,
            });
          }
        });

        // Sort by updated_at and limit
        items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setNewsItems(items.slice(0, 10));
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

  const handleCardClick = (teamId: string) => {
    navigate(`/team/${teamId}`);
  };

  // Don't render if no user regions or no news
  if (!userRegions || userRegions.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="bg-card border-3 border-border-dark p-4" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📰</span>
            <h2 className="font-pixel text-[11px] text-foreground">우리 동네 소식</h2>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className="flex-shrink-0 w-40 h-32 bg-muted border-3 border-border-dark animate-pulse"
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
        <div className="bg-card border-3 border-border-dark p-4" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📰</span>
            <h2 className="font-pixel text-[11px] text-foreground">우리 동네 소식</h2>
          </div>
          <div className="text-center py-4">
            <p className="font-pixel text-[9px] text-muted-foreground">
              아직 동네 소식이 없어요
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">
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
        className="bg-card border-3 border-border-dark p-3"
        style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📰</span>
            <h2 className="font-pixel text-[11px] text-foreground">우리 동네 소식</h2>
            <span className="px-2 py-0.5 bg-accent/20 text-accent font-pixel text-[8px] border border-accent">
              NEW
            </span>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="w-6 h-6 flex items-center justify-center bg-secondary border-2 border-border-dark hover:bg-muted transition-colors"
              style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-6 h-6 flex items-center justify-center bg-secondary border-2 border-border-dark hover:bg-muted transition-colors"
              style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div 
          id="news-carousel"
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {newsItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleCardClick(item.teamId)}
              className={cn(
                'flex-shrink-0 w-44 border-3 border-border-dark bg-muted transition-all',
                'hover:border-primary hover:scale-[1.02]',
                'text-left'
              )}
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              {/* Content Area */}
              <div className="relative h-24 overflow-hidden bg-secondary">
                {item.type === 'photo' ? (
                  <>
                    <img 
                      src={item.content} 
                      alt={`${item.teamName} 소식`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary/80 border border-primary-dark flex items-center justify-center">
                      <Image size={10} className="text-primary-foreground" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 h-full flex items-center">
                      <p className="font-body text-[10px] text-foreground line-clamp-4 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                    <div className="absolute top-1 right-1 w-5 h-5 bg-accent/80 border border-accent-dark flex items-center justify-center">
                      <FileText size={10} className="text-accent-foreground" />
                    </div>
                  </>
                )}

                {/* Region Tag */}
                <div className="absolute bottom-1 left-1">
                  <span className="px-1.5 py-0.5 bg-primary/90 text-primary-foreground font-pixel text-[7px] border border-primary-dark">
                    #{item.district}
                  </span>
                </div>
              </div>

              {/* Team Info Footer */}
              <div className="p-2 border-t-2 border-border-dark bg-card">
                <div className="flex items-center gap-2">
                  <span className="text-base flex-shrink-0">{item.teamEmblem}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-pixel text-[9px] text-foreground truncate">
                      {item.teamName}
                    </p>
                    <p className="font-body text-[8px] text-muted-foreground">
                      {item.type === 'photo' ? '📷 새 사진' : '📝 팀 소개'}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Region Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t-2 border-border">
          <span className="font-pixel text-[8px] text-muted-foreground mr-1">📍</span>
          {userRegions.map((r) => (
            <span
              key={`${r.region}-${r.district}`}
              className="px-2 py-0.5 bg-secondary text-secondary-foreground font-pixel text-[7px] border border-border-dark"
            >
              {r.district}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
