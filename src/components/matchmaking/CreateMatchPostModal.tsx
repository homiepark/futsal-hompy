import { useState, useEffect, useCallback, useRef } from 'react';
import { X, MapPin, Calendar, Clock, Target, Home, Search, Star, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { LevelInfoButton } from '@/components/ui/LevelGuideModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { levelOptions } from '@/lib/teamData';
import { useMatchPostDraft } from '@/hooks/useMatchPostDraft';
import { DraftConfirmModal } from './DraftConfirmModal';

interface CreateMatchPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  team: {
    id: string;
    name: string;
    emblem: string;
    level?: string;
    mannerScore?: number;
    homeGroundName?: string;
    homeGroundAddress?: string;
  } | null;
}

const levelVariants = {
  '1': 'level-1',
  '2': 'level-2',
  '3': 'level-3',
  '4': 'level-4',
} as const;

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', 
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', 
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
];

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
  const [matchTimeStart, setMatchTimeStart] = useState('14:00');
  const [matchTimeEnd, setMatchTimeEnd] = useState('16:00');
  const [targetLevels, setTargetLevels] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-save state
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  const { hasDraft, draft, saveDraft, clearDraft, draftSavedAt } = useMatchPostDraft(team?.id || null);

  // Show draft confirm modal when opening with existing draft
  useEffect(() => {
    if (isOpen && hasDraft && !hasInitializedRef.current) {
      setShowDraftConfirm(true);
    }
    if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen, hasDraft]);

  // Initialize form (either fresh or from draft)
  const initializeForm = useCallback((useDraft: boolean) => {
    hasInitializedRef.current = true;
    setShowDraftConfirm(false);

    if (useDraft && draft) {
      setLocationType(draft.locationType);
      setCustomLocationName(draft.customLocationName);
      setCustomLocationAddress(draft.customLocationAddress);
      setMatchDate(draft.matchDate);
      setMatchTimeStart(draft.matchTimeStart);
      setMatchTimeEnd(draft.matchTimeEnd);
      setTargetLevels(draft.targetLevels);
      setDescription(draft.description);
    } else {
      // Fresh form
      setLocationType(team?.homeGroundName ? 'home_ground' : 'custom');
      setCustomLocationName('');
      setCustomLocationAddress('');
      setMatchDate(format(new Date(), 'yyyy-MM-dd'));
      setMatchTimeStart('14:00');
      setMatchTimeEnd('16:00');
      setTargetLevels([]);
      setDescription('');
      clearDraft();
    }
  }, [draft, team, clearDraft]);

  // Initialize form when modal opens and no draft exists
  useEffect(() => {
    if (isOpen && !hasDraft && !hasInitializedRef.current) {
      initializeForm(false);
    }
  }, [isOpen, hasDraft, initializeForm]);

  // Auto-save effect
  useEffect(() => {
    if (!isOpen || !hasInitializedRef.current || !team?.id) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setDraftSaveStatus('saving');

    // Debounce save by 1 second
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraft({
        locationType,
        customLocationName,
        customLocationAddress,
        matchDate,
        matchTimeStart,
        matchTimeEnd,
        targetLevels,
        description,
      });
      setDraftSaveStatus('saved');

      // Reset status after 2 seconds
      setTimeout(() => setDraftSaveStatus('idle'), 2000);
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isOpen, locationType, customLocationName, customLocationAddress, matchDate, matchTimeStart, matchTimeEnd, targetLevels, description, saveDraft, team?.id]);

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
      toast.error('희망 팀 레벨을 선택해주세요');
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

      // Clear draft on successful submit
      clearDraft();
      
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

  // Show draft confirm modal if needed
  if (showDraftConfirm) {
    return (
      <DraftConfirmModal
        isOpen={showDraftConfirm}
        onContinue={() => initializeForm(true)}
        onDiscard={() => initializeForm(false)}
      />
    );
  }

  const hasHomeGround = team?.homeGroundName;
  const teamLevel = (team?.level || '1');
  const mannerScore = team?.mannerScore || 4.5;

  // Format selected date for display
  const formattedDate = matchDate 
    ? format(new Date(matchDate), 'M월 d일 (EEE)', { locale: ko })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-card border-4 border-border-dark"
        style={{ boxShadow: '8px 8px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-primary/80 border-b-4 border-primary-dark p-4 flex items-center justify-between">
          <h2 className="font-pixel text-xs text-primary-foreground flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            매칭 공고 올리기
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-primary-dark/30 hover:bg-primary-dark/50 transition-colors border-2 border-primary-dark"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <X size={16} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Team Info Header - Enhanced */}
          {team && (
            <div 
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-secondary to-secondary/50 border-3 border-border-dark"
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              <div 
                className="w-14 h-14 bg-field-green border-3 border-primary-dark flex items-center justify-center"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <span className="text-2xl">{team.emblem}</span>
              </div>
              <div className="flex-1">
                <p className="font-pixel text-[11px] text-foreground font-bold">{team.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <PixelBadge variant={levelVariants[teamLevel]} className="text-[8px]">
                    Lv.{teamLevel}
                  </PixelBadge>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-accent fill-accent" />
                    <span className="font-pixel text-[9px] text-accent font-bold">{mannerScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-pixel text-[7px] text-muted-foreground block">공고 작성</span>
                <span className="font-pixel text-[8px] text-primary">팀 관리자</span>
              </div>
            </div>
          )}

          {/* Schedule Section */}
          <div 
            className="bg-secondary/30 border-3 border-border-dark p-3 space-y-3"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2 border-b-2 border-dashed border-border pb-2">
              <Calendar size={12} className="text-primary" />
              경기 일정
            </h3>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="font-pixel text-[9px] text-muted-foreground">날짜 선택</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2.5 font-pixel text-[10px] bg-input border-3 border-border-dark focus:border-primary outline-none"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              />
              {formattedDate && (
                <p className="font-pixel text-[9px] text-primary">📅 {formattedDate}</p>
              )}
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
                <Clock size={10} />
                시간 선택
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={matchTimeStart}
                  onChange={(e) => setMatchTimeStart(e.target.value)}
                  className="flex-1 px-3 py-2.5 font-pixel text-[10px] bg-input border-3 border-border-dark focus:border-primary outline-none appearance-none cursor-pointer"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <span className="font-pixel text-[12px] text-primary font-bold">~</span>
                <select
                  value={matchTimeEnd}
                  onChange={(e) => setMatchTimeEnd(e.target.value)}
                  className="flex-1 px-3 py-2.5 font-pixel text-[10px] bg-input border-3 border-border-dark focus:border-primary outline-none appearance-none cursor-pointer"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <p className="font-pixel text-[8px] text-muted-foreground">
                ⏰ {matchTimeStart} ~ {matchTimeEnd} (총 {
                  (() => {
                    const [startH, startM] = matchTimeStart.split(':').map(Number);
                    const [endH, endM] = matchTimeEnd.split(':').map(Number);
                    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
                    const hours = Math.floor(totalMinutes / 60);
                    const mins = totalMinutes % 60;
                    if (mins === 0) return `${hours}시간`;
                    if (hours === 0) return `${mins}분`;
                    return `${hours}시간 ${mins}분`;
                  })()
                })
              </p>
            </div>
          </div>

          {/* Location Section */}
          <div 
            className="bg-secondary/30 border-3 border-border-dark p-3 space-y-3"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2 border-b-2 border-dashed border-border pb-2">
              <MapPin size={12} className="text-primary" />
              장소 선택
            </h3>
            
            {/* Location Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setLocationType('home_ground')}
                disabled={!hasHomeGround}
                className={cn(
                  "flex-1 px-3 py-2.5 font-pixel text-[9px] border-3 transition-all",
                  locationType === 'home_ground'
                    ? "bg-primary text-primary-foreground border-primary-dark"
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary",
                  !hasHomeGround && "opacity-50 cursor-not-allowed"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <Home size={12} className="inline mr-1" />
                홈 구장
              </button>
              <button
                onClick={() => setLocationType('custom')}
                className={cn(
                  "flex-1 px-3 py-2.5 font-pixel text-[9px] border-3 transition-all",
                  locationType === 'custom'
                    ? "bg-primary text-primary-foreground border-primary-dark"
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <Search size={12} className="inline mr-1" />
                다른 장소
              </button>
            </div>

            {/* Home Ground Display */}
            {locationType === 'home_ground' && hasHomeGround && (
              <div 
                className="px-3 py-3 bg-primary/10 border-3 border-primary/50"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <p className="font-pixel text-[10px] text-foreground flex items-center gap-1">
                  📍 {team?.homeGroundName}
                </p>
                {team?.homeGroundAddress && (
                  <p className="font-pixel text-[8px] text-muted-foreground mt-1">
                    {team.homeGroundAddress}
                  </p>
                )}
              </div>
            )}

            {/* Custom Location Input */}
            {locationType === 'custom' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="구장 이름 검색 (예: 용산 풋살파크)"
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 font-pixel text-[9px] bg-input border-3 border-border-dark focus:border-primary outline-none"
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="주소 입력 (선택)"
                  value={customLocationAddress}
                  onChange={(e) => setCustomLocationAddress(e.target.value)}
                  className="w-full px-3 py-2.5 font-pixel text-[9px] bg-input border-3 border-border-dark focus:border-primary outline-none"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                />
              </div>
            )}
          </div>

          {/* Target Levels */}
          <div 
            className="bg-secondary/30 border-3 border-border-dark p-3 space-y-3"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="flex items-center justify-between border-b-2 border-dashed border-border pb-2">
              <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
                <Target size={12} className="text-accent" />
                희망 팀 레벨
              </h3>
              <LevelInfoButton />
            </div>
            <p className="font-pixel text-[8px] text-muted-foreground">복수 선택 가능</p>
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
                      "px-3 py-3 border-3 transition-all text-left relative overflow-hidden",
                      isSelected
                        ? levelColorClass
                        : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                    )}
                    style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-white/30 flex items-center justify-center">
                        <span className="text-[8px]">✓</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <span className="font-pixel text-[10px] font-bold block">Lv.{value}</span>
                        <span className={cn(
                          "font-pixel text-[7px]",
                          isSelected ? "opacity-75" : "text-muted-foreground"
                        )}>
                          {tier}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div 
            className="bg-secondary/30 border-3 border-border-dark p-3 space-y-2"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <label className="font-pixel text-[10px] text-foreground flex items-center gap-2">
              📝 한마디 메시지
              <span className="text-[8px] text-muted-foreground">(선택)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="정정당당하게 한 판 하실 팀 찾습니다!"
              rows={3}
              className="w-full px-3 py-2.5 font-pixel text-[9px] bg-input border-3 border-border-dark focus:border-primary outline-none resize-none"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t-4 border-border-dark p-4 space-y-2">
          {/* Draft Save Status */}
          <div className="flex items-center justify-center gap-2">
            {draftSaveStatus === 'saving' && (
              <span className="font-pixel text-[8px] text-muted-foreground animate-pulse flex items-center gap-1">
                <Save size={10} className="animate-spin" />
                저장 중...
              </span>
            )}
            {draftSaveStatus === 'saved' && (
              <span className="font-pixel text-[8px] text-primary flex items-center gap-1">
                <Save size={10} />
                임시 저장됨
              </span>
            )}
          </div>

          <PixelButton
            variant="primary"
            size="lg"
            className="w-full font-bold text-[11px]"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ 
              boxShadow: '4px 4px 0 hsl(var(--primary-dark))',
              transform: 'translateY(-2px)'
            }}
          >
            {isSubmitting ? '등록 중...' : '⚔️ 공고 등록하기'}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
