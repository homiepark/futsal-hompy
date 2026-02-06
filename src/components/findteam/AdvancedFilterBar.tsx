import { useState, useCallback } from 'react';
import { Search, X, Check, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Region data with districts
const regionData: Record<string, string[]> = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
  '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
  '대구': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
  '광주': ['광산구', '남구', '동구', '북구', '서구'],
  '울산': ['남구', '동구', '북구', '울주군', '중구'],
  '세종': ['세종시'],
  '강원': ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시', '홍천군'],
  '충북': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군'],
  '충남': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시'],
  '전북': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시'],
  '전남': ['목포시', '여수시', '순천시', '나주시', '광양시'],
  '경북': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시'],
  '경남': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'],
  '제주': ['제주시', '서귀포시'],
};

const genderOptions = ['남성', '여성', '혼성'];
const levelOptions = ['S', 'A', 'B', 'C'];
const dayOptions = ['월', '화', '수', '목', '금', '토', '일'];
const timeSlotOptions = ['오전 (06-12시)', '오후 (12-18시)', '저녁 (18-24시)'];

export interface FilterState {
  teamName: string;
  genders: string[];
  region: string;
  district: string;
  levels: string[];
  days: string[];
  timeSlot: string;
}

interface AdvancedFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function AdvancedFilterBar({ filters, onFiltersChange }: AdvancedFilterBarProps) {
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isTimeSlotOpen, setIsTimeSlotOpen] = useState(false);

  const hasActiveFilters = filters.teamName || 
    filters.genders.length > 0 || 
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
      levels: [],
      days: [],
      timeSlot: '',
    });
  }, [onFiltersChange]);

  const toggleArrayFilter = (key: 'genders' | 'levels' | 'days', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const activeCount = [
    filters.teamName ? 1 : 0,
    filters.genders.length,
    filters.region ? 1 : 0,
    filters.levels.length,
    filters.days.length,
    filters.timeSlot ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

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
          {genderOptions.map(gender => {
            const isActive = filters.genders.includes(gender);
            return (
              <button
                key={gender}
                onClick={() => toggleArrayFilter('genders', gender)}
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
                {gender}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Hierarchical Dropdown */}
      <div>
        <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">📍 지역</label>
        <div className="flex gap-2">
          {/* City/Province */}
          <div className="relative flex-1">
            <button
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 font-body text-sm border-3 transition-all",
                filters.region
                  ? "bg-primary text-primary-foreground border-primary-dark"
                  : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
              )}
              style={{ 
                boxShadow: filters.region 
                  ? '2px 2px 0 hsl(var(--primary-dark))' 
                  : '2px 2px 0 hsl(var(--pixel-shadow))' 
              }}
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
                        "w-full px-3 py-2 text-left font-body text-sm hover:bg-muted border-b border-border last:border-b-0",
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

          {/* District (only show if region selected) */}
          {filters.region && (
            <div className="relative flex-1">
              <select
                value={filters.district}
                onChange={(e) => onFiltersChange({ ...filters, district: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 font-body text-sm border-3 appearance-none cursor-pointer",
                  filters.district
                    ? "bg-primary text-primary-foreground border-primary-dark"
                    : "bg-secondary text-secondary-foreground border-border-dark"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <option value="">구/군</option>
                {regionData[filters.region]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Clear Region */}
          {filters.region && (
            <button
              onClick={() => onFiltersChange({ ...filters, region: '', district: '' })}
              className="p-2 bg-secondary border-2 border-border-dark hover:bg-muted"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Level Multi-Select */}
      <div>
        <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">⭐ 실력</label>
        <div className="flex flex-wrap gap-1.5">
          {levelOptions.map(level => {
            const isActive = filters.levels.includes(level);
            const levelColorClass = {
              S: 'bg-accent text-accent-foreground border-accent-dark',
              A: 'bg-primary text-primary-foreground border-primary-dark',
              B: 'bg-primary/70 text-primary-foreground border-primary-dark/70',
              C: 'bg-primary/50 text-primary-foreground border-primary-dark/50',
            }[level];
            
            return (
              <button
                key={level}
                onClick={() => toggleArrayFilter('levels', level)}
                className={cn(
                  "px-3 py-1.5 font-pixel text-[10px] border-3 transition-all",
                  isActive
                    ? levelColorClass
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-primary"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {isActive && <Check size={10} className="inline mr-1" />}
                Lv.{level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule - Days Multi-Select */}
      <div>
        <label className="font-pixel text-[9px] text-muted-foreground mb-1.5 block">📅 훈련 요일</label>
        <div className="flex flex-wrap gap-1">
          {dayOptions.map(day => {
            const isActive = filters.days.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleArrayFilter('days', day)}
                className={cn(
                  "w-8 h-8 font-body text-xs border-2 transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground border-accent-dark"
                    : "bg-secondary text-secondary-foreground border-border-dark hover:border-accent"
                )}
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                {day}
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
            <span>{filters.timeSlot || '시간대 선택'}</span>
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
                {timeSlotOptions.map(slot => (
                  <button
                    key={slot}
                    onClick={() => {
                      onFiltersChange({ ...filters, timeSlot: slot });
                      setIsTimeSlotOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left font-body text-sm hover:bg-muted border-b border-border last:border-b-0",
                      filters.timeSlot === slot && "bg-accent/10 text-accent"
                    )}
                  >
                    {filters.timeSlot === slot && <Check size={10} className="inline mr-1" />}
                    {slot}
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
  levels: [],
  days: [],
  timeSlot: '',
};
