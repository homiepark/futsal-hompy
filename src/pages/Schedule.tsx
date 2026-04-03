import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  timeStart?: string;
  timeEnd?: string;
  location?: string;
  eventType: 'match' | 'friendly' | 'training' | 'event';
}

interface PostEvent {
  id: string;
  title: string;
  date: string;
  postId: string;
  author: string;
  imageUrl?: string;
  teamId: string;
}

interface MyTeam {
  id: string;
  name: string;
  emblem: string;
  photoUrl?: string;
}

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [postEvents, setPostEvents] = useState<PostEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  useBodyScrollLock(showAddModal);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEvent | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTimeStart, setNewTimeStart] = useState('');
  const [newTimeEnd, setNewTimeEnd] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newEventType, setNewEventType] = useState<'match' | 'friendly' | 'training' | 'event'>('training');
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [recurringMonth, setRecurringMonth] = useState(new Date());

  // team membership data for admin check
  const [teamRoles, setTeamRoles] = useState<Record<string, string>>({});
  const [teamOwners, setTeamOwners] = useState<Record<string, string>>({});

  // Fetch teams
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchTeams = async () => {
      const { data } = await supabase
        .from('team_members')
        .select('team_id, role, teams(id, name, emblem, photo_url, admin_user_id)')
        .eq('user_id', user.id);
      if (data && data.length > 0) {
        const teams = data.filter((d: any) => d.teams).map((d: any) => ({
          id: d.teams.id, name: d.teams.name, emblem: d.teams.emblem, photoUrl: d.teams.photo_url || undefined
        }));
        const roles: Record<string, string> = {};
        const owners: Record<string, string> = {};
        data.forEach((d: any) => {
          if (d.teams) {
            roles[d.teams.id] = d.role;
            owners[d.teams.id] = d.teams.admin_user_id;
          }
        });
        setTeamRoles(roles);
        setTeamOwners(owners);
        setMyTeams(teams);
        setSelectedTeam(teams[0]?.id || '');
      }
      setLoading(false);
    };
    fetchTeams();
  }, [user]);

  // 선택된 팀에 대한 admin 여부 (팀 전환 시 갱신)
  // owner, admin, manager, coach + teams.admin_user_id 체크
  useEffect(() => {
    if (selectedTeam && user) {
      const role = teamRoles[selectedTeam];
      const isTeamOwner = teamOwners[selectedTeam] === user.id;
      setIsAdmin(
        role === 'admin' || role === 'owner' || role === 'manager' || role === 'coach' || isTeamOwner
      );
    }
  }, [selectedTeam, teamRoles, teamOwners, user]);

  // 일정 페이지 진입 시 seen 갱신 (뱃지 초기화)
  useEffect(() => {
    if (user && selectedTeam) {
      localStorage.setItem(`schedule_seen_${selectedTeam}_${user.id}`, new Date().toISOString());
    }
  }, [user, selectedTeam]);

  // Fetch schedules + post events
  const fetchData = useCallback(async () => {
    if (!selectedTeam) return;
    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    // Fetch team schedules
    const { data: scheduleData } = await supabase
      .from('team_schedules')
      .select('*')
      .eq('team_id', selectedTeam)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date');

    setSchedules((scheduleData || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      timeStart: s.time_start || s.time || undefined,
      timeEnd: s.time_end || undefined,
      location: s.location || undefined,
      eventType: s.event_type || 'match',
    })));

    // Fetch posts with activity_date
    const { data: posts } = await supabase
      .from('archive_posts')
      .select('id, content, activity_date, image_url, author_user_id')
      .eq('team_id', selectedTeam)
      .not('activity_date', 'is', null)
      .gte('activity_date', monthStart)
      .lte('activity_date', monthEnd);

    let profileMap = new Map<string, string>();
    if (posts && posts.length > 0) {
      const authorIds = [...new Set(posts.map(p => p.author_user_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, nickname').in('user_id', authorIds);
      profileMap = new Map((profiles || []).map(p => [p.user_id, p.nickname]));
    }

    setPostEvents((posts || []).map(p => ({
      id: p.id,
      title: p.content?.slice(0, 30) + (p.content?.length > 30 ? '...' : '') || '게시글',
      date: (p as any).activity_date,
      postId: p.id,
      author: profileMap.get(p.author_user_id) || '팀원',
      imageUrl: p.image_url || undefined,
      teamId: selectedTeam,
    })));
  }, [selectedTeam, currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calendar
  const monthStartDate = startOfMonth(currentMonth);
  const monthEndDate = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStartDate, end: monthEndDate });
  const startDayOfWeek = getDay(monthStartDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(s => s.date === dateStr);
  };
  const getPostsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return postEvents.filter(p => p.date === dateStr);
  };

  const selectedSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];
  const selectedPosts = selectedDate ? getPostsForDate(selectedDate) : [];

  const resetForm = () => {
    setNewTitle(''); setNewDate(''); setNewTimeStart(''); setNewTimeEnd(''); setNewLocation(''); setNewEventType('training');
    setIsRecurring(false); setSelectedDates([]); setRecurringMonth(new Date());
    setEditingSchedule(null);
  };

  const handleSaveSchedule = async () => {
    if (!newTitle.trim() || !selectedTeam || !user) return;

    // 반복 등록 모드
    if (isRecurring && selectedDates.length > 0) {
      const rows = selectedDates.map(d => ({
        team_id: selectedTeam,
        created_by: user.id,
        title: newTitle.trim(),
        date: d,
        time_start: newTimeStart || null,
        time_end: newTimeEnd || null,
        location: newLocation || null,
        event_type: newEventType,
      }));
      const { error } = await supabase.from('team_schedules').insert(rows);
      if (error) { console.error('Batch insert error:', error); toast.error('일정 등록에 실패했습니다'); return; }
      toast.success(`${selectedDates.length}개 일정이 등록되었습니다! 📅`);
      setShowAddModal(false);
      resetForm();
      fetchData();
      return;
    }

    if (!newDate) return;

    if (editingSchedule) {
      // 수정
      const { data, error } = await supabase.from('team_schedules')
        .update({
          title: newTitle.trim(),
          date: newDate,
          time_start: newTimeStart || null,
          time_end: newTimeEnd || null,
          location: newLocation || null,
          event_type: newEventType,
        })
        .eq('id', editingSchedule.id)
        .select();

      if (error) { console.error('Update error:', error); toast.error('일정 수정에 실패했습니다'); return; }
      if (!data || data.length === 0) {
        console.error('Update returned 0 rows - RLS blocking?');
        toast.error('일정 수정 권한이 없습니다');
        return;
      }
      toast.success('일정이 수정되었습니다! ✏️');
    } else {
      // 등록
      const { data, error } = await supabase.from('team_schedules').insert({
        team_id: selectedTeam,
        created_by: user.id,
        title: newTitle.trim(),
        date: newDate,
        time_start: newTimeStart || null,
        time_end: newTimeEnd || null,
        location: newLocation || null,
        event_type: newEventType,
      }).select();

      if (error) { console.error('Insert error:', error); toast.error('일정 등록에 실패했습니다'); return; }
      if (!data || data.length === 0) {
        console.error('Insert returned 0 rows - RLS blocking?');
        toast.error('일정 등록 권한이 없습니다');
        return;
      }
      toast.success('일정이 등록되었습니다! 📅');
    }

    setShowAddModal(false);
    resetForm();
    fetchData();
  };

  const handleEditSchedule = (s: ScheduleEvent) => {
    setEditingSchedule(s);
    setNewTitle(s.title);
    setNewDate(s.date);
    setNewTimeStart(s.timeStart || '');
    setNewTimeEnd(s.timeEnd || '');
    setNewLocation(s.location || '');
    setNewEventType(s.eventType);
    setShowAddModal(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('일정을 삭제하시겠습니까?')) return;

    // 삭제 전 건수 확인
    const { count: beforeCount } = await supabase
      .from('team_schedules')
      .select('id', { count: 'exact', head: true })
      .eq('id', id);

    const { error } = await supabase.from('team_schedules').delete().eq('id', id);
    if (error) { console.error('Delete error:', error); toast.error('일정 삭제에 실패했습니다'); return; }

    // 삭제 후 확인 - 여전히 존재하면 RLS가 차단한 것
    const { count: afterCount } = await supabase
      .from('team_schedules')
      .select('id', { count: 'exact', head: true })
      .eq('id', id);

    if (afterCount && afterCount > 0) {
      console.error('Delete blocked by RLS - row still exists');
      toast.error('일정 삭제 권한이 없습니다. 팀 관리자에게 문의하세요.');
      return;
    }

    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.success('일정이 삭제되었습니다');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">📅</div></div>;

  if (!user) {
    return (
      <div className="pb-24 max-w-lg mx-auto px-4 pt-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="font-pixel text-lg text-foreground mb-2">팀 일정</h1>
        <p className="font-body text-muted-foreground mb-6">로그인이 필요합니다</p>
        <button onClick={() => navigate('/auth')} className="px-6 py-3 bg-primary border-4 border-primary-dark text-primary-foreground font-pixel text-[11px] shadow-pixel">로그인하기</button>
      </div>
    );
  }

  if (myTeams.length === 0) {
    return (
      <div className="pb-24 max-w-lg mx-auto px-4 pt-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h1 className="font-pixel text-lg text-foreground mb-2">팀 일정</h1>
        <p className="font-body text-muted-foreground mb-6">팀에 가입하면 일정을 볼 수 있어요</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary border-4 border-primary-dark text-primary-foreground font-pixel text-[11px] shadow-pixel">팀 찾아보기</button>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary border-b-4 border-primary-dark p-4 flex items-center justify-between">
        <h1 className="font-pixel text-sm text-primary-foreground">📅 팀 일정</h1>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); setNewDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''); }}
            className="w-8 h-8 bg-accent border-2 border-accent-dark flex items-center justify-center"
            style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
          >
            <Plus size={16} className="text-accent-foreground" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Team Selector */}
        {myTeams.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {myTeams.map(team => (
              <button key={team.id} onClick={() => setSelectedTeam(team.id)}
                className={cn('flex-shrink-0 flex items-center gap-2 px-3 py-2 border-3 font-pixel text-[11px] transition-all',
                  selectedTeam === team.id ? 'bg-primary border-primary-dark text-primary-foreground' : 'bg-card border-border-dark text-foreground hover:border-primary'
                )} style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <div className="w-5 h-5 overflow-hidden rounded-sm">
                  {team.photoUrl ? <img src={team.photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-sm">{team.emblem}</span>}
                </div>
                {team.name}
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex items-center gap-1">
            <span className="text-sm">⭐</span>
            <span className="font-pixel text-[11px] text-muted-foreground">매치</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">⚔️</span>
            <span className="font-pixel text-[11px] text-muted-foreground">자체전</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">🏃</span>
            <span className="font-pixel text-[11px] text-muted-foreground">훈련</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">🎉</span>
            <span className="font-pixel text-[11px] text-muted-foreground">이벤트</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
            <span className="font-pixel text-[11px] text-muted-foreground">게시글</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card border-3 border-border-dark p-4" style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft size={20} /></button>
            <span className="font-pixel text-sm text-foreground">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</span>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div key={day} className={cn('text-center font-pixel text-[11px] py-1.5',
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'
              )}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
            {days.map(day => {
              const daySchedules = getSchedulesForDate(day);
              const dayPosts = getPostsForDate(day);
              const hasMatch = daySchedules.some(s => s.eventType === 'match');
              const hasFriendly = daySchedules.some(s => s.eventType === 'friendly');
              const hasTraining = daySchedules.some(s => s.eventType === 'training');
              const hasEvent = daySchedules.some(s => s.eventType === 'event');
              const hasPosts = dayPosts.length > 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const dayOfWeek = getDay(day);

              return (
                <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center relative transition-all',
                    isSelected ? 'bg-primary text-primary-foreground border-2 border-primary-dark' : 'hover:bg-muted',
                    isToday(day) && !isSelected && 'border-2 border-accent',
                    dayOfWeek === 0 && !isSelected ? 'text-red-400' : '',
                    dayOfWeek === 6 && !isSelected ? 'text-blue-400' : '',
                  )}
                >
                  <span className="font-pixel text-xs">{format(day, 'd')}</span>
                  <div className="flex items-center gap-0.5 mt-0.5 h-3">
                    {hasMatch && <span className="text-[10px] leading-none drop-shadow-[0_0_3px_rgba(255,200,0,0.8)]">⭐</span>}
                    {hasFriendly && <span className="text-[10px] leading-none">⚔️</span>}
                    {hasTraining && <span className="text-[10px] leading-none">🏃</span>}
                    {hasEvent && <span className="text-[10px] leading-none">🎉</span>}
                    {hasPosts && <span className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-primary-foreground' : 'bg-accent')}></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date */}
        {selectedDate && (
          <div className="space-y-3">
            <h3 className="font-pixel text-[14px] text-foreground">
              📅 {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
            </h3>

            {/* Schedules */}
            {selectedSchedules.length > 0 && (
              <div className="space-y-2">
                <p className="font-pixel text-[12px] text-muted-foreground">팀 일정</p>
                {selectedSchedules.map(s => (
                  <div key={s.id} className="bg-card border-3 border-border-dark p-4 flex items-center gap-3"
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <div className={cn('w-12 h-12 flex items-center justify-center border-2 shrink-0 text-xl rounded-lg',
                      s.eventType === 'match' ? 'bg-yellow-100 border-yellow-400' :
                      s.eventType === 'friendly' ? 'bg-orange-50 border-orange-400' :
                      s.eventType === 'event' ? 'bg-purple-50 border-purple-400' :
                      'bg-lime-50 border-lime-400'
                    )}>
                      {s.eventType === 'match' ? '⭐' : s.eventType === 'friendly' ? '⚔️' : s.eventType === 'event' ? '🎉' : '🏃'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[12px] text-foreground">{s.title}</p>
                      <div className="flex items-center gap-2 mt-1 font-pixel text-[11px] text-muted-foreground flex-wrap">
                        {(s.timeStart || s.timeEnd) && (
                          <span>⏰ {s.timeStart || ''}{s.timeEnd ? ` ~ ${s.timeEnd}` : ''}</span>
                        )}
                        {s.location && <span>📍 {s.location}</span>}
                        <span className={cn('px-1.5 py-0.5 border text-[9px] rounded',
                          s.eventType === 'match' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' :
                          s.eventType === 'friendly' ? 'bg-orange-50 border-orange-400 text-orange-600' :
                          s.eventType === 'event' ? 'bg-purple-50 border-purple-400 text-purple-600' :
                          'bg-lime-50 border-lime-400 text-lime-600'
                        )}>
                          {s.eventType === 'match' ? '매치' : s.eventType === 'friendly' ? '자체전' : s.eventType === 'event' ? '이벤트' : '훈련'}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => handleEditSchedule(s)} className="text-muted-foreground hover:text-primary p-1" title="수정">
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteSchedule(s.id)} className="text-muted-foreground hover:text-destructive p-1" title="삭제">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post Events */}
            {selectedPosts.length > 0 && (
              <div className="space-y-2">
                <p className="font-pixel text-[12px] text-muted-foreground">📸 팀 스토리</p>
                {selectedPosts.map(event => (
                  <button key={event.id}
                    onClick={() => navigate(`/archive?team=${event.teamId}&post=${event.postId}`)}
                    className="w-full bg-card border-3 border-border-dark p-3 text-left hover:border-primary transition-colors flex items-center gap-3"
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    <div className="w-10 h-10 bg-muted border-2 border-border-dark overflow-hidden rounded-sm shrink-0">
                      {event.imageUrl ? <img src={event.imageUrl} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center text-lg">📸</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[12px] text-foreground truncate">{event.title}</p>
                      <span className="font-pixel text-[11px] text-muted-foreground">👤 {event.author}</span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {selectedSchedules.length === 0 && selectedPosts.length === 0 && (
              <div className="bg-card border-3 border-border-dark p-6 text-center" style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}>
                <p className="font-pixel text-[11px] text-muted-foreground">이 날의 기록이 없습니다</p>
                {isAdmin && (
                  <button onClick={() => { setShowAddModal(true); setNewDate(format(selectedDate, 'yyyy-MM-dd')); }}
                    className="mt-2 px-4 py-1.5 bg-accent border-2 border-accent-dark font-pixel text-[11px] text-accent-foreground hover:brightness-110">
                    + 일정 등록
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowAddModal(false); resetForm(); }} />
          <div className="relative w-full sm:max-w-sm bg-card border-4 border-border-dark rounded-t-xl sm:rounded-xl max-h-[90vh] flex flex-col"
            style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0 rounded-t-lg">
              <span className="font-pixel text-[11px]">📅 {editingSchedule ? '일정 수정' : '일정 등록'}</span>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="hover:opacity-80 font-pixel text-[11px]">✕</button>
            </div>
            <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
              {/* Event Type */}
              <div>
                <label className="block font-pixel text-[11px] text-muted-foreground mb-1">유형 *</label>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setNewEventType('match')}
                    className={cn('flex-1 py-2 border-3 rounded-lg font-pixel text-[11px] flex items-center justify-center gap-1 transition-all',
                      newEventType === 'match' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-muted border-border-dark text-foreground hover:border-yellow-400'
                    )} style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                  >⭐ 매치</button>
                  <button type="button" onClick={() => setNewEventType('friendly')}
                    className={cn('flex-1 py-2 border-3 rounded-lg font-pixel text-[11px] flex items-center justify-center gap-1 transition-all',
                      newEventType === 'friendly' ? 'bg-orange-50 border-orange-400 text-orange-600' : 'bg-muted border-border-dark text-foreground hover:border-orange-400'
                    )} style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                  >⚔️ 자체전</button>
                  <button type="button" onClick={() => setNewEventType('training')}
                    className={cn('flex-1 py-2 border-3 rounded-lg font-pixel text-[11px] flex items-center justify-center gap-1 transition-all',
                      newEventType === 'training' ? 'bg-lime-50 border-lime-400 text-lime-600' : 'bg-muted border-border-dark text-foreground hover:border-lime-400'
                    )} style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                  >🏃 훈련</button>
                  <button type="button" onClick={() => setNewEventType('event')}
                    className={cn('flex-1 py-2 border-3 rounded-lg font-pixel text-[11px] flex items-center justify-center gap-1 transition-all',
                      newEventType === 'event' ? 'bg-purple-50 border-purple-400 text-purple-600' : 'bg-muted border-border-dark text-foreground hover:border-purple-400'
                    )} style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                  >🎉 이벤트</button>
                </div>
              </div>
              <div>
                <label className="block font-pixel text-[11px] text-muted-foreground mb-1">제목 *</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 정기 훈련, 친선 경기..." className="w-full pixel-input" maxLength={50} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-pixel text-[11px] text-muted-foreground">날짜 *</label>
                  {!editingSchedule && (
                    <button type="button" onClick={() => { setIsRecurring(!isRecurring); setSelectedDates([]); setRecurringMonth(currentMonth); }}
                      className={cn('px-2 py-0.5 font-pixel text-[9px] border-2 rounded transition-all',
                        isRecurring ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-border-dark text-muted-foreground hover:border-primary'
                      )}
                    >📅 다중 선택</button>
                  )}
                </div>

                {!isRecurring ? (
                  <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                    className="w-full pixel-input text-[10px]" style={{ boxSizing: 'border-box', paddingRight: '8px' }} />
                ) : (
                  /* 다중 날짜 선택 달력 */
                  <div className="border-2 border-border-dark rounded-lg p-3 bg-muted/30">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-2">
                      <button type="button" onClick={() => setRecurringMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded"><ChevronLeft size={16} /></button>
                      <span className="font-pixel text-[11px] text-foreground">{format(recurringMonth, 'yyyy년 M월', { locale: ko })}</span>
                      <button type="button" onClick={() => setRecurringMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded"><ChevronRight size={16} /></button>
                    </div>
                    {/* Week Header */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {['일','월','화','수','목','금','토'].map((d, i) => (
                        <div key={d} className={cn('text-center font-pixel text-[9px] py-0.5',
                          i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'
                        )}>{d}</div>
                      ))}
                    </div>
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: getDay(startOfMonth(recurringMonth)) }).map((_, i) => <div key={`e-${i}`} />)}
                      {eachDayOfInterval({ start: startOfMonth(recurringMonth), end: endOfMonth(recurringMonth) }).map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isSelected = selectedDates.includes(dateStr);
                        const dow = getDay(day);
                        return (
                          <button key={dateStr} type="button" onClick={() =>
                            setSelectedDates(prev => isSelected ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort())
                          }
                            className={cn('aspect-square flex items-center justify-center font-pixel text-[11px] rounded transition-all',
                              isSelected ? 'bg-primary text-primary-foreground border-2 border-primary-dark' : 'hover:bg-muted border border-transparent',
                              !isSelected && dow === 0 && 'text-red-400',
                              !isSelected && dow === 6 && 'text-blue-400',
                            )}
                          >{format(day, 'd')}</button>
                        );
                      })}
                    </div>
                    {selectedDates.length > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-pixel text-[11px] text-primary">📅 {selectedDates.length}일 선택됨</p>
                        <button type="button" onClick={() => setSelectedDates([])}
                          className="font-pixel text-[9px] text-muted-foreground hover:text-destructive">초기화</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block font-pixel text-[11px] text-muted-foreground mb-1">시작 시간</label>
                <input type="time" value={newTimeStart}
                  onChange={(e) => {
                    const start = e.target.value;
                    setNewTimeStart(start);
                    if (start && !newTimeEnd) {
                      const [h, m] = start.split(':').map(Number);
                      const endH = (h + 2) % 24;
                      setNewTimeEnd(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                    }
                  }}
                  className="w-full pixel-input text-[11px]" />
              </div>
              <div>
                <label className="block font-pixel text-[11px] text-muted-foreground mb-1">종료 시간</label>
                <input type="time" value={newTimeEnd} onChange={(e) => setNewTimeEnd(e.target.value)}
                  className={cn('w-full pixel-input text-[11px]', newTimeStart && !newTimeEnd && 'border-primary ring-2 ring-primary/30')} />
              </div>
              <div>
                <label className="block font-pixel text-[11px] text-muted-foreground mb-1">장소</label>
                <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="예: OO 풋살장" className="w-full pixel-input" maxLength={50} />
              </div>
              <button onClick={handleSaveSchedule} disabled={!newTitle.trim() || (!isRecurring && !newDate) || (isRecurring && selectedDates.length === 0)}
                className="w-full py-2.5 bg-primary text-primary-foreground font-pixel text-[11px] border-3 border-primary-dark hover:brightness-110 disabled:opacity-50"
                style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
              >{editingSchedule ? '수정하기' : isRecurring ? '🔄 일괄 등록하기' : '등록하기'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
