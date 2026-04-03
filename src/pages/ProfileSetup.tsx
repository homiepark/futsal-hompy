import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, ArrowRight, X, Plus } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { regionData, regions } from '@/lib/teamData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Futsal positions with icons
const positions = [
  { id: 'pivo', label: '피보', emoji: '⚡', description: 'Pivot / Forward' },
  { id: 'ala', label: '아라', emoji: '💨', description: 'Winger' },
  { id: 'fixo', label: '픽소', emoji: '🛡️', description: 'Defender' },
  { id: 'goleiro', label: '골레이로', emoji: '🧤', description: 'Goalkeeper' },
];

interface PreferredRegion {
  region: string;
  district: string;
}

const MAX_REGIONS = 3;

// Generate random 4-digit tag
const generateTag = () => {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
};

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState('');
  const [realName, setRealName] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [monthsOfExperience, setMonthsOfExperience] = useState(0);
  const [isProElite, setIsProElite] = useState(false);

  // Multi-region state
  const [preferredRegions, setPreferredRegions] = useState<PreferredRegion[]>([]);
  const [tempRegion, setTempRegion] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  // Add a region tag
  const handleAddRegion = () => {
    if (!tempRegion || !tempDistrict) {
      toast({ title: '시/도와 구/군을 모두 선택해주세요', variant: 'destructive' });
      return;
    }

    if (preferredRegions.length >= MAX_REGIONS) {
      toast({ title: `최대 ${MAX_REGIONS}개까지만 추가할 수 있습니다`, variant: 'destructive' });
      return;
    }

    const isDuplicate = preferredRegions.some(
      r => r.region === tempRegion && r.district === tempDistrict
    );
    if (isDuplicate) {
      toast({ title: '이미 추가된 지역입니다', variant: 'destructive' });
      return;
    }

    setPreferredRegions([...preferredRegions, { region: tempRegion, district: tempDistrict }]);
    setTempRegion('');
    setTempDistrict('');
  };

  // Remove a region tag
  const handleRemoveRegion = (index: number) => {
    setPreferredRegions(preferredRegions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!nickname.trim()) {
      toast({ title: '닉네임을 입력해주세요', variant: 'destructive' });
      return;
    }
    if (!realName.trim()) {
      toast({ title: '실명을 입력해주세요', variant: 'destructive' });
      return;
    }
    if (selectedPositions.length === 0) {
      toast({ title: '포지션을 하나 이상 선택해주세요', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        toast({ title: '로그인이 필요합니다', variant: 'destructive' });
        navigate('/auth');
        return;
      }

      // Generate unique tag
      const nicknameTag = generateTag();

      // Upload avatar if exists
      let uploadedAvatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          uploadedAvatarUrl = urlData.publicUrl;
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: nickname.trim(),
          nickname_tag: nicknameTag,
          real_name: realName.trim(),
          preferred_position: selectedPositions[0],
          preferred_positions: selectedPositions,
          years_of_experience: yearsOfExperience,
          months_of_experience: monthsOfExperience,
          experience_set_at: new Date().toISOString(),
          is_pro_elite: isProElite,
          avatar_url: uploadedAvatarUrl,
          preferred_regions: JSON.parse(JSON.stringify(preferredRegions)),
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({ title: '프로필이 저장되었습니다! 🎮' });
      navigate('/');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast({ title: '프로필 저장에 실패했습니다', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tempDistricts = tempRegion ? regionData[tempRegion] || [] : [];

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary border-4 border-primary-dark flex items-center justify-center animate-pixel-pulse"
            style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
          >
            <span className="text-2xl">⚽</span>
          </div>
          <p className="font-pixel text-xs text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 px-4 py-6 max-w-lg mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <PixelBackButton variant="green" />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted border-3 border-border-dark flex items-center justify-center font-pixel text-[10px] text-muted-foreground"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            ✓
          </div>
          <span className="font-pixel text-[9px] text-muted-foreground">계정 생성</span>
        </div>
        <div className="w-8 h-1 bg-primary" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary border-3 border-primary-dark flex items-center justify-center font-pixel text-[10px] text-primary-foreground"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            2
          </div>
          <span className="font-pixel text-[9px] text-primary">프로필 설정</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="font-pixel text-lg text-primary mb-1">⚽ 프로필 설정</h1>
        <p className="font-pixel text-xs text-muted-foreground">Detailed Profile Setup</p>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="w-28 h-28 rounded-full bg-muted border-4 border-border-dark overflow-hidden hover:opacity-80 transition-opacity"
            style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
                <Camera size={28} className="text-muted-foreground mb-1" />
                <span className="font-pixel text-[8px] text-muted-foreground">사진 추가</span>
              </div>
            )}
          </button>
          <div
            className="absolute -bottom-1 -right-1 w-9 h-9 bg-accent border-3 border-accent-dark flex items-center justify-center cursor-pointer"
            onClick={handleAvatarClick}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <Camera size={18} className="text-accent-foreground" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Nickname Input */}
      <PixelCard className="mb-4">
        <label className="block font-pixel text-xs text-foreground mb-2">
          닉네임 <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
          className="w-full pixel-input"
          maxLength={12}
        />
        <p className="font-pixel text-[9px] text-muted-foreground mt-2">
          💡 자동으로 4자리 태그가 부여됩니다 (예: {nickname || '닉네임'}#{generateTag()})
        </p>
        <p className="font-pixel text-[9px] text-muted-foreground mt-1 text-right">
          {nickname.length}/12
        </p>
      </PixelCard>

      {/* Real Name Input */}
      <PixelCard className="mb-4">
        <label className="block font-pixel text-xs text-foreground mb-2">
          실명 <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={realName}
          onChange={(e) => setRealName(e.target.value)}
          placeholder="본인 실명을 입력하세요"
          className="w-full pixel-input"
          maxLength={20}
        />
        <div className="mt-2 p-2.5 bg-muted border-2 border-border-dark rounded-lg">
          <p className="font-body text-xs text-foreground">
            👥 실명은 같은 팀원에게만 선수카드에서 표시됩니다
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-1">
            팀 외부 사용자에게는 닉네임만 보이며, 팀원 간 소통을 위해 사용돼요.
          </p>
        </div>
      </PixelCard>

      {/* Activity Regions */}
      <PixelCard className="mb-4">
        <label className="block font-pixel text-xs text-foreground mb-1 flex items-center gap-2">
          <span className="text-primary">📍</span>
          활동 지역
          <span className="text-[9px] text-muted-foreground font-pixel">(최대 3개)</span>
        </label>
        <p className="font-pixel text-[8px] text-muted-foreground mb-3">
          설정하시면 홈 화면에서 해당 지역 팀들을 먼저 보여드려요!
        </p>

        {/* Region Tags */}
        {preferredRegions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {preferredRegions.map((r, index) => (
              <div
                key={`${r.region}-${r.district}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary text-primary-foreground border-3 border-primary-dark"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <span className="font-pixel text-[9px]">📍 {r.district}</span>
                <button
                  onClick={() => handleRemoveRegion(index)}
                  className="w-4 h-4 flex items-center justify-center bg-primary-dark/30 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Region Selector */}
        {preferredRegions.length < MAX_REGIONS && (
          <div className="flex gap-2">
            <Select value={tempRegion} onValueChange={(v) => { setTempRegion(v); setTempDistrict(''); }}>
              <SelectTrigger className={cn(
                'flex-1 bg-input border-3 border-border-dark font-pixel text-[10px] h-10',
                'focus:border-primary focus:ring-0'
              )}>
                <SelectValue placeholder="시/도" />
              </SelectTrigger>
              <SelectContent className="bg-card border-3 border-border-dark max-h-48 z-50">
                {regions.map((r) => (
                  <SelectItem key={r} value={r} className="font-pixel text-[10px] cursor-pointer hover:bg-muted">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tempDistrict} onValueChange={setTempDistrict} disabled={!tempRegion}>
              <SelectTrigger className={cn(
                'flex-1 bg-input border-3 border-border-dark font-pixel text-[10px] h-10',
                'focus:border-primary focus:ring-0',
                !tempRegion && 'opacity-50'
              )}>
                <SelectValue placeholder="구/군" />
              </SelectTrigger>
              <SelectContent className="bg-card border-3 border-border-dark max-h-48 z-50">
                {tempDistricts.map((d) => (
                  <SelectItem key={d} value={d} className="font-pixel text-[10px] cursor-pointer hover:bg-muted">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={handleAddRegion}
              disabled={!tempRegion || !tempDistrict}
              className={cn(
                'w-10 h-10 flex items-center justify-center border-3 transition-all',
                tempRegion && tempDistrict
                  ? 'bg-accent text-accent-foreground border-accent-dark hover:brightness-110'
                  : 'bg-muted text-muted-foreground border-border-dark opacity-50'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        {preferredRegions.length >= MAX_REGIONS && (
          <p className="text-xs text-accent font-pixel mt-2">✓ 최대 {MAX_REGIONS}개 지역이 설정되었습니다</p>
        )}
      </PixelCard>

      {/* Position Selection - Multi-select */}
      <PixelCard className="mb-4">
        <label className="block font-pixel text-xs text-foreground mb-1 flex items-center gap-2">
          <span className="text-primary">⚽</span>
          포지션 선택 <span className="text-accent">*</span>
        </label>
        <p className="font-pixel text-[8px] text-muted-foreground mb-3">복수 선택 가능 · 첫 번째 선택이 대표 포지션</p>
        <div className="grid grid-cols-2 gap-3">
          {positions.map((pos) => {
            const isSelected = selectedPositions.includes(pos.id);
            const isPrimary = selectedPositions[0] === pos.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => {
                  setSelectedPositions(prev =>
                    isSelected
                      ? prev.filter(p => p !== pos.id)
                      : [...prev, pos.id]
                  );
                }}
                className={cn(
                  'p-3 border-4 transition-all text-center relative',
                  isSelected
                    ? 'bg-primary border-primary-dark text-primary-foreground shadow-[0_0_12px_hsl(var(--primary))]'
                    : 'bg-secondary border-border-dark hover:border-primary'
                )}
                style={{
                  boxShadow: isSelected
                    ? '0 0 12px hsl(var(--primary)), 3px 3px 0 hsl(var(--primary-dark))'
                    : '3px 3px 0 hsl(var(--pixel-shadow))'
                }}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-accent border-2 border-accent-dark flex items-center justify-center">
                    <span className="text-[8px] text-accent-foreground">{isPrimary ? '★' : '✓'}</span>
                  </div>
                )}
                <span className="text-xl block mb-1">{pos.emoji}</span>
                <span className="font-pixel text-[10px] block">{pos.label}</span>
                <span className="font-body text-[9px] text-muted-foreground block">{pos.description}</span>
              </button>
            );
          })}
        </div>

        {/* Primary position selector */}
        {selectedPositions.length > 1 && (
          <div className="mt-3 p-2 bg-muted border-2 border-border-dark">
            <p className="font-pixel text-[8px] text-muted-foreground mb-2">★ 대표 포지션 설정</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedPositions.map((posId) => {
                const pos = positions.find(p => p.id === posId);
                if (!pos) return null;
                const isPrimary = selectedPositions[0] === posId;
                return (
                  <button
                    key={posId}
                    type="button"
                    onClick={() => {
                      const others = selectedPositions.filter(p => p !== posId);
                      setSelectedPositions([posId, ...others]);
                    }}
                    className={cn(
                      'px-2.5 py-1 border-2 font-pixel text-[9px] transition-all',
                      isPrimary
                        ? 'bg-accent border-accent-dark text-accent-foreground'
                        : 'bg-secondary border-border-dark text-foreground hover:border-accent'
                    )}
                  >
                    {isPrimary ? '★ ' : ''}{pos.emoji} {pos.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PixelCard>

      {/* Experience & Status */}
      <PixelCard className="mb-6">
        <label className="block font-pixel text-xs text-foreground mb-4 flex items-center gap-2">
          <span className="text-accent">📊</span>
          풋살 경력 정보
        </label>

        {/* Years of Experience - Detailed */}
        <div className="mb-4">
          <label className="font-pixel text-[10px] text-muted-foreground mb-2 block">
            풋살/축구 경력
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <select
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-2 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] focus:outline-none focus:border-accent"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {Array.from({ length: 31 }, (_, i) => i).map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={monthsOfExperience}
                onChange={(e) => setMonthsOfExperience(Number(e.target.value))}
                className="w-full px-2 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] focus:outline-none focus:border-accent"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {Array.from({ length: 12 }, (_, i) => i).map(m => (
                  <option key={m} value={m}>{m}개월</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 text-center p-2 bg-accent/20 border-2 border-accent">
            <span className="font-pixel text-[10px] text-accent-foreground">
              📊 경력: {yearsOfExperience}년 {monthsOfExperience > 0 ? `${monthsOfExperience}개월` : ''}
            </span>
          </div>
        </div>

        {/* Pro/Elite Status */}
        <div>
          <label className="font-pixel text-[10px] text-muted-foreground mb-2 block">
            프로/엘리트 선수 출신
          </label>
          <button
            type="button"
            onClick={() => setIsProElite(!isProElite)}
            className={cn(
              'w-full py-3 border-4 transition-all',
              isProElite
                ? 'bg-accent text-accent-foreground border-accent-dark shadow-[4px_4px_0_hsl(var(--accent-dark))]'
                : 'bg-secondary text-secondary-foreground border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))]'
            )}
          >
            {isProElite ? '✓ 프로/엘리트 출신입니다' : '해당 없음'}
          </button>
        </div>
      </PixelCard>

      {/* Submit Button */}
      <PixelButton
        variant="accent"
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          '저장 중...'
        ) : (
          <>
            <span>🚀 프로필 완성하기!</span>
            <ArrowRight size={18} />
          </>
        )}
      </PixelButton>
      <p className="text-center font-pixel text-[9px] text-muted-foreground mt-2">
        Complete Your Profile!
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
