import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, UserPlus, Palette, MapPin, Share2 } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { shareToKakao } from '@/lib/kakaoShare';
import { calculateCurrentExperience } from '@/lib/experience';
import { TeamHeader } from '@/components/team/TeamHeader';
import { TeamSwitcher } from '@/components/team/TeamSwitcher';
import { TeamAnnouncement } from '@/components/team/TeamAnnouncement';
import { TeamIntro } from '@/components/team/TeamIntro';
import { LatestArchive } from '@/components/team/LatestArchive';
import { MemberRoster } from '@/components/team/MemberRoster';
import { Guestbook } from '@/components/team/Guestbook';

import { HompySkinSelector, skins } from '@/components/team/HompySkinSelector';
import { SkinAnimation } from '@/components/team/SkinAnimation';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { JoinRequestButton } from '@/components/team/JoinRequestButton';
import { AdminTransferModal } from '@/components/team/AdminTransferModal';
import { AdminManageModal } from '@/components/team/AdminManageModal';
import { JoinRequestNotification } from '@/components/team/JoinRequestNotification';
import { PlayerInviteModal } from '@/components/team/PlayerInviteModal';
import { DirectMessageModal } from '@/components/messages/DirectMessageModal';
import { BroadcastModal } from '@/components/messages/BroadcastModal';
import { TeamSettingsModal } from '@/components/team/TeamSettingsModal';
import { TeamAchievements } from '@/components/team/TeamAchievements';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { levelOptions } from '@/lib/teamData';

interface TeamData {
  id: string;
  name: string;
  emblem: string;
  photo_url: string | null;
  banner_url: string | null;
  level: string | null;
  region: string | null;
  district: string | null;
  introduction: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  admin_user_id: string | null;
  home_ground_name: string | null;
  home_ground_address: string | null;
  gender: string | null;
  training_days: string[] | null;
  training_start_time: string | null;
  training_end_time: string | null;
}

interface MemberData {
  id: string;
  userId?: string;
  nickname: string;
  avatarUrl?: string;
  position: 'pivo' | 'ala' | 'fixo' | 'goleiro';
  yearsOfExperience?: number;
  monthsOfExperience?: number;
  isAdmin?: boolean;
  role?: string;
  joinDate?: string;
  staffCareerYears?: number | null;
  staffCareerNote?: string | null;
}

interface ArchiveItem {
  id: string;
  imageUrl: string;
  content?: string;
  isVideo?: boolean;
  date: string;
}

const VALID_POSITIONS = ['pivo', 'ala', 'fixo', 'goleiro'] as const;
type Position = typeof VALID_POSITIONS[number];

function toPosition(value: string | undefined | null): Position {
  if (value && VALID_POSITIONS.includes(value as Position)) {
    return value as Position;
  }
  return 'ala'; // default fallback
}

export default function TeamHome() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { setActiveTeam, clearActiveTeam } = useTeam();
  const [showAdminTransfer, setShowAdminTransfer] = useState(false);
  const [showAdminManage, setShowAdminManage] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [currentSkin, setCurrentSkin] = useState('default');
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [archiveTotalCount, setArchiveTotalCount] = useState(0);
  const [notices, setNotices] = useState<Array<{ id: string; content: string; created_at: string }>>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(() => {
    try {
      const saved = localStorage.getItem('team-favorites');
      return saved ? new Set(JSON.parse(saved)).has(teamId) : false;
    } catch { return false; }
  });
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [newSchedulePopup, setNewSchedulePopup] = useState<{
    title: string; date: string; timeStart?: string; timeEnd?: string; location?: string; eventType: string;
  } | null>(null);
  const [showNoticeEdit, setShowNoticeEdit] = useState(false);
  const [noticeText, setNoticeText] = useState('');

  // Derived state
  const isOwner = currentUserId != null && teamData?.admin_user_id === currentUserId;
  const isAdmin = isOwner
    || members.some(m => m.userId === currentUserId && (m.role === 'admin' || m.role === 'owner'));
  const isMember = currentUserId != null && members.some(m => m.userId === currentUserId);
  const adminUserId = teamData?.admin_user_id ?? '';

  // Fetch notices for the team
  const fetchNotices = useCallback(async () => {
    if (!teamId) return;

    const { data, error } = await supabase
      .from('team_notices')
      .select('id, content, created_at')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotices(data);
    }
  }, [teamId]);

  // Fetch all team data
  useEffect(() => {
    if (!teamId) return;

    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled) {
          setCurrentUserId(user?.id ?? null);
        }

        // Fetch team, members, archive, notices in parallel
        const [teamRes, membersRes, archiveRes, noticesRes, archiveCountRes] = await Promise.all([
          supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single(),

          supabase
            .from('team_members')
            .select('id, user_id, role, joined_at, staff_career_years, staff_career_note')
            .eq('team_id', teamId),

          supabase
            .from('archive_posts')
            .select('id, image_url, video_url, content, created_at')
            .eq('team_id', teamId)
            .order('created_at', { ascending: false })
            .limit(4),

          supabase
            .from('team_notices')
            .select('id, content, created_at')
            .eq('team_id', teamId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(20),

          supabase
            .from('archive_posts')
            .select('id', { count: 'exact', head: true })
            .eq('team_id', teamId),
        ]);

        if (cancelled) return;

        // Handle team data
        if (teamRes.error) {
          console.error('Team fetch error:', teamRes.error);
          setError('팀 정보를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }

        const team = teamRes.data as TeamData;
        setTeamData(team);
        setCurrentSkin((team as any).skin || 'default');

        // Set active team in context
        setActiveTeam({
          id: team.id,
          name: team.name,
          emblem: team.emblem,
          photoUrl: team.photo_url ?? '',
          bannerUrl: team.banner_url ?? '',
          level: team.level ?? '1',
          favorites: 0,
          region: [team.region, team.district].filter(Boolean).join(' '),
          description: team.introduction ?? '',
          introduction: team.introduction ?? '',
          instagramUrl: team.instagram_url ?? '',
          youtubeUrl: team.youtube_url ?? '',
        });

        // Handle members - fetch profiles separately to avoid join issues
        if (!membersRes.error && membersRes.data && membersRes.data.length > 0) {
          const userIds = membersRes.data.map((m: any) => m.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, nickname, avatar_url, preferred_positions, years_of_experience, months_of_experience, experience_set_at')
            .in('user_id', userIds);

          const profileMap = new Map(
            (profilesData || []).map((p: any) => [p.user_id, p])
          );

          const mapped: MemberData[] = membersRes.data.map((m: any) => {
            const profile = profileMap.get(m.user_id);
            const positions: string[] = profile?.preferred_positions ?? [];
            return {
              id: m.id,
              userId: m.user_id,
              nickname: profile?.nickname ?? '팀원',
              avatarUrl: profile?.avatar_url ?? '',
              position: toPosition(positions[0]),
              yearsOfExperience: (() => {
                const exp = calculateCurrentExperience(
                  profile?.years_of_experience ?? 0,
                  (profile as any)?.months_of_experience ?? 0,
                  (profile as any)?.experience_set_at
                );
                return exp.years;
              })(),
              monthsOfExperience: (() => {
                const exp = calculateCurrentExperience(
                  profile?.years_of_experience ?? 0,
                  (profile as any)?.months_of_experience ?? 0,
                  (profile as any)?.experience_set_at
                );
                return exp.months;
              })(),
              isAdmin: m.role === 'admin' || m.role === 'owner' || m.user_id === team.admin_user_id,
              role: m.user_id === team.admin_user_id ? 'owner' : m.role,
              joinDate: m.joined_at ? new Date(m.joined_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : undefined,
              staffCareerYears: m.staff_career_years ?? null,
              staffCareerNote: m.staff_career_note ?? null,
            };
          });
          setMembers(mapped);
        }

        // Handle archive
        if (!archiveRes.error && archiveRes.data) {
          const mapped: ArchiveItem[] = archiveRes.data.map((a: any) => ({
            id: a.id,
            imageUrl: a.image_url ?? '',
            content: a.content ?? '',
            isVideo: !!a.video_url,
            date: new Date(a.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).replace(/\. /g, '.').replace(/\.$/, ''),
          }));
          setArchiveItems(mapped);
        }

        // Handle archive total count
        setArchiveTotalCount(archiveCountRes.count || 0);

        // Handle notices
        if (!noticesRes.error && noticesRes.data) {
          setNotices(noticesRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load team data:', err);
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // 새 일정 팝업 체크
  useEffect(() => {
    if (!teamId || !currentUserId) return;
    const checkNewSchedule = async () => {
      const seenKey = `schedule_seen_${teamId}_${currentUserId}`;
      const lastSeen = localStorage.getItem(seenKey);
      const { data } = await supabase
        .from('team_schedules')
        .select('id, title, date, time_start, time_end, location, event_type, created_at')
        .eq('team_id', teamId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        const latest = data[0];
        if (!lastSeen || new Date(latest.created_at) > new Date(lastSeen)) {
          setNewSchedulePopup({
            title: latest.title,
            date: latest.date,
            timeStart: latest.time_start || undefined,
            timeEnd: latest.time_end || undefined,
            location: latest.location || undefined,
            eventType: latest.event_type,
          });
          localStorage.setItem(seenKey, new Date().toISOString());
        }
      }
    };
    checkNewSchedule();
  }, [teamId, currentUserId]);

  const handleBack = () => {
    clearActiveTeam();
    navigate(-1);
  };

  const handleBannerUpdate = async (url: string) => {
    if (!teamId) return;
    const { error } = await supabase
      .from('teams')
      .update({ banner_url: url })
      .eq('id', teamId);

    if (error) {
      toast.error('배너 업데이트에 실패했습니다');
      return;
    }
    setTeamData(prev => prev ? { ...prev, banner_url: url } : prev);
    toast.success('배너가 업데이트되었습니다');
  };

  const handleIntroUpdate = async (text: string) => {
    if (!teamId) return;
    const { error } = await supabase
      .from('teams')
      .update({ introduction: text })
      .eq('id', teamId);

    if (error) {
      toast.error('팀 소개 저장에 실패했습니다');
      return;
    }
    setTeamData(prev => prev ? { ...prev, introduction: text } : prev);
    toast.success('팀 소개가 저장되었습니다');
  };

  const handleAdminTransfer = async (newAdminId: string) => {
    const member = members.find(m => m.id === newAdminId);
    if (!teamId || !member?.userId) return;

    const { error } = await supabase
      .from('teams')
      .update({ admin_user_id: member.userId })
      .eq('id', teamId);

    if (error) {
      toast.error('관리자 이전에 실패했습니다');
      return;
    }
    setTeamData(prev => prev ? { ...prev, admin_user_id: member.userId! } : prev);
    toast.success(`${member.nickname}님에게 관리자 권한이 이전되었습니다`);
  };

  const handleNameSave = async () => {
    if (!teamId || !newTeamName.trim()) return;
    const { error } = await supabase
      .from('teams')
      .update({ name: newTeamName.trim() })
      .eq('id', teamId);

    if (error) {
      toast.error('팀 이름 변경에 실패했습니다');
      return;
    }
    setTeamData(prev => prev ? { ...prev, name: newTeamName.trim() } : prev);
    setShowNameEdit(false);
    toast.success('팀 이름이 변경되었습니다');
  };

  // Replace notice (deactivate old ones, create new)
  const handleCreateNotice = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Deactivate all existing notices for this team
      await supabase
        .from('team_notices')
        .update({ is_active: false })
        .eq('team_id', teamId)
        .eq('is_active', true);

      // Insert new notice
      const { error } = await supabase
        .from('team_notices')
        .insert({
          team_id: teamId,
          content,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('공지가 변경되었습니다! 📢');
      fetchNotices();
    } catch (error) {
      console.error('Notice creation error:', error);
      toast.error('공지 등록에 실패했습니다');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="pb-24 max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-pulse font-pixel text-sm text-muted-foreground">
            로딩 중...
          </div>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !teamData) {
    return (
      <div className="pb-24 max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="font-pixel text-sm text-destructive">{error ?? '팀을 찾을 수 없습니다.'}</p>
          <PixelButton variant="default" size="sm" onClick={() => navigate(-1)}>
            돌아가기
          </PixelButton>
        </div>
      </div>
    );
  }

  const regionDisplay = [teamData.region, teamData.district].filter(Boolean).join(' ');
  const trainingInfo = (() => {
    const days = teamData.training_days;
    const start = teamData.training_start_time;
    const end = teamData.training_end_time;
    if (!days || days.length === 0) return '';
    let info = days.join(',');
    if (start && end) info += ` ${start}-${end}`;
    else if (start) info += ` ${start}~`;
    return info;
  })();
  // 감독/코치 제외한 선수만 평균 경력 계산
  const playerMembers = members.filter(m => m.role !== 'manager' && m.role !== 'coach');
  const avgExp = playerMembers.length > 0
    ? Math.round(
        (playerMembers.reduce((sum, m) => sum + (m.yearsOfExperience ?? 0), 0) / playerMembers.length) * 10
      ) / 10
    : 0;

  // Apply skin CSS variables
  const activeSkin = skins.find(s => s.id === currentSkin);
  const skinStyle = activeSkin && activeSkin.id !== 'default' ? (() => {
    // Parse HSL values from skin colors for CSS variable override
    const parseHSL = (hsl: string) => {
      const match = hsl.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
      return match ? `${match[1]} ${match[2]}% ${match[3]}%` : '';
    };
    return {
      '--primary': parseHSL(activeSkin.headerBg),
      '--primary-dark': parseHSL(activeSkin.borderColor),
      '--accent': parseHSL(activeSkin.accentColor),
      '--accent-dark': parseHSL(activeSkin.accentColor).replace(/(\d+)%\)?\s*$/, (_, p) => `${Math.max(0, parseInt(p) - 15)}%`),
      '--background': parseHSL(activeSkin.bgColor),
      background: activeSkin.bgColor,
    } as React.CSSProperties;
  })() : {};

  return (
    <div className="pb-24 max-w-lg mx-auto relative" style={skinStyle}>
      {/* Skin Animation */}
      <SkinAnimation animation={activeSkin?.animation} />

      {/* 1. Sticky Header with Team Switcher */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-2 border-border-dark">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelBackButton onClick={handleBack} variant="green" />
            <span className="font-pixel text-[10px] text-muted-foreground">MY TEAM</span>
          </div>
        <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowSkinSelector(true)}
                className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
                title="스킨 변경"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <Palette size={14} className="text-foreground" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setShowTeamSettings(true)}
                className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
                title="팀 설정"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <Settings size={14} className="text-foreground" />
              </button>
            )}
            <TeamSwitcher />
          </div>
        </div>
      </div>

      {/* 2. Team Banner + Photo + Name/Level/Region/HomeGround */}
      <TeamHeader
        name={teamData.name}
        emblem={teamData.emblem}
        photoUrl={teamData.photo_url ?? ''}
        bannerUrl={teamData.banner_url ?? ''}
        level={teamData.level ?? '1'}
        favorites={0}
        region={regionDisplay}
        homeGroundName={teamData.home_ground_name ?? ''}
        homeGroundAddress={teamData.home_ground_address ?? ''}
        trainingInfo={trainingInfo}
        instagramUrl={teamData.instagram_url ?? ''}
        youtubeUrl={teamData.youtube_url ?? ''}
        teamId={teamId}
        isAdmin={isAdmin}
        isFavorited={isFavorited}
        onFavoriteToggle={(val) => {
          setIsFavorited(val);
          try {
            const saved = localStorage.getItem('team-favorites');
            const favs = saved ? new Set(JSON.parse(saved)) : new Set();
            if (val) { favs.add(teamId); } else { favs.delete(teamId); }
            localStorage.setItem('team-favorites', JSON.stringify([...favs]));
          } catch {}
          toast.success(val ? '즐겨찾기에 추가했습니다 ⭐' : '즐겨찾기를 해제했습니다');
        }}
        onPhotoUpdate={(url) => setTeamData(prev => prev ? { ...prev, photo_url: url } : prev)}
        onBannerUpdate={handleBannerUpdate}
        onNameUpdate={(newName) => setTeamData(prev => prev ? { ...prev, name: newName } : prev)}
        onNameClick={() => { if (isAdmin) { setShowNameEdit(true); setNewTeamName(teamData.name); } }}
        onLevelClick={() => setShowLevelInfo(true)}
      />

      {/* 3. Marquee Notice Bar (전광판) + 수정 버튼 */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden border-y-2 border-primary/30">
        <div className="py-2 flex items-center">
          <span className="shrink-0 px-2 text-base">📢</span>
          <div className="flex-1 overflow-hidden">
            {notices.length > 0 ? (
              <div className="animate-marquee whitespace-nowrap">
                {notices.map((n, i) => (
                  <span key={n.id} className="font-pixel text-xs text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.8)] mx-6">
                    {n.content}
                    {i < notices.length - 1 && <span className="mx-4 text-[#ff6b9d] drop-shadow-[0_0_6px_rgba(255,107,157,0.8)]">◆</span>}
                  </span>
                ))}
                {notices.map((n) => (
                  <span key={`dup-${n.id}`} className="font-pixel text-xs text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.8)] mx-6">
                    {n.content}
                  </span>
                ))}
              </div>
            ) : (
              <span className="font-pixel text-xs text-[#00ff88]/50 px-4">공지를 등록해보세요</span>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowNoticeEdit(true)}
              className="shrink-0 px-2 font-pixel text-[8px] text-[#00ff88] hover:text-white transition-colors"
            >
              ✏️
            </button>
          )}
        </div>
      </div>

      {/* Join Request Notification */}
      <JoinRequestNotification teamId={teamData.id} isAdmin={isAdmin} />

      <div className="px-4 py-4 space-y-5">
        {/* 4. Quick Stats Row */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { label: '팀 레벨', value: `LV.${teamData.level}`, icon: '🏅', key: 'level' },
            { label: '매치 횟수', value: '0전', icon: '⚔️', key: 'match' },
            { label: '팀원평균경력', value: `${avgExp}년`, icon: '⏰', key: 'exp' },
            { label: '매너', value: '-', icon: '⭐', key: 'manner' },
            { label: '멤버', value: `${members.length}명`, icon: '👥', key: 'member' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => {
                if (stat.key === 'level') setShowLevelInfo(true);
                if (stat.key === 'manner') {
                  toast('매너 점수는 매치 후 상대팀이 평가합니다', { icon: '⭐', description: '매치 결과 입력 시 상대팀에게 별 1~5점을 받아요' });
                }
              }}
              className="bg-card border-2 border-border-dark py-2 text-center hover:bg-muted transition-colors"
              style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}
            >
              <span className="text-sm block">{stat.icon}</span>
              <span className="font-pixel text-[12px] text-foreground block mt-0.5">{stat.value}</span>
              <span className="font-pixel text-[8px] text-muted-foreground">{stat.label}</span>
            </button>
          ))}
        </div>

        {/* 5. Achievements */}
        <TeamAchievements
          matchCount={0}
          memberCount={members.length}
          archiveCount={archiveTotalCount}
        />

        {/* 7. Team Intro */}
        <TeamIntro
          introduction={teamData.introduction ?? ''}
          isAdmin={isAdmin}
          onSave={handleIntroUpdate}
        />

        {/* 8. Latest Archive (팀 스토리) */}
        <LatestArchive
          teamId={teamData.id}
          items={archiveItems}
        />

        {/* 9. Member Roster */}
        <MemberRoster
          members={members}
          teamId={teamData.id}
        />

        {/* 10. Guestbook */}
        <Guestbook teamId={teamId} />

        {/* 11. Admin Actions */}
        {isAdmin && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => setShowBroadcast(true)} className="flex-1 py-2.5 bg-card border-2 border-border-dark font-pixel text-[8px] text-foreground flex items-center justify-center gap-1 hover:bg-muted" style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}>
                📢 메시지
              </button>
              <button onClick={() => setShowInviteModal(true)} className="flex-1 py-2.5 bg-card border-2 border-border-dark font-pixel text-[8px] text-foreground flex items-center justify-center gap-1 hover:bg-muted" style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}>
                👥 초대
              </button>
              <button onClick={() => navigate('/messages', { state: { tab: 'join-requests' } })} className="flex-1 py-2.5 bg-card border-2 border-border-dark font-pixel text-[8px] text-foreground flex items-center justify-center gap-1 hover:bg-muted" style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}>
                📋 입단관리
              </button>
            </div>

            {/* Owner-only actions */}
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdminManage(true)}
                  className="flex-1 py-2.5 bg-card border-2 border-border-dark font-pixel text-[8px] text-foreground flex items-center justify-center gap-1 hover:bg-muted"
                  style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}
                >
                  🛡️ 멤버 역할 관리
                </button>
                <button
                  onClick={() => setShowAdminTransfer(true)}
                  className="flex-1 py-2.5 bg-card border-2 border-border-dark font-pixel text-[8px] text-foreground flex items-center justify-center gap-1 hover:bg-muted"
                  style={{boxShadow:'2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'}}
                >
                  👑 팀장 이전
                </button>
              </div>
            )}
          </div>
        )}

        {/* 12. Non-admin actions */}
        {!isAdmin && (
          <div className="space-y-2">
            {!isMember ? (
              <JoinRequestButton
                teamId={teamData.id}
                teamName={teamData.name}
                teamEmblem={teamData.emblem}
                className="w-full"
              />
            ) : (
              <div className="w-full text-center py-2.5 bg-muted border-2 border-border-dark font-pixel text-[9px] text-muted-foreground"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                ✅ 팀원입니다
              </div>
            )}
            <button
              onClick={() => setShowDirectMessage(true)}
              className="w-full py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              ✉️ 팀 관리자에게 쪽지보내기
            </button>
          </div>
        )}
      </div>

      {/* Admin Transfer Modal */}
      <AdminTransferModal
        isOpen={showAdminTransfer}
        onClose={() => setShowAdminTransfer(false)}
        members={members}
        currentAdminId={members.find(m => m.userId === teamData.admin_user_id)?.id ?? ''}
        onTransfer={handleAdminTransfer}
      />

      {/* Admin Manage Modal */}
      <AdminManageModal
        isOpen={showAdminManage}
        onClose={() => setShowAdminManage(false)}
        members={members}
        teamId={teamData.id}
        ownerId={teamData.admin_user_id || ''}
        onRoleChange={(memberId, newRole) => {
          setMembers(prev => prev.map(m =>
            m.id === memberId
              ? { ...m, role: newRole, isAdmin: newRole === 'admin' || newRole === 'owner' }
              : m
          ));
        }}
      />

      {/* Player Invite Modal */}
      <PlayerInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        teamId={teamData.id}
        teamName={teamData.name}
      />

      {/* Direct Message Modal (for non-admins) */}
      <DirectMessageModal
        isOpen={showDirectMessage}
        onClose={() => setShowDirectMessage(false)}
        recipientId={adminUserId}
        recipientName="팀 관리자"
        teamId={teamData.id}
        teamName={teamData.name}
        isTeamInquiry={true}
      />

      {/* Notice Edit Modal */}
      {showNoticeEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNoticeEdit(false)} />
          <div className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden"
            style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="bg-gradient-to-r from-[#1a0a2e] to-[#16213e] text-[#00ff88] px-4 py-3 flex items-center justify-between">
              <span className="font-pixel text-[10px]">📢 공지 수정</span>
              <button onClick={() => setShowNoticeEdit(false)} className="hover:opacity-80 font-pixel text-[10px]">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="전광판에 표시할 공지를 입력하세요"
                className="w-full pixel-input h-20 resize-none"
                maxLength={100}
              />
              <p className="font-pixel text-[6px] text-muted-foreground text-right">{noticeText.length}/100</p>
              <button
                onClick={async () => {
                  if (!noticeText.trim()) return;
                  await handleCreateNotice(noticeText.trim());
                  setNoticeText('');
                  setShowNoticeEdit(false);
                }}
                className="w-full py-2.5 bg-[#00ff88] text-[#1a0a2e] font-pixel text-[9px] border-2 border-[#00cc6a] hover:brightness-110 transition-all"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
              >
                공지 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Info Modal */}
      {showLevelInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLevelInfo(false)} />
          <div className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden"
            style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <span className="font-pixel text-[10px]">🏅 팀 레벨 안내</span>
              <button onClick={() => setShowLevelInfo(false)} className="hover:opacity-80 font-pixel text-[10px]">✕</button>
            </div>
            <div className="p-4 space-y-3">
              {levelOptions.map(level => {
                const color = `bg-[hsl(var(--level-${level.value}))]`;
                return (
                  <div key={level.value} className={`flex items-start gap-3 p-2.5 border-2 border-border-dark ${teamData.level === level.value ? 'ring-2 ring-primary' : ''}`}
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                  >
                    <div className={`w-10 h-10 ${color} flex items-center justify-center text-lg shrink-0 border-2 border-black/20`}>
                      {level.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 ${color} text-white font-pixel text-[8px]`}>{level.label}</span>
                        <span className="font-pixel text-[9px] text-foreground">{level.name}</span>
                        {teamData.level === level.value && <span className="font-pixel text-[7px] text-primary">← 우리 팀</span>}
                      </div>
                      <p className="font-pixel text-[7px] text-muted-foreground mt-0.5">{level.desc}</p>
                      <p className="font-pixel text-[6px] text-muted-foreground/70 mt-0.5">{level.characteristic}</p>
                      <p className="font-pixel text-[6px] text-muted-foreground/70">{level.operatingStyle}</p>
                    </div>
                  </div>
                );
              })}
              {(() => {
                const recommendedLevel = avgExp < 1 ? '1' : avgExp < 3 ? '2' : avgExp < 7 ? '3' : '4';
                const recOpt = levelOptions.find(l => l.value === recommendedLevel);
                return recommendedLevel !== (teamData.level || '1') && recOpt ? (
                  <p className="font-pixel text-[8px] text-amber-500 text-center pt-2 border-t border-border">
                    💡 팀원 경력 기반 추천: {recOpt.label} {recOpt.name}
                  </p>
                ) : null;
              })()}
              <p className="font-pixel text-[7px] text-muted-foreground text-center pt-2 border-t border-border">
                💡 팀 레벨은 팀 설정에서 변경할 수 있어요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Team Name Edit Modal */}
      {showNameEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNameEdit(false)} />
          <div className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden"
            style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <span className="font-pixel text-[10px]">✏️ 팀 이름 수정</span>
              <button onClick={() => setShowNameEdit(false)} className="hover:opacity-80 font-pixel text-[10px]">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full pixel-input"
                maxLength={30}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              />
              <p className="font-pixel text-[8px] text-muted-foreground text-right">{newTeamName.length}/30</p>
              <button
                onClick={handleNameSave}
                disabled={!newTeamName.trim()}
                className="w-full py-2.5 bg-primary text-primary-foreground font-pixel text-[10px] border-3 border-primary-dark hover:brightness-110 disabled:opacity-50"
                style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skin Selector Modal */}
      <HompySkinSelector
        isOpen={showSkinSelector}
        onClose={() => setShowSkinSelector(false)}
        currentSkin={currentSkin}
        onSkinChange={async (skinId) => {
          setCurrentSkin(skinId);
          if (teamId) {
            await supabase.from('teams').update({ skin: skinId } as any).eq('id', teamId);
          }
          toast.success('스킨이 변경되었습니다! ✨');
        }}
      />

      {/* Team Settings Modal */}
      <TeamSettingsModal
        isOpen={showTeamSettings}
        onClose={() => setShowTeamSettings(false)}
        teamId={teamId || ''}
        currentRegion={teamData.region || ''}
        currentDistrict={teamData.district || ''}
        currentLevel={teamData.level || '1'}
        currentHomeGround={teamData.home_ground_name || ''}
        currentHomeGroundAddress={teamData.home_ground_address || ''}
        currentGender={teamData.gender || 'mixed'}
        currentTrainingDays={teamData.training_days || []}
        currentTrainingStartTime={teamData.training_start_time || ''}
        currentTrainingEndTime={teamData.training_end_time || ''}
        currentIntroduction={teamData.introduction || ''}
        currentInstagramUrl={teamData.instagram_url || ''}
        currentYoutubeUrl={teamData.youtube_url || ''}
        currentEmblem={teamData.emblem || '⚽'}
        onUpdate={(data) => {
          setTeamData(prev => prev ? { ...prev, ...data } as TeamData : prev);
        }}
        onDelete={() => {
          navigate('/my-team');
        }}
      />

      {/* Broadcast Modal (for admins) */}
      <BroadcastModal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        teamId={teamData.id}
        teamName={teamData.name}
        members={members.map(m => ({
          id: m.userId || m.id,
          nickname: m.nickname,
          avatarUrl: m.avatarUrl,
        }))}
      />

      {/* 새 일정 팝업 */}
      {newSchedulePopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNewSchedulePopup(null)} />
          <div
            className="relative w-full max-w-xs bg-card border-4 border-accent overflow-hidden animate-in fade-in zoom-in-95"
            style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
          >
            <div className="bg-gradient-to-r from-accent to-accent/80 border-b-3 border-accent-dark px-4 py-3 text-center">
              <span className="font-pixel text-[12px] text-accent-foreground">📅 새 일정이 등록됐어요!</span>
            </div>
            <div className="p-5 text-center space-y-3">
              <div className="text-4xl">{newSchedulePopup.eventType === 'match' ? '⭐' : '🏃'}</div>
              <p className="font-pixel text-[12px] text-foreground">{newSchedulePopup.title}</p>
              <div className="space-y-1">
                <p className="font-pixel text-[10px] text-muted-foreground">
                  📅 {newSchedulePopup.date.replace(/-/g, '.')}
                </p>
                {(newSchedulePopup.timeStart || newSchedulePopup.timeEnd) && (
                  <p className="font-pixel text-[10px] text-muted-foreground">
                    🕐 {newSchedulePopup.timeStart || ''}{newSchedulePopup.timeEnd ? ` ~ ${newSchedulePopup.timeEnd}` : ''}
                  </p>
                )}
                {newSchedulePopup.location && (
                  <p className="font-pixel text-[10px] text-muted-foreground">📍 {newSchedulePopup.location}</p>
                )}
              </div>
            </div>
            <div className="flex border-t-2 border-border-dark">
              <button
                onClick={() => setNewSchedulePopup(null)}
                className="flex-1 py-3 font-pixel text-[10px] text-muted-foreground hover:bg-muted transition-colors border-r-2 border-border-dark"
              >
                닫기
              </button>
              <button
                onClick={() => { setNewSchedulePopup(null); navigate('/schedule'); }}
                className="flex-1 py-3 font-pixel text-[10px] text-primary hover:bg-primary/10 transition-colors"
              >
                일정 확인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
