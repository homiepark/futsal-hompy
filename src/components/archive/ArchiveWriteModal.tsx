import { useState, useRef } from 'react';
import { X, Image, Video, Hash, Upload, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ArchiveWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: { id: string; name: string; emoji: string }[];
  onSubmit: (data: ArchivePostData) => void;
}

interface ArchivePostData {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  folderId: string;
}

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

export function ArchiveWriteModal({ isOpen, onClose, folders, onSubmit }: ArchiveWriteModalProps) {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?.id || 'all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('이미지는 5MB 이하만 업로드 가능합니다');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = () => {
    if (!content.trim() && !imagePreview && !videoUrl) {
      toast.error('내용을 입력해주세요');
      return;
    }
    
    onSubmit({
      content,
      imageUrl: imagePreview || undefined,
      videoUrl: videoUrl || undefined,
      tags: selectedTags,
      folderId: selectedFolder,
    });

    // Reset form
    setContent('');
    setImagePreview(null);
    setVideoUrl('');
    setSelectedTags([]);
    toast.success('아카이브에 등록되었습니다!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
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
            <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">
              폴더 선택
            </label>
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
            <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘의 기록을 남겨보세요..."
              className="w-full h-24 px-3 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
              style={{ boxShadow: 'inset 2px 2px 0 hsl(var(--pixel-shadow) / 0.2)' }}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">
              이미지
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="relative">
                <div className="border-4 border-border-dark overflow-hidden" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-40 object-cover"
                  />
                </div>
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 w-6 h-6 bg-destructive border-2 border-border-dark flex items-center justify-center"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  <X size={12} className="text-destructive-foreground" />
                </button>
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
                  클릭하여 이미지 업로드
                </span>
              </button>
            )}
          </div>

          {/* Video Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-pixel text-[8px] text-muted-foreground uppercase">
                동영상 링크
              </label>
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
            <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">
              태그 선택
            </label>
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

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-3 border-t-3 border-border-dark bg-muted/50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-primary border-3 border-primary-dark font-pixel text-[9px] text-primary-foreground hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
          >
            <Upload size={12} />
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
