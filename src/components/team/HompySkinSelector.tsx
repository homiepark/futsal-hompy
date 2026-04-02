import { useState } from 'react';
import { Palette, X, Check } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface Skin {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  headerBg: string;
  accentColor: string;
  preview: string;
  animation?: string;
}

const skins: Skin[] = [
  {
    id: 'default',
    name: '기본 그린',
    emoji: '⚽',
    bgColor: 'hsl(40 40% 97%)',
    borderColor: 'hsl(30 30% 50%)',
    headerBg: 'hsl(168 55% 42%)',
    accentColor: 'hsl(12 80% 62%)',
    preview: 'linear-gradient(135deg, hsl(168 55% 42%), hsl(168 45% 32%))',
  },
  {
    id: 'fire',
    name: '불꽃 레드',
    emoji: '🔥',
    bgColor: 'hsl(0 30% 97%)',
    borderColor: 'hsl(0 40% 45%)',
    headerBg: 'hsl(0 72% 55%)',
    accentColor: 'hsl(30 90% 55%)',
    preview: 'linear-gradient(135deg, hsl(0 72% 55%), hsl(30 90% 55%))',
    animation: 'fire',
  },
  {
    id: 'ocean',
    name: '오션 블루',
    emoji: '🌊',
    bgColor: 'hsl(210 40% 97%)',
    borderColor: 'hsl(210 40% 45%)',
    headerBg: 'hsl(210 70% 50%)',
    accentColor: 'hsl(190 80% 45%)',
    preview: 'linear-gradient(135deg, hsl(210 70% 50%), hsl(190 80% 45%))',
    animation: 'bubbles',
  },
  {
    id: 'sunset',
    name: '선셋 퍼플',
    emoji: '🌅',
    bgColor: 'hsl(280 30% 97%)',
    borderColor: 'hsl(280 40% 45%)',
    headerBg: 'hsl(280 60% 55%)',
    accentColor: 'hsl(320 70% 55%)',
    preview: 'linear-gradient(135deg, hsl(280 60% 55%), hsl(320 70% 55%))',
  },
  {
    id: 'gold',
    name: '골드 챔피언',
    emoji: '🏆',
    bgColor: 'hsl(45 40% 97%)',
    borderColor: 'hsl(35 50% 40%)',
    headerBg: 'hsl(45 80% 50%)',
    accentColor: 'hsl(25 80% 50%)',
    preview: 'linear-gradient(135deg, hsl(45 80% 50%), hsl(25 80% 50%))',
    animation: 'sparkle',
  },
  {
    id: 'midnight',
    name: '미드나이트',
    emoji: '🌙',
    bgColor: 'hsl(230 20% 15%)',
    borderColor: 'hsl(230 30% 30%)',
    headerBg: 'hsl(230 40% 30%)',
    accentColor: 'hsl(50 80% 55%)',
    preview: 'linear-gradient(135deg, hsl(230 40% 30%), hsl(260 30% 20%))',
    animation: 'sparkle',
  },
  {
    id: 'cherry',
    name: '벚꽃 핑크',
    emoji: '🌸',
    bgColor: 'hsl(340 40% 97%)',
    borderColor: 'hsl(340 40% 55%)',
    headerBg: 'hsl(340 60% 65%)',
    accentColor: 'hsl(350 70% 55%)',
    preview: 'linear-gradient(135deg, hsl(340 60% 65%), hsl(350 50% 80%))',
    animation: 'sakura',
  },
  {
    id: 'clover',
    name: '클로버 민트',
    emoji: '🍀',
    bgColor: 'hsl(150 40% 97%)',
    borderColor: 'hsl(150 40% 40%)',
    headerBg: 'hsl(150 50% 45%)',
    accentColor: 'hsl(130 60% 45%)',
    preview: 'linear-gradient(135deg, hsl(150 50% 45%), hsl(130 60% 55%))',
  },
  {
    id: 'rainbow',
    name: '레인보우',
    emoji: '🌈',
    bgColor: 'hsl(0 0% 98%)',
    borderColor: 'hsl(280 50% 50%)',
    headerBg: 'hsl(280 60% 55%)',
    accentColor: 'hsl(30 90% 55%)',
    preview: 'linear-gradient(135deg, hsl(0 80% 60%), hsl(60 80% 55%), hsl(120 60% 50%), hsl(200 70% 55%), hsl(280 60% 55%))',
  },
  {
    id: 'samba',
    name: '쌈바 스페셜🤙',
    emoji: '🇧🇷',
    bgColor: 'hsl(48 80% 96%)',
    borderColor: 'hsl(120 50% 30%)',
    headerBg: 'hsl(48 90% 52%)',
    accentColor: 'hsl(120 60% 35%)',
    preview: 'linear-gradient(135deg, hsl(48 90% 52%), hsl(120 60% 35%))',
    animation: 'samba',
  },
  {
    id: 'dark',
    name: '다크 네온',
    emoji: '⚫',
    bgColor: 'hsl(0 0% 10%)',
    borderColor: 'hsl(160 100% 40%)',
    headerBg: 'hsl(0 0% 15%)',
    accentColor: 'hsl(160 100% 50%)',
    preview: 'linear-gradient(135deg, hsl(0 0% 10%), hsl(0 0% 20%))',
    animation: 'sparkle',
  },
  {
    id: 'christmas',
    name: '크리스마스',
    emoji: '🎄',
    bgColor: 'hsl(120 20% 96%)',
    borderColor: 'hsl(0 60% 45%)',
    headerBg: 'hsl(0 70% 50%)',
    accentColor: 'hsl(120 60% 40%)',
    preview: 'linear-gradient(135deg, hsl(0 70% 50%), hsl(120 60% 35%))',
    animation: 'snow',
  },
  {
    id: 'football',
    name: '축구공',
    emoji: '⚽',
    bgColor: 'hsl(120 30% 96%)',
    borderColor: 'hsl(120 40% 35%)',
    headerBg: 'hsl(120 50% 38%)',
    accentColor: 'hsl(45 90% 50%)',
    preview: 'linear-gradient(135deg, hsl(120 50% 38%), hsl(120 40% 28%))',
    animation: 'football',
  },
];

interface HompySkinSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkin: string;
  onSkinChange: (skinId: string) => void;
}

export function HompySkinSelector({ isOpen, onClose, currentSkin, onSkinChange }: HompySkinSelectorProps) {
  const [previewSkin, setPreviewSkin] = useState(currentSkin);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleApply = () => {
    onSkinChange(previewSkin);
    onClose();
  };

  const selectedSkin = skins.find(s => s.id === previewSkin);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden animate-slide-up max-h-[80vh] flex flex-col"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
          <div className="flex items-center gap-2">
            <Palette size={14} />
            <span className="font-pixel text-[10px]">홈피 스킨 변경</span>
          </div>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={16} />
          </button>
        </div>

        {/* Skin Grid - scrollable */}
        <div
          className="p-4 grid grid-cols-3 gap-3 overflow-y-auto flex-1"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {skins.map((skin) => (
            <button
              key={skin.id}
              onClick={() => setPreviewSkin(skin.id)}
              className={`relative p-2 border-3 transition-all ${
                previewSkin === skin.id
                  ? 'border-primary scale-105'
                  : 'border-border-dark hover:border-muted-foreground'
              }`}
              style={{ boxShadow: previewSkin === skin.id ? '3px 3px 0 hsl(var(--primary-dark))' : '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <div
                className="w-full aspect-square rounded-sm mb-2 border border-black/10 relative overflow-hidden"
                style={{ background: skin.preview }}
              >
                {/* Animation preview indicator */}
                {skin.animation && (
                  <div className="absolute bottom-0.5 right-0.5 text-[8px]">✨</div>
                )}
              </div>
              <div className="text-center">
                <span className="text-lg block">{skin.emoji}</span>
                <span className="font-pixel text-[7px] text-foreground block mt-1">{skin.name}</span>
              </div>
              {currentSkin === skin.id && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent border-2 border-accent-dark rounded-full flex items-center justify-center">
                  <Check size={10} className="text-accent-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Preview info */}
        {selectedSkin?.animation && (
          <div className="px-4 py-2 bg-muted/50 border-t border-border text-center">
            <span className="font-pixel text-[8px] text-muted-foreground">
              ✨ 이 스킨은 {
                selectedSkin.animation === 'sakura' ? '벚꽃 날리기' :
                selectedSkin.animation === 'snow' ? '눈 내리기' :
                selectedSkin.animation === 'sparkle' ? '반짝이' :
                selectedSkin.animation === 'bubbles' ? '물방울' :
                selectedSkin.animation === 'fire' ? '불꽃' :
                selectedSkin.animation === 'football' ? '축구공 튀기기' :
                selectedSkin.animation === 'samba' ? '쌈바 캐릭터 🤙' :
                ''
              } 효과가 포함되어 있어요
            </span>
          </div>
        )}

        {/* Apply Button */}
        <div className="p-4 border-t-2 border-border flex-shrink-0">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-primary text-primary-foreground font-pixel text-[10px] border-3 border-primary-dark hover:brightness-110 transition-all"
            style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
          >
            ✨ 스킨 적용하기
          </button>
        </div>
      </div>
    </div>
  );
}

export { skins };
export type { Skin };
