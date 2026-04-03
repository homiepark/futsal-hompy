import { useState } from 'react';
import { X, Crown, AlertTriangle, UserPlus, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from '@/components/ui/PixelButton';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface Member {
  id: string;
  nickname: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

interface AdminTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentAdminId: string;
  onTransfer: (newAdminId: string) => void;
  onAddAdmin?: (memberId: string) => void;
  onRemoveAdmin?: (memberId: string) => void;
}

export function AdminTransferModal({
  isOpen,
  onClose,
  members,
  currentAdminId,
  onTransfer,
  onAddAdmin,
  onRemoveAdmin,
}: AdminTransferModalProps) {
  useBodyScrollLock(isOpen);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [mode, setMode] = useState<'manage' | 'transfer'>('manage');

  if (!isOpen) return null;

  // Get current admins (original admin + members with admin role)
  const admins = members.filter(m => m.id === currentAdminId || m.isAdmin);
  const adminCount = admins.length;
  const canAddAdmin = adminCount < 2;
  
  // Eligible members for adding as admin (not already admin)
  const eligibleForAdmin = members.filter(m => m.id !== currentAdminId && !m.isAdmin);
  
  // Eligible members for transfer (not the current original admin)
  const eligibleForTransfer = members.filter(m => m.id !== currentAdminId);
  
  const selectedMemberData = members.find(m => m.id === selectedMember);

  const handleTransfer = () => {
    if (selectedMember) {
      onTransfer(selectedMember);
      handleClose();
    }
  };

  const handleAddAdmin = () => {
    if (selectedMember && onAddAdmin) {
      onAddAdmin(selectedMember);
      toast.success(`${selectedMemberData?.nickname}님을 관리자로 추가했습니다`);
      setSelectedMember(null);
    }
  };

  const handleRemoveAdmin = (memberId: string) => {
    if (onRemoveAdmin) {
      const member = members.find(m => m.id === memberId);
      onRemoveAdmin(memberId);
      toast.success(`${member?.nickname}님의 관리자 권한을 해제했습니다`);
    }
  };

  const handleClose = () => {
    setSelectedMember(null);
    setConfirmStep(false);
    setMode('manage');
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
              관리자 설정
            </span>
          </div>
          <button onClick={handleClose} className="text-primary-foreground hover:opacity-70">
            <X size={16} />
          </button>
        </div>

        <div className="p-3">
          {mode === 'manage' && !confirmStep ? (
            <>
              {/* Current Admins Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-[9px] text-muted-foreground">
                    현재 관리자 ({adminCount}/2)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center gap-2 p-2 bg-primary/10 border-2 border-primary/30"
                      style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.4)' }}
                    >
                      <div className="w-7 h-7 bg-secondary border-2 border-border-dark overflow-hidden">
                        {admin.avatarUrl ? (
                          <img src={admin.avatarUrl} alt={admin.nickname} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                        )}
                      </div>
                      <span className="font-pixel text-[9px] text-foreground flex-1">{admin.nickname}</span>
                      {admin.id === currentAdminId ? (
                        <span className="font-pixel text-[11px] text-primary px-1.5 py-0.5 bg-primary/20 border border-primary">
                          👑 대표
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors"
                          title="관리자 해제"
                        >
                          <UserMinus size={14} className="text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Admin Section */}
              {canAddAdmin && eligibleForAdmin.length > 0 && (
                <div className="mb-4">
                  <span className="font-pixel text-[9px] text-muted-foreground block mb-2">
                    관리자 추가하기
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pixel-scrollbar">
                    {eligibleForAdmin.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member.id)}
                        className={cn(
                          'w-full flex items-center gap-2 p-2',
                          'border-2 transition-all',
                          selectedMember === member.id
                            ? 'bg-accent/20 border-accent'
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
                          <UserPlus size={14} className="ml-auto text-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedMember && (
                    <PixelButton
                      variant="accent"
                      size="sm"
                      className="w-full mt-2 flex items-center justify-center gap-1"
                      onClick={handleAddAdmin}
                    >
                      <UserPlus size={12} />
                      관리자로 추가
                    </PixelButton>
                  )}
                </div>
              )}

              {!canAddAdmin && (
                <p className="font-pixel text-[11px] text-muted-foreground text-center py-2 mb-3 bg-muted/50 border border-border-dark">
                  ℹ️ 팀당 최대 2명의 관리자를 설정할 수 있습니다
                </p>
              )}

              {/* Transfer Button */}
              <div className="pt-2 border-t border-border-dark">
                <button
                  onClick={() => setMode('transfer')}
                  className="w-full py-2 text-center font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  🔄 대표 관리자 권한 이전하기
                </button>
              </div>
            </>
          ) : mode === 'transfer' && !confirmStep ? (
            <>
              <button
                onClick={() => setMode('manage')}
                className="font-pixel text-[9px] text-muted-foreground mb-3 hover:text-foreground"
              >
                ← 뒤로
              </button>
              <p className="font-pixel text-[9px] text-muted-foreground mb-3">
                대표 관리자 권한을 이전할 팀원을 선택하세요
              </p>

              {/* Member List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pixel-scrollbar mb-3">
                {eligibleForTransfer.map((member) => (
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
                    {member.isAdmin && (
                      <span className="font-pixel text-[11px] text-primary px-1 bg-primary/20 border border-primary">
                        관리자
                      </span>
                    )}
                    {selectedMember === member.id && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </button>
                ))}
                {eligibleForTransfer.length === 0 && (
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
                <p className="font-pixel text-[11px] text-foreground leading-tight">
                  정말로 <strong>{selectedMemberData?.nickname}</strong>님에게 대표 관리자 권한을 이전하시겠습니까?
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