import { Plus, Image, Video } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { TimelinePost } from '@/components/archive/TimelinePost';

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
    likes: 18,
    comments: 5,
  },
];

export default function TeamArchive() {
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

      {/* Timeline */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <TimelinePost key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
