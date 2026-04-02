import { useState } from 'react';
import { MapPin, Medal, Users, ChevronDown, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LevelInfoButton } from '@/components/ui/LevelGuideModal';
import { regionData, regions } from '@/lib/teamData';

interface PreferredRegion {
  region: string;
  district: string;
}

interface CompactFilterBarProps {
  filters: {
    teamName: string;
    levels: string[];
    genders: string[];
    selectedRegions: PreferredRegion[];
  };
  onFiltersChange: (filters: any) => void;
}

const levelOpts = [
  { value: '1', label: 'LV.1', desc: '풋린이', icon: '🌱' },
  { value: '2', label: 'LV.2', desc: '풋내기', icon: '⚽' },
  { value: '3', label: 'LV.3', desc: '풋살러', icon: '🔥' },
  { value: '4', label: 'LV.4', desc: '풋살왕', icon: '👑' },
];

const genderOptions = [
  { value: 'male', label: '남성', icon: '👨' },
  { value: 'female', label: '여성', icon: '👩' },
  { value: 'mixed', label: '혼성', icon: '👥' },
];

export function CompactFilterBar({ filters, onFiltersChange }: CompactFilterBarProps) {
  const [expandedFilter, setExpandedFilter] = useState<'level' | 'gender' | 'region' | null>(null);
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('');

  const toggleFilter = (filter: 'level' | 'gender' | 'region') => {
    setExpandedFilter(expandedFilter === filter ? null : filter);
  };

  const toggleLevel = (level: string) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter(l => l !== level)
      : [...filters.levels, level];
    onFiltersChange({ ...filters, levels: newLevels });
  };

  const toggleGender = (gender: string) => {
    const newGenders = filters.genders.includes(gender)
      ? filters.genders.filter(g => g !== gender)
      : [...filters.genders, gender];
    onFiltersChange({ ...filters, genders: newGenders });
  };

  const toggleRegion = (region: PreferredRegion) => {
    const exists = filters.selectedRegions.some(
      r => r.region === region.region && r.district === region.district
    );
    const newRegions = exists
      ? filters.selectedRegions.filter(r => !(r.region === region.region && r.district === region.district))
      : [...filters.selectedRegions, region];
    onFiltersChange({ ...filters, selectedRegions: newRegions });
  };

  const clearRegions = () => {
    onFiltersChange({ ...filters, selectedRegions: [] });
  };

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      teamName: '',
      levels: [],
      genders: [],
      selectedRegions: [],
    });
  };

  const hasActiveFilters = filters.teamName || filters.levels.length > 0 || filters.genders.length > 0 || filters.selectedRegions.length > 0;

  return (
    <div className="px-4 py-3">
      <div 
        className="bg-card border-4 border-border-dark"
        style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 border-b-3 border-border-dark px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <h2 className="font-pixel text-[12px] text-foreground">팀 찾기</h2>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 bg-muted font-pixel text-[8px] text-muted-foreground border-2 border-border-dark hover:bg-destructive/20 transition-colors"
            >
              <X size={10} />
              초기화
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b-2 border-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="팀 이름 검색..."
              value={filters.teamName}
              onChange={(e) => onFiltersChange({ ...filters, teamName: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 font-pixel text-[10px] bg-input border-3 border-border-dark focus:border-primary outline-none"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="p-3 flex gap-2">
          {/* Level Filter */}
          <button
            onClick={() => toggleFilter('level')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-pixel text-[10px] border-3 transition-all",
              expandedFilter === 'level' || filters.levels.length > 0
                ? "bg-primary text-primary-foreground border-primary-dark"
                : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <Medal size={14} />
            레벨
            {filters.levels.length > 0 && (
              <span className="px-1.5 py-0.5 bg-accent text-accent-foreground text-[8px]">
                {filters.levels.length}
              </span>
            )}
            <ChevronDown size={12} className={cn(expandedFilter === 'level' && "rotate-180 transition-transform")} />
          </button>

          {/* Gender Filter */}
          <button
            onClick={() => toggleFilter('gender')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-pixel text-[10px] border-3 transition-all",
              expandedFilter === 'gender' || filters.genders.length > 0
                ? "bg-primary text-primary-foreground border-primary-dark"
                : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <Users size={14} />
            성별
            {filters.genders.length > 0 && (
              <span className="px-1.5 py-0.5 bg-accent text-accent-foreground text-[8px]">
                {filters.genders.length}
              </span>
            )}
            <ChevronDown size={12} className={cn(expandedFilter === 'gender' && "rotate-180 transition-transform")} />
          </button>

          {/* Region Filter */}
          <button
            onClick={() => toggleFilter('region')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-pixel text-[10px] border-3 transition-all",
              expandedFilter === 'region' || filters.selectedRegions.length > 0
                ? "bg-primary text-primary-foreground border-primary-dark"
                : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <MapPin size={14} />
            지역
            {filters.selectedRegions.length > 0 && (
              <span className="px-1.5 py-0.5 bg-accent text-accent-foreground text-[8px]">
                {filters.selectedRegions.length}
              </span>
            )}
            <ChevronDown size={12} className={cn(expandedFilter === 'region' && "rotate-180 transition-transform")} />
          </button>
        </div>

        {/* Expanded Filter Content */}
        {expandedFilter === 'level' && (
          <div className="px-3 pb-3 border-t-2 border-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[8px] text-muted-foreground">레벨 선택 (복수 가능)</span>
              <LevelInfoButton />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {levelOpts.map(({ value, label, desc, icon }) => (
                <button
                  key={value}
                  onClick={() => toggleLevel(value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 border-3 transition-all text-left",
                    filters.levels.includes(value)
                      ? "bg-primary text-primary-foreground border-primary-dark"
                      : "bg-muted text-muted-foreground border-border-dark hover:border-primary"
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  <span className="text-base">{icon}</span>
                  <div>
                    <span className="font-pixel text-[10px] font-bold block">{label}</span>
                    <span className="font-pixel text-[8px] opacity-70">{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {expandedFilter === 'gender' && (
          <div className="px-3 pb-3 border-t-2 border-border pt-3">
            <span className="font-pixel text-[8px] text-muted-foreground block mb-2">성별 선택</span>
            <div className="flex gap-2">
              {genderOptions.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => toggleGender(value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-3 transition-all",
                    filters.genders.includes(value)
                      ? "bg-primary text-primary-foreground border-primary-dark"
                      : "bg-muted text-muted-foreground border-border-dark hover:border-primary"
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="font-pixel text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {expandedFilter === 'region' && (
          <div className="px-3 pb-3 border-t-2 border-border pt-3">
            {/* Selected regions */}
            {filters.selectedRegions.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-pixel text-[8px] text-muted-foreground">선택된 지역</span>
                  <button
                    onClick={clearRegions}
                    className="font-pixel text-[8px] text-accent hover:text-accent-dark"
                  >
                    전체 해제
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filters.selectedRegions.map((r) => (
                    <button
                      key={`${r.region}-${r.district}`}
                      onClick={() => toggleRegion(r)}
                      className="px-2 py-1 bg-primary text-primary-foreground font-pixel text-[8px] border-2 border-primary-dark hover:bg-destructive hover:border-destructive transition-colors flex items-center gap-1"
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                    >
                      {r.region} {r.district}
                      <X size={8} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Region selector - 2 step: 시/도 → 구/군 */}
            <div className="space-y-2">
              {/* Step 1: 시/도 선택 */}
              <div className="flex flex-wrap gap-1">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegionKey(selectedRegionKey === region ? '' : region)}
                    className={cn(
                      "px-2 py-1 font-pixel text-[8px] border-2 transition-all",
                      selectedRegionKey === region
                        ? "bg-primary text-primary-foreground border-primary-dark"
                        : filters.selectedRegions.some(r => r.region === region)
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-muted text-muted-foreground border-border-dark hover:border-primary/50"
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* Step 2: 구/군 선택 */}
              {selectedRegionKey && regionData[selectedRegionKey] && (
                <div className="bg-muted/50 border-2 border-border-dark p-2">
                  <span className="font-pixel text-[8px] text-muted-foreground block mb-1.5">
                    {selectedRegionKey} 지역 선택 (복수 가능)
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {regionData[selectedRegionKey].map((district) => {
                      const isSelected = filters.selectedRegions.some(
                        r => r.region === selectedRegionKey && r.district === district
                      );
                      return (
                        <button
                          key={district}
                          onClick={() => toggleRegion({ region: selectedRegionKey, district })}
                          className={cn(
                            "px-2 py-1 font-pixel text-[8px] border transition-all flex items-center gap-0.5",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary-dark"
                              : "bg-card text-foreground border-border hover:border-primary/50"
                          )}
                        >
                          {isSelected && <Check size={8} />}
                          {district}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filters.selectedRegions.length === 0 && !selectedRegionKey && (
                <p className="font-pixel text-[8px] text-muted-foreground text-center py-1">
                  시/도를 선택하면 세부 지역을 고를 수 있어요
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
