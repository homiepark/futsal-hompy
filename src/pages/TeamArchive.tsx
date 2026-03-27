import { useState } from 'react';
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

const myTeams = [
  { id: 'fc-bulkkot', name: 'FC 불꽃', emblem: '🔥' },
  { id: 'lions-fc', name: '라이언즈 FC', emblem: '🦁' },
];

const defaultFolders = [
  { id: 'all', name: '전체보기', emoji: '📁', isDefault: true },
  { id: 'matches', name: '경기 하이라이트', emoji: '⚽' },
  { id: 'training', name: '훈련 기록', emoji: '🏃' },
  { id: 'events', name: '팀 이벤트', emoji: '🎉' },
];

const mockPosts = [
  {
    id: '1',
    author: 'FC 불꽃',
    date: '2024.01.20',
    content: '오늘 FC 번개와의 경기에서 3-2로 극적인 역전승! 후반 막판 동점골에 이어 연장에서 결승골까지! 팀원들 모두 고생했습니다 💪🔥',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
    likes: 24,
    comments: 8,
    folderId: 'matches',
  },
  {
    id: '2',
    author: 'FC 불꽃',
    date: '2024.01.15',
    content: '신년 첫 경기 승리! 2024년도 좋은 출발입니다 ⚽',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600',
    likes: 31,
    comments: 12,
    folderId: 'matches',
  },
  {
    id: '3',
    author: 'FC 불꽃',
    date: '2024.01.08',
    content: '새해 첫 훈련! 올해 목표는 리그 우승입니다 🏆',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600',
    likes: 18,
    comments: 5,
    folderId: 'training',
  },
  {
    id: '4',
    author: 'FC 불꽃',
    date: '2024.01.02',
    content: '팀 유니폼 도착! 올해도 화이팅 🔥',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600',
    likes: 42,
    comments: 15,
    folderId: 'events',
    isVideo: false,
  },
  {
    id: '4-1',
    author: 'FC 불꽃',
    date: '2024.01.05',
    content: '이번 주 베스트 골 모음! 역대급 중거리 슛 터졌습니다 ⚽🔥',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
    likes: 67,
    comments: 23,
    folderId: 'matches',
    isVideo: true,
  },
  {
    id: '5',
    author: 'FC 불꽃',
    date: '2023.12.28',
    content: '송년회 단체사진 📸',
    imageUrl: 'https://images.unsplash.com/photo-1529629468155-c2f79a99fefc?w=600',
    likes: 56,
    comments: 22,
    folderId: 'events',
  },
  {
    id: '6',
    author: 'FC 불꽃',
    date: '2023.12.20',
    content: '마지막 경기 승리로 마무리!',
    imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600',
    likes: 38,
    comments: 10,
    folderId: 'matches',
  },
];

export default function TeamArchive() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamParam = searchParams.get('team');
  
  const [view, setView] = useState<'grid' | 'single'>('single');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(teamParam || 'all');
  const [folders, setFolders] = useState(defaultFolders);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const isAdmin = true; // Would check user's role

  // Filter posts by folder
  const filteredPosts = selectedFolder === 'all' 
    ? mockPosts 
    : mockPosts.filter(post => post.folderId === selectedFolder);

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

  const handleArchiveSubmit = (data: any) => {
    console.log('Archive post submitted:', data);
    // TODO: Save to Supabase
  };

  const handleFoldersSave = (newFolders: typeof folders) => {
    setFolders(newFolders);
    // TODO: Save to Supabase
  };

  // Find current team info
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
        <div className="mb-3">
          <TeamSelector 
            teams={myTeams} 
            selectedTeam={selectedTeam} 
            onSelect={setSelectedTeam} 
          />
        </div>

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
          {filteredPosts.length === 0 ? (
            <div className="kairo-panel p-8 text-center">
              <div className="text-4xl mb-3">📁</div>
              <p className="font-pixel text-[10px] text-muted-foreground">
                이 폴더에 게시물이 없습니다
              </p>
            </div>
          ) : view === 'grid' ? (
            /* Grid View - Denser */
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
            /* Single View (Timeline) - Denser */
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <TimelinePost key={post.id} {...post} />
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
        onSubmitSuccess={() => {
          console.log('Archive post created');
          // TODO: refresh posts from DB
        }}
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
