import { Clock, MapPin, Users, Check, X } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBadge } from '@/components/ui/PixelBadge';

interface EventCardProps {
  title: string;
  type: 'match' | 'training';
  date: string;
  time: string;
  location: string;
  attendees: { attending: number; absent: number; pending: number };
  myStatus?: 'attending' | 'absent' | 'pending';
}

export function EventCard({
  title,
  type,
  date,
  time,
  location,
  attendees,
  myStatus = 'pending',
}: EventCardProps) {
  return (
    <PixelCard className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <PixelBadge variant={type === 'match' ? 'accent' : 'primary'}>
            {type === 'match' ? '⚔️ 경기' : '🏃 훈련'}
          </PixelBadge>
          <h3 className="font-pixel text-[10px] text-foreground mt-2">{title}</h3>
        </div>
        <span className="font-body text-xs text-muted-foreground">{date}</span>
      </div>

      <div className="space-y-1 font-body text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span>{location}</span>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="flex items-center gap-4 py-2 border-t-2 border-b-2 border-border">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-primary border border-primary-dark flex items-center justify-center">
            <Check size={10} className="text-primary-foreground" />
          </div>
          <span className="font-pixel text-[8px] text-primary">{attendees.attending}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-destructive border border-destructive flex items-center justify-center">
            <X size={10} className="text-destructive-foreground" />
          </div>
          <span className="font-pixel text-[8px] text-destructive">{attendees.absent}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-muted border border-border-dark" />
          <span className="font-pixel text-[8px] text-muted-foreground">{attendees.pending}</span>
        </div>
      </div>

      {/* Vote Buttons */}
      <div className="flex gap-2">
        <PixelButton 
          variant={myStatus === 'attending' ? 'primary' : 'default'} 
          size="sm" 
          className="flex-1 flex items-center justify-center gap-1"
        >
          <Check size={12} />
          참석
        </PixelButton>
        <PixelButton 
          variant={myStatus === 'absent' ? 'accent' : 'default'} 
          size="sm" 
          className="flex-1 flex items-center justify-center gap-1"
        >
          <X size={12} />
          불참
        </PixelButton>
      </div>
    </PixelCard>
  );
}
