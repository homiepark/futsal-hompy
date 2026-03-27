import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, UserPlus, Palette } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { useDev } from '@/contexts/DevContext';
import { TeamHeader } from '@/components/team/TeamHeader';
import { TeamSwitcher } from '@/components/team/TeamSwitcher';
import { TeamAnnouncement } from '@/components/team/TeamAnnouncement';
import { TeamIntro } from '@/components/team/TeamIntro';
import { LatestArchive } from '@/components/team/LatestArchive';
import { MemberRoster } from '@/components/team/MemberRoster';
import { Guestbook } from '@/components/team/Guestbook';
import { VisitorCounter } from '@/components/team/VisitorCounter';

import { HompySkinSelector } from '@/components/team/HompySkinSelector';
import { TeamLevelBadge } from '@/components/team/TeamLevelBadge';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBackButton } from '@/components/ui/PixelBackButton';
import { JoinRequestButton } from '@/components/team/JoinRequestButton';
import { AdminTransferModal } from '@/components/team/AdminTransferModal';
import { PlayerInviteModal } from '@/components/team/PlayerInviteModal';
import { DirectMessageModal } from '@/components/messages/DirectMessageModal';
import { BroadcastModal } from '@/components/messages/BroadcastModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

interface MemberData {
  id: string;
  userId?: string;
  nickname: string;
  avatarUrl?: string;
  position: 'pivo' | 'ala' | 'fixo' | 'goleiro';
  yearsOfExperience?: number;
  isAdmin?: boolean;
}

interface ArchiveItem {
  id: string;
  imageUrl: string;
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
  const { isDevAdmin } = useDev();
  const [showAdminTransfer, setShowAdminTransfer] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [currentSkin, setCurrentSkin] = useState('default');
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [notices, setNotices] = useState<Array<{ id: string; content: string; created_at: string }>>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const isAdmin = isDevAdmin || (currentUserId != null && teamData?.admin_user_id === currentUserId)
    || members.some(m => m.userId === currentUserId && m.isAdmin);
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
        const [teamRes, membersRes, archiveRes, noticesRes] = await Promise.all([
          supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single(),

          supabase
            .from('team_members')
            .select('id, user_id, role')
            .eq('team_id', teamId),

          supabase
            .from('archive_posts')
            .select('id, image_url, video_url, created_at')
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
        ]);

        if (cancelled) return;

        // Handle team data
        if (teamRes.error) {
          setError('팀 정보를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }

        const team = teamRes.data as TeamData;
        setTeamData(team);

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
            .select('user_id, nickname, avatar_url, preferred_positions, years_of_experience')
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
              yearsOfExperience: profile?.years_of_experience ?? 0,
              isAdmin: m.role === 'admin' || m.user_id === team.admin_user_id,
            };
          });
          setMembers(mapped);
        }

        // Handle archive
        if (!archiveRes.error && archiveRes.data) {
          const mapped: ArchiveItem[] = archiveRes.data.map((a: any) => ({
            id: a.id,
            imageUrl: a.image_url ?? '',
            isVideo: !!a.video_url,
            date: new Date(a.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).replace(/\. /g, '.').replace(/\.$/, ''),
          }));
          setArchiveItems(mapped);
        }

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

  // Create a new notice
  const handleCreateNotice = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const { error } = await supabase
        .from('team_notices')
        .insert({
          team_id: teamId,
          content,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('공지사항이 등록되었습니다! 📢');
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

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Sticky Header with Team Switcher */}
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
                onClick={() => setShowAdminTransfer(true)}
                className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
                title="관리자 설정"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <Settings size={14} className="text-foreground" />
              </button>
            )}
            <TeamSwitcher />
          </div>
        </div>
      </div>

      {/* Team Header with Banner */}
      <TeamHeader
        name={teamData.name}
        emblem={teamData.emblem}
        photoUrl={teamData.photo_url ?? ''}
        bannerUrl={teamData.banner_url ?? ''}
        level={teamData.level ?? '1'}
        favorites={0}
        region={regionDisplay}
        instagramUrl={teamData.instagram_url ?? ''}
        youtubeUrl={teamData.youtube_url ?? ''}
        teamId={teamId}
        isAdmin={isAdmin}
        onPhotoUpdate={(url) => setTeamData(prev => prev ? { ...prev, photo_url: url } : prev)}
        onBannerUpdate={handleBannerUpdate}
        onNameUpdate={(newName) => setTeamData(prev => prev ? { ...prev, name: newName } : prev)}
        onNameClick={() => { if (isAdmin) { setShowNameEdit(true); setNewTeamName(teamData.name); } }}
      />

      {/* Inline Team Name Edit */}
      {isAdmin && showNameEdit && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
          <input
            className="flex-1 px-2 py-1 font-pixel text-[10px] border-2 border-border-dark bg-background"
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setShowNameEdit(false); }}
            autoFocus
            placeholder="새 팀 이름"
          />
          <button onClick={handleNameSave} className="font-pixel text-[9px] px-2 py-1 bg-primary text-primary-foreground border-2 border-border-dark">저장</button>
          <button onClick={() => setShowNameEdit(false)} className="font-pixel text-[9px] px-2 py-1 bg-secondary text-foreground border-2 border-border-dark">취소</button>
        </div>
      )}

      {/* 공지 관리 */}
      <div className="px-4 pt-3">
        <div className="bg-muted/40 border border-border rounded p-2">
          <TeamAnnouncement
            teamId={teamId || ''}
            notices={notices}
            isAdmin={isAdmin}
            onCreateNotice={handleCreateNotice}
            onRefresh={fetchNotices}
          />
        </div>
      </div>

      {/* === Marquee Notice Bar (전광판 스타일) === */}
      {notices.length > 0 && (
        <div className="bg-foreground/90 overflow-hidden border-y-2 border-border-dark">
          <div className="py-2 flex items-center">
            <span className="shrink-0 px-2 font-pixel text-[8px] text-accent bg-accent/20 border-r border-border-dark">📢</span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                {notices.map((n, i) => (
                  <span key={n.id} className="font-pixel text-[9px] text-background mx-6">
                    {n.content}
                    {i < notices.length - 1 && <span className="mx-4 text-accent">◆</span>}
                  </span>
                ))}
                {notices.map((n) => (
                  <span key={`dup-${n.id}`} className="font-pixel text-[9px] text-background mx-6">
                    {n.content}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-5">
        {/* Visitor Counter */}
        <VisitorCounter todayCount={12} totalCount={3847} />

        {/* Team Level & Stats */}
        <TeamLevelBadge
          level={teamData.level ?? '1'}
          matchCount={23}
          mannerScore={4.5}
          avgExperience={
            members.length > 0
              ? Math.round(
                  (members.reduce((sum, m) => sum + (m.yearsOfExperience ?? 0), 0) / members.length) * 10
                ) / 10
              : 0
          }
        />

        {/* 팀 소개 */}
        <TeamIntro
          introduction={teamData.introduction ?? ''}
          isAdmin={isAdmin}
          onSave={handleIntroUpdate}
        />

        {/* Team Actions Section */}
        <div className="space-y-2">
          {/* Admin: Team Broadcast Button */}
          {isAdmin && (
            <PixelButton
              variant="default"
              size="sm"
              onClick={() => setShowBroadcast(true)}
              className="w-full flex items-center justify-center"
            >
              📢 팀원 전체 메시지
            </PixelButton>
          )}

          {/* Admin: Invite Player Button */}
          {isAdmin && (
            <PixelButton
              variant="accent"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <UserPlus size={14} />
              선수 초대하기
            </PixelButton>
          )}

          {/* Join Request or Member Status or Admin Management */}
          {isAdmin ? (
            <PixelButton
              variant="default"
              size="sm"
              onClick={() => navigate('/messages', { state: { tab: 'join-requests' } })}
              className="w-full flex items-center justify-center"
            >
              📋 입단 신청 관리
            </PixelButton>
          ) : !isMember ? (
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

          {/* Message Button - Only for Non-Admin */}
          {!isAdmin && (
            <button
              onClick={() => setShowDirectMessage(true)}
              className="w-full py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              ✉️ 팀 관리자에게 쪽지보내기
            </button>
          )}
        </div>

        {/* 📸 추억저장소 (formerly 아카이브) */}
        <LatestArchive
          teamId={teamData.id}
          items={archiveItems}
        />

        {/* Member Roster */}
        <MemberRoster
          members={members}
          teamId={teamData.id}
        />

        {/* Guestbook */}
        <Guestbook teamId={teamId} />
      </div>

      {/* Admin Transfer Modal */}
      <AdminTransferModal
        isOpen={showAdminTransfer}
        onClose={() => setShowAdminTransfer(false)}
        members={members}
        currentAdminId={members.find(m => m.userId === teamData.admin_user_id)?.id ?? ''}
        onTransfer={handleAdminTransfer}
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

      {/* Skin Selector Modal */}
      <HompySkinSelector
        isOpen={showSkinSelector}
        onClose={() => setShowSkinSelector(false)}
        currentSkin={currentSkin}
        onSkinChange={(skinId) => {
          setCurrentSkin(skinId);
          toast.success('스킨이 변경되었습니다! ✨');
        }}
      />

      {/* Broadcast Modal (for admins) */}
      <BroadcastModal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        teamId={teamData.id}
        teamName={teamData.name}
        members={members.map(m => ({
          id: m.id,
          nickname: m.nickname,
          avatarUrl: m.avatarUrl,
        }))}
      />
    </div>
  );
}
