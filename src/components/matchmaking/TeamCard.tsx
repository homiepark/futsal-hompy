import { MapPin, Users, Star } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { PixelButton } from '@/components/ui/PixelButton';

interface TeamCardProps {
  name: string;
  region: string;
  level: 'S' | 'A' | 'B' | 'C';
  members: number;
  gender: '남성' | '여성' | '혼성';
  avgExperience: number;
  hasProPlayer: boolean;
}

const levelVariants = {
  'S': 'level-s',
  'A': 'level-a',
  'B': 'level-b',
  'C': 'level-c',
} as const;

export function TeamCard({
  name,
  region,
  level,
  members,
  gender,
  avgExperience,
  hasProPlayer,
}: TeamCardProps) {
  return (
    <PixelCard className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-field-green border-2 border-primary-dark flex items-center justify-center shadow-pixel-sm">
            <span className="font-pixel text-xs text-primary-foreground">⚽</span>
          </div>
          <div>
            <h3 className="font-pixel text-[10px] text-foreground">{name}</h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={10} />
              <span className="font-body text-xs">{region}</span>
            </div>
          </div>
        </div>
        <PixelBadge variant={levelVariants[level]}>
          Lv.{level}
        </PixelBadge>
      </div>

      <div className="flex flex-wrap gap-2">
        <PixelBadge variant="default">
          <Users size={10} className="mr-1" />
          {members}명
        </PixelBadge>
        <PixelBadge variant="default">{gender}</PixelBadge>
        <PixelBadge variant="default">경력 {avgExperience}년</PixelBadge>
        {hasProPlayer && (
          <PixelBadge variant="accent">
            <Star size={10} className="mr-1" />
            프로출신
          </PixelBadge>
        )}
      </div>

      <div className="flex gap-2">
        <PixelButton variant="primary" size="sm" className="flex-1">
          매칭 신청
        </PixelButton>
        <PixelButton variant="default" size="sm">
          프로필
        </PixelButton>
      </div>
    </PixelCard>
  );
}
