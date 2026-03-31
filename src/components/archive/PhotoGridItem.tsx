import { Instagram } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoGridItemProps {
  id: string;
  imageUrl: string;
  content?: string;
  likes: number;
  onClick: () => void;
}

export function PhotoGridItem({ imageUrl, content, likes, onClick }: PhotoGridItemProps) {
  const handleInstagramShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('인스타그램 공유 준비 중...', {
      description: '곧 연동 기능이 추가됩니다!',
    });
  };

  return (
    <div
      className="relative aspect-square cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-full h-full border-2 border-border-dark shadow-pixel-sm overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="팀 사진"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          /* Text preview for posts without images */
          <div className="w-full h-full bg-card p-2 flex flex-col justify-between">
            <p className="font-body text-[8px] text-foreground leading-tight line-clamp-4 overflow-hidden">
              {content || ''}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="font-pixel text-[6px] text-muted-foreground">📝</span>
              <span className="font-pixel text-[6px] text-muted-foreground">♥ {likes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Overlay on hover - only for images */}
      {imageUrl && (
        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="font-pixel text-[10px] text-white">♥ {likes}</span>
        </div>
      )}

      {/* Instagram Icon - only for images */}
      {imageUrl && (
        <button
          onClick={handleInstagramShare}
          className="absolute top-1 right-1 w-6 h-6 bg-accent border-2 border-accent-dark shadow-pixel-sm flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="인스타그램 공유"
        >
          <Instagram size={12} className="text-accent-foreground" />
        </button>
      )}
    </div>
  );
}
