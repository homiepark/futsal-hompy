import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GuestLoginPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName?: string;
}

export function GuestLoginPrompt({ open, onOpenChange, teamName }: GuestLoginPromptProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  const handleSignup = () => {
    onOpenChange(false);
    navigate('/auth?mode=signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-4 border-accent max-w-xs mx-auto p-0 overflow-hidden"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Pixel Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 border-b-4 border-accent-dark px-4 py-3">
          <DialogHeader>
            <DialogTitle className="font-pixel text-[12px] text-accent-foreground flex items-center gap-2">
              <span className="text-lg">⚽</span>
              로그인이 필요해요!
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-5 text-center space-y-4">
          {/* Mascot / Icon */}
          <div className="relative inline-block">
            <div className="text-6xl animate-bounce">🔐</div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 rounded-full blur-sm" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="font-pixel text-[10px] text-foreground leading-relaxed">
              로그인하면 {teamName ? `'${teamName}'` : '이 팀'}의
              <br />
              더 많은 소식을 볼 수 있어요!
            </p>
            <p className="font-pixel text-[11px] text-muted-foreground">
              팀 가입, 매치 신청, 방명록 작성도 가능해요 ✨
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleLogin}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3',
                'bg-primary text-primary-foreground border-4 border-primary-dark',
                'font-pixel text-[10px] uppercase tracking-wider',
                'hover:brightness-110 transition-all',
                'active:translate-x-0.5 active:translate-y-0.5'
              )}
              style={{
                boxShadow: `
                  4px 4px 0 hsl(var(--primary-dark)),
                  inset -2px -2px 0 hsl(var(--primary-dark) / 0.4),
                  inset 2px 2px 0 hsl(0 0% 100% / 0.25)
                `,
              }}
            >
              <LogIn size={14} />
              로그인
            </button>

            <button
              onClick={handleSignup}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3',
                'bg-accent text-accent-foreground border-4 border-accent-dark',
                'font-pixel text-[10px] uppercase tracking-wider',
                'hover:brightness-110 transition-all',
                'active:translate-x-0.5 active:translate-y-0.5'
              )}
              style={{
                boxShadow: `
                  4px 4px 0 hsl(var(--accent-dark)),
                  inset -2px -2px 0 hsl(var(--accent-dark) / 0.4),
                  inset 2px 2px 0 hsl(0 0% 100% / 0.25)
                `,
              }}
            >
              <UserPlus size={14} />
              회원가입
            </button>
          </div>

          {/* Skip Option */}
          <button
            onClick={() => onOpenChange(false)}
            className="font-pixel text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            나중에 할게요
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
