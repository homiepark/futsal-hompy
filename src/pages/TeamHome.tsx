import { useNavigate } from 'react-router-dom';
import { MoodDisplay } from '@/components/team/MoodDisplay';
import { WinsCounter } from '@/components/team/WinsCounter';
import { TeamPolaroid } from '@/components/team/TeamPolaroid';
import { Guestbook } from '@/components/team/Guestbook';
import { PixelButton } from '@/components/ui/PixelButton';
import { MessageButton } from '@/components/ui/MessageButton';
import { MatchRequestButton } from '@/components/ui/MatchRequestButton';

export default function TeamHome() {
  const navigate = useNavigate();

  return (
    <div className="pb-24 px-5 py-8 max-w-lg mx-auto space-y-8">
      {/* Match Request - Prominent CTA */}
      <MatchRequestButton />

      {/* Team Info & Admin Message */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-pixel text-xs text-foreground">FC 불꽃</h2>
          <p className="font-body text-sm text-muted-foreground">서울 강남구 · 2020년 창단</p>
        </div>
        <MessageButton 
          label="관리자 쪽지" 
          variant="admin" 
          size="md"
        />
      </div>

      {/* Register Button */}
      <PixelButton
        variant="primary"
        size="lg"
        onClick={() => navigate('/register')}
        className="w-full"
      >
        ⚽ 선수 등록하기
      </PixelButton>

      {/* Team Stats Row */}
      <div className="grid grid-cols-2 gap-5">
        <MoodDisplay mood="🔥" teamName="FC 불꽃" />
        <WinsCounter wins={42} />
      </div>

      {/* Team Polaroid */}
      <section>
        <h2 className="font-pixel text-[10px] text-muted-foreground mb-4 flex items-center gap-2">
          <span className="text-accent">✦</span>
          우리팀 갤러리
          <span className="text-primary">✦</span>
        </h2>
        <TeamPolaroid caption="2024.01.15 신년 첫 승리! 🎉" />
      </section>

      {/* Guestbook */}
      <section>
        <Guestbook />
      </section>
    </div>
  );
}
