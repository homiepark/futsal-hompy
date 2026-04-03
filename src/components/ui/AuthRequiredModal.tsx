import { X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  message = '먼저 로그인을 해주세요!',
}: AuthRequiredModalProps) {
  useBodyScrollLock(isOpen);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xs kairo-panel animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="kairo-panel-header justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔐</span>
            <span>로그인 필요</span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary border-3 border-border-dark mb-4"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            <span className="text-3xl">🔒</span>
          </div>

          {/* Message */}
          <p className="font-pixel text-[10px] text-foreground mb-2">
            {message}
          </p>
          <p className="font-pixel text-[11px] text-muted-foreground">
            간편 신청을 위해 가입이 필요합니다.
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 border-t-3 border-border-dark bg-muted/50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            닫기
          </button>
          <button
            onClick={handleLogin}
            className={cn(
              'flex-1 py-2.5 border-3 font-pixel text-[9px] transition-all',
              'flex items-center justify-center gap-2',
              'bg-primary text-primary-foreground border-primary-dark',
              'hover:brightness-110'
            )}
            style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
          >
            <LogIn size={12} />
            <span>로그인하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
