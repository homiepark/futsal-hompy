import { useState } from 'react';
import { Send, Heart } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelIcon } from '@/components/ui/PixelIcon';

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
    <PixelCard>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📝</span>
        <h3 className="font-pixel text-xs text-foreground">방명록</h3>
      </div>

      {/* Message Input */}
      <div className="flex gap-2 mb-4">
        <PixelInput
          placeholder="메시지를 남겨주세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <PixelButton variant="primary" size="sm">
          <Send size={14} />
        </PixelButton>
      </div>

      {/* Entries */}
      <div className="space-y-3 max-h-64 overflow-y-auto pixel-scrollbar">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className="bg-secondary p-3 border-2 border-border-dark shadow-pixel-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-[8px] text-primary">{entry.author}</span>
              <span className="font-body text-xs text-muted-foreground">{entry.date}</span>
            </div>
            <p className="font-body text-sm text-foreground mb-2">{entry.message}</p>
            <button className="flex items-center gap-1 text-accent hover:scale-110 transition-transform">
              <Heart size={12} fill="currentColor" />
              <span className="font-pixel text-[8px]">{entry.likes}</span>
            </button>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
