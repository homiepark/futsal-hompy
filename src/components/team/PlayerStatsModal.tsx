import { X, Star, Calendar, MapPin, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStats {
  id: string;
  nickname: string;
  avatarUrl?: string;
  position: 'pivo' | 'ala' | 'fixo' | 'goleiro';
  yearsOfExperience: number;
  isAdmin?: boolean;
  joinDate?: string;
  mannerRating?: number;
  matchesPlayed?: number;
  goals?: number;
  assists?: number;
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

export function PlayerStatsModal({ isOpen, onClose, player }: PlayerStatsModalProps) {
  if (!isOpen || !player) return null;

  const info = positionInfo[player.position];
  const mannerRating = player.mannerRating ?? 4.5;
  const fullStars = Math.floor(mannerRating);
  const hasHalfStar = mannerRating % 1 >= 0.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm kairo-panel animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="kairo-panel-header justify-between">
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

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Player Header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
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

          {/* Stats Grid */}
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

            {/* Matches Played */}
            <div className="kairo-section flex items-center gap-2">
              <span className="text-sm">⚽</span>
              <div className="min-w-0">
                <p className="font-pixel text-[7px] text-muted-foreground uppercase">참여 경기</p>
                <p className="font-pixel text-[9px] text-foreground">
                  {player.matchesPlayed ?? 42}경기
                </p>
              </div>
            </div>

            {/* Goals/Assists */}
            <div className="kairo-section flex items-center gap-2">
              <span className="text-sm">🎯</span>
              <div className="min-w-0">
                <p className="font-pixel text-[7px] text-muted-foreground uppercase">득점/도움</p>
                <p className="font-pixel text-[9px] text-foreground">
                  {player.goals ?? 12}G / {player.assists ?? 8}A
                </p>
              </div>
            </div>
          </div>

          {/* Manner Rating */}
          <div className="kairo-section">
            <div className="flex items-center justify-between mb-2">
              <p className="font-pixel text-[8px] text-muted-foreground uppercase">매너 지수</p>
              <p className="font-pixel text-[10px] text-accent">{mannerRating.toFixed(1)}</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={cn(
                    'transition-colors',
                    i < fullStars 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : i === fullStars && hasHalfStar
                        ? 'text-yellow-500 fill-yellow-500/50'
                        : 'text-muted-foreground'
                  )}
                />
              ))}
              <span className="ml-2 font-pixel text-[8px] text-muted-foreground">
                ({Math.floor(Math.random() * 50 + 20)} 평가)
              </span>
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
