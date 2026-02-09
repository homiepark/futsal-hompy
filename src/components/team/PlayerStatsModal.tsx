import { useState } from 'react';
import { X, Calendar, Trophy, Send, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestbookEntry {
  id: string;
  authorNickname: string;
  message: string;
  date: string;
  likes: number;
}

interface PlayerStats {
  id: string;
  nickname: string;
  avatarUrl?: string;
  position: 'pivo' | 'ala' | 'fixo' | 'goleiro';
  yearsOfExperience: number;
  isAdmin?: boolean;
  joinDate?: string;
  bio?: string;
}

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerStats | null;
}

const positionInfo = {
  pivo: { label: '피보', emoji: '⚡', color: 'bg-accent/20 border-accent text-accent', fullName: 'Pivô (공격수)' },
  ala: { label: '아라', emoji: '💨', color: 'bg-primary/20 border-primary text-primary', fullName: 'Ala (측면)' },
  fixo: { label: '픽소', emoji: '🛡️', color: 'bg-blue-500/20 border-blue-500 text-blue-600', fullName: 'Fixo (수비수)' },
  goleiro: { label: '골레이로', emoji: '🧤', color: 'bg-green-500/20 border-green-500 text-green-600', fullName: 'Goleiro (골키퍼)' },
};

// Mock guestbook entries (will be replaced with real data later)
const mockGuestbookEntries: GuestbookEntry[] = [
  { id: '1', authorNickname: '별빛#1234', message: '오늘 경기 멋졌어요! 🔥', date: '2024.01.20', likes: 3 },
  { id: '2', authorNickname: '축구왕#5678', message: '패스 타이밍 진짜 좋았습니다 👍', date: '2024.01.18', likes: 5 },
  { id: '3', authorNickname: '풋살러#9012', message: '다음에 또 같이 해요!', date: '2024.01.15', likes: 2 },
];

export function PlayerStatsModal({ isOpen, onClose, player }: PlayerStatsModalProps) {
  const [guestbookMessage, setGuestbookMessage] = useState('');
  const [guestbookEntries] = useState<GuestbookEntry[]>(mockGuestbookEntries);

  if (!isOpen || !player) return null;

  const info = positionInfo[player.position];

  const handleSubmitGuestbook = () => {
    if (!guestbookMessage.trim()) return;
    // TODO: Submit to database
    console.log('Submit guestbook:', guestbookMessage);
    setGuestbookMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm kairo-panel animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="kairo-panel-header justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>선수 카드</span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 pixel-scrollbar">
          {/* Player Header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 bg-secondary border-4 border-border-dark overflow-hidden">
                {player.avatarUrl ? (
                  <img 
                    src={player.avatarUrl} 
                    alt={player.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-muted">
                    👤
                  </div>
                )}
              </div>
              {player.isAdmin && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-accent border-2 border-accent-dark flex items-center justify-center text-sm">
                  👑
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-pixel text-sm text-foreground truncate mb-1">
                {player.nickname}
              </h3>
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-1 mb-2',
                'border-2 text-[9px] font-pixel',
                info.color
              )}>
                <span>{info.emoji}</span>
                <span>{info.label}</span>
              </div>
              <p className="font-pixel text-[8px] text-muted-foreground">
                {info.fullName}
              </p>
            </div>
          </div>

          {/* Personal Bio Section */}
          <div className="kairo-section">
            <p className="font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">💬 한줄 소개</p>
            <div 
              className="bg-muted/50 border-2 border-border-dark p-2"
              style={{ boxShadow: 'inset 1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
            >
              <p className="font-pixel text-[10px] text-foreground leading-relaxed">
                {player.bio || '아직 자기소개가 없습니다 ✨'}
              </p>
            </div>
          </div>

          {/* Stats Grid - Simplified: Only Join Date & Career */}
          <div className="grid grid-cols-2 gap-2">
            {/* Join Date */}
            <div className="kairo-section flex items-center gap-2">
              <Calendar size={14} className="text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-pixel text-[7px] text-muted-foreground uppercase">가입일</p>
                <p className="font-pixel text-[9px] text-foreground truncate">
                  {player.joinDate || '2024.01.15'}
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="kairo-section flex items-center gap-2">
              <Trophy size={14} className="text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-pixel text-[7px] text-muted-foreground uppercase">경력</p>
                <p className="font-pixel text-[9px] text-foreground">
                  {player.yearsOfExperience}년차
                </p>
              </div>
            </div>
          </div>

          {/* Player Guestbook Section */}
          <div className="kairo-section">
            <p className="font-pixel text-[8px] text-muted-foreground uppercase mb-2">📝 선수 방명록</p>
            
            {/* Guestbook Input */}
            <div className="flex gap-1.5 mb-3">
              <input
                className="flex-1 px-2 py-1.5 bg-input border-2 border-border-dark font-pixel text-[9px] placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder="응원 메시지를 남겨주세요..."
                value={guestbookMessage}
                onChange={(e) => setGuestbookMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuestbook()}
                maxLength={50}
              />
              <button 
                onClick={handleSubmitGuestbook}
                className="px-2 py-1.5 bg-primary border-2 border-primary-dark hover:brightness-110 transition-all"
                style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
              >
                <Send size={12} className="text-primary-foreground" />
              </button>
            </div>

            {/* Guestbook Entries - Show latest 3 */}
            <div className="space-y-1.5 max-h-28 overflow-y-auto pixel-scrollbar">
              {guestbookEntries.slice(0, 3).map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-muted/50 p-2 border-2 border-border-dark"
                  style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-pixel text-[8px] text-primary">{entry.authorNickname}</span>
                    <span className="font-pixel text-[7px] text-muted-foreground">{entry.date}</span>
                  </div>
                  <p className="font-pixel text-[9px] text-foreground mb-1 leading-tight">{entry.message}</p>
                  <button className="flex items-center gap-0.5 text-accent hover:scale-110 transition-transform">
                    <Heart size={10} fill="currentColor" />
                    <span className="font-pixel text-[7px]">{entry.likes}</span>
                  </button>
                </div>
              ))}
              {guestbookEntries.length === 0 && (
                <p className="font-pixel text-[9px] text-muted-foreground text-center py-3">
                  아직 방명록이 없어요. 첫 번째 응원을 남겨보세요! 💪
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-muted border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-secondary transition-colors"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              닫기
            </button>
            <button
              className="flex-1 py-2 bg-primary border-3 border-primary-dark font-pixel text-[9px] text-primary-foreground hover:brightness-110 transition-all"
              style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
            >
              쪽지 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
