import { useState, useEffect } from 'react';
import { MapPin, X, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { regionData, regions } from '@/lib/teamData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PreferredRegion {
  region: string;
  district: string;
}

const GUEST_REGIONS_KEY = 'guest_preferred_regions';
const MAX_REGIONS = 3;

export function getGuestRegions(): PreferredRegion[] {
  try {
    const stored = localStorage.getItem(GUEST_REGIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_REGIONS);
      }
    }
  } catch (e) {
    console.error('Error parsing guest regions:', e);
  }
  return [];
}

export function setGuestRegions(regions: PreferredRegion[]) {
  localStorage.setItem(GUEST_REGIONS_KEY, JSON.stringify(regions.slice(0, MAX_REGIONS)));
}

interface GuestRegionSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegionsChange: (regions: PreferredRegion[]) => void;
  currentRegions: PreferredRegion[];
}

export function GuestRegionSelector({ 
  open, 
  onOpenChange, 
  onRegionsChange,
  currentRegions 
}: GuestRegionSelectorProps) {
  const [selectedRegions, setSelectedRegions] = useState<PreferredRegion[]>(currentRegions);
  const [tempRegion, setTempRegion] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');

  useEffect(() => {
    setSelectedRegions(currentRegions);
  }, [currentRegions, open]);

  const districts = tempRegion ? regionData[tempRegion] || [] : [];

  const handleAddRegion = () => {
    if (tempRegion && tempDistrict && selectedRegions.length < MAX_REGIONS) {
      const exists = selectedRegions.some(
        r => r.region === tempRegion && r.district === tempDistrict
      );
      if (!exists) {
        setSelectedRegions(prev => [...prev, { region: tempRegion, district: tempDistrict }]);
      }
      setTempRegion('');
      setTempDistrict('');
    }
  };

  const handleRemoveRegion = (index: number) => {
    setSelectedRegions(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    setGuestRegions(selectedRegions);
    onRegionsChange(selectedRegions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-4 border-primary max-w-sm mx-auto p-0 overflow-hidden"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Pixel Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 border-b-4 border-primary-dark px-4 py-3">
          <DialogHeader>
            <DialogTitle className="font-pixel text-[12px] text-primary-foreground flex items-center gap-2">
              <MapPin size={16} />
              동네 설정하기
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-4 space-y-4">
          {/* Info Text */}
          <div className="bg-muted border-3 border-border-dark p-3" 
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <p className="font-pixel text-[9px] text-foreground leading-relaxed">
              📍 관심 있는 동네를 선택하면
              <br />
              그 지역 팀들의 소식을 볼 수 있어요!
            </p>
            <p className="font-pixel text-[8px] text-muted-foreground mt-2">
              (최대 {MAX_REGIONS}개 선택 가능)
            </p>
          </div>

          {/* Selected Regions */}
          {selectedRegions.length > 0 && (
            <div className="space-y-2">
              <p className="font-pixel text-[9px] text-foreground">선택한 동네:</p>
              <div className="flex flex-wrap gap-2">
                {selectedRegions.map((r, i) => (
                  <div 
                    key={`${r.region}-${r.district}`}
                    className="flex items-center gap-1 px-2 py-1 bg-accent/20 border-2 border-accent text-accent font-pixel text-[8px]"
                  >
                    <span>📍 {r.district}</span>
                    <button 
                      onClick={() => handleRemoveRegion(i)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Region */}
          {selectedRegions.length < MAX_REGIONS && (
            <div className="space-y-2">
              <p className="font-pixel text-[9px] text-foreground">동네 추가:</p>
              <div className="grid grid-cols-2 gap-2">
                <Select value={tempRegion} onValueChange={(v) => { setTempRegion(v); setTempDistrict(''); }}>
                  <SelectTrigger className={cn(
                    'bg-input border-3 border-border-dark font-pixel text-[9px] h-9',
                    'focus:border-primary focus:ring-0'
                  )}>
                    <SelectValue placeholder="시/도" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-3 border-border-dark max-h-48 z-50">
                    {regions.map((r) => (
                      <SelectItem 
                        key={r} 
                        value={r}
                        className="font-pixel text-[9px] cursor-pointer hover:bg-muted"
                      >
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={tempDistrict} onValueChange={setTempDistrict} disabled={!tempRegion}>
                  <SelectTrigger className={cn(
                    'bg-input border-3 border-border-dark font-pixel text-[9px] h-9',
                    'focus:border-primary focus:ring-0',
                    !tempRegion && 'opacity-50'
                  )}>
                    <SelectValue placeholder="구/군" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-3 border-border-dark max-h-48 z-50">
                    {districts.map((d) => (
                      <SelectItem 
                        key={d} 
                        value={d}
                        className="font-pixel text-[9px] cursor-pointer hover:bg-muted"
                      >
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={handleAddRegion}
                disabled={!tempRegion || !tempDistrict}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2',
                  'bg-secondary border-3 border-border-dark font-pixel text-[9px]',
                  'transition-all',
                  tempRegion && tempDistrict 
                    ? 'hover:bg-muted cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                )}
                style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
              >
                <Plus size={12} />
                추가하기
              </button>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3',
              'bg-primary text-primary-foreground border-4 border-primary-dark',
              'font-pixel text-[10px] uppercase tracking-wider',
              'hover:brightness-110 transition-all',
              'active:translate-x-0.5 active:translate-y-0.5'
            )}
            style={{
              boxShadow: `
                4px 4px 0 hsl(var(--primary-dark)),
                inset -2px -2px 0 hsl(var(--primary-dark) / 0.4),
                inset 2px 2px 0 hsl(0 0% 100% / 0.25)
              `,
            }}
          >
            <Check size={14} />
            완료
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Prompt component for when no regions are selected
interface GuestRegionPromptProps {
  onSelectClick: () => void;
}

export function GuestRegionPrompt({ onSelectClick }: GuestRegionPromptProps) {
  return (
    <div className="px-4 py-3">
      <div 
        className="bg-card border-4 border-accent overflow-hidden"
        style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 border-b-3 border-accent-dark px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-base">📰</span>
            <h2 className="font-pixel text-[10px] text-accent-foreground">우리동네 풋살팀 소식</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-5xl mb-4 animate-bounce">📍</div>
          <p className="font-pixel text-[11px] text-foreground mb-2">
            동네를 설정하고 주변 팀 소식을 받아보세요!
          </p>
          <p className="font-pixel text-[8px] text-muted-foreground mb-4">
            관심 지역의 팀 활동, 매치 결과, 모집 공고를 한눈에
          </p>
          
          <button
            onClick={onSelectClick}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3',
              'bg-primary text-primary-foreground border-4 border-primary-dark',
              'font-pixel text-[10px] uppercase tracking-wider',
              'hover:brightness-110 transition-all',
              'active:translate-x-0.5 active:translate-y-0.5'
            )}
            style={{
              boxShadow: `
                4px 4px 0 hsl(var(--primary-dark)),
                inset -2px -2px 0 hsl(var(--primary-dark) / 0.4),
                inset 2px 2px 0 hsl(0 0% 100% / 0.25)
              `,
            }}
          >
            <MapPin size={14} />
            동네 설정하기
          </button>
        </div>
      </div>
    </div>
  );
}
