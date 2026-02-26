import { useState } from 'react';
import { Heart, MessageCircle, Share2, Instagram, Send, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { toast } from 'sonner';
import { useArchiveLikes } from '@/hooks/useArchiveLikes';
import { useArchiveComments } from '@/hooks/useArchiveComments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TimelinePostProps {
  id: string;
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  likes?: number;
  comments?: number;
  isMock?: boolean;
}

export function TimelinePost({
  id,
  author,
  date,
  content,
  imageUrl,
  imageUrls = [],
  likes: mockLikes = 0,
  comments: mockComments = 0,
  isMock = true,
}: TimelinePostProps) {
  const { user } = useAuth();
  const { likesCount, isLiked, toggleLike, loading: likeLoading } = useArchiveLikes(id);
  const { comments: commentList, commentsCount, addComment, deleteComment, loading: commentLoading } = useArchiveComments(id);
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Build the effective image list: prefer imageUrls array, fallback to single imageUrl
  const allImages = imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);

  const displayLikes = isMock ? mockLikes : likesCount;
  const displayComments = isMock ? mockComments : commentsCount;

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    await addComment(commentText);
    setCommentText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const prevImage = () => setCurrentImageIndex(i => Math.max(0, i - 1));
  const nextImage = () => setCurrentImageIndex(i => Math.min(allImages.length - 1, i + 1));

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

      {/* Image Carousel */}
      {allImages.length > 0 && (
        <div className="relative border-4 border-border-dark shadow-pixel overflow-hidden rounded-lg">
          <img 
            src={allImages[currentImageIndex]} 
            alt={`게시물 이미지 ${currentImageIndex + 1}`}
            className="w-full aspect-video object-cover transition-opacity duration-200"
          />

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-background/80 border-2 border-border-dark flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft size={14} className="text-foreground" />
                </button>
              )}
              {currentImageIndex < allImages.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-background/80 border-2 border-border-dark flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight size={14} className="text-foreground" />
                </button>
              )}
              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "w-1.5 h-1.5 border border-border-dark transition-colors",
                      idx === currentImageIndex ? "bg-primary" : "bg-background/60"
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Instagram Share */}
          <button 
            onClick={() => {
              toast.success('인스타그램 공유 준비 중...', {
                description: '곧 연동 기능이 추가됩니다!',
              });
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-accent border-2 border-accent-dark shadow-pixel-sm flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="인스타그램 공유"
          >
            <Instagram size={16} className="text-accent-foreground" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t-2 border-border">
        <button 
          onClick={toggleLike}
          disabled={likeLoading}
          className={cn(
            "flex items-center gap-1 transition-colors",
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
          )}
        >
          <Heart size={16} className={cn(isLiked && "fill-current")} />
          <span className="font-pixel text-[8px]">{displayLikes}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className={cn(
            "flex items-center gap-1 transition-colors",
            showComments ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <MessageCircle size={16} className={cn(showComments && "fill-primary/20")} />
          <span className="font-pixel text-[8px]">{displayComments}</span>
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors ml-auto">
          <Share2 size={16} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-2 pt-2 border-t-2 border-border">
          {/* Comment List */}
          {commentList.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {commentList.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 group">
                  <div className="w-6 h-6 bg-secondary border border-border-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-pixel text-[7px] text-muted-foreground">
                      {(comment.nickname || '풋').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[9px] text-foreground font-bold">
                        {comment.nickname}
                      </span>
                      <span className="font-pixel text-[7px] text-muted-foreground">
                        {format(new Date(comment.created_at), 'M.d HH:mm', { locale: ko })}
                      </span>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                    <p className="font-body text-xs text-foreground break-words">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-pixel text-[8px] text-muted-foreground text-center py-2">
              아직 댓글이 없습니다
            </p>
          )}

          {/* Comment Input */}
          {user ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="댓글을 입력하세요..."
                className="pixel-input flex-1 text-xs py-1.5 px-2"
                maxLength={200}
              />
              <button
                onClick={handleSubmitComment}
                disabled={commentLoading || !commentText.trim()}
                className={cn(
                  "w-8 h-8 flex items-center justify-center border-2 transition-colors",
                  commentText.trim()
                    ? "bg-primary border-primary-dark text-primary-foreground hover:brightness-110"
                    : "bg-muted border-border text-muted-foreground"
                )}
                style={commentText.trim() ? { boxShadow: '2px 2px 0 hsl(var(--primary-dark))' } : undefined}
              >
                <Send size={14} />
              </button>
            </div>
          ) : (
            <p className="font-pixel text-[8px] text-muted-foreground text-center py-1">
              로그인 후 댓글을 작성할 수 있습니다
            </p>
          )}
        </div>
      )}
    </PixelCard>
  );
}
