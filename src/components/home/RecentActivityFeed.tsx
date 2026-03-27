import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'match_result' | 'new_team' | 'court_booking' | 'archive_post';
  teamName: string;
  teamEmblem: string;
  description: string;
  timeAgo: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'match_result',
    teamName: 'FC 불꽃',
    teamEmblem: '🔥',
    description: 'FC 번개에 승리! 통산 23승 달성',
    timeAgo: '2시간 전',
  },
  {
    id: '2',
    type: 'new_team',
    teamName: '블루웨이브',
    teamEmblem: '🌊',
    description: '새로운 팀이 등록되었습니다',
    timeAgo: '5시간 전',
  },
  {
    id: '3',
    type: 'archive_post',
    teamName: '스틸러스',
    teamEmblem: '⚔️',
    description: '훈련 하이라이트 영상 업로드',
    timeAgo: '어제',
  },
  {
    id: '4',
    type: 'court_booking',
    teamName: 'FC 드래곤즈',
    teamEmblem: '🐉',
    description: '강남 풋살파크 토요일 14시 예약',
    timeAgo: '어제',
  },
];

const typeConfig = {
  match_result: { icon: '⚽', label: '경기결과' },
  new_team: { icon: '🆕', label: '신규팀' },
  court_booking: { icon: '📍', label: '구장예약' },
  archive_post: { icon: '📸', label: '아카이브' },
};

export function RecentActivityFeed() {
  const navigate = useNavigate();

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
        {mockActivities.map((activity) => {
          const config = typeConfig[activity.type];
          return (
            <div
              key={activity.id}
              className="px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/team/${activity.id}`)}
            >
              {/* Team Emblem */}
              <span className="text-lg shrink-0">{activity.teamEmblem}</span>

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
