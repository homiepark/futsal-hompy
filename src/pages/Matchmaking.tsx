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
import { ChallengeModal } from '@/components/matchmaking/ChallengeModal';
import { MatchTicker } from '@/components/matchmaking/MatchTicker';
import { RecommendedMatches } from '@/components/matchmaking/RecommendedMatches';
import { useAuth } from '@/contexts/AuthContext';
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

export default function Matchmaking() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [filters, setFilters] = useState<BoardFilters>(initialFilters);
  const [matchPosts, setMatchPosts] = useState<MatchPost[]>([]);
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
  const [challengeTarget, setChallengeTarget] = useState<{
    postId: string;
    teamName: string;
    teamEmblem: string;
    teamAdminId: string;
  } | null>(null);
  const [recommendedTeams, setRecommendedTeams] = useState<Array<{
    id: string;
    name: string;
    emblem: string;
    region: string;
    district: string;
    level: string;
    mannerScore: number;
    matchTime: string;
    homeGroundName?: string;
    homeGroundAddress?: string;
    tags: string[];
    matchScore: number;
  }>>([]);

  const canCreatePost = isAdmin;

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
          const myTeam = {
            id: teams[0].id,
            name: teams[0].name,
            emblem: teams[0].emblem,
            level: teams[0].level,
            mannerScore: 4.5, // Default score for now
            homeGroundName: teams[0].home_ground_name || undefined,
            homeGroundAddress: teams[0].home_ground_address || undefined,
          };
          setUserTeam(myTeam);
          setIsAdmin(true);

          // Load recommended teams
          loadRecommendedTeams(myTeam.id, myTeam.level);
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
            level: '1',
          },
        }));

        setMatchPosts(postsWithTeams);
      }
    } catch (error) {
      console.error('Error loading match posts:', error);
    }
  };

  const loadRecommendedTeams = async (myTeamId: string, myLevel?: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, emblem, level, region, district, home_ground_name, home_ground_address')
        .neq('id', myTeamId)
        .limit(3);

      if (error) throw error;
      if (!data || data.length === 0) return;

      const myLevelNum = parseInt(myLevel || '2');
      const mapped = data.map(team => {
        const teamLevelNum = parseInt(team.level || '2');
        const levelDiff = Math.abs(myLevelNum - teamLevelNum);
        const matchScore = Math.max(50, 100 - levelDiff * 15);
        const tags: string[] = [];
        if (levelDiff <= 1) tags.push('실력 비슷');
        if (levelDiff >= 2) tags.push('도전 매치!');
        if (team.district) tags.push(`#${team.district}`);

        return {
          id: team.id,
          name: team.name,
          emblem: team.emblem,
          region: team.region || '',
          district: team.district || '',
          level: team.level || '2',
          mannerScore: 4.5,
          matchTime: '',
          homeGroundName: team.home_ground_name || undefined,
          homeGroundAddress: team.home_ground_address || undefined,
          tags,
          matchScore,
        };
      });

      mapped.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendedTeams(mapped);
    } catch (error) {
      console.error('Error loading recommended teams:', error);
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

    // Find the post to get team info
    const post = matchPosts.find(p => p.id === postId);
    if (!post) return;

    // Get the admin of the target team
    const { data: targetTeam } = await supabase
      .from('teams')
      .select('admin_user_id')
      .eq('id', post.team_id)
      .single();

    setChallengeTarget({
      postId,
      teamName: post.team.name,
      teamEmblem: post.team.emblem,
      teamAdminId: targetTeam?.admin_user_id || '',
    });
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

      {/* AI Recommended Matches */}
      {userTeam && recommendedTeams.length > 0 && (
        <RecommendedMatches
          teams={recommendedTeams}
          userDistricts={recommendedTeams.map(t => t.district).filter(Boolean)}
        />
      )}

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
              teamLevel={post.team.level}
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

      {/* Challenge Modal */}
      {challengeTarget && userTeam && (
        <ChallengeModal
          isOpen={!!challengeTarget}
          onClose={() => setChallengeTarget(null)}
          matchPostId={challengeTarget.postId}
          targetTeamName={challengeTarget.teamName}
          targetTeamEmblem={challengeTarget.teamEmblem}
          targetTeamAdminId={challengeTarget.teamAdminId}
          myTeam={{ id: userTeam.id, name: userTeam.name, emblem: userTeam.emblem }}
          myUserId={authUser?.id || ''}
          onSuccess={loadMatchPosts}
        />
      )}

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
