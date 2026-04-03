import { useState, useEffect } from 'react';
import { Pencil, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementHistoryModal } from './AnnouncementHistoryModal';
import { AnnouncementEditModal } from './AnnouncementEditModal';

interface Notice {
  id: string;
  content: string;
  created_at: string;
}

interface TeamAnnouncementProps {
  teamId: string;
  notices: Notice[];
  isAdmin: boolean;
  onCreateNotice: (content: string) => void;
  onRefresh: () => void;
}

export function TeamAnnouncement({
  teamId,
  notices,
  isAdmin,
  onCreateNotice,
  onRefresh,
}: TeamAnnouncementProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const latestNotice = notices[0];
  const noticeContent = latestNotice?.content || '오늘도 즐거운 풋살 하세요! ⚽';
  const isLongText = noticeContent.length > 30;

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < noticeContent.length) {
        setDisplayedText(noticeContent.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [noticeContent]);

  const handleSaveNotice = (content: string) => {
    onCreateNotice(content);
    setShowEdit(false);
  };

  return (
    <>
      <div
        className={cn(
          "relative bg-amber-50 border-3 border-amber-700 p-3 transition-transform duration-200",
          isHovered && "animate-bounce-subtle"
        )}
        style={{ 
          boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 text-xs">⭐</div>
        <div className="absolute -top-1 -right-1 text-xs">⭐</div>
        <div className="absolute -bottom-1 -left-1 text-xs">📣</div>
        <div className="absolute -bottom-1 -right-1 text-xs">📣</div>

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-pixel text-[10px] text-amber-800 uppercase">📢 공지</span>
          <div className="flex items-center gap-1">
            {/* History button */}
            <button
              onClick={() => setShowHistory(true)}
              className="w-6 h-6 bg-amber-100 border-2 border-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors"
              title="기록보기"
              style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
            >
              <Clock size={12} className="text-amber-700" />
            </button>
            
            {/* Edit button - Admin only */}
            {isAdmin && (
              <button
                onClick={() => setShowEdit(true)}
                className="w-6 h-6 bg-amber-100 border-2 border-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors group"
                title="공지 수정"
                style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
              >
                <Pencil size={12} className="text-amber-700 group-hover:animate-wiggle" />
              </button>
            )}
          </div>
        </div>

        {/* Notice Content */}
        <div className="min-h-[24px] overflow-hidden">
          {isLongText && !isTyping ? (
            // Marquee effect for long text
            <div className="marquee-container">
              <p className="font-body text-sm text-amber-900 whitespace-nowrap animate-marquee">
                {noticeContent}
                <span className="mx-8">•</span>
                {noticeContent}
              </p>
            </div>
          ) : (
            // Typewriter effect
            <p className="font-body text-sm text-amber-900">
              {displayedText}
              {isTyping && <span className="animate-blink">|</span>}
            </p>
          )}
        </div>

        {/* Date indicator */}
        {latestNotice && (
          <div className="mt-2 text-right">
            <span className="font-pixel text-[11px] text-amber-600">
              {new Date(latestNotice.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}
      </div>

      {/* History Modal */}
      <AnnouncementHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        notices={notices}
      />

      {/* Edit Modal - Admin only */}
      {isAdmin && (
        <AnnouncementEditModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveNotice}
          currentContent={latestNotice?.content || ''}
        />
      )}
    </>
  );
}
