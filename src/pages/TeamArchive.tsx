import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Image, Video } from 'lucide-react';
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
  const { user } = useAuth();

  const [view, setView] = useState<'grid' | 'single'>('single');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(teamParam || 'all');
  const [folders, setFolders] = useState(defaultFolders);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [posts, setPosts] = useState<ArchivePost[]>([]);
  const [myTeams, setMyTeams] = useState<{ id: string; name: string; emblem: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = true; // TODO: check real admin status

  // Fetch user's teams
  useEffect(() => {
    async function fetchTeams() {
      if (!user) return;
      const { data } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name, emblem)')
        .eq('user_id', user.id);

      if (data) {
        const teams = data
          .map((d: any) => d.teams)
          .filter(Boolean);
        setMyTeams(teams);
        if (teams.length > 0 && !teamParam) {
          setSelectedTeam(teams[0].id);
        }
      }
    }
    fetchTeams();
  }, [user, teamParam]);

  // Fetch archive posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('archive_posts')
        .select('id, content, image_url, image_urls, video_url, folder_id, created_at, author_user_id')
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
          .select('user_id, nickname')
          .in('user_id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.nickname]) || []);

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
          author: profileMap.get(post.author_user_id) || '알 수 없음',
          date: format(new Date(post.created_at), 'yyyy.MM.dd'),
          content: post.content,
          imageUrl: post.image_url || undefined,
          imageUrls: post.image_urls || undefined,
          videoUrl: post.video_url || undefined,
          isVideo: !!post.video_url,
          likes: likeMap.get(post.id) || 0,
          comments: commentMap.get(post.id) || 0,
          folderId: post.folder_id || 'all',
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

  const handleFoldersSave = (newFolders: typeof folders) => {
    setFolders(newFolders);
  };

  const currentTeam = myTeams.find(t => t.id === selectedTeam);

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-3 border-border-dark">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PixelBackButton onClick={handleBack} />
            <div className="flex items-center gap-1.5">
              {currentTeam && <span className="text-lg">{currentTeam.emblem}</span>}
              <h1 className="font-pixel text-[10px] text-foreground">아카이브</h1>
            </div>
          </div>
          <PixelButton
            variant="accent"
            size="sm"
            className="flex items-center gap-1 text-[8px] px-2 py-1"
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

        {/* View Toggle & Filter Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <ViewToggle view={view} onViewChange={setView} />
          <div className="flex gap-1.5">
            <button className="pixel-mini-btn">
              <Image size={14} />
            </button>
            <button className="pixel-mini-btn">
              <Video size={14} />
            </button>
          </div>
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
              {postsWithImages.map((post) => (
                <PhotoGridItem
                  key={post.id}
                  id={post.id}
                  imageUrl={post.imageUrl!}
                  likes={post.likes}
                  onClick={() => handleGridItemClick(post.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <TimelinePost key={post.id} {...post} isMock={false} />
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
