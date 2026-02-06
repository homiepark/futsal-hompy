import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { TeamHeader } from '@/components/team/TeamHeader';
import { LatestArchive } from '@/components/team/LatestArchive';
import { MemberRoster } from '@/components/team/MemberRoster';
import { MoodDisplay } from '@/components/team/MoodDisplay';
import { WinsCounter } from '@/components/team/WinsCounter';
import { Guestbook } from '@/components/team/Guestbook';
import { PixelButton } from '@/components/ui/PixelButton';
import { MessageButton } from '@/components/ui/MessageButton';
import { MatchRequestButton } from '@/components/ui/MatchRequestButton';

// Mock data - would come from Supabase
const mockTeamData = {
  id: 'fc-bulkkot',
  name: 'FC 불꽃',
  emblem: '🔥',
  photoUrl: '',
  level: 'A' as const,
  favorites: 128,
  region: '서울 강남구',
  description: '열정 가득한 풋살 팀입니다!',
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

  // Set this team as active when entering
  useEffect(() => {
    // In real app, fetch team data by teamId
    setActiveTeam(mockTeamData);
    
    return () => {
      // Optional: clear on unmount if you want
      // clearActiveTeam();
    };
  }, [teamId, setActiveTeam]);

  const handleBack = () => {
    clearActiveTeam();
    navigate('/');
  };

  const isAdmin = true; // Would check user's role in team

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-2 border-border-dark">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <span className="font-pixel text-[10px] text-muted-foreground">팀 홈으로</span>
        </div>
      </div>

      {/* Team Header */}
      <TeamHeader
        name={mockTeamData.name}
        emblem={mockTeamData.emblem}
        photoUrl={mockTeamData.photoUrl}
        level={mockTeamData.level}
        favorites={mockTeamData.favorites}
        region={mockTeamData.region}
        isAdmin={isAdmin}
        onPhotoEdit={() => console.log('Edit team photo')}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Match Request CTA */}
        <MatchRequestButton />

        {/* Team Actions Row */}
        <div className="flex items-center gap-3">
          <PixelButton
            variant="primary"
            size="md"
            onClick={() => navigate('/register')}
            className="flex-1"
          >
            ⚽ 선수 등록
          </PixelButton>
          <MessageButton 
            label="관리자 쪽지" 
            variant="admin" 
            size="md"
          />
        </div>

        {/* Team Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <MoodDisplay mood="🔥" teamName={mockTeamData.name} />
          <WinsCounter wins={42} />
        </div>

        {/* Latest Archive Preview */}
        <LatestArchive 
          teamId={mockTeamData.id} 
          items={mockArchiveItems} 
        />

        {/* Member Roster */}
        <MemberRoster 
          members={mockMembers}
          teamId={mockTeamData.id}
        />

        {/* Guestbook */}
        <section>
          <Guestbook />
        </section>
      </div>
    </div>
  );
}
