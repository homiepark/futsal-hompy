import { useState, useEffect } from 'react';
import { X, Search, Users } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RecipientUser {
  id: string;
  nickname: string;
  tag: string;
  avatarUrl: string;
  teamName?: string;
  region?: string;
}

interface RecipientPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: RecipientUser) => void;
}

export function RecipientPicker({ isOpen, onClose, onSelect }: RecipientPickerProps) {
  useBodyScrollLock(isOpen);
  const { user } = useAuth();
  const [tab, setTab] = useState<'team' | 'search'>('team');
  const [teamMembers, setTeamMembers] = useState<RecipientUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipientUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch team members
  useEffect(() => {
    if (!isOpen || !user) return;
    async function fetch() {
      setLoading(true);
      // Get user's teams
      const { data: myTeams } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name)')
        .eq('user_id', user!.id);

      if (!myTeams || myTeams.length === 0) { setLoading(false); return; }

      const teamIds = myTeams.map((t: any) => t.team_id);
      const teamMap = new Map(myTeams.map((t: any) => [t.team_id, (t.teams as any)?.name || '']));

      // Get all members of those teams
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id, team_id')
        .in('team_id', teamIds)
        .neq('user_id', user!.id);

      if (!members || members.length === 0) { setLoading(false); return; }

      const userIds = [...new Set(members.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, nickname_tag, avatar_url, region, district')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const result: RecipientUser[] = [];
      const seen = new Set<string>();
      for (const m of members) {
        if (seen.has(m.user_id)) continue;
        seen.add(m.user_id);
        const p = profileMap.get(m.user_id);
        result.push({
          id: m.user_id,
          nickname: p?.nickname || '팀원',
          tag: p?.nickname_tag || '0000',
          avatarUrl: p?.avatar_url || '',
          teamName: teamMap.get(m.team_id) || '',
          region: [p?.region, p?.district].filter(Boolean).join(' '),
        });
      }
      setTeamMembers(result);
      setLoading(false);
    }
    fetch();
  }, [isOpen, user]);

  // Search users by nickname
  useEffect(() => {
    if (tab !== 'search' || !searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, nickname_tag, avatar_url, region, district')
        .ilike('nickname', `%${searchQuery.trim()}%`)
        .neq('user_id', user?.id || '')
        .limit(10);

      if (profiles) {
        // Fetch team info for results
        const userIds = profiles.map(p => p.user_id);
        const { data: memberships } = await supabase
          .from('team_members')
          .select('user_id, teams(name)')
          .in('user_id', userIds);

        const teamNameMap = new Map<string, string>();
        (memberships || []).forEach((m: any) => {
          if (m.teams?.name && !teamNameMap.has(m.user_id)) {
            teamNameMap.set(m.user_id, m.teams.name);
          }
        });

        setSearchResults(profiles.map(p => ({
          id: p.user_id,
          nickname: p.nickname || '유저',
          tag: p.nickname_tag || '0000',
          avatarUrl: p.avatar_url || '',
          teamName: teamNameMap.get(p.user_id),
          region: [p.region, p.district].filter(Boolean).join(' '),
        })));
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, tab, user]);

  if (!isOpen) return null;

  const renderUser = (u: RecipientUser) => (
    <button
      key={u.id}
      onClick={() => { onSelect(u); onClose(); }}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors border-b border-border last:border-b-0"
    >
      {/* Avatar */}
      <div className="w-9 h-9 border-2 border-border-dark overflow-hidden shrink-0 bg-muted flex items-center justify-center"
        style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
      >
        {u.avatarUrl ? (
          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-pixel text-[10px] text-muted-foreground">{u.nickname.charAt(0)}</span>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[9px] text-foreground truncate">{u.nickname}</span>
          <span className="font-pixel text-[11px] text-muted-foreground">#{u.tag}</span>
        </div>
        <div className="flex items-center gap-2">
          {u.teamName && <span className="font-pixel text-[11px] text-primary">⚽ {u.teamName}</span>}
          {u.region && <span className="font-pixel text-[11px] text-muted-foreground">📍 {u.region}</span>}
        </div>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden max-h-[75vh] flex flex-col"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
          <span className="font-pixel text-[10px]">✉️ 받는 사람 선택</span>
          <button onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-border-dark shrink-0">
          <button
            onClick={() => setTab('team')}
            className={`flex-1 py-2.5 font-pixel text-[9px] flex items-center justify-center gap-1 transition-colors ${
              tab === 'team' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            <Users size={12} /> 팀원
          </button>
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-2.5 font-pixel text-[9px] flex items-center justify-center gap-1 transition-colors ${
              tab === 'search' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            <Search size={12} /> 유저 검색
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {tab === 'team' ? (
            loading ? (
              <div className="p-6 text-center">
                <span className="font-pixel text-[9px] text-muted-foreground animate-pulse">불러오는 중...</span>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="p-6 text-center">
                <span className="text-2xl block mb-2">👥</span>
                <span className="font-pixel text-[11px] text-muted-foreground">팀원이 없습니다</span>
              </div>
            ) : (
              teamMembers.map(renderUser)
            )
          ) : (
            <>
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="닉네임으로 검색..."
                    className="w-full pixel-input pl-8"
                    autoFocus
                  />
                </div>
              </div>
              {searching ? (
                <div className="p-6 text-center">
                  <span className="font-pixel text-[9px] text-muted-foreground animate-pulse">검색 중...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(renderUser)
              ) : searchQuery.trim() ? (
                <div className="p-6 text-center">
                  <span className="font-pixel text-[11px] text-muted-foreground">검색 결과가 없습니다</span>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <span className="text-2xl block mb-2">🔍</span>
                  <span className="font-pixel text-[11px] text-muted-foreground">닉네임을 입력해서 검색하세요</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
