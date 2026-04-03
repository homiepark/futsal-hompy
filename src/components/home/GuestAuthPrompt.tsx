import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GuestAuthPrompt() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4">
      <div
        className="bg-card border-4 border-accent overflow-hidden"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 border-b-4 border-accent-dark px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📰</span>
            <h2 className="font-pixel text-[12px] text-accent-foreground">
              우리동네 풋살팀 소식
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          {/* Icon Animation */}
          <div className="relative inline-block">
            <div className="text-6xl">🔒</div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/15 rounded-full blur-sm" />
          </div>

          {/* Message */}
          <div className="space-y-3">
            <p className="font-pixel text-[12px] text-foreground leading-relaxed">
              회원가입하고
              <br />
              <span className="text-primary">우리동네 풋살팀 소식</span>을 확인하세요!
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <span className="px-2 py-1 bg-primary/10 border-2 border-primary/30 font-pixel text-[11px] text-primary">
                팀 소식
              </span>
              <span className="px-2 py-1 bg-accent/10 border-2 border-accent/30 font-pixel text-[11px] text-accent">
                매치 결과
              </span>
              <span className="px-2 py-1 bg-secondary border-2 border-border font-pixel text-[11px] text-muted-foreground">
                신규 멤버 모집
              </span>
            </div>
            <p className="font-pixel text-[10px] text-muted-foreground leading-relaxed">
              관심 지역의 풋살팀 활동을 한눈에 볼 수 있어요 ⚽
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/auth')}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3.5',
                'bg-primary text-primary-foreground border-4 border-primary-dark',
                'font-pixel text-[12px] uppercase tracking-wider',
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
              <UserPlus size={16} />
              회원가입하기
            </button>

            <button
              onClick={() => navigate('/auth')}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3',
                'bg-secondary text-foreground border-3 border-border-dark',
                'font-pixel text-[10px]',
                'hover:bg-muted transition-all',
                'active:translate-x-0.5 active:translate-y-0.5'
              )}
              style={{
                boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))',
              }}
            >
              <LogIn size={14} />
              이미 계정이 있어요
            </button>
          </div>

          {/* Decorative Footer */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <span className="text-primary text-sm">◆</span>
            <span className="text-accent text-sm">◆</span>
            <span className="text-primary text-sm">◆</span>
          </div>
        </div>
      </div>
    </div>
  );
}
