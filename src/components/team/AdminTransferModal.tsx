import { useState } from 'react';
import { X, Crown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from '@/components/ui/PixelButton';

interface Member {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

interface AdminTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentAdminId: string;
  onTransfer: (newAdminId: string) => void;
}

export function AdminTransferModal({
  isOpen,
  onClose,
  members,
  currentAdminId,
  onTransfer,
}: AdminTransferModalProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  const eligibleMembers = members.filter(m => m.id !== currentAdminId);
  const selectedMemberData = members.find(m => m.id === selectedMember);

  const handleTransfer = () => {
    if (selectedMember) {
      onTransfer(selectedMember);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedMember(null);
    setConfirmStep(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className="w-full max-w-sm bg-card border-4 border-border-dark"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-primary border-b-4 border-primary-dark">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-primary-foreground" />
            <span className="font-pixel text-[10px] text-primary-foreground uppercase">
              관리자 권한 이전
            </span>
          </div>
          <button onClick={handleClose} className="text-primary-foreground hover:opacity-70">
            <X size={16} />
          </button>
        </div>

        <div className="p-3">
          {!confirmStep ? (
            <>
              <p className="font-pixel text-[9px] text-muted-foreground mb-3">
                관리자 권한을 이전할 팀원을 선택하세요
              </p>

              {/* Member List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pixel-scrollbar mb-3">
                {eligibleMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member.id)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2',
                      'border-2 transition-all',
                      selectedMember === member.id
                        ? 'bg-primary/20 border-primary'
                        : 'bg-muted border-border-dark hover:bg-muted/70'
                    )}
                    style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.4)' }}
                  >
                    <div className="w-7 h-7 bg-secondary border-2 border-border-dark overflow-hidden">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                      )}
                    </div>
                    <span className="font-pixel text-[9px] text-foreground">{member.nickname}</span>
                    {selectedMember === member.id && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </button>
                ))}
                {eligibleMembers.length === 0 && (
                  <p className="text-center font-pixel text-[9px] text-muted-foreground py-4">
                    이전할 수 있는 팀원이 없습니다
                  </p>
                )}
              </div>

              <PixelButton
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!selectedMember}
                onClick={() => setConfirmStep(true)}
              >
                다음
              </PixelButton>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="flex items-center gap-2 p-2 bg-accent/20 border-2 border-accent mb-3">
                <AlertTriangle size={16} className="text-accent flex-shrink-0" />
                <p className="font-pixel text-[8px] text-foreground leading-tight">
                  정말로 <strong>{selectedMemberData?.nickname}</strong>님에게 관리자 권한을 이전하시겠습니까?
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>

              <div className="flex gap-2">
                <PixelButton
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmStep(false)}
                >
                  취소
                </PixelButton>
                <PixelButton
                  variant="accent"
                  size="sm"
                  className="flex-1"
                  onClick={handleTransfer}
                >
                  👑 이전 확인
                </PixelButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
