import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { TimelinePost } from '@/components/archive/TimelinePost';
import { PhotoGridItem } from '@/components/archive/PhotoGridItem';
import { ViewToggle } from '@/components/archive/ViewToggle';
import { TeamSelector } from '@/components/ui/TeamSelector';
import { ArchiveFolderTabs } from '@/components/archive/ArchiveFolderTabs';
import { ArchiveWriteModal } from '@/components/archive/ArchiveWriteModal';
import { FolderManageModal } from '@/components/archive/FolderManageModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ArchivePost {
  id: string;
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  isVideo?: boolean;
  likes: number;
  comments: number;
  folderId: string;
  authorUserId?: string;
  authorAvatarUrl?: string;
}

const defaultFolders = [
  { id: 'all', name: '전체보기', emoji: '📁', isDefault: true },
  { id: 'matches', name: '경기 하이라이트', emoji: '⚽' },
  { id: 'training', name: '훈련 기록', emoji: '🏃' },
  { id: 'events', name: '팀 이벤트', emoji: '🎉' },
];

export default function TeamArchive() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamParam = searchParams.get('team');
  const postParam = searchParams.get('post');
  const { user } = useAuth();

  const [view, setView] = useState<'grid' | 'single'>('single');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(teamParam || 'all');
  const [folders, setFolders] = useState(defaultFolders);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [posts, setPosts] = useState<ArchivePost[]>([]);
  const [myTeams, setMyTeams] = useState<{ id: string; name: string; emblem: string; photoUrl?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch user's teams
  useEffect(() => {
    async function fetchTeams() {
      if (!user) return;
      const { data } = await supabase
        .from('team_members')
        .select('team_id, role, teams(id, name, emblem, photo_url)')
        .eq('user_id', user.id);

      if (data) {
        const teams = data
          .map((d: any) => d.teams)
          .filter(Boolean)
          .map((t: any) => ({ id: t.id, name: t.name, emblem: t.emblem, photoUrl: t.photo_url || undefined }));
        setMyTeams(teams);
        if (teams.length > 0 && !teamParam) {
          setSelectedTeam(teams[0].id);
        }
        const adminEntry = data.find((d: any) => d.role === 'admin' || d.role === 'owner');
        if (adminEntry) setIsAdmin(true);
        const ownerEntry = data.find((d: any) => d.role === 'owner');
        if (ownerEntry) setIsOwner(true);
      }
    }
    fetchTeams();
  }, [user, teamParam]);

  // Load folders from DB when team changes
  useEffect(() => {
    async function loadFolders() {
      if (!selectedTeam || selectedTeam === 'all') {
        setFolders(defaultFolders);
        return;
      }
      const { data } = await supabase
        .from('teams')
        .select('archive_folders')
        .eq('id', selectedTeam)
        .single();

      const saved = (data as any)?.archive_folders;
      if (saved && Array.isArray(saved) && saved.length > 0) {
        // Always include "전체보기" as first
        const hasAll = saved.some((f: any) => f.id === 'all');
        setFolders(hasAll ? saved : [defaultFolders[0], ...saved]);
      } else {
        setFolders(defaultFolders);
      }
    }
    loadFolders();
  }, [selectedTeam]);

  // Fetch archive posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('archive_posts')
        .select('id, content, image_url, image_urls, video_url, folder_id, created_at, author_user_id, activity_date, visibility')
        .order('created_at', { ascending: false });

      if (selectedTeam && selectedTeam !== 'all') {
        query = query.eq('team_id', selectedTeam);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Fetch author profiles
        const authorIds = [...new Set(data.map(p => p.author_user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, nickname, avatar_url')
          .in('user_id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, { nickname: p.nickname, avatarUrl: p.avatar_url }]) || []);

        // Fetch like counts
        const postIds = data.map(p => p.id);
        const { data: likeCounts } = await supabase
          .from('archive_post_likes')
          .select('post_id')
          .in('post_id', postIds);

        const likeMap = new Map<string, number>();
        likeCounts?.forEach(l => {
          likeMap.set(l.post_id, (likeMap.get(l.post_id) || 0) + 1);
        });

        // Fetch comment counts
        const { data: commentCounts } = await supabase
          .from('archive_post_comments')
          .select('post_id')
          .in('post_id', postIds);

        const commentMap = new Map<string, number>();
        commentCounts?.forEach(c => {
          commentMap.set(c.post_id, (commentMap.get(c.post_id) || 0) + 1);
        });

        const mappedPosts: ArchivePost[] = data.map(post => ({
          id: post.id,
          author: profileMap.get(post.author_user_id)?.nickname || '알 수 없음',
          date: format(new Date(post.created_at), 'yyyy.MM.dd'),
          content: post.content,
          imageUrl: post.image_url || undefined,
          imageUrls: post.image_urls || undefined,
          videoUrl: post.video_url || undefined,
          isVideo: !!post.video_url,
          likes: likeMap.get(post.id) || 0,
          comments: commentMap.get(post.id) || 0,
          folderId: post.folder_id || 'all',
          activityDate: (post as any).activity_date || undefined,
          authorUserId: post.author_user_id || undefined,
          authorAvatarUrl: profileMap.get(post.author_user_id)?.avatarUrl || undefined,
          visibility: (post as any).visibility || undefined,
        }));

        setPosts(mappedPosts);
      }
    } catch (err) {
      console.error('Error fetching archive posts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter posts by folder
  const filteredPosts = selectedFolder === 'all'
    ? posts
    : posts.filter(post => post.folderId === selectedFolder);

  const postsWithImages = filteredPosts.filter(post => post.imageUrl);

  // Auto-scroll to specific post if postParam is set
  useEffect(() => {
    if (postParam && posts.length > 0) {
      setView('single');
      setTimeout(() => {
        const el = document.getElementById(`post-${postParam}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [postParam, posts]);

  const handleGridItemClick = (postId: string) => {
    setSelectedPostId(postId);
    setView('single');
  };

  const handleBack = () => {
    if (teamParam) {
      navigate(`/team/${teamParam}`);
    } else {
      navigate('/my-team');
    }
  };

  const handleFoldersSave = async (newFolders: typeof folders) => {
    setFolders(newFolders);
    if (selectedTeam && selectedTeam !== 'all') {
      const { error } = await supabase
        .from('teams')
        .update({ archive_folders: JSON.parse(JSON.stringify(newFolders)) } as any)
        .eq('id', selectedTeam);
      if (error) {
        console.error('Folder save error:', error);
        toast.error('폴더 저장에 실패했습니다. DB 컬럼을 확인해주세요.');
      }
    }
  };

  const currentTeam = myTeams.find(t => t.id === selectedTeam);

  // 공유 링크로 접근했는데 비로그인인 경우
  const isSharedAccess = !!postParam;
  const isNotLoggedIn = !user;
  const isNotTeamMember = user && myTeams.length === 0;

  if (isSharedAccess && (isNotLoggedIn || isNotTeamMember) && !loading) {
    return (
      <div className="pb-20 max-w-lg mx-auto">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-3 border-border-dark">
          <div className="px-3 py-2 flex items-center gap-2">
            <PixelBackButton onClick={() => navigate('/')} />
            <h1 className="font-pixel text-[10px] text-foreground">팀 스토리</h1>
          </div>
        </div>
        <div className="px-4 py-12 text-center">
          <div className="text-5xl mb-4">🔒</div>
          {isNotLoggedIn ? (
            <>
              <p className="font-pixel text-[12px] text-foreground mb-2">이 게시글을 보려면 로그인이 필요합니다</p>
              <p className="font-pixel text-[11px] text-muted-foreground mb-6">회원가입 후 팀에 가입하면 게시글을 볼 수 있어요!</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-6 py-2.5 bg-primary text-primary-foreground border-3 border-primary-dark rounded-lg font-pixel text-[11px] hover:brightness-110"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
                >회원가입 / 로그인</button>
              </div>
            </>
          ) : (
            <>
              <p className="font-pixel text-[12px] text-foreground mb-2">팀원만 볼 수 있는 게시글입니다</p>
              <p className="font-pixel text-[11px] text-muted-foreground mb-6">팀에 가입하면 게시글을 볼 수 있어요!</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-primary text-primary-foreground border-3 border-primary-dark rounded-lg font-pixel text-[11px] hover:brightness-110"
                style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
              >팀 찾기</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-3 border-border-dark">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PixelBackButton onClick={handleBack} />
            <div className="flex items-center gap-1.5">
              {currentTeam && <span className="text-lg">{currentTeam.emblem}</span>}
              <h1 className="font-pixel text-[10px] text-foreground">팀 스토리</h1>
            </div>
          </div>
          <PixelButton
            variant="accent"
            size="sm"
            className="flex items-center gap-1 text-[11px] px-2 py-1"
            onClick={() => setShowWriteModal(true)}
          >
            <Plus size={12} />
            <span>글쓰기</span>
          </PixelButton>
        </div>
      </div>

      <div className="px-3 py-3">
        {/* Team Selector */}
        {myTeams.length > 0 && (
          <div className="mb-3">
            <TeamSelector
              teams={myTeams}
              selectedTeam={selectedTeam}
              onSelect={setSelectedTeam}
            />
          </div>
        )}

        {/* Folder Tabs */}
        <div className="mb-3">
          <ArchiveFolderTabs
            folders={folders}
            selectedFolder={selectedFolder}
            onSelect={setSelectedFolder}
            isAdmin={isAdmin}
            onManageFolders={() => setShowFolderModal(true)}
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center mb-3">
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Content based on view */}
        <div
          className="transition-opacity duration-300 ease-in-out"
          key={`${view}-${selectedFolder}`}
        >
          {loading ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 animate-bounce">📸</div>
              <p className="font-pixel text-[10px] text-muted-foreground">불러오는 중...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="kairo-panel p-8 text-center">
              <div className="text-4xl mb-3">📁</div>
              <p className="font-pixel text-[10px] text-muted-foreground">
                {posts.length === 0 ? '아직 게시물이 없습니다. 첫 글을 작성해보세요!' : '이 폴더에 게시물이 없습니다'}
              </p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 gap-1.5">
              {filteredPosts.map((post) => (
                <PhotoGridItem
                  key={post.id}
                  id={post.id}
                  imageUrl={post.imageUrl || ''}
                  content={post.content}
                  likes={post.likes}
                  onClick={() => handleGridItemClick(post.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div key={post.id} id={`post-${post.id}`}>
                <TimelinePost
                  {...post}
                  isMock={false}
                  isAdmin={isAdmin}
                  isOwner={isOwner}
                  onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))}
                  onUpdate={fetchPosts}
                  folderName={folders.find(f => f.id === post.folderId)?.name}
                  folderEmoji={folders.find(f => f.id === post.folderId)?.emoji}
                  folderId={post.folderId}
                  activityDate={(post as any).activityDate}
                  folders={folders.filter(f => !f.isDefault)}
                />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Write Modal */}
      <ArchiveWriteModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        folders={folders.filter(f => !f.isDefault)}
        teamId={selectedTeam}
        onSubmitSuccess={fetchPosts}
      />

      {/* Folder Management Modal (Admin Only) */}
      <FolderManageModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        folders={folders}
        onSave={handleFoldersSave}
      />
    </div>
  );
}
