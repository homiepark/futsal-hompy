import { useState, useEffect, useCallback } from 'react';
import { Search, X, Check, ChevronDown, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { TeamCard } from '@/components/matchmaking/TeamCard';
import { LevelInfoButton } from '@/components/ui/LevelGuideModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  regionData, 
  genderOptions, 
  levelOptions,
} from '@/lib/teamData';

interface PreferredRegion {
  region: string;
  district: string;
}

interface MatchFilters {
  teamName: string;
  genders: string[];
  selectedRegions: PreferredRegion[];
  levels: string[];
}

const initialFilters: MatchFilters = {
  teamName: '',
  genders: [],
  selectedRegions: [],
  levels: [],
};

const MAX_FILTER_REGIONS = 3;

// Mock teams - will be replaced with real data
const mockTeams = [
  { name: 'FC 번개', region: '서울', district: '강남구', level: 'S' as const, members: 12, gender: '남성' as const, avgExperience: 8, hasProPlayer: true },
  { name: '선데이 풋살', region: '서울', district: '마포구', level: 'A' as const, members: 10, gender: '혼성' as const, avgExperience: 5, hasProPlayer: false },
  { name: '레이디스 FC', region: '경기', district: '성남시', level: 'B' as const, members: 15, gender: '여성' as const, avgExperience: 3, hasProPlayer: false },
  { name: '올드보이즈', region: '서울', district: '송파구', level: 'A' as const, members: 14, gender: '남성' as const, avgExperience: 12, hasProPlayer: true },
  { name: '위클리 킥', region: '인천', district: '연수구', level: 'C' as const, members: 8, gender: '혼성' as const, avgExperience: 2, hasProPlayer: false },
];

export default function Matchmaking() {
  const [filters, setFilters] = useState<MatchFilters>(initialFilters);
  const [smartFilterApplied, setSmartFilterApplied] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [tempRegion, setTempRegion] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');

  // Load user's preferred regions on mount
  useEffect(() => {
    async function loadSmartFilter() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_regions')
        .eq('user_id', user.id)
        .single();

      if (profile?.preferred_regions && Array.isArray(profile.preferred_regions) && profile.preferred_regions.length > 0) {
        const regions = (profile.preferred_regions as unknown as PreferredRegion[]).filter(
          r => r && typeof r === 'object' && 'region' in r && 'district' in r
        );
        if (regions.length === 0) return;
        
        setFilters(prev => ({
          ...prev,
          selectedRegions: regions,
        }));
        setSmartFilterApplied(true);
        
        const districtNames = regions.map(r => r.district).join(', ');
        toast.success(`${districtNames}의 팀들을 모아봤어요!`, {
          icon: '📍',
          duration: 3000,
          className: 'font-pixel',
        });
      }
    }
    loadSmartFilter();
  }, []);

  const handleShowAll = useCallback(() => {
    setFilters(initialFilters);
    setSmartFilterApplied(false);
    setTempRegion('');
    setTempDistrict('');
    toast.info('전체 팀 목록을 표시합니다', { icon: '🔄', className: 'font-pixel' });
  }, []);

  const toggleArrayFilter = (key: 'genders' | 'levels', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: updated });
  };

  const handleAddRegion = () => {
    if (!tempRegion || !tempDistrict) return;
    if (filters.selectedRegions.length >= MAX_FILTER_REGIONS) return;
    
    const isDuplicate = filters.selectedRegions.some(
      r => r.region === tempRegion && r.district === tempDistrict
    );
    if (isDuplicate) return;
    
    setFilters({
      ...filters,
      selectedRegions: [...filters.selectedRegions, { region: tempRegion, district: tempDistrict }],
    });
    setTempRegion('');
    setTempDistrict('');
    setSmartFilterApplied(false);
  };

  const handleRemoveRegion = (index: number) => {
    setFilters({
      ...filters,
      selectedRegions: filters.selectedRegions.filter((_, i) => i !== index),
    });
    setSmartFilterApplied(false);
  };

  const hasActiveFilters = filters.teamName || 
    filters.genders.length > 0 || 
    filters.selectedRegions.length > 0 ||
    filters.levels.length > 0;

  const tempDistricts = tempRegion ? regionData[tempRegion] || [] : [];

  // Filter teams based on current filters
  const filteredTeams = mockTeams.filter(team => {
    // Team name filter
    if (filters.teamName && !team.name.toLowerCase().includes(filters.teamName.toLowerCase())) {
      return false;
    }
    
    // Gender filter (OR logic)
    if (filters.genders.length > 0) {
      const genderValue = team.gender === '남성' ? 'male' : team.gender === '여성' ? 'female' : 'mixed';
      if (!filters.genders.includes(genderValue)) return false;
    }
    
    // Region filter (OR logic - any of selected regions)
    if (filters.selectedRegions.length > 0) {
      const matchesAnyRegion = filters.selectedRegions.some(
        r => team.region === r.region && team.district === r.district
      );
      if (!matchesAnyRegion) return false;
    }
    
    // Level filter (OR logic)
    if (filters.levels.length > 0 && !filters.levels.includes(team.level)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-pixel text-xs text-foreground flex items-center gap-2 mb-4">
          <span className="text-primary">✦</span>
          스마트 매칭
        </h2>

        {/* Smart Filter Notice */}
        {smartFilterApplied && filters.selectedRegions.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-accent/20 border-2 border-accent rounded">
            <Sparkles size={14} className="text-accent" />
            <span className="font-pixel text-[8px] text-accent flex-1">
              내 활동 지역 팀 우선 표시 중
            </span>
            <button
              onClick={handleShowAll}
              className="px-2 py-1 font-pixel text-[8px] bg-card border-2 border-border-dark hover:bg-muted transition-colors"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              전체 보기
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="팀 이름 검색..."
            value={filters.teamName}
            onChange={(e) => setFilters({ ...filters, teamName: e.target.value })}
            className={cn(
              "w-full pl-9 pr-8 py-2 font-body text-sm",
              "bg-input border-3 border-border-dark",
              "focus:outline-none focus:border-primary transition-colors",
              filters.teamName && "border-primary bg-primary/5"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          />
          {filters.teamName && (
            <button
              onClick={() => setFilters({ ...filters, teamName: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <X size={12} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <div className="bg-card border-3 border-border-dark p-3 space-y-3" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
          {/* Header with Reset */}
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-[9px] text-foreground flex items-center gap-2">
              🔍 상세 필터
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[8px] border-2 border-accent-dark">
                  적용중
                </span>
              )}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleShowAll}
                className="flex items-center gap-1 px-2 py-1 text-[8px] font-pixel text-muted-foreground hover:text-foreground border-2 border-border-dark bg-secondary hover:bg-muted transition-colors"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <RotateCcw size={10} />
                초기화
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div>
            <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">👥 성별</label>
            <div className="flex flex-wrap gap-1.5">
              {genderOptions.map(({ value, label }) => {
                const isActive = filters.genders.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleArrayFilter('genders', value)}
                    className={cn(
                      "px-3 py-1.5 font-body text-xs border-3 transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary-dark"
                        : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                    )}
                    style={{ 
                      boxShadow: isActive 
                        ? '2px 2px 0 hsl(var(--primary-dark))' 
                        : '2px 2px 0 hsl(var(--pixel-shadow))' 
                    }}
                  >
                    {isActive && <Check size={10} className="inline mr-1" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Region Selection */}
          <div>
            <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">
              📍 지역 <span className="text-[8px]">(최대 3개)</span>
            </label>
            
            {/* Selected Region Tags */}
            {filters.selectedRegions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {filters.selectedRegions.map((r, index) => (
                  <div
                    key={`${r.region}-${r.district}`}
                    className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground border-2 border-primary-dark"
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <span className="font-pixel text-[9px]">{r.district}</span>
                    <button
                      onClick={() => handleRemoveRegion(index)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-primary-dark/30 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Region UI */}
            {filters.selectedRegions.length < MAX_FILTER_REGIONS && (
              <div className="flex gap-2">
                {/* City/Province */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setIsRegionOpen(!isRegionOpen)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 font-body text-sm border-3 transition-all",
                      tempRegion
                        ? "bg-primary/20 border-primary"
                        : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                    )}
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <span>{tempRegion || '시/도'}</span>
                    <ChevronDown size={14} className={cn("transition-transform", isRegionOpen && "rotate-180")} />
                  </button>
                  {isRegionOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsRegionOpen(false)} />
                      <div 
                        className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-card border-3 border-border-dark z-50"
                        style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
                      >
                        {Object.keys(regionData).map(region => (
                          <button
                            key={region}
                            onClick={() => {
                              setTempRegion(region);
                              setTempDistrict('');
                              setIsRegionOpen(false);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left font-body text-sm hover:bg-muted border-b border-border last:border-b-0",
                              tempRegion === region && "bg-primary/10 text-primary"
                            )}
                          >
                            {tempRegion === region && <Check size={10} className="inline mr-1" />}
                            {region}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* District */}
                <div className="relative flex-1">
                  <select
                    value={tempDistrict}
                    onChange={(e) => setTempDistrict(e.target.value)}
                    disabled={!tempRegion}
                    className={cn(
                      "w-full px-3 py-2 font-body text-sm border-3 appearance-none cursor-pointer",
                      tempDistrict
                        ? "bg-primary/20 border-primary"
                        : "bg-secondary text-secondary-foreground border-border-dark",
                      !tempRegion && "opacity-50"
                    )}
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <option value="">구/군</option>
                    {tempDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddRegion}
                  disabled={!tempRegion || !tempDistrict}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center border-3 transition-all",
                    tempRegion && tempDistrict
                      ? "bg-accent text-accent-foreground border-accent-dark hover:brightness-110"
                      : "bg-muted text-muted-foreground border-border-dark opacity-50"
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Level Filter with descriptions */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="font-pixel text-[9px] text-muted-foreground">🏅 레벨 선택</label>
              <LevelInfoButton />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {levelOptions.map(({ value, desc, icon }) => {
                const isActive = filters.levels.includes(value);
                const levelColorClass = {
                  S: 'bg-accent text-accent-foreground border-accent-dark',
                  A: 'bg-primary text-primary-foreground border-primary-dark',
                  B: 'bg-primary/70 text-primary-foreground border-primary-dark/70',
                  C: 'bg-primary/50 text-primary-foreground border-primary-dark/50',
                }[value];
                
                return (
                  <button
                    key={value}
                    onClick={() => toggleArrayFilter('levels', value)}
                    className={cn(
                      "px-2 py-2 border-3 transition-all text-left",
                      isActive
                        ? levelColorClass
                        : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                    )}
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <div className="flex items-center gap-1">
                      {isActive ? <Check size={10} /> : <span>{icon}</span>}
                      <span className="font-pixel text-[10px]">Lv.{value}</span>
                    </div>
                    <p className={cn(
                      "font-pixel text-[7px] mt-0.5 truncate",
                      isActive ? "opacity-90" : "text-muted-foreground"
                    )}>
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Level Legend */}
      <div className="bg-secondary p-3 border-3 border-border-dark mb-6" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-pixel text-[9px] text-foreground">📊 레벨 가이드</p>
          <LevelInfoButton />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {levelOptions.map(({ value, desc, icon }) => {
            const levelColorClass = {
              S: 'level-s',
              A: 'level-a',
              B: 'level-b',
              C: 'level-c',
            }[value];
            return (
              <div key={value} className="flex items-center gap-2">
                <PixelBadge variant={levelColorClass as any}>
                  <span className="mr-1">{icon}</span>
                  Lv.{value}
                </PixelBadge>
                <span className="font-pixel text-[7px] text-muted-foreground truncate">{desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team List */}
      <div className="space-y-4">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team, index) => (
            <TeamCard 
              key={index} 
              {...team} 
              region={`${team.region} ${team.district}`}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="font-pixel text-[10px] text-muted-foreground">
              조건에 맞는 팀이 없습니다
            </p>
            <button
              onClick={handleShowAll}
              className="mt-3 px-4 py-2 font-pixel text-[9px] bg-primary text-primary-foreground border-3 border-primary-dark hover:brightness-110 transition-all"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
