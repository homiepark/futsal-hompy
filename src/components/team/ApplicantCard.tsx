import { User, MessageCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicantCardProps {
  id: string;
  nickname: string;
  nicknameTag?: string;
  realName?: string;
  avatarUrl?: string;
  yearsOfExperience: number;
  monthsOfExperience?: number;
  preferredPosition: string;
  preferredPositions?: string[];
  message?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onMessage: (id: string) => void;
}

const positionLabels: Record<string, string> = {
  pivo: '피보',
  ala: '알라',
  fixo: '픽소',
  goleiro: '골레이루',
  MF: '미드필더',
};

const positionColors: Record<string, string> = {
  pivo: 'bg-accent text-accent-foreground',
  ala: 'bg-primary text-primary-foreground',
  fixo: 'bg-primary/70 text-primary-foreground',
  goleiro: 'bg-accent/80 text-accent-foreground',
  MF: 'bg-muted text-muted-foreground',
};

export function ApplicantCard({
  id,
  nickname,
  nicknameTag,
  realName,
  avatarUrl,
  yearsOfExperience,
  monthsOfExperience,
  preferredPosition,
  preferredPositions,
  message,
  onApprove,
  onReject,
  onMessage,
}: ApplicantCardProps) {
  const allPositions = preferredPositions?.length ? preferredPositions : [preferredPosition];
  const positionLabel = allPositions.map(p => positionLabels[p] || p).join(' / ');
  const positionColor = positionColors[preferredPosition] || 'bg-muted text-muted-foreground';

  // Format display name for admin view
  const displayName = nicknameTag 
    ? `${nickname}#${nicknameTag}` 
    : nickname;
  const fullDisplayName = realName 
    ? `${displayName} (${realName})` 
    : displayName;

  return (
    <div className="kairo-panel p-0 overflow-hidden">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-3 p-3 bg-secondary/50 border-b-2 border-border-dark">
        {/* Avatar */}
        <div className="w-12 h-12 border-3 border-border-dark bg-muted flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-muted-foreground" />
          )}
        </div>

        {/* Name and position */}
        <div className="flex-1 min-w-0">
          <h3 className="font-pixel text-sm text-foreground truncate" title={fullDisplayName}>
            {displayName}
          </h3>
          {realName && (
            <p className="font-pixel text-[9px] text-accent truncate" title={realName}>
              ({realName})
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'font-pixel text-[8px] px-2 py-0.5 border-2 border-border-dark',
              positionColor
            )}
              style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.5)' }}
            >
              {positionLabel}
            </span>
            <span className="font-pixel text-[9px] text-muted-foreground">
              경력 {yearsOfExperience}년
            </span>
          </div>
        </div>

        {/* Chat button */}
        <button
          onClick={() => onMessage(id)}
          className="pixel-mini-btn"
          title="쪽지 보내기"
        >
          <MessageCircle size={14} />
        </button>
      </div>

      {/* Introduction message */}
      {message && (
        <div className="p-3 bg-card border-b-2 border-border-dark/50">
          <p className="font-pixel text-[9px] text-muted-foreground mb-1">💬 자기소개</p>
          <p className="text-sm text-foreground leading-relaxed">{message}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex">
        <button
          onClick={() => onReject(id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive font-pixel text-[10px] uppercase transition-colors border-r-2 border-border-dark"
        >
          <X size={14} />
          거절
        </button>
        <button
          onClick={() => onApprove(id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-pixel text-[10px] uppercase transition-colors"
        >
          <Check size={14} />
          승인
        </button>
      </div>
    </div>
  );
}
