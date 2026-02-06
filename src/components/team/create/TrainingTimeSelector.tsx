import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trainingDays, timeOptions } from '@/lib/teamData';

interface TrainingTimeSelectorProps {
  selectedDays: string[];
  startTime: string;
  endTime: string;
  onDaysChange: (days: string[]) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function TrainingTimeSelector({
  selectedDays,
  startTime,
  endTime,
  onDaysChange,
  onStartTimeChange,
  onEndTimeChange,
}: TrainingTimeSelectorProps) {
  const toggleDay = (dayValue: string) => {
    if (selectedDays.includes(dayValue)) {
      onDaysChange(selectedDays.filter(d => d !== dayValue));
    } else {
      onDaysChange([...selectedDays, dayValue]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Day Selection */}
      <div>
        <label className="font-pixel text-[9px] text-foreground block mb-2">📅 훈련 요일 (다중 선택)</label>
        <div className="flex gap-1 flex-wrap">
          {trainingDays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                'w-9 h-9 font-pixel text-[10px] border-3 transition-all',
                selectedDays.includes(day.value)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted border-border-dark hover:bg-muted/70'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range Selection */}
      <div>
        <label className="font-pixel text-[9px] text-foreground block mb-2">⏰ 훈련 시간대</label>
        <div className="flex items-center gap-2">
          <Select value={startTime} onValueChange={onStartTimeChange}>
            <SelectTrigger className={cn(
              'flex-1 bg-input border-3 border-border-dark font-pixel text-[10px] h-10',
              'focus:border-primary focus:ring-0'
            )}>
              <SelectValue placeholder="시작 시간" />
            </SelectTrigger>
            <SelectContent className="bg-card border-3 border-border-dark max-h-48 z-50">
              {timeOptions.map((time) => (
                <SelectItem 
                  key={time.value} 
                  value={time.value}
                  className="font-pixel text-[10px] cursor-pointer hover:bg-muted"
                >
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="font-pixel text-[10px] text-muted-foreground">~</span>

          <Select value={endTime} onValueChange={onEndTimeChange}>
            <SelectTrigger className={cn(
              'flex-1 bg-input border-3 border-border-dark font-pixel text-[10px] h-10',
              'focus:border-primary focus:ring-0'
            )}>
              <SelectValue placeholder="종료 시간" />
            </SelectTrigger>
            <SelectContent className="bg-card border-3 border-border-dark max-h-48 z-50">
              {timeOptions.map((time) => (
                <SelectItem 
                  key={time.value} 
                  value={time.value}
                  className="font-pixel text-[10px] cursor-pointer hover:bg-muted"
                >
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
