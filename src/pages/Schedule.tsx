import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import {
  getDaysInMonth,
  startOfMonth,
  getDay,
  format,
  addMonths,
  subMonths,
  isSameDay,
  isToday as checkIsToday,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { CalendarDay } from '@/components/schedule/CalendarDay';
import { EventCard } from '@/components/schedule/EventCard';
import { TeamSelector } from '@/components/ui/TeamSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Team {
  id: string;
  name: string;
  emblem: string;
}

interface MatchPost {
  id: string;
  team_id: string;
  match_date: string;
  match_time_start: string;
  match_time_end: string;
  location_name: string;
  location_address: string | null;
  status: string;
  description: string | null;
}

interface TeamNotice {
  id: string;
  team_id: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

export default function Schedule() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTeam, setSelectedTeam] = useState('all');

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [matchPosts, setMatchPosts] = useState<MatchPost[]>([]);
  const [notices, setNotices] = useState<TeamNotice[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Fetch user's teams
  useEffect(() => {
    if (!user) {
      setTeams([]);
      setTeamsLoading(false);
      return;
    }

    const fetchTeams = async () => {
      setTeamsLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name, emblem)')
        .eq('user_id', user.id);

      if (!error && data) {
        const fetched: Team[] = data
          .map((row: any) => row.teams)
          .filter(Boolean)
          .map((t: any) => ({ id: t.id, name: t.name, emblem: t.emblem }));
        setTeams(fetched);
      }
      setTeamsLoading(false);
    };

    fetchTeams();
  }, [user]);

  // Fetch match_posts and team_notices for the current month and selected team
  const fetchEvents = useCallback(async () => {
    if (!user) return;

    setEventsLoading(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStart = format(new Date(year, month, 1), 'yyyy-MM-dd');
    const monthEnd = format(new Date(year, month, getDaysInMonth(currentDate)), 'yyyy-MM-dd');

    // Determine which team IDs to query
    const teamIds =
      selectedTeam === 'all'
        ? teams.map((t) => t.id)
        : [selectedTeam];

    if (teamIds.length === 0) {
      setMatchPosts([]);
      setNotices([]);
      setEventsLoading(false);
      return;
    }

    // Fetch match posts
    const matchQuery = supabase
      .from('match_posts')
      .select('id, team_id, match_date, match_time_start, match_time_end, location_name, location_address, status, description')
      .in('team_id', teamIds)
      .gte('match_date', monthStart)
      .lte('match_date', monthEnd)
      .order('match_date', { ascending: true });

    // Fetch team notices
    const noticeQuery = supabase
      .from('team_notices')
      .select('id, team_id, content, created_at, is_active')
      .in('team_id', teamIds)
      .eq('is_active', true)
      .gte('created_at', `${monthStart}T00:00:00`)
      .lte('created_at', `${monthEnd}T23:59:59`)
      .order('created_at', { ascending: true });

    const [matchResult, noticeResult] = await Promise.all([matchQuery, noticeQuery]);

    if (!matchResult.error && matchResult.data) {
      setMatchPosts(matchResult.data);
    } else {
      setMatchPosts([]);
    }

    if (!noticeResult.error && noticeResult.data) {
      setNotices(noticeResult.data);
    } else {
      setNotices([]);
    }

    setEventsLoading(false);
  }, [user, currentDate, selectedTeam, teams]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Calendar grid calculations
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = startOfMonth(currentDate);
  const startDayOffset = getDay(firstDayOfMonth); // 0=Sun, 1=Mon, ...

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Build a map of day -> event types for calendar indicators
  const eventsMap: Record<number, 'match' | 'training'> = {};

  for (const mp of matchPosts) {
    const d = parseISO(mp.match_date).getDate();
    eventsMap[d] = 'match';
  }

  // Notices show as 'training' indicator (reusing existing type)
  for (const notice of notices) {
    const d = parseISO(notice.created_at).getDate();
    if (!eventsMap[d]) {
      eventsMap[d] = 'training';
    }
  }

  // Events for the selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayMatches = matchPosts.filter((mp) => mp.match_date === selectedDateStr);
  const selectedDayNotices = notices.filter(
    (n) => format(parseISO(n.created_at), 'yyyy-MM-dd') === selectedDateStr
  );

  // Navigation handlers
  const goToPrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const goToNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  const handleDayClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setSelectedDate(new Date(year, month, day));
  };

  const currentMonthLabel = format(currentDate, 'yyyy년 M월', { locale: ko });

  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Team Selector */}
      <div className="mb-4">
        {teamsLoading ? (
          <div className="flex items-center gap-2 px-4 py-2">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
            <span className="font-body text-sm text-muted-foreground">팀 불러오는 중...</span>
          </div>
        ) : (
          <TeamSelector
            teams={teams}
            selectedTeam={selectedTeam}
            onSelect={setSelectedTeam}
          />
        )}
      </div>

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
          <PixelButton variant="ghost" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft size={16} />
          </PixelButton>
          <span className="font-pixel text-[10px] text-foreground">{currentMonthLabel}</span>
          <PixelButton variant="ghost" size="sm" onClick={goToNextMonth}>
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
          {/* Empty cells for starting day offset */}
          {Array.from({ length: startDayOffset }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {calendarDays.map((day) => {
            const cellDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            return (
              <CalendarDay
                key={day}
                day={day}
                isToday={checkIsToday(cellDate)}
                isSelected={isSameDay(cellDate, selectedDate)}
                hasEvent={!!eventsMap[day]}
                eventType={eventsMap[day]}
                onClick={() => handleDayClick(day)}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t-2 border-border">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-accent border border-border-dark" />
            <span className="font-body text-xs text-muted-foreground">경기</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary border border-border-dark" />
            <span className="font-body text-xs text-muted-foreground">공지</span>
          </div>
        </div>
      </PixelCard>

      {/* Events for Selected Day */}
      <div>
        <h3 className="font-pixel text-[10px] text-muted-foreground mb-3">
          {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })} 일정
        </h3>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
            <span className="font-body text-sm text-muted-foreground ml-2">
              일정 불러오는 중...
            </span>
          </div>
        ) : selectedDayMatches.length === 0 && selectedDayNotices.length === 0 ? (
          <PixelCard>
            <p className="text-center font-body text-sm text-muted-foreground py-4">
              이 날에는 일정이 없습니다.
            </p>
          </PixelCard>
        ) : (
          <div className="space-y-4">
            {selectedDayMatches.map((mp) => (
              <EventCard
                key={mp.id}
                title={mp.description || mp.location_name}
                type="match"
                date={format(parseISO(mp.match_date), 'M월 d일 (EEE)', { locale: ko })}
                time={`${mp.match_time_start} - ${mp.match_time_end}`}
                location={mp.location_address || mp.location_name}
                attendees={{ attending: 0, absent: 0, pending: 0 }}
                myStatus="pending"
              />
            ))}
            {selectedDayNotices.map((notice) => (
              <EventCard
                key={notice.id}
                title={notice.content}
                type="training"
                date={format(parseISO(notice.created_at), 'M월 d일 (EEE)', { locale: ko })}
                time=""
                location=""
                attendees={{ attending: 0, absent: 0, pending: 0 }}
                myStatus="pending"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
