import { useState } from 'react';
import { Search, ChevronDown, X, Check, RotateCcw, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { regionData, levelOptions } from '@/lib/teamData';
import { format, addDays } from 'date-fns';

interface MatchBoardFiltersProps {
  filters: {
    region: string;
    district: string;
    date: string;
    levels: string[];
  };
  onFiltersChange: (filters: {
    region: string;
    district: string;
    date: string;
    levels: string[];
  }) => void;
}

export function MatchBoardFilters({ filters, onFiltersChange }: MatchBoardFiltersProps) {
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  const hasActiveFilters = filters.region || filters.date || filters.levels.length > 0;
  const districts = filters.region ? regionData[filters.region] || [] : [];

  const handleReset = () => {
    onFiltersChange({
      region: '',
      district: '',
      date: '',
      levels: [],
    });
  };

  const toggleLevel = (level: string) => {
    const updated = filters.levels.includes(level)
      ? filters.levels.filter(l => l !== level)
      : [...filters.levels, level];
    onFiltersChange({ ...filters, levels: updated });
  };

  // Quick date options
  const dateOptions = [
    { label: '오늘', value: format(new Date(), 'yyyy-MM-dd') },
    { label: '내일', value: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: '이번 주', value: 'week' },
  ];

  return (
    <div className="bg-card border-3 border-border-dark p-3 space-y-3 mb-4" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-[9px] text-foreground flex items-center gap-2">
          🔍 필터
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[8px] border-2 border-accent-dark">
              적용중
            </span>
          )}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-[8px] font-pixel text-muted-foreground hover:text-foreground border-2 border-border-dark bg-secondary hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <RotateCcw size={10} />
            초기화
          </button>
        )}
      </div>

      {/* Region Selection */}
      <div className="flex gap-2">
        {/* City/Province */}
        <div className="relative flex-1">
          <button
            onClick={() => setIsRegionOpen(!isRegionOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 font-pixel text-[10px] border-2 transition-all",
              filters.region
                ? "bg-primary/20 border-primary"
                : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <span>{filters.region || '시/도'}</span>
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
                      onFiltersChange({ ...filters, region, district: '' });
                      setIsRegionOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left font-pixel text-[10px] hover:bg-muted border-b border-border last:border-b-0",
                      filters.region === region && "bg-primary/10 text-primary"
                    )}
                  >
                    {filters.region === region && <Check size={10} className="inline mr-1" />}
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
            value={filters.district}
            onChange={(e) => onFiltersChange({ ...filters, district: e.target.value })}
            disabled={!filters.region}
            className={cn(
              "w-full px-3 py-2 font-pixel text-[10px] border-2 appearance-none cursor-pointer",
              filters.district
                ? "bg-primary/20 border-primary"
                : "bg-secondary text-secondary-foreground border-border-dark",
              !filters.region && "opacity-50"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <option value="">구/군</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Quick Date Filters */}
      <div className="space-y-1.5">
        <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
          <Calendar size={10} />
          날짜
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {dateOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onFiltersChange({ 
                ...filters, 
                date: filters.date === opt.value ? '' : opt.value 
              })}
              className={cn(
                "px-3 py-1.5 font-pixel text-[9px] border-2 transition-all",
                filters.date === opt.value
                  ? "bg-primary text-primary-foreground border-primary-dark"
                  : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              {opt.label}
            </button>
          ))}
          <input
            type="date"
            value={filters.date !== 'week' ? filters.date : ''}
            onChange={(e) => onFiltersChange({ ...filters, date: e.target.value })}
            className={cn(
              "px-2 py-1 font-pixel text-[9px] border-2 bg-secondary border-border-dark",
              filters.date && filters.date !== 'week' && !dateOptions.some(o => o.value === filters.date) && "border-primary"
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          />
        </div>
      </div>

      {/* Level Filter */}
      <div className="space-y-1.5">
        <label className="font-pixel text-[9px] text-muted-foreground flex items-center gap-1">
          <Target size={10} />
          희망 팀 레벨
          
        </label>
        <div className="flex gap-1.5">
          {levelOptions.map(({ value, icon }) => {
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
                onClick={() => toggleLevel(value)}
                className={cn(
                  "px-3 py-1.5 border-2 transition-all",
                  isActive
                    ? levelColorClass
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <span className="font-pixel text-[9px]">
                  {isActive && <Check size={10} className="inline mr-0.5" />}
                  {value}급
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
