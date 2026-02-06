import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Music, Heart, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Guestbook } from '@/components/team/Guestbook';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TeamMiniRoomProps {
  userId: string;
}

interface UserTeam {
  id: string;
  name: string;
  emblem: string;
  level: string;
  introduction: string | null;
  banner_url: string | null;
}

// Floating decoration component
function FloatingDecoration({ type, delay, position }: { 
  type: 'heart' | 'star' | 'note'; 
  delay: number;
  position: { top: string; left: string };
}) {
  const icons = {
    heart: <Heart size={12} className="text-pink-400 fill-pink-400" />,
    star: <Star size={10} className="text-yellow-400 fill-yellow-400" />,
    note: <Music size={10} className="text-accent" />,
  };

  return (
    <div 
      className="absolute animate-bounce pointer-events-none"
      style={{ 
        top: position.top, 
        left: position.left,
        animationDelay: `${delay}ms`,
        animationDuration: '2s',
      }}
    >
      {icons[type]}
    </div>
  );
}

// Speech bubble component
function SpeechBubble({ message }: { message: string }) {
  return (
    <div className="relative">
      {/* Bubble */}
      <div 
        className="bg-white border-3 border-border-dark px-3 py-2 relative"
        style={{ 
          boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))',
          minWidth: '120px',
        }}
      >
        <p className="font-pixel text-[8px] text-foreground text-center leading-relaxed">
          {message}
        </p>
      </div>
      {/* Tail */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid hsl(var(--border-dark))',
        }}
      />
      <div 
        className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '7px solid white',
        }}
      />
    </div>
  );
}

// Pixel character component
function PixelCharacter({ emblem }: { emblem: string }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Character body - simple pixel person */}
      <div className="relative">
        {/* Head */}
        <div 
          className="w-8 h-8 bg-[#FFD5A0] border-2 border-[#8B6914] rounded-sm flex items-center justify-center"
          style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
        >
          {/* Eyes */}
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#2D1F0F] rounded-full" />
            <div className="w-1.5 h-1.5 bg-[#2D1F0F] rounded-full" />
          </div>
        </div>
        {/* Body - Team jersey */}
        <div 
          className="w-10 h-10 -mt-1 mx-auto bg-primary border-2 border-primary-dark flex items-center justify-center"
          style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
        >
          <span className="text-lg">{emblem}</span>
        </div>
        {/* Legs */}
        <div className="flex justify-center gap-1 -mt-0.5">
          <div className="w-3 h-4 bg-[#4A4A4A] border border-[#2D2D2D]" />
          <div className="w-3 h-4 bg-[#4A4A4A] border border-[#2D2D2D]" />
        </div>
      </div>
    </div>
  );
}

// Visitor counter console
function VisitorCounter({ today, total }: { today: number; total: number }) {
  return (
    <div 
      className="bg-[#2A2A3A] border-3 border-[#1A1A2A] p-2"
      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Eye size={10} className="text-green-400" />
          <span className="font-pixel text-[7px] text-green-400">TODAY</span>
          <span className="font-pixel text-[9px] text-white font-bold ml-auto">{today}</span>
        </div>
        <div className="h-px bg-[#3A3A4A]" />
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7px] text-gray-400">TOTAL</span>
          <span className="font-pixel text-[9px] text-gray-300 font-bold ml-auto">{total}</span>
        </div>
      </div>
    </div>
  );
}

// Guestbook chalkboard
function GuestbookBoard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div 
        className="bg-[#2D5A3D] border-4 border-[#5C3A1E] p-2 hover:brightness-110 transition-all"
        style={{ 
          boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))',
          minWidth: '60px',
        }}
      >
        <p className="font-pixel text-[8px] text-[#E8E8C8] text-center">📝</p>
        <p className="font-pixel text-[7px] text-[#E8E8C8] text-center">방명록</p>
      </div>
      {/* Chalk dust effect on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles size={8} className="text-white absolute -top-1 -right-1" />
      </div>
    </button>
  );
}

// Bulletin board
function BulletinBoard({ teamName }: { teamName: string }) {
  return (
    <div 
      className="bg-[#C4956A] border-4 border-[#8B6914] p-1.5"
      style={{ 
        boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))',
        minWidth: '55px',
      }}
    >
      {/* Pin */}
      <div className="w-2 h-2 bg-red-500 border border-red-700 rounded-full mx-auto mb-1" />
      {/* Note */}
      <div className="bg-[#FFFFC8] p-1 border border-[#E8E8A0]">
        <p className="font-pixel text-[6px] text-[#4A4A4A] text-center truncate">{teamName}</p>
      </div>
    </div>
  );
}

// Team emblem rug
function EmblemRug({ emblem }: { emblem: string }) {
  return (
    <div 
      className="w-14 h-14 bg-gradient-to-br from-accent/30 to-accent/50 border-3 border-accent-dark rounded-full flex items-center justify-center"
      style={{ 
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <span className="text-2xl">{emblem}</span>
    </div>
  );
}

export function TeamMiniRoom({ userId }: TeamMiniRoomProps) {
  const navigate = useNavigate();
  const [team, setTeam] = useState<UserTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState({ today: 0, total: 0 });
  const [showGuestbook, setShowGuestbook] = useState(false);

  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        const { data: teams, error } = await supabase
          .from('teams')
          .select('id, name, emblem, level, introduction, banner_url')
          .eq('admin_user_id', userId)
          .limit(1);

        if (error) throw error;

        if (teams && teams.length > 0) {
          setTeam(teams[0]);
          setVisitCount({
            today: Math.floor(Math.random() * 50) + 10,
            total: Math.floor(Math.random() * 500) + 100,
          });
        }
      } catch (error) {
        console.error('Error fetching user team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeam();
  }, [userId]);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div 
          className="bg-card border-4 border-primary p-4 animate-pulse"
          style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
        >
          <div className="h-32 bg-muted" />
        </div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  const welcomeMessage = team.introduction?.slice(0, 30) || "반갑습니다! 즐겁게 공 차요 ⚽";

  const decorations = [
    { type: 'heart' as const, delay: 0, position: { top: '15%', left: '10%' } },
    { type: 'star' as const, delay: 300, position: { top: '25%', left: '85%' } },
    { type: 'note' as const, delay: 600, position: { top: '20%', left: '75%' } },
    { type: 'heart' as const, delay: 900, position: { top: '30%', left: '15%' } },
    { type: 'star' as const, delay: 1200, position: { top: '18%', left: '50%' } },
  ];

  return (
    <>
      <div className="px-4 py-3">
        {/* Room Container with 3D isometric effect */}
        <div 
          className="relative overflow-hidden border-4 border-primary"
          style={{ boxShadow: '5px 5px 0 hsl(var(--pixel-shadow))' }}
        >
          {/* Room Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 border-b-3 border-primary-dark px-3 py-1.5 flex items-center gap-2">
            <span className="text-sm">🏠</span>
            <h2 className="font-pixel text-[9px] text-primary-foreground">{team.name}의 미니홈</h2>
          </div>

          {/* Isometric Room */}
          <div className="relative" style={{ minHeight: '180px' }}>
            {/* Back Wall - Left */}
            <div 
              className="absolute top-0 left-0 w-1/2 h-24"
              style={{
                background: 'repeating-linear-gradient(90deg, #F5E6D3 0px, #F5E6D3 8px, #EBD9C4 8px, #EBD9C4 16px)',
                borderBottom: '3px solid #C4A574',
                borderRight: '2px solid #D4C4A4',
              }}
            />
            
            {/* Back Wall - Right */}
            <div 
              className="absolute top-0 right-0 w-1/2 h-24"
              style={{
                background: 'repeating-linear-gradient(90deg, #EBD9C4 0px, #EBD9C4 8px, #F5E6D3 8px, #F5E6D3 16px)',
                borderBottom: '3px solid #C4A574',
                borderLeft: '2px solid #E5D5B5',
              }}
            />

            {/* Wooden Floor */}
            <div 
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: '90px',
                background: 'repeating-linear-gradient(90deg, #A67C52 0px, #A67C52 20px, #8B6914 20px, #8B6914 22px, #C4956A 22px, #C4956A 42px, #8B6914 42px, #8B6914 44px)',
                borderTop: '3px solid #8B6914',
              }}
            >
              {/* Floor shadow gradient */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 50%)',
                }}
              />
            </div>

            {/* Floating Decorations */}
            {decorations.map((dec, i) => (
              <FloatingDecoration key={i} {...dec} />
            ))}

            {/* Visitor Counter - Left Wall */}
            <div className="absolute top-3 left-3">
              <VisitorCounter today={visitCount.today} total={visitCount.total} />
            </div>

            {/* Right Wall Items */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
              <GuestbookBoard onClick={() => setShowGuestbook(true)} />
              <BulletinBoard teamName={team.name} />
            </div>

            {/* Center Floor - Character & Emblem */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              {/* Speech Bubble */}
              <SpeechBubble message={welcomeMessage} />
              
              {/* Character */}
              <div className="relative">
                <PixelCharacter emblem={team.emblem} />
              </div>
              
              {/* Emblem Rug */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 -z-10">
                <EmblemRug emblem={team.emblem} />
              </div>
            </div>

            {/* Team Poster on Back Wall */}
            <button
              onClick={() => navigate(`/team/${team.id}`)}
              className="absolute top-5 left-1/2 -translate-x-1/2 hover:scale-105 transition-transform"
            >
              <div 
                className="bg-white border-3 border-[#8B6914] p-1"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                <div className="w-10 h-10 bg-field-green flex items-center justify-center">
                  <span className="text-xl">{team.emblem}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-secondary/50 border-t-2 border-border-dark px-3 py-2 flex justify-center gap-2">
            <button
              onClick={() => navigate(`/team/${team.id}`)}
              className="px-3 py-1.5 bg-primary text-primary-foreground font-pixel text-[8px] border-2 border-primary-dark hover:brightness-110 transition-all"
              style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
            >
              🏠 팀 홈 가기
            </button>
            <button
              onClick={() => navigate('/matchmaking')}
              className="px-3 py-1.5 bg-accent text-accent-foreground font-pixel text-[8px] border-2 border-accent-dark hover:brightness-110 transition-all"
              style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
            >
              ⚔️ 매칭 찾기
            </button>
          </div>
        </div>
      </div>

      {/* Guestbook Dialog */}
      <Dialog open={showGuestbook} onOpenChange={setShowGuestbook}>
        <DialogContent className="max-w-sm border-4 border-primary bg-card p-0">
          <DialogHeader className="bg-primary px-4 py-2 border-b-2 border-primary-dark">
            <DialogTitle className="font-pixel text-sm text-primary-foreground flex items-center gap-2">
              📝 {team.name} 방명록
            </DialogTitle>
          </DialogHeader>
          <div className="p-0">
            <Guestbook />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
