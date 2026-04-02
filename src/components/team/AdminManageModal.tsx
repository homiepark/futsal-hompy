import { useState } from 'react';
import { X, Shield, ShieldOff, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  userId?: string;
  nickname: string;
  avatarUrl?: string;
  role?: string;
  isAdmin?: boolean;
  staffCareerYears?: number | null;
  staffCareerNote?: string | null;
}

interface AdminManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  teamId: string;
  ownerId: string;
  onRoleChange: (memberId: string, newRole: string) => void;
}

const roleOptions = [
  { value: 'member', label: '선수', icon: '⚽', desc: '일반 팀원' },
  { value: 'admin', label: '관리자', icon: '🛡️', desc: '팀 설정/승인 권한' },
  { value: 'coach', label: '코치', icon: '📋', desc: '팀 지도 코치' },
  { value: 'manager', label: '감독', icon: '👔', desc: '팀 감독' },
];

export function AdminManageModal({ isOpen, onClose, members, teamId, ownerId, onRoleChange }: AdminManageModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [editingCareer, setEditingCareer] = useState<string | null>(null);
  const [careerYears, setCareerYears] = useState('');
  const [careerNote, setCareerNote] = useState('');

  if (!isOpen) return null;

  const manageableMembers = members.filter(m => m.userId !== ownerId);

  // 감독은 팀당 1명 제한
  const hasManager = members.some(m => m.role === 'manager' && m.userId !== ownerId);

  const handleRoleChange = async (member: Member, newRole: string) => {
    if (!member.userId) return;

    // 감독 중복 체크
    if (newRole === 'manager' && hasManager && member.role !== 'manager') {
      toast.error('감독은 팀당 1명만 지정할 수 있습니다');
      return;
    }

    setLoading(member.id);
    try {
      const updateData: any = { role: newRole };
      // 선수/관리자로 변경 시 스태프 경력 초기화
      if (newRole === 'member' || newRole === 'admin') {
        updateData.staff_career_years = null;
        updateData.staff_career_note = null;
      }

      const { error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('team_id', teamId)
        .eq('user_id', member.userId);

      if (error) throw error;

      onRoleChange(member.id, newRole);
      const roleLabel = roleOptions.find(r => r.value === newRole)?.label || newRole;
      toast.success(`${member.nickname}님을 ${roleLabel}(으)로 지정했습니다`);
    } catch (err) {
      console.error('Role change error:', err);
      toast.error('역할 변경에 실패했습니다');
    } finally {
      setLoading(null);
    }
  };

  const handleSaveCareer = async (member: Member) => {
    if (!member.userId) return;
    setLoading(member.id);
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          staff_career_years: careerYears ? parseInt(careerYears) : null,
          staff_career_note: careerNote.trim() || null,
        })
        .eq('team_id', teamId)
        .eq('user_id', member.userId);

      if (error) throw error;
      toast.success('경력이 저장되었습니다');
      setEditingCareer(null);
    } catch (err) {
      console.error('Career save error:', err);
      toast.error('경력 저장에 실패했습니다');
    } finally {
      setLoading(null);
    }
  };

  const isStaff = (role?: string) => role === 'manager' || role === 'coach';

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return '👑';
      case 'manager': return '👔';
      case 'coach': return '📋';
      case 'admin': return '🛡️';
      default: return '⚽';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'owner': return '팀장';
      case 'manager': return '감독';
      case 'coach': return '코치';
      case 'admin': return '관리자';
      default: return '선수';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden animate-in fade-in zoom-in-95"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Shield size={14} />
            <span className="font-pixel text-[10px]">멤버 역할 관리</span>
          </div>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="font-pixel text-[8px] text-muted-foreground">
            감독(1명), 코치(복수), 관리자, 선수 역할을 지정할 수 있습니다.
          </p>

          {manageableMembers.length === 0 ? (
            <p className="font-pixel text-[10px] text-muted-foreground text-center py-6">
              관리할 팀원이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {manageableMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-muted border-2 border-border-dark overflow-hidden"
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-9 h-9 rounded-full bg-secondary border-2 border-border-dark overflow-hidden flex-shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[10px] text-foreground truncate">{member.nickname}</p>
                      <p className="font-pixel text-[8px] text-muted-foreground">
                        {getRoleIcon(member.role)} {getRoleLabel(member.role)}
                        {isStaff(member.role) && member.staffCareerYears && (
                          <span className="ml-1 text-primary">· 경력 {member.staffCareerYears}년</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Role Buttons */}
                  <div className="px-3 pb-2 flex flex-wrap gap-1">
                    {roleOptions.map((opt) => {
                      const isCurrentRole = member.role === opt.value;
                      const isManagerDisabled = opt.value === 'manager' && hasManager && member.role !== 'manager';
                      return (
                        <button
                          key={opt.value}
                          onClick={() => !isCurrentRole && handleRoleChange(member, opt.value)}
                          disabled={loading === member.id || isCurrentRole || isManagerDisabled}
                          className={cn(
                            'px-2 py-1 border-2 font-pixel text-[8px] transition-all disabled:opacity-50',
                            isCurrentRole
                              ? 'bg-primary text-primary-foreground border-primary-dark'
                              : 'bg-card border-border-dark hover:border-primary text-foreground'
                          )}
                          title={isManagerDisabled ? '감독은 1명만 가능합니다' : opt.desc}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Staff Career Input (감독/코치만) */}
                  {isStaff(member.role) && (
                    <div className="px-3 pb-3 pt-1 border-t border-border">
                      {editingCareer === member.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              placeholder="경력(년)"
                              value={careerYears}
                              onChange={(e) => setCareerYears(e.target.value)}
                              className="w-20 px-2 py-1 font-pixel text-[10px] bg-input border-2 border-border-dark"
                            />
                            <input
                              type="text"
                              placeholder="경력 설명 (선택)"
                              value={careerNote}
                              onChange={(e) => setCareerNote(e.target.value)}
                              className="flex-1 px-2 py-1 font-pixel text-[10px] bg-input border-2 border-border-dark"
                            />
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveCareer(member)}
                              disabled={loading === member.id}
                              className="px-3 py-1 bg-primary text-primary-foreground border-2 border-primary-dark font-pixel text-[8px]"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingCareer(null)}
                              className="px-3 py-1 bg-muted border-2 border-border-dark font-pixel text-[8px]"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCareer(member.id);
                            setCareerYears(member.staffCareerYears?.toString() || '');
                            setCareerNote(member.staffCareerNote || '');
                          }}
                          className="font-pixel text-[8px] text-primary hover:text-primary/80"
                        >
                          {member.staffCareerYears ? `✏️ 경력 수정 (${member.staffCareerYears}년)` : '➕ 지도 경력 입력'}
                          {member.staffCareerNote && (
                            <span className="text-muted-foreground ml-1">· {member.staffCareerNote}</span>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t-2 border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-muted border-3 border-border-dark font-pixel text-[10px] text-foreground hover:bg-secondary transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
