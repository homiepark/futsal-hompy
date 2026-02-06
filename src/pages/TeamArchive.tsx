import { useState } from 'react';
import { Plus, Image, Video } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { TimelinePost } from '@/components/archive/TimelinePost';
import { PhotoGridItem } from '@/components/archive/PhotoGridItem';
import { ViewToggle } from '@/components/archive/ViewToggle';

const mockPosts = [
  {
    id: '1',
    author: 'FC 불꽃',
    date: '2024.01.20',
    content: '오늘 FC 번개와의 경기에서 3-2로 극적인 역전승! 후반 막판 동점골에 이어 연장에서 결승골까지! 팀원들 모두 고생했습니다 💪🔥',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
    likes: 24,
    comments: 8,
  },
  {
    id: '2',
    author: 'FC 불꽃',
    date: '2024.01.15',
    content: '신년 첫 경기 승리! 2024년도 좋은 출발입니다 ⚽',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600',
    likes: 31,
    comments: 12,
  },
  {
    id: '3',
    author: 'FC 불꽃',
    date: '2024.01.08',
    content: '새해 첫 훈련! 올해 목표는 리그 우승입니다 🏆',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600',
    likes: 18,
    comments: 5,
  },
  {
    id: '4',
    author: 'FC 불꽃',
    date: '2024.01.02',
    content: '팀 유니폼 도착! 올해도 화이팅 🔥',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600',
    likes: 42,
    comments: 15,
  },
  {
    id: '5',
    author: 'FC 불꽃',
    date: '2023.12.28',
    content: '송년회 단체사진 📸',
    imageUrl: 'https://images.unsplash.com/photo-1529629468155-c2f79a99fefc?w=600',
    likes: 56,
    comments: 22,
  },
  {
    id: '6',
    author: 'FC 불꽃',
    date: '2023.12.20',
    content: '마지막 경기 승리로 마무리!',
    imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600',
    likes: 38,
    comments: 10,
  },
];

export default function TeamArchive() {
  const [view, setView] = useState<'grid' | 'single'>('single');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const postsWithImages = mockPosts.filter(post => post.imageUrl);

  const handleGridItemClick = (postId: string) => {
    setSelectedPostId(postId);
    setView('single');
  };

  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-pixel text-xs text-foreground flex items-center gap-2">
          <span className="text-accent">✦</span>
          팀 아카이브
        </h2>
        <PixelButton variant="accent" size="sm" className="flex items-center gap-1">
          <Plus size={14} />
          <span>업로드</span>
        </PixelButton>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-center mb-6">
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <PixelButton variant="default" className="flex items-center justify-center gap-2 py-4">
          <Image size={18} />
          <span className="text-[8px]">사진 올리기</span>
        </PixelButton>
        <PixelButton variant="default" className="flex items-center justify-center gap-2 py-4">
          <Video size={18} />
          <span className="text-[8px]">영상 올리기</span>
        </PixelButton>
      </div>

      {/* Content based on view */}
      <div 
        className="transition-opacity duration-300 ease-in-out"
        key={view}
      >
        {view === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-3 gap-2">
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
          /* Single View (Timeline) */
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <TimelinePost key={post.id} {...post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
