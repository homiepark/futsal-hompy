import { useState, useCallback } from 'react';
import { Search, X, Check, ChevronDown, RotateCcw, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  regionData, 
  genderOptions, 
  levelOptions, 
  trainingDays, 
  timeSlotOptions,
} from '@/lib/teamData';

interface PreferredRegion {
  region: string;
  district: string;
}

export interface FilterState {
  teamName: string;
  genders: string[];
  region: string;
  district: string;
  selectedRegions: PreferredRegion[];
  levels: string[];
  days: string[];
  timeSlot: string;
}

interface AdvancedFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const MAX_FILTER_REGIONS = 3;

export function AdvancedFilterBar({ filters, onFiltersChange }: AdvancedFilterBarProps) {
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isTimeSlotOpen, setIsTimeSlotOpen] = useState(false);
  const [tempRegion, setTempRegion] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');

  const hasActiveFilters = filters.teamName || 
    filters.genders.length > 0 || 
    filters.selectedRegions.length > 0 ||
    filters.region || 
    filters.levels.length > 0 || 
    filters.days.length > 0 || 
    filters.timeSlot;

  const handleReset = useCallback(() => {
    onFiltersChange({
      teamName: '',
      genders: [],
      region: '',
      district: '',
      selectedRegions: [],
      levels: [],
      days: [],
      timeSlot: '',
    });
    setTempRegion('');
    setTempDistrict('');
  }, [onFiltersChange]);

  const toggleArrayFilter = (key: 'genders' | 'levels' | 'days', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  // Add region to multi-select
  const handleAddRegion = () => {
    if (!tempRegion || !tempDistrict) return;
    if (filters.selectedRegions.length >= MAX_FILTER_REGIONS) return;
    
    const isDuplicate = filters.selectedRegions.some(
      r => r.region === tempRegion && r.district === tempDistrict
    );
    if (isDuplicate) return;
    
    onFiltersChange({
      ...filters,
      selectedRegions: [...filters.selectedRegions, { region: tempRegion, district: tempDistrict }],
      region: '',
      district: '',
    });
    setTempRegion('');
    setTempDistrict('');
  };

  // Remove region from multi-select
  const handleRemoveRegion = (index: number) => {
    onFiltersChange({
      ...filters,
      selectedRegions: filters.selectedRegions.filter((_, i) => i !== index),
    });
  };

  const activeCount = [
    filters.teamName ? 1 : 0,
    filters.genders.length,
    filters.selectedRegions.length || (filters.region ? 1 : 0),
    filters.levels.length,
    filters.days.length,
    filters.timeSlot ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const tempDistricts = tempRegion ? regionData[tempRegion] || [] : [];

  return (
    <div className="bg-card border-y-4 border-border-dark p-3 space-y-3">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
          🔍 고급 필터
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[8px] border-2 border-accent-dark">
              {activeCount}개 적용중
            </span>
          )}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-pixel text-muted-foreground hover:text-foreground border-2 border-border-dark bg-secondary hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <RotateCcw size={10} />
            초기화
          </button>
        )}
      </div>

      {/* Team Name Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="팀 이름 검색..."
          value={filters.teamName}
          onChange={(e) => onFiltersChange({ ...filters, teamName: e.target.value })}
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
            onClick={() => onFiltersChange({ ...filters, teamName: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <X size={12} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Gender Multi-Select */}
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

      {/* Level Multi-Select */}
      <div>
        <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">⭐ 실력</label>
        <div className="flex flex-wrap gap-1.5">
          {levelOptions.map(({ value }) => {
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
                  "px-3 py-1.5 font-pixel text-[10px] border-3 transition-all",
                  isActive
                    ? levelColorClass
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {isActive && <Check size={10} className="inline mr-1" />}
                Lv.{value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule - Days Multi-Select */}
      <div>
        <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">📅 훈련 요일</label>
        <div className="flex flex-wrap gap-1">
          {trainingDays.map(({ value, label }) => {
            const isActive = filters.days.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleArrayFilter('days', value)}
                className={cn(
                  "w-8 h-8 font-body text-xs border-2 transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground border-accent-dark"
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-accent"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Dropdown */}
      <div>
        <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">⏰ 훈련 시간대</label>
        <div className="relative">
          <button
            onClick={() => setIsTimeSlotOpen(!isTimeSlotOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 font-body text-sm border-3 transition-all",
              filters.timeSlot
                ? "bg-accent text-accent-foreground border-accent-dark"
                : "bg-secondary text-secondary-foreground border-border-dark hover:border-accent"
            )}
            style={{ 
              boxShadow: filters.timeSlot 
                ? '2px 2px 0 hsl(var(--accent-dark))' 
                : '2px 2px 0 hsl(var(--pixel-shadow))' 
            }}
          >
            <span>{timeSlotOptions.find(t => t.value === filters.timeSlot)?.label || '시간대 선택'}</span>
            <div className="flex items-center gap-1">
              {filters.timeSlot && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onFiltersChange({ ...filters, timeSlot: '' });
                  }}
                  className="p-0.5 hover:bg-accent-dark/20 rounded"
                >
                  <X size={12} />
                </span>
              )}
              <ChevronDown size={14} className={cn("transition-transform", isTimeSlotOpen && "rotate-180")} />
            </div>
          </button>
          {isTimeSlotOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTimeSlotOpen(false)} />
              <div 
                className="absolute top-full left-0 mt-1 w-full bg-card border-3 border-border-dark z-50"
                style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
              >
                {timeSlotOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      onFiltersChange({ ...filters, timeSlot: value });
                      setIsTimeSlotOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left font-body text-sm hover:bg-muted border-b border-border last:border-b-0",
                      filters.timeSlot === value && "bg-accent/10 text-accent"
                    )}
                  >
                    {filters.timeSlot === value && <Check size={10} className="inline mr-1" />}
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const initialFilterState: FilterState = {
  teamName: '',
  genders: [],
  region: '',
  district: '',
  selectedRegions: [],
  levels: [],
  days: [],
  timeSlot: '',
};
