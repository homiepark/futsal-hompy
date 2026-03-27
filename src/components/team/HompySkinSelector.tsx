import { useState } from 'react';
import { Palette, X, Check } from 'lucide-react';

interface Skin {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  headerBg: string;
  accentColor: string;
  preview: string; // CSS gradient for preview
}

const skins: Skin[] = [
  {
    id: 'default',
    name: '기본 그린',
    emoji: '⚽',
    bgColor: 'hsl(40 40% 97%)',
    borderColor: 'hsl(30 30% 50%)',
    headerBg: 'hsl(142 69% 52%)',
    accentColor: 'hsl(27 97% 58%)',
    preview: 'linear-gradient(135deg, hsl(142 69% 52%), hsl(142 55% 42%))',
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

  if (!isOpen) return null;

  const handleApply = () => {
    onSkinChange(previewSkin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-card border-t-4 border-border-dark rounded-t-xl overflow-hidden animate-slide-up"
        style={{ boxShadow: '0 -4px 20px hsl(var(--pixel-shadow) / 0.3)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Palette size={14} />
            <span className="font-pixel text-[10px]">홈피 스킨 변경</span>
          </div>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={16} />
          </button>
        </div>

        {/* Skin Grid */}
        <div className="p-4 grid grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
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
              {/* Preview Color */}
              <div
                className="w-full aspect-square rounded-sm mb-2 border border-black/10"
                style={{ background: skin.preview }}
              />
              <div className="text-center">
                <span className="text-lg block">{skin.emoji}</span>
                <span className="font-pixel text-[7px] text-foreground block mt-1">{skin.name}</span>
              </div>
              {/* Current indicator */}
              {currentSkin === skin.id && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent border-2 border-accent-dark rounded-full flex items-center justify-center">
                  <Check size={10} className="text-accent-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t-2 border-border">
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
