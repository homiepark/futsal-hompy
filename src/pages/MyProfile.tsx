import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Camera, Mail, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { regionData, regions } from '@/lib/teamData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Futsal positions
const futsalPositions = [
  { id: 'pivo', label: '피보', emoji: '⚡', description: 'Pivot / Forward' },
  { id: 'ala', label: '아라', emoji: '💨', description: 'Winger' },
  { id: 'fixo', label: '픽소', emoji: '🛡️', description: 'Fixed / Defender' },
  { id: 'goleiro', label: '골레이로', emoji: '🧤', description: 'Goalkeeper' },
];

interface PreferredRegion {
  region: string;
  district: string;
}

const MAX_REGIONS = 3;

export default function MyProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    nickname: '풋살러',
    avatarUrl: '',
    yearsOfExperience: 0,
    monthsOfExperience: 0,
    isProElite: false,
    preferredPositions: ['ala'] as string[],
  });
  
  // Multi-region state
  const [preferredRegions, setPreferredRegions] = useState<PreferredRegion[]>([]);
  const [tempRegion, setTempRegion] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');

  const [myTeams] = useState([
    { id: '1', name: 'FC 불꽃', emblem: '🔥', role: 'admin' },
    { id: '2', name: '라이언즈 FC', emblem: '🦁', role: 'member' },
  ]);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            nickname: data.nickname || '풋살러',
            avatarUrl: data.avatar_url || '',
            yearsOfExperience: data.years_of_experience || 0,
            monthsOfExperience: (data as any).months_of_experience || 0,
            isProElite: data.is_pro_elite || false,
            preferredPositions: (data as any).preferred_positions?.length > 0 
              ? (data as any).preferred_positions 
              : (data.preferred_position ? [data.preferred_position] : ['ala']),
          });
          
          // Load preferred regions from JSONB
          const savedRegions = data.preferred_regions as unknown as PreferredRegion[] | null;
          if (savedRegions && Array.isArray(savedRegions)) {
            setPreferredRegions(savedRegions);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getPositionLabels = (positionIds: string[]) => {
    return positionIds
      .map(id => futsalPositions.find(p => p.id === id)?.label || id)
      .join(' / ');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile({ ...profile, avatarUrl: url });
    }
  };

  // Add a region tag
  const handleAddRegion = () => {
    if (!tempRegion || !tempDistrict) {
      toast.error('시/도와 구/군을 모두 선택해주세요');
      return;
    }
    
    if (preferredRegions.length >= MAX_REGIONS) {
      toast.error(`최대 ${MAX_REGIONS}개까지만 추가할 수 있습니다`);
      return;
    }
    
    // Check for duplicates
    const isDuplicate = preferredRegions.some(
      r => r.region === tempRegion && r.district === tempDistrict
    );
    if (isDuplicate) {
      toast.error('이미 추가된 지역입니다');
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

  const handleSave = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: profile.nickname,
          years_of_experience: profile.yearsOfExperience,
          months_of_experience: profile.monthsOfExperience,
          is_pro_elite: profile.isProElite,
          preferred_position: profile.preferredPositions[0] || 'ala',
          preferred_positions: profile.preferredPositions,
          preferred_regions: JSON.parse(JSON.stringify(preferredRegions)),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('프로필이 저장되었습니다!', {
        icon: '✅',
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const tempDistricts = tempRegion ? regionData[tempRegion] || [] : [];

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary border-b-4 border-primary-dark p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center">
            <ArrowLeft size={18} className="text-primary-foreground" />
          </Link>
          <h1 className="text-sm text-primary-foreground">내 프로필</h1>
        </div>
        <Link to="/messages" className="relative w-10 h-10 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center">
          <Mail size={20} className="text-primary-foreground" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent border border-accent-dark text-[10px] text-accent-foreground flex items-center justify-center">
            2
          </span>
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card with Avatar */}
        <PixelCard className="flex flex-col items-center gap-4 py-6">
          {/* Avatar with Edit Button */}
          <div className="relative">
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-muted border-4 border-border-dark overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 w-8 h-8 bg-accent border-2 border-accent-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))]"
            >
              <Camera size={16} className="text-accent-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Nickname */}
          <div className="text-center">
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="text-lg text-foreground bg-transparent border-b-2 border-border focus:border-primary outline-none text-center w-full max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground mt-1">
              경력 {profile.yearsOfExperience}년 {profile.monthsOfExperience > 0 ? `${profile.monthsOfExperience}개월` : ''} · {getPositionLabels(profile.preferredPositions)}
            </p>
          </div>
        </PixelCard>

        {/* Activity Regions - Multi-select with Tags */}
        <PixelCard>
          <h2 className="text-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">📍</span>
            활동 지역
            <span className="text-[9px] text-muted-foreground font-pixel">(최대 3개)</span>
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
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
        <PixelCard>
          <h2 className="text-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">⚽</span>
            포지션 선택
          </h2>
          <p className="font-pixel text-[8px] text-muted-foreground mb-3">복수 선택 가능</p>
          <div className="grid grid-cols-2 gap-3">
            {futsalPositions.map((pos) => {
              const isSelected = profile.preferredPositions.includes(pos.id);
              return (
                <button
                  key={pos.id}
                  onClick={() => {
                    const newPositions = isSelected
                      ? profile.preferredPositions.filter(p => p !== pos.id)
                      : [...profile.preferredPositions, pos.id];
                    if (newPositions.length > 0) {
                      setProfile({ ...profile, preferredPositions: newPositions });
                    }
                  }}
                  className={cn(
                    'p-3 border-4 transition-all text-center relative',
                    isSelected
                      ? 'bg-primary border-primary-dark text-primary-foreground shadow-[0_0_12px_hsl(var(--primary))]'
                      : 'bg-secondary border-border-dark hover:border-primary'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-accent border-2 border-accent-dark flex items-center justify-center">
                      <span className="text-[8px] text-accent-foreground">✓</span>
                    </div>
                  )}
                  <span className="text-xl block mb-1">{pos.emoji}</span>
                  <span className="font-pixel text-[10px] block">{pos.label}</span>
                  <span className="font-body text-[9px] text-muted-foreground block">{pos.description}</span>
                </button>
              );
            })}
          </div>
        </PixelCard>

        {/* Experience & Status */}
        <PixelCard>
          <h2 className="text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">📊</span>
            풋살 경력 정보
          </h2>

          {/* Years of Experience */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              풋살/축구 경력 (년)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfile({ ...profile, yearsOfExperience: Math.max(0, profile.yearsOfExperience - 1) })}
                className="w-10 h-10 bg-secondary border-4 border-border-dark text-lg shadow-[2px_2px_0_hsl(var(--pixel-shadow))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_hsl(var(--pixel-shadow))]"
              >
                -
              </button>
              <div className="flex-1 h-10 bg-muted border-4 border-border-dark flex items-center justify-center text-sm">
                {profile.yearsOfExperience}년
              </div>
              <button
                onClick={() => setProfile({ ...profile, yearsOfExperience: profile.yearsOfExperience + 1 })}
                className="w-10 h-10 bg-secondary border-4 border-border-dark text-lg shadow-[2px_2px_0_hsl(var(--pixel-shadow))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_hsl(var(--pixel-shadow))]"
              >
                +
              </button>
            </div>
          </div>

          {/* Pro/Elite Status */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              프로/엘리트 선수 출신
            </label>
            <button
              onClick={() => setProfile({ ...profile, isProElite: !profile.isProElite })}
              className={cn(
                'w-full py-3 border-4 transition-all',
                profile.isProElite
                  ? 'bg-accent text-accent-foreground border-accent-dark shadow-[4px_4px_0_hsl(var(--accent-dark))]'
                  : 'bg-secondary text-secondary-foreground border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))]'
              )}
            >
              {profile.isProElite ? '✓ 프로/엘리트 출신입니다' : '해당 없음'}
            </button>
          </div>
        </PixelCard>

        {/* My Teams Section */}
        <PixelCard>
          <h2 className="text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">🏆</span>
            내 팀 목록
          </h2>

          {myTeams.length > 0 ? (
            <div className="space-y-2">
              {myTeams.map((team) => (
                <div 
                  key={team.id}
                  className="flex items-center gap-3 p-3 bg-muted border-2 border-border-dark"
                >
                  <div className="w-10 h-10 bg-field-green border-2 border-border-dark flex items-center justify-center text-xl">
                    {team.emblem}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.role === 'admin' ? '👑 관리자' : '👤 멤버'}
                    </p>
                  </div>
                  <Link 
                    to={`/team/${team.id}`}
                    className="px-3 py-1 bg-primary text-primary-foreground border-2 border-primary-dark text-xs"
                  >
                    보기
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>아직 소속된 팀이 없습니다</p>
              <Link to="/" className="text-primary text-sm mt-2 inline-block">
                팀 찾기 →
              </Link>
            </div>
          )}
        </PixelCard>

        {/* Save Button */}
        <PixelButton 
          variant="primary" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? '저장 중...' : '프로필 저장'}</span>
        </PixelButton>
      </div>
    </div>
  );
}
