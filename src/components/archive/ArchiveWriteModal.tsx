import { useState, useRef } from 'react';
import { X, Image, Video, Upload, Link, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?.id || 'all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

    setUploading(true);

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images.map(i => i.file));
      }

      const { error } = await supabase.from('archive_posts').insert({
        team_id: teamId,
        author_user_id: user.id,
        content: content.trim(),
        image_url: imageUrls[0] || null,
        image_urls: imageUrls,
        video_url: videoUrl || null,
        folder_id: selectedFolder,
      });

      if (error) throw error;

      setContent('');
      setImages([]);
      setVideoUrl('');
      setSelectedTags([]);
      toast.success('아카이브에 등록되었습니다! 📸');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-hidden kairo-panel animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="kairo-panel-header justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span>아카이브 작성</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Folder Selection */}
          <div>
            <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">폴더 선택</label>
            <div className="flex flex-wrap gap-1.5">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    'px-2 py-1 border-2 font-pixel text-[8px] transition-all',
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

          {/* Content Input */}
          <div>
            <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘의 기록을 남겨보세요..."
              className="w-full h-24 px-3 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
              style={{ boxShadow: 'inset 2px 2px 0 hsl(var(--pixel-shadow) / 0.2)' }}
            />
          </div>

          {/* Multi Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-pixel text-[8px] text-muted-foreground uppercase">
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
                    <div key={idx} className="relative aspect-square border-3 border-border-dark overflow-hidden group" style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}>
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-0.5 left-0.5 px-1 bg-primary border border-primary-dark">
                          <span className="font-pixel text-[6px] text-primary-foreground">대표</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive/90 border border-border-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  {/* Add More Button */}
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-3 border-dashed border-border-dark bg-muted/50 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-muted transition-colors"
                    >
                      <Plus size={16} className="text-muted-foreground" />
                      <span className="font-pixel text-[6px] text-muted-foreground">추가</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-3 border-dashed border-border-dark bg-muted/50 flex flex-col items-center gap-2 hover:border-primary hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center">
                  <Image size={20} className="text-muted-foreground" />
                </div>
                <span className="font-pixel text-[8px] text-muted-foreground">
                  클릭하여 이미지 업로드 (최대 {MAX_IMAGES}장, 각 10MB)
                </span>
              </button>
            )}
          </div>

          {/* Video Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-pixel text-[8px] text-muted-foreground uppercase">동영상 링크</label>
              <button
                onClick={() => setShowVideoInput(!showVideoInput)}
                className={cn(
                  'px-2 py-0.5 border-2 font-pixel text-[7px] transition-all',
                  showVideoInput
                    ? 'bg-primary border-primary-dark text-primary-foreground'
                    : 'bg-muted border-border-dark text-foreground hover:border-primary'
                )}
              >
                <Video size={10} className="inline mr-1" />
                {showVideoInput ? '접기' : '추가'}
              </button>
            </div>
            {showVideoInput && (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Link size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube 또는 동영상 URL"
                    className="w-full pl-7 pr-3 py-2 bg-input border-2 border-border-dark font-pixel text-[9px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">태그 선택</label>
            <div className="grid grid-cols-4 gap-1.5">
              {defaultTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={cn(
                    'py-1.5 border-2 font-pixel text-[7px] transition-all',
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
            className="flex-1 py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 py-2.5 bg-primary border-3 border-primary-dark font-pixel text-[9px] text-primary-foreground hover:brightness-110 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
          >
            {uploading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload size={12} />
                등록하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
