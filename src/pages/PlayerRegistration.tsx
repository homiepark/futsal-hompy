import { useState } from 'react';
import { User } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { MessageButton } from '@/components/ui/MessageButton';
import { cn } from '@/lib/utils';

const positions = [
  { id: 'pivo', label: 'PIVO', emoji: '⚡' },
  { id: 'ala', label: 'ALA', emoji: '💨' },
  { id: 'fixo', label: 'FIXO', emoji: '🛡️' },
  { id: 'goleiro', label: '골레이로', emoji: '🧤' },
];

export default function PlayerRegistration() {
  const [nickname, setNickname] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [careerType, setCareerType] = useState<'under1' | 'over1' | null>(null);
  const [careerYears, setCareerYears] = useState(1);
  const [careerMonths, setCareerMonths] = useState(0);
  const [isElite, setIsElite] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!nickname || selectedPositions.length === 0 || careerType === null || isElite === null) {
      alert('모든 항목을 입력해주세요!');
      return;
    }
    console.log({ nickname, selectedPositions, careerType, careerYears, careerMonths, isElite });
    // TODO: Handle registration logic
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 py-6 max-w-lg mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <PixelBackButton />
      </div>

      {/* Title - Pixel Font */}
      <div className="text-center mb-6">
        <h1 className="font-pixel text-sm mb-2">⚽️ 선수 등록소</h1>
        <p className="font-body text-xs text-muted-foreground">Player Registration</p>
      </div>

      {/* Character Placeholder with DM Button */}
      <div className="max-w-[200px] mx-auto mb-6">
        <PixelCard variant="frame">
          <div className="aspect-square bg-muted flex items-center justify-center border-2 border-border-dark">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-secondary border-4 border-border-dark flex items-center justify-center mb-2">
                <User size={32} className="text-muted-foreground" />
              </div>
              <p className="font-body text-[10px] text-muted-foreground">탭하여 업로드</p>
            </div>
          </div>
        </PixelCard>
        {/* DM Button for player profile */}
        <div className="flex justify-center mt-3">
          <MessageButton label="쪽지 보내기" size="md" />
        </div>
      </div>

      {/* Nickname Input */}
      <section className="mb-6">
        <label className="block font-body text-sm font-medium text-foreground mb-2">
          닉네임
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="선수 이름을 입력하세요..."
          className="w-full pixel-input placeholder:text-muted-foreground"
          maxLength={12}
        />
        <p className="font-body text-xs text-muted-foreground mt-1 text-right">
          {nickname.length}/12
        </p>
      </section>

      {/* Position Selection - Multi-select */}
      <section className="mb-6">
        <label className="block font-pixel text-sm font-medium text-foreground mb-1">
          포지션 선택
        </label>
        <p className="font-pixel text-[8px] text-muted-foreground mb-3">복수 선택 가능</p>
        <div className="grid grid-cols-2 gap-3">
          {positions.map((pos) => {
            const isSelected = selectedPositions.includes(pos.id);
            return (
              <button
                key={pos.id}
                onClick={() => {
                  setSelectedPositions(prev =>
                    isSelected
                      ? prev.filter(p => p !== pos.id)
                      : [...prev, pos.id]
                  );
                }}
                className={cn(
                  'p-4 border-4 transition-all text-center',
                  isSelected
                    ? 'bg-primary border-primary-dark text-primary-foreground shadow-[0_0_12px_hsl(var(--primary))]'
                    : 'bg-secondary border-border-dark hover:border-primary'
                )}
              >
                <span className="text-2xl block mb-1">{pos.emoji}</span>
                <span className="font-pixel text-[10px] block">{pos.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Career Selection - Conditional */}
      <section className="mb-6">
        <label className="block font-pixel text-sm font-medium text-foreground mb-3">
          경력
        </label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => setCareerType('under1')}
            className={cn(
              'p-3 border-4 transition-all text-center',
              careerType === 'under1'
                ? 'bg-accent border-accent-dark text-accent-foreground shadow-[0_0_12px_hsl(var(--accent))]'
                : 'bg-secondary border-border-dark hover:border-accent'
            )}
          >
            <span className="text-xl block mb-1">🌱</span>
            <span className="font-pixel text-[10px] block">1년 이하</span>
          </button>
          <button
            onClick={() => setCareerType('over1')}
            className={cn(
              'p-3 border-4 transition-all text-center',
              careerType === 'over1'
                ? 'bg-accent border-accent-dark text-accent-foreground shadow-[0_0_12px_hsl(var(--accent))]'
                : 'bg-secondary border-border-dark hover:border-accent'
            )}
          >
            <span className="text-xl block mb-1">⚡</span>
            <span className="font-pixel text-[10px] block">1년 이상</span>
          </button>
        </div>

        {careerType === 'over1' && (
          <div className="p-3 bg-muted border-4 border-border-dark space-y-2">
            <p className="font-pixel text-[9px] text-muted-foreground">상세 경력</p>
            <div className="flex items-center gap-2">
              <select
                value={careerYears}
                onChange={(e) => setCareerYears(Number(e.target.value))}
                className="flex-1 px-2 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] focus:outline-none focus:border-accent"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={careerMonths}
                onChange={(e) => setCareerMonths(Number(e.target.value))}
                className="flex-1 px-2 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] focus:outline-none focus:border-accent"
              >
                {Array.from({ length: 12 }, (_, i) => i).map(m => (
                  <option key={m} value={m}>{m}개월</option>
                ))}
              </select>
            </div>
            <div className="text-center p-2 bg-accent/20 border-2 border-accent">
              <span className="font-pixel text-[10px]">📊 {careerYears}년 {careerMonths > 0 ? `${careerMonths}개월` : ''}</span>
            </div>
          </div>
        )}

        {careerType === 'under1' && (
          <div className="p-3 bg-muted border-4 border-border-dark text-center">
            <span className="font-pixel text-[10px] text-muted-foreground">🌱 입문 레벨</span>
          </div>
        )}
      </section>

      {/* Elite Status */}
      <section className="mb-8">
        <label className="block font-body text-sm font-medium text-foreground mb-3">
          엘리트 선수인가요?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsElite(true)}
            className={cn(
              'p-4 border-4 transition-all text-center',
              isElite === true
                ? 'bg-[hsl(45,100%,50%)] border-[hsl(45,100%,35%)] text-foreground shadow-[0_0_16px_hsl(45,100%,50%)]'
                : 'bg-secondary border-border-dark hover:border-[hsl(45,100%,50%)]'
            )}
          >
            <span className="text-2xl block mb-2">🏆</span>
            <span className="font-pixel text-[8px] block">ELITE</span>
            <span className="font-body text-xs text-muted-foreground block mt-1">프로/엘리트 경험</span>
          </button>
          <button
            onClick={() => setIsElite(false)}
            className={cn(
              'p-4 border-4 transition-all text-center',
              isElite === false
                ? 'bg-primary border-primary-dark text-primary-foreground shadow-[0_0_16px_hsl(var(--primary))]'
                : 'bg-secondary border-border-dark hover:border-primary'
            )}
          >
            <span className="text-2xl block mb-2">⚽️</span>
            <span className="font-pixel text-[8px] block">AMATEUR</span>
            <span className="font-body text-xs text-muted-foreground block mt-1">동호회 플레이어</span>
          </button>
        </div>
      </section>

      {/* Submit Button */}
      <PixelButton
        variant="accent"
        size="lg"
        onClick={handleSubmit}
        className="w-full py-4"
      >
        🚀 그라운드 입장하기!
      </PixelButton>
      <p className="text-center font-body text-xs text-muted-foreground mt-2">
        Enter the Ground!
      </p>

      {/* Decorative Elements */}
      <div className="flex justify-center gap-2 mt-6">
        <span className="text-primary animate-pixel-pulse">◆</span>
        <span className="text-accent animate-pixel-pulse" style={{ animationDelay: '0.3s' }}>◆</span>
        <span className="text-primary animate-pixel-pulse" style={{ animationDelay: '0.6s' }}>◆</span>
      </div>
    </div>
  );
}
