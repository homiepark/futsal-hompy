import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { regionData, regions } from '@/lib/teamData';

interface RegionSelectorProps {
  region: string;
  district: string;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
}

export function RegionSelector({ region, district, onRegionChange, onDistrictChange }: RegionSelectorProps) {
  const districts = region ? regionData[region] || [] : [];

  const handleRegionChange = (value: string) => {
    onRegionChange(value);
    onDistrictChange(''); // Reset district when region changes
  };

  return (
    <div className="space-y-2">
      <label className="font-pixel text-[9px] text-foreground">📍 활동 지역</label>
      <div className="grid grid-cols-2 gap-2">
        <Select value={region} onValueChange={handleRegionChange}>
          <SelectTrigger className={cn(
            'bg-input border-3 border-border-dark font-pixel text-[10px] h-10',
            'focus:border-primary focus:ring-0'
          )}>
            <SelectValue placeholder="시/도 선택" />
          </SelectTrigger>
          <SelectContent className="bg-card border-3 border-border-dark max-h-60 z-50">
            {regions.map((r) => (
              <SelectItem 
                key={r} 
                value={r}
                className="font-pixel text-[10px] cursor-pointer hover:bg-muted"
              >
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={district} onValueChange={onDistrictChange} disabled={!region}>
          <SelectTrigger className={cn(
            'bg-input border-3 border-border-dark font-pixel text-[10px] h-10',
            'focus:border-primary focus:ring-0',
            !region && 'opacity-50'
          )}>
            <SelectValue placeholder="구/군 선택" />
          </SelectTrigger>
          <SelectContent className="bg-card border-3 border-border-dark max-h-60 z-50">
            {districts.map((d) => (
              <SelectItem 
                key={d} 
                value={d}
                className="font-pixel text-[10px] cursor-pointer hover:bg-muted"
              >
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
