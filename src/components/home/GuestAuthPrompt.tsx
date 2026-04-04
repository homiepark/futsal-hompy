import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GuestAuthPrompt() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-2">
      <div
        className="bg-card border-3 border-border-dark overflow-hidden rounded-xl"
        style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 border-b-2 border-primary-dark px-3 py-2 flex items-center gap-1.5">
          <span className="text-sm">✨</span>
          <h2 className="font-pixel text-[11px] text-primary-foreground">우리팀 새 소식</h2>
        </div>

        {/* Content */}
        <div className="p-4 text-center">
          <p className="font-pixel text-[11px] text-foreground mb-1">
            로그인하면 팀 소식을 받을 수 있어요!
          </p>
          <p className="font-pixel text-[9px] text-muted-foreground mb-3">
            게시글 · 공지 · 일정을 한눈에 ⚽
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/auth')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5',
                'bg-primary text-primary-foreground border-3 border-primary-dark rounded-lg',
                'font-pixel text-[11px]',
                'hover:brightness-110 transition-all',
                'active:translate-x-0.5 active:translate-y-0.5'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
            >
              <UserPlus size={14} />
              회원가입
            </button>
            <button
              onClick={() => navigate('/auth')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5',
                'bg-secondary text-foreground border-3 border-border-dark rounded-lg',
                'font-pixel text-[11px]',
                'hover:bg-muted transition-all',
                'active:translate-x-0.5 active:translate-y-0.5'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <LogIn size={14} />
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
