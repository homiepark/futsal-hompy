import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerStatsModal } from './PlayerStatsModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Member {
  id: string;
  userId?: string;
  nickname: string;
  realName?: string;
  avatarUrl?: string;
  position: 'pivo' | 'ala' | 'fixo' | 'goleiro';
  positions?: string[];
  yearsOfExperience: number;
  monthsOfExperience?: number;
  isAdmin?: boolean;
  role?: string;
  joinDate?: string;
  mannerRating?: number;
  matchesPlayed?: number;
  goals?: number;
  assists?: number;
  staffCareerYears?: number | null;
  staffCareerNote?: string | null;
}

interface MemberRosterProps {
  members: Member[];
  teamId: string;
}

const positionInfo = {
  pivo: { label: '피보', emoji: '⚡', color: 'bg-accent/20 border-accent' },
  ala: { label: '아라', emoji: '💨', color: 'bg-primary/20 border-primary' },
  fixo: { label: '픽소', emoji: '🛡️', color: 'bg-blue-500/20 border-blue-500' },
  goleiro: { label: '골레이로', emoji: '🧤', color: 'bg-green-500/20 border-green-500' },
};

export function MemberRoster({ members, teamId }: MemberRosterProps) {
  const { user } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 경력 수정 상태
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editCareerYears, setEditCareerYears] = useState<number>(0);
  const [editCareerNote, setEditCareerNote] = useState('');

  // 감독/코치 분리
  const staffMembers = members.filter(m => m.role === 'manager' || m.role === 'coach');
  const playerMembers = members.filter(m => m.role !== 'manager' && m.role !== 'coach');

  // Group players by position
  const groupedMembers = playerMembers.reduce((acc, member) => {
    const memberPositions = member.positions?.length ? member.positions : [member.position];
    memberPositions.forEach(pos => {
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(member);
    });
    return acc;
  }, {} as Record<string, Member[]>);

  const positionOrder: Array<'pivo' | 'ala' | 'fixo' | 'goleiro'> = ['goleiro', 'fixo', 'ala', 'pivo'];

  const handleMemberClick = (member: Member) => {
    setSelectedPlayer(member);
    setShowModal(true);
  };

  const getStaffIcon = (role?: string) => role === 'manager' ? '👔' : '📋';
  const getStaffLabel = (role?: string) => role === 'manager' ? '감독' : '코치';

  const startEditCareer = (staff: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStaffId(staff.id);
    setEditCareerYears(staff.staffCareerYears || 0);
    setEditCareerNote(staff.staffCareerNote || '');
  };

  const handleSaveCareer = async (staff: Member) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          staff_career_years: editCareerYears || null,
          staff_career_note: editCareerNote.trim() || null,
        })
        .eq('id', staff.id);

      if (error) throw error;

      // Optimistic update
      staff.staffCareerYears = editCareerYears || null;
      staff.staffCareerNote = editCareerNote.trim() || null;

      setEditingStaffId(null);
      toast.success('지도 경력이 수정되었습니다!');
    } catch (err) {
      console.error('Career update error:', err);
      toast.error('경력 수정에 실패했습니다');
    }
  };

  const isOwnStaff = (staff: Member) => user && staff.userId === user.id;
  const isTeamAdmin = user && members.some(m => m.userId === user.id && (m.role === 'owner' || m.role === 'admin'));
  const canEditStaff = (staff: Member) => isOwnStaff(staff) || isTeamAdmin;

  return (
    <>
      {/* 감독 & 코치 섹션 (있을 때만 표시) */}
      {staffMembers.length > 0 && (
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">👔</span>
            <span>감독 & 코치</span>
          </div>

          <div className="p-3 space-y-2">
            {staffMembers.map((staff) => (
              <div key={staff.id}>
                <button
                  onClick={() => handleMemberClick(staff)}
                  className="w-full flex items-center gap-3 p-2.5 bg-muted border-2 border-border-dark rounded-lg hover:border-primary transition-colors text-left"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-secondary border-2 border-border-dark rounded-md overflow-hidden flex-shrink-0 relative">
                    {staff.avatarUrl ? (
                      <img src={staff.avatarUrl} alt={staff.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg bg-muted">👤</div>
                    )}
                    <div className="absolute -top-0.5 -right-0.5 text-[10px]">{getStaffIcon(staff.role)}</div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-pixel text-xs text-foreground truncate">{staff.nickname}</span>
                      <span className="px-1.5 py-0.5 bg-primary/20 border border-primary/40 rounded font-pixel text-[11px] text-primary shrink-0">
                        {getStaffLabel(staff.role)}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-body text-xs text-foreground">
                        📋 지도 경력 {staff.staffCareerYears ? `${staff.staffCareerYears}년` : '미입력'}
                      </p>
                      {staff.staffCareerNote && (
                        <p className="font-body text-xs text-muted-foreground">
                          💬 {staff.staffCareerNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 본인이면 수정 버튼 */}
                  {canEditStaff(staff) && editingStaffId !== staff.id && (
                    <button
                      onClick={(e) => startEditCareer(staff, e)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center bg-secondary border-2 border-border-dark rounded hover:border-primary transition-colors"
                    >
                      <Pencil size={12} className="text-muted-foreground" />
                    </button>
                  )}
                </button>

                {/* 경력 수정 폼 */}
                {editingStaffId === staff.id && (
                  <div className="mt-1.5 p-3 bg-card border-2 border-primary/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="font-pixel text-[11px] text-muted-foreground shrink-0">지도 경력</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={editCareerYears}
                          onChange={(e) => setEditCareerYears(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-input border-2 border-border-dark rounded font-pixel text-[11px] focus:outline-none focus:border-primary text-center"
                        />
                        <span className="font-pixel text-[11px] text-muted-foreground">년</span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-pixel text-[11px] text-muted-foreground mb-1">경력 한줄 소개</label>
                      <input
                        type="text"
                        value={editCareerNote}
                        onChange={(e) => setEditCareerNote(e.target.value)}
                        placeholder="예: 전 K리그 OO FC 코치"
                        className="w-full px-2 py-1.5 bg-input border-2 border-border-dark rounded font-body text-xs focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                        maxLength={50}
                      />
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => setEditingStaffId(null)}
                        className="px-3 py-1.5 bg-secondary border-2 border-border-dark rounded font-pixel text-[11px] text-foreground hover:bg-muted"
                      >
                        <X size={12} className="inline mr-0.5" />취소
                      </button>
                      <button
                        onClick={() => handleSaveCareer(staff)}
                        className="px-3 py-1.5 bg-primary border-2 border-primary-dark rounded font-pixel text-[11px] text-primary-foreground hover:brightness-110"
                      >
                        <Check size={12} className="inline mr-0.5" />저장
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선수 목록 */}
      <div className="kairo-panel">
        {/* Panel Header */}
        <div className="kairo-panel-header">
          <span className="text-sm">👥</span>
          <span>팀원 현황</span>
          <span className="text-muted-foreground ml-1">({playerMembers.length}명)</span>
        </div>

        {/* Member Grid */}
        <div className="p-3 space-y-3">
          {positionOrder.map((position) => {
            const positionMembers = groupedMembers[position];
            if (!positionMembers || positionMembers.length === 0) return null;

            const info = positionInfo[position];

            return (
              <div key={position}>
                {/* Position Tag */}
                <div className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 mb-2',
                  'border-2 text-[11px] font-pixel',
                  info.color
                )}>
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                  <span className="text-muted-foreground">({positionMembers.length})</span>
                </div>

                {/* 4-Column Fixed Grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {positionMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className="relative flex flex-col items-center p-1.5 bg-muted border-2 border-border-dark rounded-lg hover:border-primary hover:bg-secondary transition-colors text-center"
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                    >
                      {/* Admin Badge - outside avatar overflow */}
                      {member.isAdmin && (
                        <div className="absolute -top-1.5 -right-1.5 z-10 text-sm drop-shadow-md">{member.role === 'owner' ? '👑' : '🛡️'}</div>
                      )}

                      {/* Avatar */}
                      <div className="w-12 h-12 bg-secondary border-2 border-border-dark rounded-md overflow-hidden mb-1">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.nickname} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-muted">
                            👤
                          </div>
                        )}
                      </div>

                      {/* Nickname */}
                      <span className="font-pixel text-[11px] text-foreground truncate w-full leading-tight">
                        {member.nickname}
                      </span>

                      {/* Experience */}
                      <span className="font-body text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {member.yearsOfExperience}년{member.monthsOfExperience ? `${member.monthsOfExperience}개월` : ''}
                      </span>

                      {/* Multi-position badges */}
                      {(member.positions?.length ?? 0) > 1 && (
                        <div className="flex gap-0.5 mt-1">
                          {member.positions?.filter(p => p !== position).map(p => (
                            <span key={p} className="font-pixel text-[9px] px-1 bg-primary/20 border border-primary text-primary">
                              {positionInfo[p as keyof typeof positionInfo]?.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player Stats Modal */}
      <PlayerStatsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        player={selectedPlayer}
      />
    </>
  );
}
