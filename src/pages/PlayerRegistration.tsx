import { UserPlus, Construction } from 'lucide-react';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { PixelCard } from '@/components/ui/PixelCard';

export default function PlayerRegistration() {
  return (
    <div className="min-h-screen bg-background pb-24 px-4 py-6 max-w-lg mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <PixelBackButton />
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="font-pixel text-sm mb-2">⚽ 선수 등록소</h1>
        <p className="font-body text-xs text-muted-foreground">Player Registration</p>
      </div>

      {/* 준비 중 안내 */}
      <PixelCard className="text-center py-12 px-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/20 border-4 border-primary flex items-center justify-center">
            <Construction size={32} className="text-primary" />
          </div>
        </div>

        <h3 className="font-pixel text-sm text-foreground mb-3">
          선수 등록 준비 중!
        </h3>

        <div className="space-y-2 mb-6">
          <p className="font-body text-sm text-muted-foreground">
            개인 선수 프로필 등록 기능을 준비하고 있어요.
          </p>
          <p className="font-body text-xs text-muted-foreground">
            팀에 가입하면 자동으로 선수 카드가 생성됩니다!
          </p>
        </div>

        {/* 예정 기능 */}
        <div className="bg-muted/50 border-2 border-border-dark p-4 text-left space-y-2">
          <p className="font-pixel text-[9px] text-muted-foreground uppercase mb-2">
            예정된 기능
          </p>
          {[
            { emoji: '📊', text: '개인 통계 & 전적 관리' },
            { emoji: '🏆', text: '매치 MVP & 업적' },
            { emoji: '⚡', text: '포지션별 능력치 레이더' },
            { emoji: '🤝', text: '매너 점수 시스템' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm">{item.emoji}</span>
              <span className="font-body text-xs text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </PixelCard>

      {/* Decorative */}
      <div className="flex justify-center gap-2 mt-6">
        <span className="text-primary animate-pixel-pulse">◆</span>
        <span className="text-accent animate-pixel-pulse" style={{ animationDelay: '0.3s' }}>◆</span>
        <span className="text-primary animate-pixel-pulse" style={{ animationDelay: '0.6s' }}>◆</span>
      </div>
    </div>
  );
}
