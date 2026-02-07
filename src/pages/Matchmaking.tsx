import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MatchPostCard } from '@/components/matchmaking/MatchPostCard';
import { MatchBoardFilters } from '@/components/matchmaking/MatchBoardFilters';
import { CreateMatchPostModal } from '@/components/matchmaking/CreateMatchPostModal';
import { ChallengeNotification, useChallengeNotifications } from '@/components/matchmaking/ChallengeNotification';
import { MatchTicker } from '@/components/matchmaking/MatchTicker';
import { useDev } from '@/contexts/DevContext';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';

interface MatchPost {
  id: string;
  team_id: string;
  location_name: string;
  location_address: string | null;
  match_date: string;
  match_time_start: string;
  match_time_end: string;
  target_levels: string[];
  description: string | null;
  created_at: string;
  team: {
    id: string;
    name: string;
    emblem: string;
    level: string;
  };
}

interface BoardFilters {
  region: string;
  district: string;
  date: string;
  levels: string[];
}

const initialFilters: BoardFilters = {
  region: '',
  district: '',
  date: '',
  levels: [],
};

// Mock data for demonstration - will be replaced with real data
const mockMatchPosts: MatchPost[] = [
  {
    id: '1',
    team_id: 't1',
    location_name: '용산 풋살파크',
    location_address: '서울 용산구 한강대로 123',
    match_date: format(new Date(), 'yyyy-MM-dd'),
    match_time_start: '14:00',
    match_time_end: '16:00',
    target_levels: ['A', 'B'],
    description: '정정당당하게 한 판 하실 팀 찾습니다!',
    created_at: new Date().toISOString(),
    team: {
      id: 't1',
      name: 'FC 번개',
      emblem: '⚡',
      level: 'A',
    },
  },
  {
    id: '2',
    team_id: 't2',
    location_name: '상암 월드컵 풋살장',
    location_address: '서울 마포구 상암동 456',
    match_date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    match_time_start: '10:00',
    match_time_end: '12:00',
    target_levels: ['B', 'C'],
    description: '주말 오전 친선 경기 원합니다. 초보 팀도 환영!',
    created_at: new Date().toISOString(),
    team: {
      id: 't2',
      name: '선데이 풋살',
      emblem: '☀️',
      level: 'B',
    },
  },
  {
    id: '3',
    team_id: 't3',
    location_name: '강남 스포츠센터',
    location_address: '서울 강남구 역삼동 789',
    match_date: format(new Date(Date.now() + 172800000), 'yyyy-MM-dd'),
    match_time_start: '19:00',
    match_time_end: '21:00',
    target_levels: ['S', 'A'],
    description: '고수 팀만 오세요! 실력으로 승부합니다.',
    created_at: new Date().toISOString(),
    team: {
      id: 't3',
      name: '올드보이즈',
      emblem: '🦁',
      level: 'S',
    },
  },
];

export default function Matchmaking() {
  const navigate = useNavigate();
  const { isDevAdmin } = useDev();
  const [filters, setFilters] = useState<BoardFilters>(initialFilters);
  const [matchPosts, setMatchPosts] = useState<MatchPost[]>(mockMatchPosts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userTeam, setUserTeam] = useState<{
    id: string;
    name: string;
    emblem: string;
    level?: string;
    mannerScore?: number;
    homeGroundName?: string;
    homeGroundAddress?: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Combine real admin status with dev admin toggle
  const canCreatePost = isAdmin || isDevAdmin;

  // Load user's team and check if they're admin
  useEffect(() => {
    async function loadUserTeam() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check if user is admin of any team
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name, emblem, level, home_ground_name, home_ground_address')
          .eq('admin_user_id', user.id)
          .limit(1);

        if (teams && teams.length > 0) {
          setUserTeam({
            id: teams[0].id,
            name: teams[0].name,
            emblem: teams[0].emblem,
            level: teams[0].level,
            mannerScore: 4.5, // Default score for now
            homeGroundName: teams[0].home_ground_name || undefined,
            homeGroundAddress: teams[0].home_ground_address || undefined,
          });
          setIsAdmin(true);
        }

        // Load match posts from database
        await loadMatchPosts();
      } catch (error) {
        console.error('Error loading user team:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserTeam();
  }, []);

  const loadMatchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('match_posts')
        .select(`
          id,
          team_id,
          location_name,
          location_address,
          match_date,
          match_time_start,
          match_time_end,
          target_levels,
          description,
          created_at
        `)
        .eq('status', 'open')
        .gte('match_date', format(new Date(), 'yyyy-MM-dd'))
        .order('match_date', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch team info for each post
        const teamIds = [...new Set(data.map(p => p.team_id))];
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name, emblem, level')
          .in('id', teamIds);

        const teamsMap = new Map(teamsData?.map(t => [t.id, t]) || []);
        
        const postsWithTeams = data.map(post => ({
          ...post,
          team: teamsMap.get(post.team_id) || {
            id: post.team_id,
            name: '알 수 없는 팀',
            emblem: '⚽',
            level: 'C',
          },
        }));

        setMatchPosts(postsWithTeams);
      }
    } catch (error) {
      console.error('Error loading match posts:', error);
      // Keep using mock data if fetch fails
    }
  };

  // Filter match posts
  const filteredPosts = matchPosts.filter(post => {
    // Date filter
    if (filters.date) {
      const postDate = parseISO(post.match_date);
      if (filters.date === 'week') {
        if (!isThisWeek(postDate)) return false;
      } else {
        if (post.match_date !== filters.date) return false;
      }
    }

    // Level filter
    if (filters.levels.length > 0) {
      const hasMatchingLevel = filters.levels.some(level => 
        post.target_levels.includes(level)
      );
      if (!hasMatchingLevel) return false;
    }

    // Region filter (based on location_address if available)
    if (filters.region && post.location_address) {
      if (!post.location_address.includes(filters.region)) return false;
    }
    if (filters.district && post.location_address) {
      if (!post.location_address.includes(filters.district)) return false;
    }

    return true;
  });

  // Real-time challenge notifications
  const { notifications, dismissNotification } = useChallengeNotifications(userTeam?.id || null);

  const handleChallenge = async (postId: string) => {
    if (!isAdmin || !userTeam) {
      toast.error('팀 관리자만 도전할 수 있습니다', { icon: '⚠️' });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Check if already applied
      const { data: existingApp } = await supabase
        .from('match_applications')
        .select('id')
        .eq('match_post_id', postId)
        .eq('applicant_team_id', userTeam.id)
        .single();

      if (existingApp) {
        toast.info('이미 도전 신청한 공고입니다', { icon: '📝' });
        return;
      }

      // Create application
      const { error } = await supabase
        .from('match_applications')
        .insert({
          match_post_id: postId,
          applicant_team_id: userTeam.id,
          applied_by_user_id: user.id,
          message: `${userTeam.name}팀이 도전합니다!`,
        });

      if (error) throw error;

      toast.success('도전 신청이 완료되었습니다!', { icon: '⚔️' });
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('도전 신청에 실패했습니다');
    }
  };

  const handleCreateSuccess = () => {
    loadMatchPosts();
  };

  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-pixel text-xs text-foreground flex items-center gap-2 mb-2">
          <span className="text-primary">⚔️</span>
          매칭팀 구해요
        </h2>
        <p className="font-pixel text-[8px] text-muted-foreground">
          대결 상대를 찾는 팀들의 공고 게시판
        </p>
      </div>

      {/* Live Ticker */}
      <MatchTicker />

      {/* Filters */}
      <MatchBoardFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Write Post Button - Below Filters */}
      {canCreatePost && (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 mb-4",
            "bg-primary text-primary-foreground font-pixel text-[10px]",
            "border-3 border-primary-dark",
            "hover:brightness-110 active:translate-y-0.5 transition-all"
          )}
          style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
        >
          <PenSquare size={14} />
          매칭공고 글쓰기
        </button>
      )}

      {/* Match Posts */}
      <div className="space-y-4">
        <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
          <span className="text-accent">📋</span>
          매칭 공고
          <span className="text-muted-foreground">({filteredPosts.length})</span>
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="font-pixel text-[10px] text-muted-foreground animate-pulse">
              로딩 중...
            </p>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <MatchPostCard
              key={post.id}
              id={post.id}
              teamName={post.team.name}
              teamEmblem={post.team.emblem}
              teamLevel={post.team.level as 'S' | 'A' | 'B' | 'C'}
              locationName={post.location_name}
              locationAddress={post.location_address || undefined}
              matchDate={parseISO(post.match_date)}
              matchTimeStart={post.match_time_start}
              matchTimeEnd={post.match_time_end}
              targetLevels={post.target_levels}
              description={post.description || undefined}
              onChallenge={() => handleChallenge(post.id)}
              onViewProfile={() => navigate(`/team/${post.team.id}`)}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-card border-3 border-border-dark" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
            <p className="font-pixel text-[10px] text-muted-foreground mb-2">
              조건에 맞는 공고가 없습니다
            </p>
            <p className="font-pixel text-[8px] text-muted-foreground">
              필터를 조정하거나 새 공고를 기다려주세요
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Button (Only for team admins or dev admin) */}
      {canCreatePost && (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={cn(
            "fixed bottom-24 right-4 w-14 h-14",
            "bg-primary text-primary-foreground",
            "border-3 border-primary-dark",
            "flex items-center justify-center",
            "hover:brightness-110 active:translate-y-0.5 transition-all",
            "z-40"
          )}
          style={{ 
            boxShadow: '4px 4px 0 hsl(var(--primary-dark))',
          }}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      )}

      {/* Create Match Post Modal */}
      <CreateMatchPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        team={userTeam}
      />

      {/* Real-time Challenge Notifications */}
      {notifications.length > 0 && (
        <ChallengeNotification
          application={notifications[0]}
          onClose={() => dismissNotification(notifications[0].id)}
          onAction={() => {
            dismissNotification(notifications[0].id);
            loadMatchPosts();
          }}
        />
      )}
    </div>
  );
}
