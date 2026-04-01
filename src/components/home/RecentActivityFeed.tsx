import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  teamId: string;
  type: 'archive_post';
  teamName: string;
  teamEmblem: string;
  teamPhotoUrl?: string;
  imageUrl?: string;
  description: string;
  folderName?: string;
  timeAgo: string;
}

export function RecentActivityFeed() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('archive_posts')
          .select('id, team_id, content, created_at, image_url, folder_id')
          .order('created_at', { ascending: false })
          .limit(4);

        if (postsError || !postsData || postsData.length === 0) {
          setActivities([]);
          return;
        }

        const teamIds = [...new Set(postsData.map((p) => p.team_id))];
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name, emblem, photo_url, archive_folders')
          .in('id', teamIds);

        const teamsMap: Record<string, { name: string; emblem: string; photoUrl?: string; folders?: any[] }> = {};
        if (teamsData) {
          for (const t of teamsData) {
            teamsMap[t.id] = {
              name: t.name,
              emblem: t.emblem || '⚽',
              photoUrl: t.photo_url || undefined,
              folders: (t as any).archive_folders || [],
            };
          }
        }

        setActivities(
          postsData.map((p) => {
            const team = teamsMap[p.team_id] || { name: '알 수 없음', emblem: '⚽', folders: [] };
            const folder = team.folders?.find((f: any) => f.id === p.folder_id);
            return {
              id: p.id,
              teamId: p.team_id,
              type: 'archive_post' as const,
              teamName: team.name,
              teamEmblem: team.emblem,
              teamPhotoUrl: team.photoUrl,
              imageUrl: p.image_url || undefined,
              description: p.content ? p.content.slice(0, 30) + (p.content.length > 30 ? '...' : '') : '',
              folderName: folder?.name || undefined,
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
            <div key={i} className="w-full h-14 bg-muted animate-pulse border-3 border-border-dark" />
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
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/archive?team=${activity.teamId}`)}
          >
            {/* Thumbnail: image or team photo */}
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-sm shrink-0 border-2 border-border-dark bg-muted">
              {activity.imageUrl ? (
                <img src={activity.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : activity.teamPhotoUrl ? (
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
                  {activity.folderName || '게시글'}
                </span>
              </div>
              <p className="font-pixel text-[7px] text-muted-foreground mt-0.5 truncate">
                📸 {activity.description}
              </p>
            </div>

            {/* Time */}
            <span className="font-pixel text-[7px] text-muted-foreground shrink-0">
              {activity.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
