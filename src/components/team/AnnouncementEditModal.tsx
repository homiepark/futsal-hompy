import { useState } from 'react';
import { X, Pencil, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface AnnouncementEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  currentContent: string;
}

export function AnnouncementEditModal({
  isOpen,
  onClose,
  onSave,
  currentContent,
}: AnnouncementEditModalProps) {
  useBodyScrollLock(isOpen);
  const [content, setContent] = useState(currentContent);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    await onSave(content.trim());
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md bg-card border-4 border-border-dark animate-scale-in"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-amber-100 border-b-4 border-amber-700">
          <div className="flex items-center gap-2">
            <Pencil size={18} className="text-amber-700 animate-wiggle" />
            <h2 className="font-pixel text-[10px] text-amber-800 uppercase">
              ✏️ 공지 작성
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 bg-amber-200 border-2 border-amber-700 flex items-center justify-center hover:bg-amber-300 transition-colors"
          >
            <X size={14} className="text-amber-800" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <label className="font-pixel text-[9px] text-foreground uppercase block mb-2">
              공지 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="팀원들에게 전달할 공지사항을 입력하세요..."
              rows={4}
              maxLength={200}
              className="w-full px-3 py-2 bg-background border-3 border-border-dark outline-none focus:border-amber-600 resize-none font-body text-sm"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            />
            <div className="text-right mt-1">
              <span className="font-pixel text-[11px] text-muted-foreground">
                {content.length}/200
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 p-2 rounded">
            <p className="font-pixel text-[11px] text-amber-700">
              💡 팁: 공지사항은 팀 홈 상단에 표시되며, 모든 팀원이 볼 수 있습니다.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t-2 border-border-dark bg-muted/20 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className={cn(
              "flex-1 py-2.5 border-3 font-pixel text-[9px] flex items-center justify-center gap-1.5 transition-all",
              isSaving || !content.trim()
                ? "bg-muted text-muted-foreground border-border-dark cursor-not-allowed"
                : "bg-amber-500 text-white border-amber-700 hover:bg-amber-600"
            )}
            style={{ boxShadow: isSaving || !content.trim() ? '2px 2px 0 hsl(var(--pixel-shadow))' : '2px 2px 0 hsl(30, 90%, 30%)' }}
          >
            <Send size={12} />
            {isSaving ? '저장 중...' : '공지 등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
