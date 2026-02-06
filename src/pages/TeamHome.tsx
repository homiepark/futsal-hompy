import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { TeamHeader } from '@/components/team/TeamHeader';
import { TeamSwitcher } from '@/components/team/TeamSwitcher';
import { TeamIntro } from '@/components/team/TeamIntro';
import { LatestArchive } from '@/components/team/LatestArchive';
import { MemberRoster } from '@/components/team/MemberRoster';
import { Guestbook } from '@/components/team/Guestbook';
import { PixelButton } from '@/components/ui/PixelButton';
import { MessageButton } from '@/components/ui/MessageButton';
import { JoinRequestButton } from '@/components/team/JoinRequestButton';
import { AdminTransferModal } from '@/components/team/AdminTransferModal';
import { toast } from 'sonner';

// Mock data - would come from Supabase
const mockTeamData = {
  id: 'fc-bulkkot',
  name: 'FC 불꽃',
  emblem: '🔥',
  photoUrl: '',
  bannerUrl: '',
  level: 'A' as const,
  favorites: 128,
  region: '서울 강남구',
  description: '열정 가득한 풋살 팀입니다!',
  introduction: '2020년 창단된 열정 가득한 풋살 팀입니다! 매주 주말 강남에서 활동하며, 실력보다 즐거움을 추구합니다. 새로운 팀원을 환영합니다! 🔥⚽',
  instagramUrl: 'https://instagram.com/fc_bulkkot',
  youtubeUrl: '',
  foundedYear: 2020,
};

const mockArchiveItems = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300', date: '2024.01.20' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300', date: '2024.01.15' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300', date: '2024.01.08' },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300', isVideo: true, date: '2024.01.02' },
];

const mockMembers = [
  { id: '1', nickname: '캡틴불꽃', avatarUrl: '', position: 'pivo' as const, yearsOfExperience: 8, isAdmin: true },
  { id: '2', nickname: '스피드스타', avatarUrl: '', position: 'ala' as const, yearsOfExperience: 5 },
  { id: '3', nickname: '번개발', avatarUrl: '', position: 'ala' as const, yearsOfExperience: 3 },
  { id: '4', nickname: '철벽수비', avatarUrl: '', position: 'fixo' as const, yearsOfExperience: 6 },
  { id: '5', nickname: '수비왕', avatarUrl: '', position: 'fixo' as const, yearsOfExperience: 4 },
  { id: '6', nickname: '세이브킹', avatarUrl: '', position: 'goleiro' as const, yearsOfExperience: 7 },
  { id: '7', nickname: '드리블러', avatarUrl: '', position: 'pivo' as const, yearsOfExperience: 2 },
  { id: '8', nickname: '슛터', avatarUrl: '', position: 'ala' as const, yearsOfExperience: 4 },
];

export default function TeamHome() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { setActiveTeam, clearActiveTeam } = useTeam();
  const [showAdminTransfer, setShowAdminTransfer] = useState(false);
  const [teamData, setTeamData] = useState(mockTeamData);

  const isAdmin = true; // Would check user's role in team
  const isMember = true; // Would check if user is a team member

  // Set this team as active when entering
  useEffect(() => {
    setActiveTeam(mockTeamData);
    
    return () => {
      // Optional: clear on unmount
    };
  }, [teamId, setActiveTeam]);

  const handleBack = () => {
    clearActiveTeam();
    navigate('/my-team');
  };

  const handleBannerUpdate = (url: string) => {
    setTeamData(prev => ({ ...prev, bannerUrl: url }));
    // TODO: Update in Supabase
  };

  const handleIntroUpdate = (text: string) => {
    setTeamData(prev => ({ ...prev, introduction: text }));
    toast.success('팀 소개가 저장되었습니다');
    // TODO: Update in Supabase
  };

  const handleAdminTransfer = (newAdminId: string) => {
    const member = mockMembers.find(m => m.id === newAdminId);
    toast.success(`${member?.nickname}님에게 관리자 권한이 이전되었습니다`);
    // TODO: Update in Supabase
  };

  const handleJoinRequest = async () => {
    // TODO: Integrate with Supabase
    console.log('Join request sent');
  };

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Sticky Header with Team Switcher */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-2 border-border-dark">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft size={16} className="text-foreground" />
            </button>
            <span className="font-pixel text-[10px] text-muted-foreground">MY TEAM</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowAdminTransfer(true)}
                className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
                title="관리자 설정"
              >
                <Settings size={14} className="text-foreground" />
              </button>
            )}
            <TeamSwitcher />
          </div>
        </div>
      </div>

      {/* Team Header with Banner */}
      <TeamHeader
        name={teamData.name}
        emblem={teamData.emblem}
        photoUrl={teamData.photoUrl}
        bannerUrl={teamData.bannerUrl}
        level={teamData.level}
        favorites={teamData.favorites}
        region={teamData.region}
        instagramUrl={teamData.instagramUrl}
        youtubeUrl={teamData.youtubeUrl}
        isAdmin={isAdmin}
        onPhotoEdit={() => console.log('Edit team photo')}
        onBannerUpdate={handleBannerUpdate}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Team Introduction */}
        <TeamIntro
          introduction={teamData.introduction}
          isAdmin={isAdmin}
          onSave={handleIntroUpdate}
        />

        {/* Join Request or Team Actions */}
        {!isMember ? (
          <JoinRequestButton
            teamId={teamData.id}
            teamName={teamData.name}
            onRequest={handleJoinRequest}
            className="w-full"
          />
        ) : (
          <div className="flex items-center gap-2">
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              className="flex-1"
            >
              ⚽ 선수 등록
            </PixelButton>
            <MessageButton 
              label="쪽지" 
              variant="admin" 
              size="sm"
            />
          </div>
        )}

        {/* Latest Archive Preview */}
        <LatestArchive 
          teamId={teamData.id} 
          items={mockArchiveItems} 
        />

        {/* Member Roster */}
        <MemberRoster 
          members={mockMembers}
          teamId={teamData.id}
        />

        {/* Guestbook */}
        <Guestbook />
      </div>

      {/* Admin Transfer Modal */}
      <AdminTransferModal
        isOpen={showAdminTransfer}
        onClose={() => setShowAdminTransfer(false)}
        members={mockMembers}
        currentAdminId="1"
        onTransfer={handleAdminTransfer}
      />
    </div>
  );
}
