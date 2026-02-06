import { Instagram } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoGridItemProps {
  id: string;
  imageUrl: string;
  likes: number;
  onClick: () => void;
}

export function PhotoGridItem({ imageUrl, likes, onClick }: PhotoGridItemProps) {
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
      {/* Image */}
      <div className="w-full h-full border-2 border-border-dark shadow-pixel-sm overflow-hidden">
        <img 
          src={imageUrl} 
          alt="팀 사진" 
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <span className="font-pixel text-[10px] text-white">♥ {likes}</span>
      </div>
      
      {/* Instagram Icon */}
      <button 
        onClick={handleInstagramShare}
        className="absolute top-1 right-1 w-7 h-7 bg-accent border-2 border-accent-dark shadow-pixel-sm flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="인스타그램 공유"
      >
        <Instagram size={14} className="text-accent-foreground" />
      </button>
    </div>
  );
}
