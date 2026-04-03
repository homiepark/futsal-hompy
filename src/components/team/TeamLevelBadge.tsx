import { Shield, Swords, Star, Clock } from 'lucide-react';

interface TeamLevelBadgeProps {
  /** 자기 신고 레벨 (1~4) */
  level: string;
  /** 총 매치 횟수 */
  matchCount?: number;
  /** 매너 점수 (1~5) */
  mannerScore?: number;
  /** 팀원 평균 경력 (년) */
  avgExperience?: number;
  /** 컴팩트 모드 (카드용) */
  compact?: boolean;
}

/** 매치 횟수 기반 경험 등급 */
function getMatchTier(count: number): { label: string; emoji: string; color: string } {
  if (count >= 50) return { label: '레전드', emoji: '🏅', color: 'text-[hsl(var(--level-4))]' };
  if (count >= 20) return { label: '베테랑', emoji: '⚔️', color: 'text-[hsl(var(--level-3))]' };
  if (count >= 5) return { label: '경험자', emoji: '🏃', color: 'text-[hsl(var(--level-2))]' };
  return { label: '뉴비', emoji: '🌱', color: 'text-[hsl(var(--level-1))]' };
}

const levelNames: Record<string, string> = {
  '1': '풋린이',
  '2': '풋내기',
  '3': '풋살러',
  '4': '풋살왕',
};

const levelColors: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))]',
  '2': 'bg-[hsl(var(--level-2))]',
  '3': 'bg-[hsl(var(--level-3))]',
  '4': 'bg-[hsl(var(--level-4))]',
};

export function TeamLevelBadge({
  level,
  matchCount = 0,
  mannerScore,
  avgExperience,
  compact = false,
}: TeamLevelBadgeProps) {
  const matchTier = getMatchTier(matchCount);
  const isVerified = matchCount >= 5;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Level Badge */}
        <span className={`px-1.5 py-0.5 text-[11px] font-pixel text-white ${levelColors[level] || levelColors['1']}`}>
          LV.{level}
        </span>

        {/* Verified Mark */}
        {isVerified && (
          <span className="px-1 py-0.5 bg-primary/10 border border-primary/30 font-pixel text-[11px] text-primary flex items-center gap-0.5">
            <Shield size={7} /> 검증됨
          </span>
        )}

        {/* Avg Experience */}
        {avgExperience !== undefined && avgExperience > 0 && (
          <span className="font-pixel text-[11px] text-muted-foreground flex items-center gap-0.5">
            <Clock size={7} /> 평균 {avgExperience.toFixed(1)}년
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border-3 border-border-dark p-3 space-y-3"
      style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-2.5 py-1.5 -mx-3 -mt-3 border-b-2 border-primary-dark flex items-center gap-1.5">
        <Shield size={10} />
        <span className="font-pixel text-[8px]">팀 프로필</span>
      </div>

      {/* Level + Match Tier Row */}
      <div className="flex items-center gap-2">
        {/* Self-declared Level */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1.5 font-pixel text-[10px] text-white ${levelColors[level] || levelColors['1']} border-2 border-black/20`}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
          >
            LV.{level}
          </div>
          <div>
            <span className="font-pixel text-[11px] text-foreground block">{levelNames[level] || '풋린이'}</span>
            <span className="font-pixel text-[11px] text-muted-foreground">팀 레벨</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border mx-1" />

        {/* Match Experience Tier */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{matchTier.emoji}</span>
          <div>
            <span className={`font-pixel text-[11px] block ${matchTier.color}`}>{matchTier.label}</span>
            <span className="font-pixel text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Swords size={7} /> {matchCount}전
            </span>
          </div>
        </div>

        {/* Verified Badge */}
        {isVerified && (
          <div className="ml-auto px-2 py-1 bg-primary/10 border border-primary/30 flex items-center gap-1">
            <Shield size={10} className="text-primary" />
            <span className="font-pixel text-[11px] text-primary">검증됨</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 pt-2 border-t border-border">
        {/* Average Experience */}
        {avgExperience !== undefined && avgExperience > 0 && (
          <div className="flex-1 bg-secondary border-2 border-border-dark p-2 text-center"
            style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
          >
            <Clock size={12} className="mx-auto text-primary mb-1" />
            <span className="font-pixel text-[10px] text-foreground block">{avgExperience.toFixed(1)}년</span>
            <span className="font-pixel text-[8px] text-muted-foreground">평균 경력</span>
          </div>
        )}

        {/* Match Count */}
        <div className="flex-1 bg-secondary border-2 border-border-dark p-2 text-center"
          style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
        >
          <Swords size={12} className="mx-auto text-accent mb-1" />
          <span className="font-pixel text-[10px] text-foreground block">{matchCount}</span>
          <span className="font-pixel text-[8px] text-muted-foreground">총 매치</span>
        </div>

        {/* Manner Score */}
        {mannerScore !== undefined && mannerScore > 0 && (
          <div className="flex-1 bg-secondary border-2 border-border-dark p-2 text-center"
            style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
          >
            <Star size={12} className="mx-auto text-accent mb-1" />
            <span className="font-pixel text-[10px] text-foreground block">{mannerScore.toFixed(1)}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">매너 점수</span>
          </div>
        )}
      </div>

      {/* Info Text */}
      {!isVerified && (
        <p className="font-pixel text-[11px] text-muted-foreground text-center pt-1">
          💡 매치 5회 이상 시 "검증된 팀" 마크가 부여됩니다
        </p>
      )}
    </div>
  );
}
