import { useState } from 'react';
import { X, Search, User, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from '@/components/ui/PixelButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface PlayerInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  years_of_experience: number;
  preferred_position: string | null;
}

const positionFilters = [
  { key: 'all', label: '전체' },
  { key: 'pivo', label: '피보' },
  { key: 'ala', label: '알라' },
  { key: 'fixo', label: '픽소' },
  { key: 'goleiro', label: '골레이루' },
];

const positionLabels: Record<string, string> = {
  pivo: '피보',
  ala: '알라',
  fixo: '픽소',
  goleiro: '골레이루',
  MF: '미드필더',
};

export function PlayerInviteModal({ isOpen, onClose, teamId, teamName }: PlayerInviteModalProps) {
  useBodyScrollLock(isOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() && positionFilter === 'all') {
      toast.error('검색어 또는 포지션을 선택해주세요');
      return;
    }

    setSearching(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .limit(20);

      if (searchQuery.trim()) {
        query = query.ilike('nickname', `%${searchQuery.trim()}%`);
      }

      if (positionFilter !== 'all') {
        query = query.eq('preferred_position', positionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('검색 중 오류가 발생했습니다');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setInviteMessage(`안녕하세요! ${teamName} 팀에서 ${user.nickname}님을 초대합니다. 함께 활동하시겠어요?`);
  };

  const handleSendInvite = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Check if already invited
      const { data: existing } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('team_id', teamId)
        .eq('invited_user_id', selectedUser.user_id)
        .eq('status', 'pending')
        .single();

      if (existing) {
        toast.error('이미 초대한 선수입니다');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', selectedUser.user_id)
        .single();

      if (existingMember) {
        toast.error('이미 팀원입니다');
        return;
      }

      // Create invitation
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          invited_user_id: selectedUser.user_id,
          invited_by_user_id: user.id,
          message: inviteMessage,
        });

      if (error) throw error;

      toast.success(`${selectedUser.nickname}님에게 초대를 보냈습니다!`);
      onClose();
      resetState();
    } catch (error) {
      console.error('Invite error:', error);
      toast.error('초대 전송 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSearchQuery('');
    setPositionFilter('all');
    setSearchResults([]);
    setSelectedUser(null);
    setInviteMessage('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md kairo-panel overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="kairo-panel-header justify-between">
          <span className="flex items-center gap-2">
            <span>👤</span>
            선수 초대하기
          </span>
          <button
            onClick={handleClose}
            className="w-6 h-6 bg-primary-foreground/20 border border-primary-dark flex items-center justify-center hover:bg-primary-foreground/30"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {!selectedUser ? (
            <>
              {/* Search Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이름으로 검색..."
                  className="flex-1 pixel-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="pixel-btn pixel-btn-primary px-3"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* Position Filter */}
              <div className="flex flex-wrap gap-1">
                {positionFilters.map((pos) => (
                  <button
                    key={pos.key}
                    onClick={() => setPositionFilter(pos.key)}
                    className={cn(
                      'px-2 py-1 text-[9px] font-pixel border-2 transition-colors',
                      positionFilter === pos.key
                        ? 'bg-primary text-primary-foreground border-primary-dark'
                        : 'bg-secondary text-secondary-foreground border-border-dark hover:bg-muted'
                    )}
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searching ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    검색 중...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-2 bg-card border-2 border-border-dark hover:border-primary transition-colors text-left"
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                    >
                      <div className="w-10 h-10 bg-muted border-2 border-border-dark flex items-center justify-center flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-pixel text-sm text-foreground truncate">{user.nickname}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-pixel text-[8px] text-muted-foreground">
                            {positionLabels[user.preferred_position || ''] || user.preferred_position || '미정'}
                          </span>
                          <span className="font-pixel text-[8px] text-muted-foreground">
                            • 경력 {user.years_of_experience}년
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : searchQuery || positionFilter !== 'all' ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    이름 또는 포지션으로 선수를 검색하세요
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Selected User - Compose Invite */
            <>
              {/* Selected User Info */}
              <div className="flex items-center gap-3 p-3 bg-secondary/50 border-2 border-border-dark">
                <div className="w-12 h-12 bg-muted border-2 border-border-dark flex items-center justify-center flex-shrink-0">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-pixel text-sm text-foreground">{selectedUser.nickname}</p>
                  <p className="font-pixel text-[9px] text-muted-foreground">
                    {positionLabels[selectedUser.preferred_position || ''] || '미정'} • 경력 {selectedUser.years_of_experience}년
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  변경
                </button>
              </div>

              {/* Invite Message */}
              <div>
                <label className="block font-pixel text-[9px] text-muted-foreground mb-2">
                  💬 초대 메시지
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full pixel-input min-h-[100px] resize-none"
                  placeholder="초대 메시지를 입력하세요..."
                />
              </div>

              {/* Send Button */}
              <PixelButton
                variant="primary"
                onClick={handleSendInvite}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {loading ? '전송 중...' : '초대 보내기'}
              </PixelButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
