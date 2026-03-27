import { X, Clock, Megaphone } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface Notice {
  id: string;
  content: string;
  created_at: string;
}

interface AnnouncementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
}

export function AnnouncementHistoryModal({
  isOpen,
  onClose,
  notices,
}: AnnouncementHistoryModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md bg-card border-4 border-border-dark animate-scale-in max-h-[80vh] flex flex-col"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-amber-100 border-b-4 border-amber-700">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-700" />
            <h2 className="font-pixel text-[10px] text-amber-800 uppercase">
              📜 공지 기록
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notices.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone size={32} className="mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="font-pixel text-[9px] text-muted-foreground">
                아직 공지가 없습니다
              </p>
            </div>
          ) : (
            notices.map((notice, index) => (
              <div
                key={notice.id}
                className="bg-amber-50 border-3 border-amber-600 p-3"
                style={{ 
                  boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))',
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Date */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-pixel text-[8px] text-amber-600 bg-amber-200 px-2 py-0.5 border border-amber-500">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-pixel text-[8px] text-amber-500">
                    {new Date(notice.created_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Content */}
                <p className="font-body text-sm text-amber-900 leading-relaxed">
                  {notice.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-border-dark bg-muted/30">
          <p className="font-pixel text-[8px] text-muted-foreground text-center">
            총 {notices.length}개의 공지
          </p>
        </div>
      </div>
    </div>
  );
}
