import { useState } from 'react';
import { User } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { MessageButton } from '@/components/ui/MessageButton';
import { cn } from '@/lib/utils';

const positions = [
  { id: 'pivo', label: 'PIVO', emoji: '⚡' },
  { id: 'ala', label: 'ALA', emoji: '💨' },
  { id: 'fixo', label: 'FIXO', emoji: '🛡️' },
  { id: 'goleiro', label: 'GOLEIRO', emoji: '🧤' },
];

const experienceLevels = [
  { id: 1, label: 'Newbie', sublabel: '<1년', stars: 1 },
  { id: 2, label: 'Rookie', sublabel: '1-3년', stars: 2 },
  { id: 3, label: 'Regular', sublabel: '3-5년', stars: 3 },
  { id: 4, label: 'Veteran', sublabel: '5-10년', stars: 4 },
  { id: 5, label: 'Legend', sublabel: '10년+', stars: 5 },
];

export default function PlayerRegistration() {
  const [nickname, setNickname] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<number | null>(null);
  const [isElite, setIsElite] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!nickname || !selectedPosition || !experienceLevel || isElite === null) {
      alert('모든 항목을 입력해주세요!');
      return;
    }
    console.log({ nickname, selectedPosition, experienceLevel, isElite });
    // TODO: Handle registration logic
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 py-6 max-w-lg mx-auto">
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

      {/* Position Selection */}
      <section className="mb-6">
        <label className="block font-body text-sm font-medium text-foreground mb-3">
          포지션 선택
        </label>
        <div className="grid grid-cols-2 gap-3">
          {positions.map((pos) => (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id)}
              className={cn(
                'p-4 border-4 transition-all text-center',
                selectedPosition === pos.id
                  ? 'bg-primary border-primary-dark text-primary-foreground shadow-[0_0_12px_hsl(var(--primary))]'
                  : 'bg-secondary border-border-dark hover:border-primary'
              )}
            >
              <span className="text-2xl block mb-1">{pos.emoji}</span>
              <span className="font-pixel text-[10px] block">{pos.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Experience Level */}
      <section className="mb-6">
        <label className="block font-body text-sm font-medium text-foreground mb-3">
          경력 레벨
        </label>
        <div className="flex gap-1">
          {experienceLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setExperienceLevel(level.id)}
              className={cn(
                'flex-1 p-2 border-4 transition-all text-center',
                experienceLevel === level.id
                  ? 'bg-accent border-accent-dark text-accent-foreground shadow-[0_0_12px_hsl(var(--accent))]'
                  : 'bg-secondary border-border-dark hover:border-accent'
              )}
            >
              <div className="font-pixel text-[8px] mb-1">
                {'★'.repeat(level.stars)}
              </div>
              <p className="font-body text-[10px] font-medium leading-tight">{level.label}</p>
              <p className="font-body text-[9px] text-muted-foreground">{level.sublabel}</p>
            </button>
          ))}
        </div>
        {/* Experience Bar Visual */}
        <div className="mt-3 h-4 bg-muted border-4 border-border-dark flex">
          {experienceLevels.map((level) => (
            <div
              key={level.id}
              className={cn(
                'flex-1 transition-all',
                experienceLevel && level.id <= experienceLevel
                  ? 'bg-accent'
                  : 'bg-transparent'
              )}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-pixel text-[8px] text-muted-foreground">LV.1</span>
          <span className="font-pixel text-[8px] text-muted-foreground">LV.MAX</span>
        </div>
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
