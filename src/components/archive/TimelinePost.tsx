import { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Send, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Reply, X, Plus, Image } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { toast } from 'sonner';
import { useArchiveLikes } from '@/hooks/useArchiveLikes';
import { useArchiveComments } from '@/hooks/useArchiveComments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { shareToKakao } from '@/lib/kakaoShare';

interface TimelinePostProps {
  id: string;
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  isVideo?: boolean;
  likes?: number;
  comments?: number;
  isMock?: boolean;
  authorUserId?: string;
  authorAvatarUrl?: string;
  isAdmin?: boolean;
  isOwner?: boolean;
  onDelete?: (postId: string) => void;
  onUpdate?: () => void;
  folderName?: string;
  folderEmoji?: string;
  folderId?: string;
  activityDate?: string;
  visibility?: 'public' | 'members';
  folders?: { id: string; name: string; emoji: string }[];
}

export function TimelinePost({
  id,
  author,
  date,
  content,
  imageUrl,
  imageUrls = [],
  videoUrl,
  isVideo = false,
  likes: mockLikes = 0,
  comments: mockComments = 0,
  isMock = true,
  authorUserId,
  authorAvatarUrl,
  isAdmin = false,
  isOwner = false,
  onDelete,
  onUpdate,
  folderName,
  folderEmoji,
  folderId,
  activityDate,
  visibility,
  folders = [],
}: TimelinePostProps) {
  const { user } = useAuth();
  const { likesCount, isLiked, toggleLike, loading: likeLoading } = useArchiveLikes(id);
  const { comments: commentList, commentsCount, addComment, deleteComment, loading: commentLoading } = useArchiveComments(id);
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; nickname: string } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [displayContent, setDisplayContent] = useState(content);
  const [editActivityDate, setEditActivityDate] = useState(activityDate || '');
  const [editFolderId, setEditFolderId] = useState(folderId || '');
  const [editVisibility, setEditVisibility] = useState<'public' | 'members'>(visibility || 'members');
  const [editVideoUrl, setEditVideoUrl] = useState(videoUrl || '');
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<{ file: File; preview: string }[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [displayFolderName, setDisplayFolderName] = useState(folderName);
  const [displayFolderEmoji, setDisplayFolderEmoji] = useState(folderEmoji);

  const isAuthor = !!user && !!authorUserId && user.id === authorUserId;
  const canEdit = isAuthor || isOwner;
  const canDelete = isAuthor || isAdmin || isOwner;

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    const { error } = await supabase
      .from('archive_posts')
      .delete()
      .eq('id', id);
    if (error) {
      toast.error('삭제에 실패했습니다.');
      return;
    }
    toast.success('게시글이 삭제되었습니다.');
    onDelete?.(id);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    // 새 이미지 업로드
    let uploadedUrls: string[] = [];
    if (newImageFiles.length > 0 && user) {
      for (const item of newImageFiles) {
        const ext = item.file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('archive-images').upload(filePath, item.file);
        if (upErr) { toast.error('이미지 업로드에 실패했습니다'); return; }
        const { data: urlData } = supabase.storage.from('archive-images').getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    const finalImageUrls = [...editImageUrls, ...uploadedUrls];

    const updateData: any = {
      content: editContent,
      activity_date: editActivityDate || null,
      folder_id: (editFolderId && editFolderId !== 'all') ? editFolderId : null,
      visibility: editVisibility,
      video_url: editVideoUrl || null,
      image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
      image_url: finalImageUrls[0] || null,
    };

    const { error } = await supabase
      .from('archive_posts')
      .update(updateData)
      .eq('id', id);
    if (error) {
      toast.error('수정에 실패했습니다.');
      return;
    }
    setDisplayContent(editContent);
    const newFolder = folders.find(f => f.id === editFolderId);
    setDisplayFolderName(newFolder?.name);
    setDisplayFolderEmoji(newFolder?.emoji);
    setIsEditing(false);
    toast.success('게시물이 수정되었습니다.');
    onUpdate?.();
  };

  const handleCancelEdit = () => {
    setEditContent(displayContent);
    setIsEditing(false);
  };

  // Build the effective image list: prefer imageUrls array, fallback to single imageUrl
  // 동영상 URL은 이미지 목록에서 제외
  const videoSrc = videoUrl || (isVideo ? imageUrl : '');
  const allImages = (imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []))
    .filter(url => url && url !== videoSrc && !url.match(/\.(mp4|webm|mov|avi)(\?|$)/i));

  // 통합 미디어 배열 (동영상 + 사진) - 라이트박스용
  const allMedia: { type: 'video' | 'image'; url: string }[] = [];
  if (videoSrc && !videoSrc.match(/youtube\.com|youtu\.be/)) {
    allMedia.push({ type: 'video', url: videoSrc });
  }
  allImages.forEach(url => allMedia.push({ type: 'image', url }));

  const displayLikes = isMock ? mockLikes : likesCount;
  const displayComments = isMock ? mockComments : commentsCount;

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    await addComment(commentText, replyingTo?.id);
    setCommentText('');
    setReplyingTo(null);
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
        <div className="w-10 h-10 bg-primary border-2 border-primary-dark flex items-center justify-center shadow-pixel-sm overflow-hidden">
          {authorAvatarUrl ? (
            <img src={authorAvatarUrl} alt={author} className="w-full h-full object-cover" />
          ) : (
            <span className="font-pixel text-[10px] text-primary-foreground">{author.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          {displayFolderName && displayFolderName !== '전체보기' && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 border border-primary/30 font-pixel text-[11px] text-primary mb-0.5">
              {displayFolderEmoji || '📁'} {displayFolderName}
            </span>
          )}
          <p className="font-pixel text-[10px] text-foreground">{author}</p>
          <div className="flex items-center gap-1.5">
            <span className="font-body text-xs text-muted-foreground">{date}</span>
            {visibility && (
              <span className={cn(
                "font-pixel text-[9px] px-1 py-0.5 rounded",
                visibility === 'public' ? "text-blue-500 bg-blue-50" : "text-amber-600 bg-amber-50"
              )}>{visibility === 'public' ? '🌐 전체' : '🔒 팀원'}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canEdit && !isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditContent(displayContent);
                setEditActivityDate(activityDate || '');
                setEditFolderId(folderId || '');
                setEditVisibility(visibility || 'members');
                setEditVideoUrl(videoUrl || '');
                setEditImageUrls([...allImages]);
                setNewImageFiles([]);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="게시물 수정"
            >
              <span className="text-sm">✏️</span>
            </button>
          )}
          {canDelete && !isEditing && (
            <button
              onClick={handleDeletePost}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              aria-label="게시물 삭제"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          {/* 내용 */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-1">내용</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 min-h-[100px] resize-y bg-input border-2 border-border-dark rounded-lg font-body text-sm focus:outline-none focus:border-primary"
              rows={4}
            />
          </div>

          {/* 공개 범위 */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-1">공개 범위</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditVisibility('members')}
                className={cn('flex-1 py-1.5 border-2 rounded-lg font-pixel text-[11px] transition-all',
                  editVisibility === 'members' ? 'bg-primary border-primary-dark text-primary-foreground' : 'bg-muted border-border-dark text-foreground hover:border-primary'
                )}>🔒 팀원만</button>
              <button type="button" onClick={() => setEditVisibility('public')}
                className={cn('flex-1 py-1.5 border-2 rounded-lg font-pixel text-[11px] transition-all',
                  editVisibility === 'public' ? 'bg-accent border-accent-dark text-accent-foreground' : 'bg-muted border-border-dark text-foreground hover:border-accent'
                )}>🌐 전체 공개</button>
            </div>
          </div>

          {/* 활동 날짜 */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-1">📅 활동 날짜</label>
            <input type="date" value={editActivityDate} onChange={(e) => setEditActivityDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-input border-2 border-border-dark rounded-lg font-body text-sm focus:outline-none focus:border-primary" />
          </div>

          {/* 폴더 */}
          {folders.length > 0 && (
            <div>
              <label className="block font-pixel text-[11px] text-foreground mb-1">📁 폴더</label>
              <div className="flex flex-wrap gap-1.5">
                {folders.map(f => (
                  <button key={f.id} type="button" onClick={() => setEditFolderId(f.id)}
                    className={cn('px-2.5 py-1 border-2 rounded-lg font-pixel text-[11px] transition-all',
                      editFolderId === f.id
                        ? 'bg-primary border-primary-dark text-primary-foreground'
                        : 'bg-muted border-border-dark text-foreground hover:border-primary'
                    )}>{f.emoji} {f.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* 이미지 관리 */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-1">🖼️ 이미지</label>
            <input ref={editFileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setNewImageFiles(prev => [...prev, { file, preview: reader.result as string }]);
                  };
                  reader.readAsDataURL(file);
                });
                if (editFileInputRef.current) editFileInputRef.current.value = '';
              }}
            />
            <div className="grid grid-cols-4 gap-1.5">
              {editImageUrls.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square border-2 border-border-dark rounded-lg overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setEditImageUrls(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive/90 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {newImageFiles.map((item, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square border-2 border-primary/50 rounded-lg overflow-hidden group">
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-0.5 left-0.5 px-1 bg-primary rounded"><span className="font-pixel text-[8px] text-primary-foreground">NEW</span></div>
                  <button onClick={() => setNewImageFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive/90 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              <button onClick={() => editFileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-border-dark rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-0.5 hover:border-primary transition-colors">
                <Plus size={14} className="text-muted-foreground" />
                <span className="font-pixel text-[9px] text-muted-foreground">추가</span>
              </button>
            </div>
          </div>

          {/* 동영상 URL */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-1">🎬 동영상 URL</label>
            <input type="url" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)}
              placeholder="YouTube 또는 동영상 링크"
              className="w-full px-3 py-1.5 bg-input border-2 border-border-dark rounded-lg font-body text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground" />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={handleCancelEdit}
              className="font-pixel text-[11px] px-4 py-2 border-2 border-border-dark rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors">
              취소
            </button>
            <button onClick={handleSaveEdit} disabled={!editContent.trim()}
              className="font-pixel text-[11px] px-4 py-2 border-2 border-primary-dark rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-colors disabled:opacity-50">
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-body text-sm text-foreground whitespace-pre-wrap break-words">
            {displayContent.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
              part.match(/^https?:\/\//) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline break-all">
                  {part.includes('youtube.com') || part.includes('youtu.be') ? '🎬 YouTube 링크' :
                   part.includes('instagram.com') ? '📸 Instagram 링크' : part}
                </a>
              ) : part
            )}
          </p>
          {/* YouTube embeds */}
          {displayContent.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g)?.map((match, i) => {
            const videoId = match.replace(/.*(?:youtube\.com\/watch\?v=|youtu\.be\/)/,'');
            return (
              <div key={`yt-${i}`} className="border-3 border-border-dark overflow-hidden" style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player - YouTube uses iframe, direct files use video tag */}
      {(isVideo || videoUrl) && (() => {
        const url = videoUrl || imageUrl || '';
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (ytMatch) {
          return (
            <div className="border-3 border-border-dark overflow-hidden" style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}>
              <iframe
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          );
        }
        // Direct video file - tap to open in lightbox gallery
        return (
          <button
            onClick={() => { setCurrentImageIndex(0); setShowLightbox(true); }}
            className="relative border-4 border-border-dark shadow-pixel overflow-hidden rounded-lg w-full text-left"
          >
            <video src={`${url}#t=0.5`} preload="metadata" muted playsInline className="w-full aspect-video object-cover pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <span className="text-xl ml-0.5">▶</span>
              </div>
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent border-2 border-accent-dark rounded font-pixel text-[11px] text-accent-foreground"
              style={{ boxShadow: '1px 1px 0 hsl(var(--accent-dark))' }}>
              🎬 VIDEO
            </div>
            {allImages.length > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded font-pixel text-[11px] text-white">
                +{allImages.length} 📸
              </div>
            )}
          </button>
        );
      })()}

      {/* Image Grid Preview - 동영상과 함께 올려도 표시 */}
      {allImages.length > 0 && (
        <div className={cn(
          'grid gap-1 border-4 border-border-dark shadow-pixel overflow-hidden rounded-lg',
          allImages.length === 1 ? 'grid-cols-1' :
          allImages.length === 2 ? 'grid-cols-2' :
          allImages.length === 3 ? 'grid-cols-3' :
          'grid-cols-3'
        )}>
          {allImages.slice(0, 6).map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentImageIndex(idx + (videoSrc && !videoSrc.match(/youtube\.com|youtu\.be/) ? 1 : 0)); setShowLightbox(true); }}
              className={cn(
                'relative overflow-hidden bg-black/5',
                allImages.length === 1 ? 'aspect-auto max-h-96' : 'aspect-square'
              )}
            >
              <img src={img} alt={`사진 ${idx + 1}`} className={cn(
                'w-full hover:scale-105 transition-transform duration-200',
                allImages.length === 1 ? 'h-auto object-contain' : 'h-full object-cover'
              )} />
              {idx === 5 && allImages.length > 6 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="font-pixel text-white text-sm">+{allImages.length - 6}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox - Full screen media viewer (video + images) */}
      {showLightbox && allMedia.length > 0 && (
        <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col" style={{ touchAction: 'none' }} onClick={() => setShowLightbox(false)}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[11px]">{currentImageIndex + 1} / {allMedia.length}</span>
              {allMedia[currentImageIndex]?.type === 'video' && (
                <span className="px-1.5 py-0.5 bg-accent rounded font-pixel text-[9px] text-accent-foreground">🎬 VIDEO</span>
              )}
            </div>
            <button onClick={() => setShowLightbox(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded">
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Media with swipe - 슬라이드 방식 */}
          <div
            className="flex-1 relative overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              (e.currentTarget as any)._touchStartX = touch.clientX;
              (e.currentTarget as any)._touchStartY = touch.clientY;
            }}
            onTouchMove={(e) => {
              const startX = (e.currentTarget as any)._touchStartX;
              const startY = (e.currentTarget as any)._touchStartY;
              if (startX === undefined) return;
              const diffX = Math.abs(e.touches[0].clientX - startX);
              const diffY = Math.abs(e.touches[0].clientY - startY);
              if (diffX > diffY) {
                e.preventDefault();
              }
            }}
            onTouchEnd={(e) => {
              const startX = (e.currentTarget as any)._touchStartX;
              const startY = (e.currentTarget as any)._touchStartY;
              if (startX === undefined) return;
              const endX = e.changedTouches[0].clientX;
              const endY = e.changedTouches[0].clientY;
              const diffX = startX - endX;
              const diffY = Math.abs(startY - endY);
              // 가로 스와이프만 (세로보다 가로 이동이 클 때)
              if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
                if (diffX > 0 && currentImageIndex < allMedia.length - 1) {
                  setCurrentImageIndex(i => i + 1);
                } else if (diffX < 0 && currentImageIndex > 0) {
                  setCurrentImageIndex(i => i - 1);
                }
              }
            }}
          >
            {/* 슬라이드 트랙 */}
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {allMedia.map((item, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center px-4">
                  {item.type === 'video' ? (
                    <video
                      key={item.url}
                      src={item.url}
                      controls
                      autoPlay={idx === currentImageIndex}
                      playsInline
                      className="max-w-full max-h-full object-contain bg-black rounded-lg"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* 좌우 화살표 (2개 이상일 때) */}
            {allMedia.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button onClick={() => setCurrentImageIndex(i => i - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                )}
                {currentImageIndex < allMedia.length - 1 && (
                  <button onClick={() => setCurrentImageIndex(i => i + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Dots */}
          {allMedia.length > 1 && (
            <div className="flex justify-center gap-2 pb-6">
              {allMedia.map((item, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={cn(
                    'rounded-full transition-colors',
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/30',
                    item.type === 'video' ? 'w-3 h-3' : 'w-2 h-2'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-2 border-t-2 border-border">
        <button
          onClick={toggleLike}
          disabled={likeLoading}
          className={cn(
            "flex items-center gap-1.5 p-1.5 transition-colors",
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
          )}
        >
          <Heart size={22} className={cn(isLiked && "fill-current")} />
          <span className="font-pixel text-[10px]">{displayLikes}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(
            "flex items-center gap-1.5 p-1.5 transition-colors",
            showComments ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <MessageCircle size={22} className={cn(showComments && "fill-primary/20")} />
          <span className="font-pixel text-[10px]">{displayComments}</span>
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button
          className="text-muted-foreground hover:text-primary transition-colors ml-auto p-1.5"
          onClick={() => {
            const doShare = () => {
              const postUrl = `${window.location.origin}/archive?post=${id}`;
              const postImage = allImages[0] || videoUrl || undefined;
              shareToKakao({
                title: `${author}의 게시글`,
                imageUrl: postImage,
                linkUrl: postUrl,
                buttonTitle: '게시글 보기',
              });
            };
            if (visibility === 'members' || !visibility) {
              if (confirm('이 게시글은 팀원만 볼 수 있어요.\n그래도 공유할까요?')) {
                doShare();
              }
            } else {
              doShare();
            }
          }}
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-2 pt-2 border-t-2 border-border">
          {/* Comment List */}
          {commentList.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commentList.map((comment) => (
                <div key={comment.id}>
                  {/* Parent Comment */}
                  <div className="flex items-start gap-2 group">
                    <div className="w-7 h-7 rounded-full bg-secondary border-2 border-border-dark flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                      {comment.avatar_url ? (
                        <img src={comment.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-pixel text-[11px] text-muted-foreground">
                          {(comment.nickname || '풋').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[9px] text-foreground font-bold">
                          {comment.nickname}
                        </span>
                        <span className="font-pixel text-[11px] text-muted-foreground">
                          {format(new Date(comment.created_at), 'M.d HH:mm', { locale: ko })}
                        </span>
                        {user && (
                          <button
                            onClick={() => setReplyingTo({ id: comment.id, nickname: comment.nickname || '풋살러' })}
                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                          >
                            <Reply size={10} />
                            <span className="font-pixel text-[11px]">답글</span>
                          </button>
                        )}
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

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1.5 pl-3 border-l-2 border-border">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2 group">
                          <div className="w-5 h-5 rounded-full bg-secondary border border-border-dark flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                            {reply.avatar_url ? (
                              <img src={reply.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-pixel text-[11px] text-muted-foreground">
                                {(reply.nickname || '풋').charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-pixel text-[11px] text-foreground font-bold">
                                {reply.nickname}
                              </span>
                              <span className="font-pixel text-[11px] text-muted-foreground">
                                {format(new Date(reply.created_at), 'M.d HH:mm', { locale: ko })}
                              </span>
                              {user?.id === reply.user_id && (
                                <button
                                  onClick={() => deleteComment(reply.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 size={9} />
                                </button>
                              )}
                            </div>
                            <p className="font-body text-[11px] text-foreground break-words">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="font-pixel text-[11px] text-muted-foreground text-center py-2">
              아직 댓글이 없습니다
            </p>
          )}

          {/* Reply indicator */}
          {replyingTo && (
            <div className="flex items-center gap-2 px-2 py-1 bg-muted border-2 border-border-dark">
              <Reply size={10} className="text-primary" />
              <span className="font-pixel text-[11px] text-muted-foreground">
                {replyingTo.nickname}에게 답글
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-auto text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={10} />
              </button>
            </div>
          )}

          {/* Comment Input */}
          {user ? (
            <div className="flex items-center gap-1.5 pixel-input py-1 px-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={replyingTo ? `${replyingTo.nickname}에게 답글...` : "댓글을 입력하세요..."}
                className="flex-1 text-xs bg-transparent outline-none min-w-0"
                maxLength={200}
              />
              <button
                onClick={handleSubmitComment}
                disabled={commentLoading || !commentText.trim()}
                className={cn(
                  "shrink-0 w-7 h-7 flex items-center justify-center rounded transition-colors",
                  commentText.trim()
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                <Send size={16} />
              </button>
            </div>
          ) : (
            <p className="font-pixel text-[11px] text-muted-foreground text-center py-1">
              로그인 후 댓글을 작성할 수 있습니다
            </p>
          )}
        </div>
      )}
    </PixelCard>
  );
}
