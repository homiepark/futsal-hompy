import { MapPin, Construction } from 'lucide-react';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { PixelCard } from '@/components/ui/PixelCard';

export default function CourtBooking() {
  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <PixelBackButton variant="green" />
          <h2 className="font-pixel text-xs text-foreground flex items-center gap-2">
            <span className="text-primary">📍</span>
            코트 예약
          </h2>
        </div>
      </div>

      {/* 준비 중 안내 */}
      <PixelCard className="text-center py-12 px-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-accent/20 border-4 border-accent flex items-center justify-center">
            <Construction size={32} className="text-accent" />
          </div>
        </div>

        <h3 className="font-pixel text-sm text-foreground mb-3">
          코트 예약 준비 중!
        </h3>

        <div className="space-y-2 mb-6">
          <p className="font-body text-sm text-muted-foreground">
            풋살장 검색 & 예약 기능을 준비하고 있어요.
          </p>
          <p className="font-body text-xs text-muted-foreground">
            조금만 기다려주세요!
          </p>
        </div>

        {/* 예정 기능 */}
        <div className="bg-muted/50 border-2 border-border-dark p-4 text-left space-y-2">
          <p className="font-pixel text-[9px] text-muted-foreground uppercase mb-2">
            예정된 기능
          </p>
          {[
            { emoji: '🔍', text: '내 주변 풋살장 검색' },
            { emoji: '📅', text: '실시간 코트 예약' },
            { emoji: '⭐', text: '풋살장 리뷰 & 평점' },
            { emoji: '🗺️', text: '지도에서 찾기' },
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
