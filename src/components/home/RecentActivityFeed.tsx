import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  teamId: string;
  type: 'match_result' | 'new_team' | 'court_booking' | 'archive_post';
  teamName: string;
  teamEmblem: string;
  teamPhotoUrl?: string;
  description: string;
  timeAgo: string;
}

const typeConfig = {
  match_result: { icon: '⚽', label: '경기결과' },
  new_team: { icon: '🆕', label: '신규팀' },
  court_booking: { icon: '📍', label: '구장예약' },
  archive_post: { icon: '📸', label: '아카이브' },
};

export function RecentActivityFeed() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('archive_posts')
          .select('id, team_id, content, created_at')
          .order('created_at', { ascending: false })
          .limit(4);

        if (postsError || !postsData || postsData.length === 0) {
          setActivities([]);
          return;
        }

        const teamIds = [...new Set(postsData.map((p) => p.team_id))];
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name, emblem, photo_url')
          .in('id', teamIds);

        const teamsMap: Record<string, { name: string; emblem: string; photoUrl?: string }> = {};
        if (teamsData) {
          for (const t of teamsData) {
            teamsMap[t.id] = { name: t.name, emblem: t.emblem || '⚽', photoUrl: t.photo_url || undefined };
          }
        }

        setActivities(
          postsData.map((p) => {
            const team = teamsMap[p.team_id] || { name: '알 수 없음', emblem: '⚽' };
            return {
              id: p.id,
              teamId: p.team_id,
              type: 'archive_post' as const,
              teamName: team.name,
              teamEmblem: team.emblem,
              teamPhotoUrl: team.photoUrl,
              description: p.content ? p.content.slice(0, 30) + (p.content.length > 30 ? '...' : '') : '',
              timeAgo: formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ko }),
            };
          })
        );
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2 mb-3">
          <span className="text-primary">📋</span>
          최근 활동
        </h3>
        <div className="space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-12 bg-muted animate-pulse border-3 border-border-dark" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="px-4 py-3">
        <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2 mb-3">
          <span className="text-primary">📋</span>
          최근 활동
        </h3>
        <div
          className="bg-card border-3 border-border-dark p-4 text-center"
          style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
        >
          <span className="font-pixel text-[8px] text-muted-foreground">최근 활동이 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2 mb-3">
        <span className="text-primary">📋</span>
        최근 활동
      </h3>

      <div
        className="bg-card border-3 border-border-dark divide-y divide-border"
        style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
      >
        {activities.map((activity) => {
          const config = typeConfig[activity.type];
          return (
            <div
              key={activity.id}
              className="px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/team/${activity.teamId}`)}
            >
              {/* Team Emblem / Photo */}
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-sm shrink-0">
                {activity.teamPhotoUrl ? (
                  <img src={activity.teamPhotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{activity.teamEmblem}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-pixel text-[9px] text-foreground">{activity.teamName}</span>
                  <span className="px-1 py-0.5 bg-primary/10 border border-primary/20 font-pixel text-[6px] text-primary">
                    {config.label}
                  </span>
                </div>
                <p className="font-pixel text-[7px] text-muted-foreground mt-0.5 truncate">
                  {config.icon} {activity.description}
                </p>
              </div>

              {/* Time */}
              <span className="font-pixel text-[7px] text-muted-foreground shrink-0">
                {activity.timeAgo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
