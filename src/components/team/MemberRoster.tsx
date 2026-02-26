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
  joinDate?: string;
  mannerRating?: number;
  matchesPlayed?: number;
  goals?: number;
  assists?: number;
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

  // Group by position
  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.position]) {
      acc[member.position] = [];
    }
    acc[member.position].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const positionOrder: Array<'pivo' | 'ala' | 'fixo' | 'goleiro'> = ['goleiro', 'fixo', 'ala', 'pivo'];

  const handleMemberClick = (member: Member) => {
    setSelectedPlayer(member);
    setShowModal(true);
  };

  return (
    <>
      <div className="kairo-panel">
        {/* Panel Header */}
        <div className="kairo-panel-header">
          <span className="text-sm">👥</span>
          <span>팀원 현황</span>
          <span className="text-muted-foreground ml-1">({members.length})</span>
        </div>

        {/* Dense Member Grid */}
        <div className="p-2 space-y-2">
          {positionOrder.map((position) => {
            const positionMembers = groupedMembers[position];
            if (!positionMembers || positionMembers.length === 0) return null;
            
            const info = positionInfo[position];
            
            return (
              <div key={position}>
                {/* Position Tag */}
                <div className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 mb-1.5',
                  'border-2 text-[8px] font-pixel',
                  info.color
                )}>
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                </div>

                {/* Dense Members Row */}
                <div className="flex flex-wrap gap-1.5">
                  {positionMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className="kairo-member-chip group text-left"
                    >
                      {/* Mini Avatar */}
                      <div className="w-7 h-7 bg-secondary border-2 border-border-dark overflow-hidden relative flex-shrink-0">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.nickname} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs bg-muted">
                            👤
                          </div>
                        )}
                        {member.isAdmin && (
                          <div className="absolute -top-0.5 -right-0.5 text-[8px]">👑</div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex flex-col min-w-0">
                        <span className="font-pixel text-[8px] text-foreground truncate leading-tight">
                          {member.nickname}
                        </span>
                        <span className="font-pixel text-[7px] text-muted-foreground leading-tight">
                          {member.yearsOfExperience}년차
                        </span>
                      </div>
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
