import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock, Target, Home, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { LevelInfoButton } from '@/components/ui/LevelGuideModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { levelOptions } from '@/lib/teamData';

interface CreateMatchPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  team: {
    id: string;
    name: string;
    emblem: string;
    homeGroundName?: string;
    homeGroundAddress?: string;
  } | null;
}

export function CreateMatchPostModal({
  isOpen,
  onClose,
  onSuccess,
  team,
}: CreateMatchPostModalProps) {
  const [locationType, setLocationType] = useState<'home_ground' | 'custom'>('home_ground');
  const [customLocationName, setCustomLocationName] = useState('');
  const [customLocationAddress, setCustomLocationAddress] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTimeStart, setMatchTimeStart] = useState('');
  const [matchTimeEnd, setMatchTimeEnd] = useState('');
  const [targetLevels, setTargetLevels] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setLocationType('home_ground');
      setCustomLocationName('');
      setCustomLocationAddress('');
      setMatchDate('');
      setMatchTimeStart('');
      setMatchTimeEnd('');
      setTargetLevels([]);
      setDescription('');
    }
  }, [isOpen]);

  const toggleLevel = (level: string) => {
    setTargetLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleSubmit = async () => {
    if (!team) {
      toast.error('팀 정보가 없습니다');
      return;
    }

    // Validation
    const locationName = locationType === 'home_ground' ? team.homeGroundName : customLocationName;
    const locationAddress = locationType === 'home_ground' ? team.homeGroundAddress : customLocationAddress;

    if (!locationName) {
      toast.error('장소를 입력해주세요');
      return;
    }
    if (!matchDate) {
      toast.error('날짜를 선택해주세요');
      return;
    }
    if (!matchTimeStart || !matchTimeEnd) {
      toast.error('시간을 입력해주세요');
      return;
    }
    if (targetLevels.length === 0) {
      toast.error('희망 레벨을 선택해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const { error } = await supabase.from('match_posts').insert({
        team_id: team.id,
        posted_by_user_id: user.id,
        location_type: locationType,
        location_name: locationName,
        location_address: locationAddress || null,
        match_date: matchDate,
        match_time_start: matchTimeStart,
        match_time_end: matchTimeEnd,
        target_levels: targetLevels,
        description: description || null,
      });

      if (error) throw error;

      toast.success('매칭 공고가 등록되었습니다!', { icon: '⚔️' });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating match post:', error);
      toast.error('공고 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const hasHomeGround = team?.homeGroundName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-card border-4 border-border-dark"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b-4 border-primary-dark p-3 flex items-center justify-between">
          <h2 className="font-pixel text-[11px] text-primary-foreground">
            ⚔️ 매칭 공고 올리기
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-primary-dark/30 hover:bg-primary-dark/50 transition-colors"
          >
            <X size={16} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Team Info */}
          {team && (
            <div className="flex items-center gap-3 p-3 bg-secondary border-2 border-border-dark">
              <div className="w-10 h-10 bg-field-green border-2 border-primary-dark flex items-center justify-center">
                <span className="text-lg">{team.emblem}</span>
              </div>
              <div>
                <p className="font-pixel text-[10px] text-foreground">{team.name}</p>
                <p className="font-pixel text-[8px] text-muted-foreground">팀 관리자</p>
              </div>
            </div>
          )}

          {/* Location Selection */}
          <div className="space-y-2">
            <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
              <MapPin size={10} />
              장소
            </label>
            
            {/* Location Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setLocationType('home_ground')}
                disabled={!hasHomeGround}
                className={cn(
                  "flex-1 px-3 py-2 font-pixel text-[9px] border-2 transition-all",
                  locationType === 'home_ground'
                    ? "bg-primary text-primary-foreground border-primary-dark"
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary",
                  !hasHomeGround && "opacity-50 cursor-not-allowed"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <Home size={10} className="inline mr-1" />
                홈 구장
              </button>
              <button
                onClick={() => setLocationType('custom')}
                className={cn(
                  "flex-1 px-3 py-2 font-pixel text-[9px] border-2 transition-all",
                  locationType === 'custom'
                    ? "bg-primary text-primary-foreground border-primary-dark"
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <Search size={10} className="inline mr-1" />
                다른 장소
              </button>
            </div>

            {/* Home Ground Display */}
            {locationType === 'home_ground' && hasHomeGround && (
              <div className="px-3 py-2 bg-primary/10 border-2 border-primary/30">
                <p className="font-pixel text-[9px] text-foreground">{team?.homeGroundName}</p>
                {team?.homeGroundAddress && (
                  <p className="font-pixel text-[7px] text-muted-foreground mt-0.5">
                    {team.homeGroundAddress}
                  </p>
                )}
              </div>
            )}

            {/* Custom Location Input */}
            {locationType === 'custom' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="장소 이름 (예: 용산 풋살장)"
                  value={customLocationName}
                  onChange={(e) => setCustomLocationName(e.target.value)}
                  className="w-full px-3 py-2 font-pixel text-[9px] bg-input border-2 border-border-dark focus:border-primary outline-none"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                />
                <input
                  type="text"
                  placeholder="주소 (선택)"
                  value={customLocationAddress}
                  onChange={(e) => setCustomLocationAddress(e.target.value)}
                  className="w-full px-3 py-2 font-pixel text-[9px] bg-input border-2 border-border-dark focus:border-primary outline-none"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                />
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
              <Calendar size={10} />
              날짜
            </label>
            <input
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 font-pixel text-[9px] bg-input border-2 border-border-dark focus:border-primary outline-none"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            />
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
              <Clock size={10} />
              시간
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={matchTimeStart}
                onChange={(e) => setMatchTimeStart(e.target.value)}
                className="flex-1 px-3 py-2 font-pixel text-[9px] bg-input border-2 border-border-dark focus:border-primary outline-none"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              />
              <span className="font-pixel text-[10px] text-muted-foreground">~</span>
              <input
                type="time"
                value={matchTimeEnd}
                onChange={(e) => setMatchTimeEnd(e.target.value)}
                className="flex-1 px-3 py-2 font-pixel text-[9px] bg-input border-2 border-border-dark focus:border-primary outline-none"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              />
            </div>
          </div>

          {/* Target Levels */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
                <Target size={10} />
                희망 팀 레벨 (복수 선택 가능)
              </label>
              <LevelInfoButton />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {levelOptions.map(({ value, tier, icon }) => {
                const isSelected = targetLevels.includes(value);
                const levelColorClass = {
                  S: 'bg-accent text-accent-foreground border-accent-dark',
                  A: 'bg-primary text-primary-foreground border-primary-dark',
                  B: 'bg-primary/70 text-primary-foreground border-primary-dark/70',
                  C: 'bg-primary/50 text-primary-foreground border-primary-dark/50',
                }[value];
                
                return (
                  <button
                    key={value}
                    onClick={() => toggleLevel(value)}
                    className={cn(
                      "px-3 py-2 border-2 transition-all text-left",
                      isSelected
                        ? levelColorClass
                        : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                    )}
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{icon}</span>
                      <span className="font-pixel text-[9px]">Lv.{value}</span>
                      <span className={cn(
                        "font-pixel text-[7px]",
                        isSelected ? "opacity-75" : "text-muted-foreground"
                      )}>
                        ({tier})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-pixel text-[9px] text-muted-foreground">
              📝 추가 메시지 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상대 팀에게 전할 메시지가 있다면 적어주세요..."
              rows={3}
              className="w-full px-3 py-2 font-pixel text-[9px] bg-input border-2 border-border-dark focus:border-primary outline-none resize-none"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t-2 border-border-dark p-4">
          <PixelButton
            variant="primary"
            size="lg"
            className="w-full font-bold"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
          >
            {isSubmitting ? '등록 중...' : '⚔️ 공고 등록하기'}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
