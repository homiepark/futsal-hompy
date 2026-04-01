import { useState } from 'react';
import { X, Shield, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  userId?: string;
  nickname: string;
  avatarUrl?: string;
  role?: string;
  isAdmin?: boolean;
}

interface AdminManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  teamId: string;
  ownerId: string;
  onRoleChange: (memberId: string, newRole: string) => void;
}

export function AdminManageModal({ isOpen, onClose, members, teamId, ownerId, onRoleChange }: AdminManageModalProps) {
  useBodyScrollLock(isOpen);
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  // Exclude owner from the list
  const manageableMembers = members.filter(m => m.userId !== ownerId);

  const handleToggleAdmin = async (member: Member) => {
    if (!member.userId) return;
    setLoading(member.id);

    const newRole = member.role === 'admin' ? 'member' : 'admin';

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('team_id', teamId)
        .eq('user_id', member.userId);

      if (error) throw error;

      onRoleChange(member.id, newRole);
      toast.success(
        newRole === 'admin'
          ? `${member.nickname}님을 관리자로 임명했습니다 🛡️`
          : `${member.nickname}님의 관리자 권한을 해제했습니다`
      );
    } catch (err) {
      console.error('Role change error:', err);
      toast.error('권한 변경에 실패했습니다');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden animate-in fade-in zoom-in-95"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Shield size={14} />
            <span className="font-pixel text-[10px]">관리자 관리</span>
          </div>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="font-pixel text-[8px] text-muted-foreground">
            관리자는 팀 설정, 입단 승인, 공지 작성, 멤버 관리가 가능합니다.
          </p>

          {manageableMembers.length === 0 ? (
            <p className="font-pixel text-[9px] text-muted-foreground text-center py-6">
              관리할 팀원이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {manageableMembers.map((member) => {
                const isAdminRole = member.role === 'admin';
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-muted border-2 border-border-dark"
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary border-2 border-border-dark overflow-hidden flex-shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[10px] text-foreground truncate">{member.nickname}</p>
                      <p className="font-pixel text-[7px] text-muted-foreground">
                        {isAdminRole ? '🛡️ 관리자' : '👤 일반 멤버'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleAdmin(member)}
                      disabled={loading === member.id}
                      className={cn(
                        'px-3 py-1.5 border-2 font-pixel text-[8px] transition-all disabled:opacity-50',
                        isAdminRole
                          ? 'bg-destructive/10 border-destructive/50 text-destructive hover:bg-destructive/20'
                          : 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20'
                      )}
                    >
                      {loading === member.id ? '...' : isAdminRole ? (
                        <span className="flex items-center gap-1"><ShieldOff size={10} /> 해제</span>
                      ) : (
                        <span className="flex items-center gap-1"><Shield size={10} /> 임명</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t-2 border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-muted border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-secondary transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
