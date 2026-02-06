import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { CalendarDay } from '@/components/schedule/CalendarDay';
import { EventCard } from '@/components/schedule/EventCard';
import { TeamSelector } from '@/components/ui/TeamSelector';

const myTeams = [
  { id: 'fc-bulkkot', name: 'FC 불꽃', emblem: '🔥' },
  { id: 'lions-fc', name: '라이언즈 FC', emblem: '🦁' },
];

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

const mockEvents = [
  {
    title: 'vs FC 번개',
    type: 'match' as const,
    date: '1월 25일 (토)',
    time: '14:00 - 16:00',
    location: '강남 풋살파크 A코트',
    attendees: { attending: 8, absent: 2, pending: 2 },
    myStatus: 'attending' as const,
  },
  {
    title: '주간 팀 훈련',
    type: 'training' as const,
    date: '1월 27일 (월)',
    time: '19:00 - 21:00',
    location: '마포 실내풋살장',
    attendees: { attending: 6, absent: 1, pending: 5 },
    myStatus: 'pending' as const,
  },
];

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(25);
  const currentMonth = '2024년 1월';

  // Generate calendar days (simplified for demo)
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventsMap: Record<number, 'match' | 'training'> = {
    25: 'match',
    27: 'training',
    15: 'match',
    8: 'training',
  };

  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-pixel text-xs text-foreground flex items-center gap-2">
          <span className="text-accent">📅</span>
          팀 일정
        </h2>
        <PixelButton variant="primary" size="sm" className="flex items-center gap-1">
          <Plus size={14} />
          일정 추가
        </PixelButton>
      </div>

      {/* Calendar */}
      <PixelCard className="mb-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <PixelButton variant="ghost" size="sm">
            <ChevronLeft size={16} />
          </PixelButton>
          <span className="font-pixel text-[10px] text-foreground">{currentMonth}</span>
          <PixelButton variant="ghost" size="sm">
            <ChevronRight size={16} />
          </PixelButton>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div 
              key={day} 
              className="text-center font-pixel text-[8px] text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for starting day offset (assuming month starts on Monday) */}
          <div className="aspect-square" />
          {calendarDays.map((day) => (
            <CalendarDay
              key={day}
              day={day}
              isToday={day === 20}
              isSelected={day === selectedDay}
              hasEvent={!!eventsMap[day]}
              eventType={eventsMap[day]}
              onClick={() => setSelectedDay(day)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t-2 border-border">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-accent border border-border-dark" />
            <span className="font-body text-xs text-muted-foreground">경기</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary border border-border-dark" />
            <span className="font-body text-xs text-muted-foreground">훈련</span>
          </div>
        </div>
      </PixelCard>

      {/* Upcoming Events */}
      <div>
        <h3 className="font-pixel text-[10px] text-muted-foreground mb-3">
          다가오는 일정
        </h3>
        <div className="space-y-4">
          {mockEvents.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      </div>
    </div>
  );
}
