import { useState } from 'react';
import { X, Check, Trophy, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface MatchResultConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  opponentName: string;
  opponentEmblem: string;
  myTeamName: string;
  myTeamEmblem: string;
  matchDate: string;
  onSubmit: (result: 'win' | 'draw' | 'loss') => void;
}

export function MatchResultConfirm({
  isOpen,
  onClose,
  matchId,
  opponentName,
  opponentEmblem,
  myTeamName,
  myTeamEmblem,
  matchDate,
  onSubmit,
}: MatchResultConfirmProps) {
  useBodyScrollLock(isOpen);
  const [selectedResult, setSelectedResult] = useState<'win' | 'draw' | 'loss' | null>(null);
  const [mannerRating, setMannerRating] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedResult) {
      toast.error('경기 결과를 선택해주세요');
      return;
    }
    onSubmit(selectedResult);
    toast.success('경기 결과가 제출되었습니다! 상대팀 확인 후 반영됩니다.');
    onClose();
  };

  const results = [
    { key: 'win' as const, label: '승리', emoji: '🏆', color: 'border-primary bg-primary/10 text-primary' },
    { key: 'draw' as const, label: '무승부', emoji: '🤝', color: 'border-muted-foreground bg-muted text-foreground' },
    { key: 'loss' as const, label: '패배', emoji: '😤', color: 'border-accent bg-accent/10 text-accent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={14} />
            <span className="font-pixel text-[10px]">경기 결과 입력</span>
          </div>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Match Info */}
          <div className="text-center">
            <p className="font-pixel text-[11px] text-muted-foreground mb-2">{matchDate}</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <span className="text-2xl block">{myTeamEmblem}</span>
                <span className="font-pixel text-[11px] text-foreground">{myTeamName}</span>
              </div>
              <span className="font-pixel text-[12px] text-accent">VS</span>
              <div className="text-center">
                <span className="text-2xl block">{opponentEmblem}</span>
                <span className="font-pixel text-[11px] text-foreground">{opponentName}</span>
              </div>
            </div>
          </div>

          {/* Result Selection */}
          <div>
            <p className="font-pixel text-[11px] text-muted-foreground mb-2">경기 결과</p>
            <div className="grid grid-cols-3 gap-2">
              {results.map(r => (
                <button
                  key={r.key}
                  onClick={() => setSelectedResult(r.key)}
                  className={`py-3 border-3 font-pixel text-[9px] text-center transition-all ${
                    selectedResult === r.key ? r.color : 'border-border-dark bg-secondary text-foreground'
                  }`}
                  style={{
                    boxShadow: selectedResult === r.key
                      ? '3px 3px 0 hsl(var(--pixel-shadow))'
                      : '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)',
                  }}
                >
                  <span className="text-lg block mb-1">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manner Rating */}
          <div>
            <p className="font-pixel text-[11px] text-muted-foreground mb-2">
              <Shield size={10} className="inline mr-1" />
              상대팀 매너 평가
            </p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setMannerRating(star)}
                  className={`w-9 h-9 border-2 flex items-center justify-center font-pixel text-[14px] transition-all ${
                    star <= mannerRating
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-secondary border-border-dark text-muted-foreground'
                  }`}
                  style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="font-pixel text-[11px] text-center text-muted-foreground mt-1">
              {mannerRating <= 2 ? '아쉬웠어요' : mannerRating <= 3 ? '보통이에요' : mannerRating <= 4 ? '좋았어요!' : '최고예요!'}
            </p>
          </div>

          {/* Info */}
          <div className="bg-primary/5 border border-primary/20 p-2.5">
            <p className="font-pixel text-[11px] text-primary leading-relaxed">
              💡 양 팀 모두 같은 결과를 입력하면 자동 반영됩니다.
              결과가 다를 경우 관리자가 확인합니다.
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedResult}
            className="w-full py-3 bg-primary text-primary-foreground font-pixel text-[10px] border-3 border-primary-dark hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
          >
            <Check size={14} />
            결과 제출하기
          </button>
        </div>
      </div>
    </div>
  );
}
