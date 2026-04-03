import { useState, useRef } from 'react';
import { X, Image, Video, Upload, Link, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ArchiveWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: { id: string; name: string; emoji: string }[];
  teamId: string;
  onSubmitSuccess?: () => void;
  onSubmit?: (data: any) => void;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const defaultTags = [
  { id: 'match', label: '#경기', emoji: '⚽' },
  { id: 'training', label: '#훈련', emoji: '🏃' },
  { id: 'victory', label: '#승리', emoji: '🏆' },
  { id: 'team', label: '#단체', emoji: '👥' },
  { id: 'event', label: '#이벤트', emoji: '🎉' },
  { id: 'mvp', label: '#MVP', emoji: '⭐' },
  { id: 'goal', label: '#골장면', emoji: '🎯' },
  { id: 'daily', label: '#일상', emoji: '📷' },
];

interface ImageItem {
  file: File;
  preview: string;
}

export function ArchiveWriteModal({ isOpen, onClose, folders, teamId, onSubmitSuccess }: ArchiveWriteModalProps) {
  useBodyScrollLock(isOpen);
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?.id || 'all');
  const [visibility, setVisibility] = useState<'public' | 'members'>('members');
  const [activityDate, setActivityDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;

    if (files.length > remaining) {
      toast.error(`이미지는 최대 ${MAX_IMAGES}장까지 업로드 가능합니다`);
    }

    const validFiles = files.slice(0, remaining).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}은(는) 10MB를 초과합니다`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { file, preview: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(`동영상은 50MB 이하만 직접 업로드 가능합니다. 큰 영상은 링크로 추가해주세요.`);
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoUrl('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview('');
  };

  const uploadVideo = async (file: File): Promise<string> => {
    if (!user) throw new Error('로그인 필요');
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}-video.${ext}`;

    const { error } = await supabase.storage
      .from('archive-images')
      .upload(filePath, file, { upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('archive-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!user) return [];
    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from('archive-images')
        .upload(filePath, file, { upsert: false });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('archive-images')
        .getPublicUrl(filePath);

      urls.push(urlData.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0 && !videoUrl) {
      toast.error('내용을 입력해주세요');
      return;
    }
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (!teamId || teamId === 'all') {
      toast.error('팀을 선택해주세요');
      return;
    }

    setUploading(true);
    setUploadProgress('');

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadProgress(`사진 업로드 중 (${images.length}장)...`);
        imageUrls = await uploadImages(images.map(i => i.file));
      }

      let finalVideoUrl = videoUrl || null;
      if (videoFile) {
        setUploadProgress('동영상 업로드 중...');
        finalVideoUrl = await uploadVideo(videoFile);
      }

      setUploadProgress('저장 중...');
      const { error } = await supabase.from('archive_posts').insert({
        team_id: teamId,
        author_user_id: user.id,
        content: content.trim(),
        image_url: imageUrls[0] || null,
        image_urls: imageUrls,
        video_url: finalVideoUrl,
        folder_id: selectedFolder === 'all' ? null : selectedFolder,
        activity_date: activityDate || null,
        visibility: visibility,
      });

      if (error) throw error;

      setContent('');
      setImages([]);
      setVideoUrl('');
      removeVideo();
      setSelectedTags([]);
      toast.success('팀 스토리에 등록되었습니다! 📸');
      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      console.error('Archive post error:', err);
      toast.error('게시글 등록에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md max-h-[90vh] overflow-hidden kairo-panel animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-t-xl sm:rounded-xl">
        {/* Header */}
        <div className="kairo-panel-header justify-between flex-shrink-0 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span>팀 스토리 글쓰기</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Folder Selection */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-2">폴더 선택</label>
            <div className="flex flex-wrap gap-1.5">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    'px-2.5 py-1.5 border-2 rounded-lg font-pixel text-[11px] transition-all',
                    selectedFolder === folder.id
                      ? 'bg-primary border-primary-dark text-primary-foreground'
                      : 'bg-muted border-border-dark text-foreground hover:border-primary'
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                >
                  {folder.emoji} {folder.name}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Selection */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-2">공개 범위</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibility('members')}
                className={cn(
                  'flex-1 py-2 border-2 rounded-lg font-pixel text-[11px] transition-all',
                  visibility === 'members'
                    ? 'bg-primary border-primary-dark text-primary-foreground'
                    : 'bg-muted border-border-dark text-foreground hover:border-primary'
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
              >
                🔒 팀원만
              </button>
              <button
                onClick={() => setVisibility('public')}
                className={cn(
                  'flex-1 py-2 border-2 rounded-lg font-pixel text-[11px] transition-all',
                  visibility === 'public'
                    ? 'bg-accent border-accent-dark text-accent-foreground'
                    : 'bg-muted border-border-dark text-foreground hover:border-accent'
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
              >
                🌐 전체 공개
              </button>
            </div>
          </div>

          {/* Activity Date */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-2">📅 활동 날짜 (선택)</label>
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full px-3 py-2 bg-input border-2 border-border-dark rounded-lg font-body text-sm focus:outline-none focus:border-primary"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
            />
            <p className="font-body text-xs text-muted-foreground mt-1.5 leading-relaxed">
              활동한 날짜를 지정하면 팀 일정 캘린더에 자동 연동!
              해당 날짜를 탭하면 이 게시글을 바로 모아볼 수 있어요 📸
            </p>
          </div>

          {/* Content Input */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘의 기록을 남겨보세요..."
              className="w-full h-28 px-3 py-2.5 bg-input border-2 border-border-dark rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
              style={{ boxShadow: 'inset 2px 2px 0 hsl(var(--pixel-shadow) / 0.2)' }}
            />
          </div>

          {/* Multi Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-pixel text-[11px] text-foreground">
                이미지 ({images.length}/{MAX_IMAGES})
              </label>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {images.length > 0 ? (
              <div className="space-y-2">
                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square border-2 border-border-dark rounded-lg overflow-hidden group" style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}>
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary border border-primary-dark rounded">
                          <span className="font-pixel text-[9px] text-primary-foreground">대표</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive/90 border border-border-dark rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  {/* Add More Button */}
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-border-dark rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-muted transition-colors"
                    >
                      <Plus size={16} className="text-muted-foreground" />
                      <span className="font-pixel text-[9px] text-muted-foreground">추가</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-border-dark rounded-lg bg-muted/50 flex flex-col items-center gap-2 hover:border-primary hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-secondary border-2 border-border-dark rounded-lg flex items-center justify-center">
                  <Image size={20} className="text-muted-foreground" />
                </div>
                <span className="font-body text-xs text-muted-foreground">
                  클릭하여 이미지 업로드 (최대 {MAX_IMAGES}장, 각 10MB)
                </span>
              </button>
            )}
          </div>

          {/* Video Upload / Link */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-2">
              🎬 동영상 (50MB 이하 직접 업로드 또는 링크)
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />

            {videoFile ? (
              <div className="relative border-2 border-border-dark rounded-lg overflow-hidden" style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}>
                <video src={videoPreview} className="w-full aspect-video object-cover bg-black" controls />
                <button
                  onClick={removeVideo}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive/90 border border-border-dark rounded flex items-center justify-center"
                >
                  <X size={12} className="text-destructive-foreground" />
                </button>
                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-accent border border-accent-dark rounded">
                  <span className="font-body text-[11px] text-accent-foreground">
                    {(videoFile.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex-1 py-4 border-2 border-dashed border-border-dark rounded-lg bg-muted/50 flex flex-col items-center gap-1 hover:border-primary hover:bg-muted transition-colors"
                >
                  <Video size={18} className="text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">파일 선택</span>
                </button>
                <div className="flex-1">
                  <div className="relative h-full">
                    <Link size={12} className="absolute left-2 top-3 text-muted-foreground" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="또는 URL 붙여넣기"
                      className="w-full h-full pl-7 pr-3 py-2 bg-input border-2 border-border-dark rounded-lg font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block font-pixel text-[11px] text-foreground mb-2">태그 선택</label>
            <div className="grid grid-cols-4 gap-1.5">
              {defaultTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={cn(
                    'py-1.5 border-2 rounded-lg font-pixel text-[11px] transition-all',
                    selectedTags.includes(tag.id)
                      ? 'bg-accent border-accent-dark text-accent-foreground'
                      : 'bg-muted border-border-dark text-foreground hover:border-accent'
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.4)' }}
                >
                  <span className="block text-sm mb-0.5">{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 border-t-3 border-border-dark bg-muted/50 flex gap-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-2.5 bg-secondary border-3 border-border-dark rounded-lg font-pixel text-[11px] text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-[2] py-3 bg-primary border-3 border-primary-dark rounded-lg font-pixel text-xs text-primary-foreground hover:brightness-110 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {uploadProgress || '업로드 중...'}
              </>
            ) : (
              <>
                <Upload size={14} />
                등록하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
