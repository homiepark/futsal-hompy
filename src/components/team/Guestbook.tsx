import { useState } from 'react';
import { Send, Heart } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';

interface GuestbookEntry {
  id: string;
  author: string;
  message: string;
  date: string;
  likes: number;
}

const mockEntries: GuestbookEntry[] = [
  { id: '1', author: 'FC 번개', message: '좋은 경기였습니다! 다음에 또 뵙겠습니다 🔥', date: '2024.01.20', likes: 5 },
  { id: '2', author: '선데이 풋살', message: '팀워크가 정말 대단하시네요 👏', date: '2024.01.18', likes: 3 },
  { id: '3', author: '익명의 팬', message: '항상 응원합니다!', date: '2024.01.15', likes: 8 },
];

export function Guestbook() {
  const [entries] = useState<GuestbookEntry[]>(mockEntries);
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="kairo-panel">
      {/* Panel Header */}
      <div className="kairo-panel-header">
        <span className="text-sm">📝</span>
        <span>방명록</span>
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Message Input */}
        <div className="flex gap-1.5 mb-2">
          <input
            className="flex-1 px-2 py-1.5 bg-input border-2 border-border-dark font-pixel text-[9px] placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            placeholder="메시지를 남겨주세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <PixelButton variant="primary" size="sm" className="px-2">
            <Send size={12} />
          </PixelButton>
        </div>

        {/* Entries - Compact */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pixel-scrollbar">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-muted p-2 border-2 border-border-dark"
              style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.4)' }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-pixel text-[8px] text-primary">{entry.author}</span>
                <span className="font-pixel text-[7px] text-muted-foreground">{entry.date}</span>
              </div>
              <p className="font-pixel text-[9px] text-foreground mb-1 leading-tight">{entry.message}</p>
              <button className="flex items-center gap-0.5 text-accent hover:scale-110 transition-transform">
                <Heart size={10} fill="currentColor" />
                <span className="font-pixel text-[7px]">{entry.likes}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
