import { Link } from 'react-router-dom';
import { PixelCard } from '@/components/ui/PixelCard';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  nickname: string;
  avatarUrl?: string;
  position: 'pivo' | 'ala' | 'fixo' | 'goleiro';
  yearsOfExperience: number;
  isAdmin?: boolean;
}

interface MemberRosterProps {
  members: Member[];
  teamId: string;
}

const positionInfo = {
  pivo: { label: '피보', emoji: '⚡', color: 'text-accent' },
  ala: { label: '아라', emoji: '💨', color: 'text-primary' },
  fixo: { label: '픽소', emoji: '🛡️', color: 'text-blue-400' },
  goleiro: { label: '골레이로', emoji: '🧤', color: 'text-green-400' },
};

export function MemberRoster({ members, teamId }: MemberRosterProps) {
  // Group by position
  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.position]) {
      acc[member.position] = [];
    }
    acc[member.position].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const positionOrder: Array<'pivo' | 'ala' | 'fixo' | 'goleiro'> = ['goleiro', 'fixo', 'ala', 'pivo'];

  return (
    <PixelCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
          <span className="text-primary">👥</span>
          멤버 로스터
          <span className="font-body text-xs text-muted-foreground">({members.length}명)</span>
        </h2>
      </div>

      <div className="space-y-4">
        {positionOrder.map((position) => {
          const positionMembers = groupedMembers[position];
          if (!positionMembers || positionMembers.length === 0) return null;
          
          const info = positionInfo[position];
          
          return (
            <div key={position}>
              {/* Position Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('text-sm', info.color)}>{info.emoji}</span>
                <span className="font-pixel text-[8px] text-muted-foreground uppercase">{info.label}</span>
                <div className="flex-1 h-px bg-border-dark" />
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-4 gap-2">
                {positionMembers.map((member) => (
                  <Link
                    key={member.id}
                    to={`/player/${member.id}`}
                    className="flex flex-col items-center p-2 bg-muted border-2 border-border-dark hover:border-primary transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-secondary border-2 border-border-dark overflow-hidden mb-1 relative">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          👤
                        </div>
                      )}
                      {member.isAdmin && (
                        <div className="absolute -top-1 -right-1 text-xs">👑</div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <span className="font-body text-[10px] text-foreground truncate w-full text-center">
                      {member.nickname}
                    </span>
                    
                    {/* Experience */}
                    <span className="font-pixel text-[8px] text-muted-foreground">
                      {member.yearsOfExperience}년
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PixelCard>
  );
}
