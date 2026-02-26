import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Check, ArrowRight } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Futsal positions with icons
const positions = [
  { id: 'pivo', label: '피보', emoji: '⚡', description: 'Pivot / Forward' },
  { id: 'ala', label: '아라', emoji: '💨', description: 'Winger' },
  { id: 'fixo', label: '픽소', emoji: '🛡️', description: 'Defender' },
  { id: 'goleiro', label: '골레이로', emoji: '🧤', description: 'Goalkeeper' },
];

// Experience levels
const experienceLevels = [
  { id: 1, label: 'Newbie', sublabel: '<1년', years: 0 },
  { id: 2, label: 'Rookie', sublabel: '1-3년', years: 2 },
  { id: 3, label: 'Regular', sublabel: '3-5년', years: 4 },
  { id: 4, label: 'Veteran', sublabel: '5-10년', years: 7 },
  { id: 5, label: 'Legend', sublabel: '10년+', years: 12 },
];

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
  const [careerType, setCareerType] = useState<'under1' | 'over1' | null>(null);
  const [careerYears, setCareerYears] = useState(1);
  const [careerMonths, setCareerMonths] = useState(0);
  const [isElite, setIsElite] = useState<boolean | null>(null);

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
    if (careerType === null) {
      toast({ title: '경력을 선택해주세요', variant: 'destructive' });
      return;
    }
    if (isElite === null) {
      toast({ title: '엘리트 여부를 선택해주세요', variant: 'destructive' });
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

      // Calculate career
      const yearsOfExp = careerType === 'under1' ? 0 : careerYears;
      const monthsOfExp = careerType === 'under1' ? 0 : careerMonths;

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: nickname.trim(),
          nickname_tag: nicknameTag,
          real_name: realName.trim(),
          preferred_position: selectedPositions[0],
          preferred_positions: selectedPositions,
          years_of_experience: yearsOfExp,
          months_of_experience: monthsOfExp,
          is_pro_elite: isElite,
          avatar_url: uploadedAvatarUrl,
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
        <div className="mt-2 p-2 bg-muted border-2 border-border-dark">
          <p className="font-pixel text-[9px] text-muted-foreground">
            🔒 실명은 팀 관리자에게만 공개됩니다
          </p>
          <p className="font-pixel text-[8px] text-muted-foreground mt-1">
            입단 신청 시 본인 확인용으로만 사용되며, 다른 사용자에게는 보이지 않습니다.
          </p>
        </div>
      </PixelCard>

      {/* Position Selection - Multi-select */}
      <PixelCard className="mb-4">
        <label className="block font-pixel text-xs text-foreground mb-1">
          포지션 선택 <span className="text-accent">*</span>
        </label>
        <p className="font-pixel text-[8px] text-muted-foreground mb-3">복수 선택 가능</p>
        <div className="grid grid-cols-2 gap-3">
          {positions.map((pos) => {
            const isSelected = selectedPositions.includes(pos.id);
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
                  'p-4 border-4 transition-all text-center relative',
                  isSelected
                    ? 'bg-primary border-primary-dark text-primary-foreground'
                    : 'bg-secondary border-border-dark hover:border-primary'
                )}
                style={{
                  boxShadow: isSelected
                    ? '0 0 16px hsl(var(--primary)), 3px 3px 0 hsl(var(--primary-dark))'
                    : '3px 3px 0 hsl(var(--pixel-shadow))'
                }}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-accent border-2 border-accent-dark flex items-center justify-center">
                    <Check size={12} className="text-accent-foreground" />
                  </div>
                )}
                <span className="text-3xl block mb-2">{pos.emoji}</span>
                <span className="font-pixel text-[11px] block">{pos.label}</span>
                <span className="font-pixel text-[8px] text-muted-foreground block mt-1">{pos.description}</span>
              </button>
            );
          })}
        </div>
      </PixelCard>

      {/* Career Selection - Conditional */}
      <PixelCard className="mb-4">
        <label className="block font-pixel text-xs text-foreground mb-3">
          풋살/축구 경력 <span className="text-accent">*</span>
        </label>
        
        {/* Career Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setCareerType('under1')}
            className={cn(
              'p-3 border-4 transition-all text-center',
              careerType === 'under1'
                ? 'bg-accent border-accent-dark text-accent-foreground'
                : 'bg-secondary border-border-dark hover:border-accent'
            )}
            style={{
              boxShadow: careerType === 'under1'
                ? '0 0 12px hsl(var(--accent)), 3px 3px 0 hsl(var(--accent-dark))'
                : '3px 3px 0 hsl(var(--pixel-shadow))'
            }}
          >
            {careerType === 'under1' && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-primary border-2 border-primary-dark flex items-center justify-center">
                <Check size={12} className="text-primary-foreground" />
              </div>
            )}
            <span className="text-xl block mb-1">🌱</span>
            <span className="font-pixel text-[10px] block">1년 이하</span>
            <span className="font-pixel text-[7px] text-muted-foreground block mt-1">Entry Level</span>
          </button>
          <button
            type="button"
            onClick={() => setCareerType('over1')}
            className={cn(
              'p-3 border-4 transition-all text-center',
              careerType === 'over1'
                ? 'bg-accent border-accent-dark text-accent-foreground'
                : 'bg-secondary border-border-dark hover:border-accent'
            )}
            style={{
              boxShadow: careerType === 'over1'
                ? '0 0 12px hsl(var(--accent)), 3px 3px 0 hsl(var(--accent-dark))'
                : '3px 3px 0 hsl(var(--pixel-shadow))'
            }}
          >
            <span className="text-xl block mb-1">⚡</span>
            <span className="font-pixel text-[10px] block">1년 이상</span>
            <span className="font-pixel text-[7px] text-muted-foreground block mt-1">Experienced</span>
          </button>
        </div>

        {/* Detailed Year/Month Input (conditional) */}
        {careerType === 'over1' && (
          <div className="p-3 bg-muted border-3 border-border-dark space-y-3">
            <p className="font-pixel text-[9px] text-muted-foreground">상세 경력 입력</p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="font-pixel text-[8px] text-muted-foreground block mb-1">년</label>
                <select
                  value={careerYears}
                  onChange={(e) => setCareerYears(Number(e.target.value))}
                  className="w-full px-2 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] focus:outline-none focus:border-accent"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="font-pixel text-[8px] text-muted-foreground block mb-1">개월</label>
                <select
                  value={careerMonths}
                  onChange={(e) => setCareerMonths(Number(e.target.value))}
                  className="w-full px-2 py-2 bg-input border-3 border-border-dark font-pixel text-[10px] focus:outline-none focus:border-accent"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  {Array.from({ length: 12 }, (_, i) => i).map(m => (
                    <option key={m} value={m}>{m}개월</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-center p-2 bg-accent/20 border-2 border-accent">
              <span className="font-pixel text-[10px] text-accent-foreground">
                📊 경력: {careerYears}년 {careerMonths > 0 ? `${careerMonths}개월` : ''}
              </span>
            </div>
          </div>
        )}

        {careerType === 'under1' && (
          <div className="p-3 bg-muted border-3 border-border-dark text-center">
            <span className="font-pixel text-[10px] text-muted-foreground">🌱 입문 레벨로 설정됩니다</span>
          </div>
        )}
      </PixelCard>

      {/* Elite Status */}
      <PixelCard className="mb-6">
        <label className="block font-pixel text-xs text-foreground mb-3">
          선수 유형 <span className="text-accent">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIsElite(true)}
            className={cn(
              'p-4 border-4 transition-all text-center relative',
              isElite === true
                ? 'bg-[hsl(45,100%,50%)] border-[hsl(45,100%,35%)] text-foreground'
                : 'bg-secondary border-border-dark hover:border-[hsl(45,100%,50%)]'
            )}
            style={{
              boxShadow: isElite === true
                ? '0 0 20px hsl(45,100%,50%), 3px 3px 0 hsl(45,100%,35%)'
                : '3px 3px 0 hsl(var(--pixel-shadow))'
            }}
          >
            {isElite === true && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-accent border-2 border-accent-dark flex items-center justify-center">
                <Check size={12} className="text-accent-foreground" />
              </div>
            )}
            <span className="text-3xl block mb-2">🏆</span>
            <span className="font-pixel text-[10px] block">ELITE</span>
            <span className="font-pixel text-[8px] text-muted-foreground block mt-1">프로/엘리트 경험</span>
          </button>
          <button
            type="button"
            onClick={() => setIsElite(false)}
            className={cn(
              'p-4 border-4 transition-all text-center relative',
              isElite === false
                ? 'bg-primary border-primary-dark text-primary-foreground'
                : 'bg-secondary border-border-dark hover:border-primary'
            )}
            style={{
              boxShadow: isElite === false
                ? '0 0 16px hsl(var(--primary)), 3px 3px 0 hsl(var(--primary-dark))'
                : '3px 3px 0 hsl(var(--pixel-shadow))'
            }}
          >
            {isElite === false && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-accent border-2 border-accent-dark flex items-center justify-center">
                <Check size={12} className="text-accent-foreground" />
              </div>
            )}
            <span className="text-3xl block mb-2">⚽</span>
            <span className="font-pixel text-[10px] block">AMATEUR</span>
            <span className="font-pixel text-[8px] text-muted-foreground block mt-1">동호회 플레이어</span>
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
