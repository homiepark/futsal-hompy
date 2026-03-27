import { X } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface DraftConfirmModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onDiscard: () => void;
}

export function DraftConfirmModal({
  isOpen,
  onContinue,
  onDiscard,
}: DraftConfirmModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Modal */}
      <div 
        className="relative w-full max-w-sm bg-card border-4 border-accent overflow-hidden"
        style={{ boxShadow: '8px 8px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 border-b-4 border-accent-dark px-4 py-3 flex items-center justify-center">
          <h2 className="font-pixel text-[11px] text-accent-foreground flex items-center gap-2">
            <span className="text-lg">📝</span>
            작성 중인 공고 발견!
          </h2>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div 
            className="text-center p-4 bg-secondary/50 border-3 border-border-dark"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <p className="font-pixel text-[10px] text-foreground leading-relaxed">
              이전에 작성하던 공고가 있습니다.
            </p>
            <p className="font-pixel text-[10px] text-primary mt-2 font-bold">
              계속해서 작성을 완료하시겠습니까?
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <PixelButton
              variant="default"
              size="sm"
              onClick={onDiscard}
              className="flex-1"
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              ❌ 새로 작성
            </PixelButton>
            <PixelButton
              variant="primary"
              size="sm"
              onClick={onContinue}
              className="flex-1"
              style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
            >
              ✅ 이어서 작성
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
