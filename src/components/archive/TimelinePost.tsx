import { Heart, MessageCircle, Share2, Instagram } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { toast } from 'sonner';

interface TimelinePostProps {
  id: string;
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
}

export function TimelinePost({
  author,
  date,
  content,
  imageUrl,
  likes,
  comments,
}: TimelinePostProps) {
  return (
    <PixelCard className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary border-2 border-primary-dark flex items-center justify-center shadow-pixel-sm">
          <span className="font-pixel text-[10px] text-primary-foreground">FC</span>
        </div>
        <div>
          <p className="font-pixel text-[10px] text-foreground">{author}</p>
          <p className="font-body text-xs text-muted-foreground">{date}</p>
        </div>
      </div>

      {/* Content */}
      <p className="font-body text-sm text-foreground">{content}</p>

      {/* Image */}
      {imageUrl && (
        <div className="border-4 border-border-dark shadow-pixel overflow-hidden">
          <img 
            src={imageUrl} 
            alt="게시물 이미지" 
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t-2 border-border">
        <button className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
          <Heart size={16} />
          <span className="font-pixel text-[8px]">{likes}</span>
        </button>
        <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle size={16} />
          <span className="font-pixel text-[8px]">{comments}</span>
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors ml-auto">
          <Share2 size={16} />
        </button>
      </div>
    </PixelCard>
  );
}
