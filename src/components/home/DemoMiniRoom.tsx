import { useNavigate } from 'react-router-dom';
import { Eye, Music, Heart, Star, Sparkles, LogIn } from 'lucide-react';

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
      <div 
        className="bg-white border-3 border-border-dark px-3 py-2 relative"
        style={{ 
          boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))',
          minWidth: '140px',
        }}
      >
        <p className="font-pixel text-[8px] text-foreground text-center leading-relaxed">
          {message}
        </p>
      </div>
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

// Demo pixel character
function DemoPixelCharacter() {
  return (
    <div className="relative flex flex-col items-center opacity-70">
      {/* Question mark above head */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg animate-pulse">❓</div>
      
      {/* Head */}
      <div 
        className="w-8 h-8 bg-muted border-2 border-border-dark rounded-sm flex items-center justify-center"
        style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
      >
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-border-dark rounded-full" />
          <div className="w-1.5 h-1.5 bg-border-dark rounded-full" />
        </div>
      </div>
      {/* Body - Gray jersey */}
      <div 
        className="w-10 h-10 -mt-1 mx-auto bg-muted border-2 border-border-dark flex items-center justify-center"
        style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
      >
        <span className="text-lg">👤</span>
      </div>
      {/* Legs */}
      <div className="flex justify-center gap-1 -mt-0.5">
        <div className="w-3 h-4 bg-muted-foreground/50 border border-border-dark" />
        <div className="w-3 h-4 bg-muted-foreground/50 border border-border-dark" />
      </div>
    </div>
  );
}

// Empty rug placeholder
function EmptyRug() {
  return (
    <div 
      className="w-14 h-14 bg-gradient-to-br from-muted/50 to-muted border-3 border-dashed border-border-dark rounded-full flex items-center justify-center"
    >
      <span className="text-xl opacity-50">?</span>
    </div>
  );
}

// Demo visitor counter
function DemoVisitorCounter() {
  return (
    <div 
      className="bg-muted/80 border-3 border-border-dark p-2"
      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Eye size={10} className="text-muted-foreground" />
          <span className="font-pixel text-[7px] text-muted-foreground">TODAY</span>
          <span className="font-pixel text-[9px] text-muted-foreground font-bold ml-auto">--</span>
        </div>
        <div className="h-px bg-border-dark/30" />
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7px] text-muted-foreground">TOTAL</span>
          <span className="font-pixel text-[9px] text-muted-foreground font-bold ml-auto">--</span>
        </div>
      </div>
    </div>
  );
}

// Empty guestbook
function EmptyGuestbook() {
  return (
    <div 
      className="bg-muted/60 border-4 border-border-dark p-2"
      style={{ 
        boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))',
        minWidth: '60px',
      }}
    >
      <p className="font-pixel text-[8px] text-muted-foreground text-center">📝</p>
      <p className="font-pixel text-[7px] text-muted-foreground text-center">방명록</p>
    </div>
  );
}

// Empty bulletin board
function EmptyBulletinBoard() {
  return (
    <div 
      className="bg-muted/60 border-4 border-border-dark p-1.5"
      style={{ 
        boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))',
        minWidth: '55px',
      }}
    >
      <div className="w-2 h-2 bg-muted-foreground/30 border border-border-dark rounded-full mx-auto mb-1" />
      <div className="bg-muted p-1 border border-border-dark">
        <p className="font-pixel text-[6px] text-muted-foreground text-center">???</p>
      </div>
    </div>
  );
}

export function DemoMiniRoom() {
  const navigate = useNavigate();

  const decorations = [
    { type: 'heart' as const, delay: 0, position: { top: '15%', left: '10%' } },
    { type: 'star' as const, delay: 300, position: { top: '25%', left: '85%' } },
    { type: 'note' as const, delay: 600, position: { top: '20%', left: '75%' } },
    { type: 'star' as const, delay: 1200, position: { top: '18%', left: '50%' } },
  ];

  return (
    <div className="px-4 py-3">
      {/* Room Container with 3D isometric effect */}
      <div 
        className="relative overflow-hidden border-4 border-border-dark"
        style={{ boxShadow: '5px 5px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Room Header */}
        <div className="bg-gradient-to-r from-muted to-muted/80 border-b-3 border-border-dark px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🏠</span>
            <h2 className="font-pixel text-[9px] text-muted-foreground">나만의 미니홈을 만들어보세요!</h2>
          </div>
          <Sparkles size={14} className="text-accent animate-pulse" />
        </div>

        {/* Isometric Room - Faded/Preview Style */}
        <div className="relative" style={{ minHeight: '180px' }}>
          {/* Back Wall - Left (faded) */}
          <div 
            className="absolute top-0 left-0 w-1/2 h-24 opacity-60"
            style={{
              background: 'repeating-linear-gradient(90deg, hsl(var(--muted)) 0px, hsl(var(--muted)) 8px, hsl(var(--muted-foreground) / 0.1) 8px, hsl(var(--muted-foreground) / 0.1) 16px)',
              borderBottom: '3px solid hsl(var(--border-dark))',
              borderRight: '2px solid hsl(var(--border))',
            }}
          />
          
          {/* Back Wall - Right (faded) */}
          <div 
            className="absolute top-0 right-0 w-1/2 h-24 opacity-60"
            style={{
              background: 'repeating-linear-gradient(90deg, hsl(var(--muted-foreground) / 0.1) 0px, hsl(var(--muted-foreground) / 0.1) 8px, hsl(var(--muted)) 8px, hsl(var(--muted)) 16px)',
              borderBottom: '3px solid hsl(var(--border-dark))',
              borderLeft: '2px solid hsl(var(--border))',
            }}
          />

          {/* Wooden Floor (faded) */}
          <div 
            className="absolute bottom-0 left-0 right-0 opacity-50"
            style={{
              height: '90px',
              background: 'repeating-linear-gradient(90deg, hsl(var(--muted)) 0px, hsl(var(--muted)) 20px, hsl(var(--border-dark) / 0.3) 20px, hsl(var(--border-dark) / 0.3) 22px, hsl(var(--muted-foreground) / 0.2) 22px, hsl(var(--muted-foreground) / 0.2) 42px)',
              borderTop: '3px solid hsl(var(--border-dark))',
            }}
          />

          {/* Floating Decorations (slightly faded) */}
          <div className="opacity-60">
            {decorations.map((dec, i) => (
              <FloatingDecoration key={i} {...dec} />
            ))}
          </div>

          {/* Demo Visitor Counter - Left Wall */}
          <div className="absolute top-3 left-3">
            <DemoVisitorCounter />
          </div>

          {/* Right Wall Items */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <EmptyGuestbook />
            <EmptyBulletinBoard />
          </div>

          {/* Center Floor - Demo Character */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            {/* Speech Bubble */}
            <SpeechBubble message="가입하고 나만의 팀을 꾸며보세요! ⚽" />
            
            {/* Character */}
            <DemoPixelCharacter />
            
            {/* Empty Rug */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 -z-10">
              <EmptyRug />
            </div>
          </div>

          {/* Empty Poster Placeholder on Back Wall */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2">
            <div 
              className="bg-muted/50 border-3 border-dashed border-border-dark p-1"
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
            >
              <div className="w-10 h-10 bg-muted flex items-center justify-center">
                <span className="text-xl opacity-40">🏆</span>
              </div>
            </div>
          </div>

          {/* Overlay CTA */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent flex items-end justify-center pb-2 pointer-events-none">
          </div>
        </div>

        {/* Bottom Action Bar - CTA */}
        <div className="bg-secondary/80 border-t-2 border-border-dark px-3 py-2.5 flex justify-center gap-2">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-pixel text-[9px] border-3 border-primary-dark hover:brightness-110 transition-all animate-pulse"
            style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
          >
            <LogIn size={14} />
            <span>회원가입 / 로그인</span>
          </button>
          <button
            onClick={() => navigate('/create-team')}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-pixel text-[9px] border-3 border-accent-dark hover:brightness-110 transition-all"
            style={{ boxShadow: '3px 3px 0 hsl(var(--accent-dark))' }}
          >
            <span>🏆 팀 만들기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
