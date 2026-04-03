import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerStatsModal } from './PlayerStatsModal';

interface Member {
  id: string;
  userId?: string;
  nickname: string;
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
  const [selectedPlayer, setSelectedPlayer] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState(false);

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
              <button
                key={staff.id}
                onClick={() => handleMemberClick(staff)}
                className="w-full flex items-center gap-3 p-2.5 bg-muted border-2 border-border-dark rounded-lg hover:border-primary transition-colors text-left"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.3)' }}
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-secondary border-2 border-border-dark rounded-md overflow-hidden flex-shrink-0 relative">
                  {staff.avatarUrl ? (
                    <img src={staff.avatarUrl} alt={staff.nickname} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg bg-muted">👤</div>
                  )}
                  <div className="absolute -top-0.5 -right-0.5 text-[10px]">{getStaffIcon(staff.role)}</div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-[11px] text-foreground truncate">{staff.nickname}</span>
                    <span className="px-1.5 py-0.5 bg-primary/20 border border-primary/40 font-pixel text-[11px] text-primary shrink-0">
                      {getStaffLabel(staff.role)}
                    </span>
                  </div>
                  <div className="font-pixel text-[10px] text-muted-foreground mt-0.5">
                    {staff.staffCareerYears ? (
                      <span>지도 경력 {staff.staffCareerYears}년</span>
                    ) : (
                      <span>경력 미입력</span>
                    )}
                    {staff.staffCareerNote && (
                      <span className="ml-1 text-foreground/60">· {staff.staffCareerNote}</span>
                    )}
                  </div>
                </div>
              </button>
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

                {/* 3-Column Fixed Grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {positionMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className="flex flex-col items-center p-1.5 bg-muted border-2 border-border-dark rounded-lg hover:border-primary hover:bg-secondary transition-colors text-center"
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-secondary border-2 border-border-dark rounded-md overflow-hidden relative mb-1">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.nickname} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-muted">
                            👤
                          </div>
                        )}
                        {member.isAdmin && (
                          <div className="absolute -top-1 -right-1 text-[10px]">{member.role === 'owner' ? '👑' : '🛡️'}</div>
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
