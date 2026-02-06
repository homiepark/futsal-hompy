import { useState } from 'react';
import { MapPin, Users, Star, Clock } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { PixelButton } from '@/components/ui/PixelButton';
import { MapModal } from './MapModal';
import { cn } from '@/lib/utils';

interface TeamCardProps {
  id?: string;
  name: string;
  emblem?: string;
  region: string;
  level: 'S' | 'A' | 'B' | 'C';
  members: number;
  gender: '남성' | '여성' | '혼성';
  matchTime?: string;
  homeGroundName?: string;
  homeGroundAddress?: string;
  mannerScore?: number;
  tags?: string[];
  onMatchRequest?: () => void;
  onViewProfile?: () => void;
}

const levelVariants = {
  'S': 'level-s',
  'A': 'level-a',
  'B': 'level-b',
  'C': 'level-c',
} as const;

export function TeamCard({
  id,
  name,
  emblem = '⚽',
  region,
  level,
  members,
  gender,
  matchTime = '주말 오후',
  homeGroundName,
  homeGroundAddress,
  mannerScore = 4.5,
  tags = [],
  onMatchRequest,
  onViewProfile,
}: TeamCardProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <>
      <PixelCard className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-field-green border-2 border-primary-dark flex items-center justify-center shadow-pixel-sm">
              <span className="text-lg">{emblem}</span>
            </div>
            <div>
              <h3 className="font-pixel text-[10px] text-foreground">{name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin size={10} />
                <span className="font-pixel text-[9px]">{region}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <PixelBadge variant={levelVariants[level]}>
              Lv.{level}
            </PixelBadge>
            {/* Manner Score */}
            <div className="flex items-center gap-1">
              <Star size={10} className="text-accent fill-accent" />
              <span className="font-pixel text-[8px] text-accent">{mannerScore.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, idx) => (
              <span 
                key={idx}
                className={cn(
                  "px-1.5 py-0.5 font-pixel text-[7px] border",
                  tag === '내 동네 팀' && "bg-primary/20 text-primary border-primary/50",
                  tag === '실력 비슷' && "bg-accent/20 text-accent border-accent/50",
                  tag === '첫 대결' && "bg-secondary text-secondary-foreground border-border"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <PixelBadge variant="default">
            <Users size={10} className="mr-1" />
            {members}명
          </PixelBadge>
          <PixelBadge variant="default">{gender}</PixelBadge>
          <PixelBadge variant="default">
            <Clock size={10} className="mr-1" />
            {matchTime}
          </PixelBadge>
        </div>

        {/* Home Ground - Clickable */}
        {homeGroundName && (
          <button
            onClick={() => setIsMapOpen(true)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2",
              "bg-primary/10 border-2 border-primary/30",
              "hover:bg-primary/20 hover:border-primary transition-colors"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <MapPin size={12} className="text-primary flex-shrink-0" />
            <span className="font-pixel text-[9px] text-foreground truncate">
              {homeGroundName}
            </span>
          </button>
        )}

        <div className="flex gap-2">
          <PixelButton 
            variant="primary" 
            size="sm" 
            className="flex-1" 
            onClick={onMatchRequest}
          >
            매칭 신청
          </PixelButton>
          <PixelButton 
            variant="default" 
            size="sm" 
            onClick={onViewProfile}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            팀 프로필
          </PixelButton>
        </div>
      </PixelCard>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        groundName={homeGroundName || ''}
        groundAddress={homeGroundAddress || ''}
        teamName={name}
        teamEmblem={emblem}
      />
    </>
  );
}
