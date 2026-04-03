import { useState } from 'react';
import { MapPin, Clock, Users, Star, Calendar, Target } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { PixelButton } from '@/components/ui/PixelButton';
import { MapModal } from './MapModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MatchPostCardProps {
  id: string;
  teamName: string;
  teamEmblem: string;
  teamPhotoUrl?: string;
  teamLevel: string;
  teamMembers?: number;
  teamMannerScore?: number;
  locationName: string;
  locationAddress?: string;
  matchDate: Date;
  matchTimeStart: string;
  matchTimeEnd: string;
  targetLevels: string[];
  description?: string;
  onChallenge?: () => void;
  onViewProfile?: () => void;
}

const levelLabels: Record<string, string> = {
  '1': '풋린이',
  '2': '풋내기',
  '3': '풋살러',
  '4': '풋살왕',
};

const levelVariants = {
  '1': 'level-1',
  '2': 'level-2',
  '3': 'level-3',
  '4': 'level-4',
} as const;

export function MatchPostCard({
  id,
  teamName,
  teamEmblem,
  teamPhotoUrl,
  teamLevel,
  teamMembers = 10,
  teamMannerScore = 4.5,
  locationName,
  locationAddress,
  matchDate,
  matchTimeStart,
  matchTimeEnd,
  targetLevels,
  description,
  onChallenge,
  onViewProfile,
}: MatchPostCardProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const formattedDate = format(matchDate, 'M월 d일 (EEE)', { locale: ko });

  return (
    <>
      <PixelCard className="relative overflow-hidden">
        {/* Wanted Poster Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <div className="space-y-3">
          {/* Header with "WANTED" style */}
          <div className="text-center pb-2 border-b-2 border-dashed border-border">
            <span className="font-pixel text-[11px] text-muted-foreground tracking-widest">
              ⚔️ MATCH WANTED ⚔️
            </span>
          </div>

          {/* Team Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 bg-field-green border-3 border-primary-dark flex items-center justify-center overflow-hidden"
                style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
              >
                {teamPhotoUrl ? (
                  <img src={teamPhotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{teamEmblem}</span>
                )}
              </div>
              <div>
                <h3 className="font-pixel text-[11px] text-foreground font-bold">{teamName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <PixelBadge variant={levelVariants[teamLevel as keyof typeof levelVariants] || 'default'} className="text-[8px]">
                    LV.{teamLevel} {levelLabels[teamLevel] || ''}
                  </PixelBadge>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-accent fill-accent" />
                    <span className="font-pixel text-[11px] text-accent">{teamMannerScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users size={12} />
              <span className="font-pixel text-[9px]">{teamMembers}명</span>
            </div>
          </div>

          {/* Match Details */}
          <div className="bg-secondary/50 border-2 border-border-dark p-3 space-y-2">
            {/* Date & Time */}
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-primary" />
              <span className="font-pixel text-[10px] text-foreground">
                {formattedDate}
              </span>
              <Clock size={12} className="text-primary ml-2" />
              <span className="font-pixel text-[10px] text-foreground">
                {matchTimeStart} ~ {matchTimeEnd}
              </span>
            </div>

            {/* Location - Clickable */}
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
                {locationName}
              </span>
            </button>
          </div>

          {/* Target Level - Bold Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border-2 border-accent/30 flex-wrap">
            <Target size={12} className="text-accent flex-shrink-0" />
            <span className="font-pixel text-[9px] text-foreground">희망 팀 레벨:</span>
            <div className="flex gap-1">
              {targetLevels.map((level) => (
                <PixelBadge 
                  key={level} 
                  variant={levelVariants[level as keyof typeof levelVariants] || 'default'} 
                  className="text-[8px]"
                >
                  LV.{level}
                </PixelBadge>
              ))}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="font-pixel text-[11px] text-muted-foreground line-clamp-2 px-1">
              {description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <PixelButton 
              variant="primary" 
              size="sm" 
              className="flex-1 font-bold"
              onClick={onChallenge}
              style={{ 
                boxShadow: '3px 3px 0 hsl(var(--primary-dark))',
                transform: 'translateY(-1px)'
              }}
            >
              ⚔️ 도전하기
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
        </div>
      </PixelCard>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        groundName={locationName}
        groundAddress={locationAddress || ''}
        teamName={teamName}
        teamEmblem={teamEmblem}
      />
    </>
  );
}
