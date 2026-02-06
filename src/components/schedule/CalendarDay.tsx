import { cn } from '@/lib/utils';

interface CalendarDayProps {
  day: number;
  isToday?: boolean;
  hasEvent?: boolean;
  eventType?: 'match' | 'training';
  isSelected?: boolean;
  onClick?: () => void;
}

export function CalendarDay({
  day,
  isToday,
  hasEvent,
  eventType,
  isSelected,
  onClick,
}: CalendarDayProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative aspect-square flex flex-col items-center justify-center',
        'border-2 transition-all font-pixel text-[10px]',
        isSelected 
          ? 'bg-primary text-primary-foreground border-primary-dark shadow-pixel-sm scale-105' 
          : 'bg-card border-border hover:border-primary',
        isToday && !isSelected && 'border-accent'
      )}
    >
      <span>{day}</span>
      {hasEvent && (
        <span 
          className={cn(
            'absolute bottom-1 w-2 h-2',
            eventType === 'match' ? 'bg-accent' : 'bg-primary',
            'border border-border-dark'
          )}
        />
      )}
    </button>
  );
}
