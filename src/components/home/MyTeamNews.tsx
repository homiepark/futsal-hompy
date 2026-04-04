import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NewsItem {
  id: string;
  teamId: string;
  teamName: string;
  teamEmblem: string;
  type: 'post' | 'notice' | 'schedule';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  createdAt: string;
  timeAgo: string;
}

interface MyTeamNewsProps {
  userId: string;
}

const typeConfig = {
  post: { label: '📸 게시글', bg: 'bg-primary/10 text-primary border-primary/30' },
  notice: { label: '📢 공지', bg: 'bg-accent/10 text-accent border-accent/30' },
  schedule: { label: '📅 일정', bg: 'bg-blue-50 text-blue-600 border-blue-200' },
};

export function MyTeamNews({ userId }: MyTeamNewsProps) {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTeamNews = async () => {
      try {
        // 1. 내가 속한 팀 조회
        const { data: memberships } = await supabase
          .from('team_members')
          .select('team_id, teams(id, name, emblem)')
          .eq('user_id', userId);

        if (!memberships || memberships.length === 0) {
          setLoading(false);
          return;
        }

        const teamMap = new Map<string, { name: string; emblem: string }>();
        const teamIds: string[] = [];
        memberships.forEach((m: any) => {
          if (m.teams) {
            teamIds.push(m.teams.id);
            teamMap.set(m.teams.id, { name: m.teams.name, emblem: m.teams.emblem });
          }
        });

        if (teamIds.length === 0) {
          setLoading(false);
          return;
        }

        const items: NewsItem[] = [];

        // 2. 게시글 (최근 5개)
        const { data: posts } = await supabase
          .from('archive_posts')
          .select('id, team_id, content, image_url, created_at')
          .in('team_id', teamIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (posts) {
          posts.forEach(post => {
            const team = teamMap.get(post.team_id);
            if (!team) return;
            items.push({
              id: `post-${post.id}`,
              teamId: post.team_id,
              teamName: team.name,
              teamEmblem: team.emblem,
              type: 'post',
              title: post.content ? post.content.slice(0, 40) + (post.content.length > 40 ? '...' : '') : '새 게시글',
              imageUrl: post.image_url || undefined,
              createdAt: post.created_at,
              timeAgo: formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko }),
            });
          });
        }

        // 3. 공지 (최근 3개)
        const { data: notices } = await supabase
          .from('team_notices')
          .select('id, team_id, content, created_at')
          .in('team_id', teamIds)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (notices) {
          notices.forEach(notice => {
            const team = teamMap.get(notice.team_id);
            if (!team) return;
            items.push({
              id: `notice-${notice.id}`,
              teamId: notice.team_id,
              teamName: team.name,
              teamEmblem: team.emblem,
              type: 'notice',
              title: notice.content.slice(0, 40) + (notice.content.length > 40 ? '...' : ''),
              createdAt: notice.created_at,
              timeAgo: formatDistanceToNow(new Date(notice.created_at), { addSuffix: true, locale: ko }),
            });
          });
        }

        // 4. 일정 (오늘 이후 가장 가까운 5개)
        const today = new Date().toISOString().split('T')[0];
        const { data: schedules } = await supabase
          .from('team_schedules')
          .select('id, team_id, title, date, time_start, event_type, created_at')
          .in('team_id', teamIds)
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(5);

        if (schedules) {
          const eventEmoji: Record<string, string> = {
            match: '⭐', friendly: '⚔️', training: '🏃', event: '🎉',
          };
          schedules.forEach(schedule => {
            const team = teamMap.get(schedule.team_id);
            if (!team) return;
            const emoji = eventEmoji[schedule.event_type] || '📅';
            items.push({
              id: `schedule-${schedule.id}`,
              teamId: schedule.team_id,
              teamName: team.name,
              teamEmblem: team.emblem,
              type: 'schedule',
              title: `${emoji} ${schedule.title}`,
              subtitle: `${schedule.date}${schedule.time_start ? ` ${schedule.time_start}` : ''}`,
              createdAt: schedule.created_at,
              timeAgo: schedule.date,
            });
          });
        }

        // 시간순 정렬 (일정은 날짜 기준)
        items.sort((a, b) => {
          if (a.type === 'schedule' && b.type === 'schedule') {
            return (a.subtitle || '').localeCompare(b.subtitle || '');
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setNewsItems(items.slice(0, 10));
      } catch (error) {
        console.error('Error fetching my team news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeamNews();
  }, [userId]);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="bg-card border-4 border-border-dark p-4" style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✨</span>
            <h2 className="font-pixel text-[12px] text-foreground">우리팀 새 소식</h2>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted border-2 border-border-dark animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="px-4 py-3">
        <div className="bg-card border-4 border-border-dark p-4" style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✨</span>
            <h2 className="font-pixel text-[12px] text-foreground">우리팀 새 소식</h2>
          </div>
          <div className="text-center py-4">
            <p className="font-pixel text-[11px] text-muted-foreground">아직 새 소식이 없어요</p>
            <p className="font-pixel text-[11px] text-muted-foreground mt-1">팀에서 활동이 시작되면 여기에 표시됩니다!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div
        className="bg-card border-4 border-border-dark overflow-hidden rounded-xl"
        style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 border-b-3 border-primary-dark px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <h2 className="font-pixel text-[12px] text-primary-foreground">우리팀 새 소식</h2>
          </div>
          <span className="font-pixel text-[9px] text-primary-foreground/70">{newsItems.length}건</span>
        </div>

        {/* News List */}
        <div className="divide-y divide-border">
          {newsItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.type === 'schedule') {
                  navigate('/schedule');
                } else {
                  navigate(`/team/${item.teamId}`);
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
            >
              {/* Team Emblem */}
              <span className="text-xl shrink-0">{item.teamEmblem}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn(
                    "font-pixel text-[9px] px-1.5 py-0.5 rounded border shrink-0",
                    typeConfig[item.type].bg
                  )}>
                    {typeConfig[item.type].label}
                  </span>
                  <span className="font-pixel text-[10px] text-muted-foreground truncate">{item.teamName}</span>
                </div>
                <p className="font-body text-xs text-foreground truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="font-pixel text-[10px] text-muted-foreground mt-0.5">{item.subtitle}</p>
                )}
              </div>

              {/* Time / Image */}
              {item.imageUrl ? (
                <div className="w-11 h-11 shrink-0 border-2 border-border-dark rounded overflow-hidden bg-muted">
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <span className="font-pixel text-[9px] text-muted-foreground shrink-0 whitespace-nowrap">
                  {item.type === 'schedule' ? '' : item.timeAgo}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
