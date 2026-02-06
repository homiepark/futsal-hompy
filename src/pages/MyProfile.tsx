import { useState } from 'react';
import { ArrowLeft, Save, Heart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelProfileIcon } from '@/components/ui/PixelProfileIcon';
import { cn } from '@/lib/utils';

// Pixel heart icon for health
const PixelHeart = ({ filled, size = 2 }: { filled: boolean; size?: number }) => {
  const pattern = [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];

  return (
    <div className="relative" style={{ width: size * 8, height: size * 8 }}>
      {pattern.map((row, y) =>
        row.map((pixel, x) => (
          pixel === 1 && (
            <div
              key={`${x}-${y}`}
              className="absolute"
              style={{
                width: size,
                height: size,
                left: x * size,
                top: y * size,
                backgroundColor: filled ? 'hsl(0 70% 55%)' : 'hsl(0 0% 75%)',
              }}
            />
          )
        ))
      )}
    </div>
  );
};

export default function MyProfile() {
  const [profile, setProfile] = useState({
    nickname: '풋살매니아',
    yearsOfExperience: 3,
    isProElite: false,
    preferredPosition: 'MF',
    healthStatus: {
      knee: 'good' as 'good' | 'caution' | 'injured',
      ankle: 'caution' as 'good' | 'caution' | 'injured',
      other: 'good' as 'good' | 'caution' | 'injured',
    },
  });

  const healthOptions = [
    { key: 'knee', label: '무릎', icon: '🦵' },
    { key: 'ankle', label: '발목', icon: '🦶' },
    { key: 'other', label: '기타', icon: '💪' },
  ];

  const statusColors = {
    good: 'bg-primary text-primary-foreground border-primary-dark',
    caution: 'bg-accent text-accent-foreground border-accent-dark',
    injured: 'bg-destructive text-destructive-foreground border-destructive',
  };

  const statusLabels = {
    good: '양호',
    caution: '주의',
    injured: '부상',
  };

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary border-b-4 border-primary-dark p-4 flex items-center gap-3">
        <Link to="/" className="w-8 h-8 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center">
          <ArrowLeft size={18} className="text-primary-foreground" />
        </Link>
        <h1 className="font-pixel text-xs text-primary-foreground">내 프로필</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <PixelCard className="flex items-center gap-4">
          <PixelProfileIcon size={5} />
          <div className="flex-1">
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="font-body font-bold text-lg text-foreground bg-transparent border-b-2 border-border focus:border-primary outline-none w-full"
            />
            <p className="text-sm text-muted-foreground font-body mt-1">
              경력 {profile.yearsOfExperience}년 • {profile.preferredPosition}
            </p>
          </div>
        </PixelCard>

        {/* Experience & Status */}
        <PixelCard>
          <h2 className="font-body font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">⚽</span>
            풋살 경력 정보
          </h2>

          {/* Years of Experience */}
          <div className="mb-4">
            <label className="font-body text-sm text-muted-foreground mb-2 block">
              풋살/축구 경력 (년)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfile({ ...profile, yearsOfExperience: Math.max(0, profile.yearsOfExperience - 1) })}
                className="w-10 h-10 bg-secondary border-4 border-border-dark font-pixel text-lg shadow-[2px_2px_0_hsl(var(--pixel-shadow))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_hsl(var(--pixel-shadow))]"
              >
                -
              </button>
              <div className="flex-1 h-10 bg-muted border-4 border-border-dark flex items-center justify-center font-pixel text-sm">
                {profile.yearsOfExperience}년
              </div>
              <button
                onClick={() => setProfile({ ...profile, yearsOfExperience: profile.yearsOfExperience + 1 })}
                className="w-10 h-10 bg-secondary border-4 border-border-dark font-pixel text-lg shadow-[2px_2px_0_hsl(var(--pixel-shadow))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_hsl(var(--pixel-shadow))]"
              >
                +
              </button>
            </div>
          </div>

          {/* Pro/Elite Status */}
          <div>
            <label className="font-body text-sm text-muted-foreground mb-2 block">
              프로/엘리트 선수 출신
            </label>
            <button
              onClick={() => setProfile({ ...profile, isProElite: !profile.isProElite })}
              className={cn(
                'w-full py-3 border-4 font-body font-bold transition-all',
                profile.isProElite
                  ? 'bg-accent text-accent-foreground border-accent-dark shadow-[4px_4px_0_hsl(var(--accent-dark))]'
                  : 'bg-secondary text-secondary-foreground border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))]'
              )}
            >
              {profile.isProElite ? '✓ 프로/엘리트 출신입니다' : '해당 없음'}
            </button>
          </div>
        </PixelCard>

        {/* Health Check Section */}
        <PixelCard>
          <h2 className="font-body font-bold text-foreground mb-2 flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            건강 상태 체크
          </h2>
          <p className="text-xs text-muted-foreground font-body mb-4">
            팀 트레이너가 경기 전 부상 위험을 파악할 수 있습니다
          </p>

          <div className="space-y-3">
            {healthOptions.map(({ key, label, icon }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xl w-8">{icon}</span>
                <span className="font-body text-foreground w-12">{label}</span>
                <div className="flex-1 flex gap-1">
                  {(['good', 'caution', 'injured'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setProfile({
                        ...profile,
                        healthStatus: { ...profile.healthStatus, [key]: status }
                      })}
                      className={cn(
                        'flex-1 py-2 text-[10px] font-pixel border-2 transition-all',
                        profile.healthStatus[key as keyof typeof profile.healthStatus] === status
                          ? statusColors[status]
                          : 'bg-muted text-muted-foreground border-border hover:bg-secondary'
                      )}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Trainer's Note */}
          <div className="mt-4 bg-primary/10 border-2 border-primary p-3 flex items-start gap-2">
            <div className="flex gap-0.5 mt-0.5">
              <PixelHeart filled={true} size={1.5} />
              <PixelHeart filled={true} size={1.5} />
              <PixelHeart filled={false} size={1.5} />
            </div>
            <div>
              <p className="font-pixel text-[8px] text-primary mb-1">TRAINER'S TIP</p>
              <p className="font-body text-xs text-foreground">
                정확한 건강 상태 입력은 안전한 경기의 첫걸음입니다!
              </p>
            </div>
          </div>
        </PixelCard>

        {/* Save Button */}
        <PixelButton variant="primary" className="w-full flex items-center justify-center gap-2">
          <Save size={16} />
          <span>프로필 저장</span>
        </PixelButton>
      </div>
    </div>
  );
}
