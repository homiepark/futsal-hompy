import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export function SimpleHeader() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleAuthClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex border-b-4 border-border-dark bg-card">
      {user ? (
        // Logged in state
        <>
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "flex-1 py-3 px-4 font-body text-sm font-bold transition-all border-r-2 border-border-dark",
              "flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground shadow-[inset_0_-4px_0_hsl(var(--primary-dark))]"
            )}
          >
            <span>👤</span>
            <span className="truncate max-w-[100px]">내 프로필</span>
          </button>
          <button
            onClick={handleLogout}
            className={cn(
              "py-3 px-4 font-body text-sm font-bold transition-all",
              "flex items-center justify-center gap-2",
              "bg-secondary text-secondary-foreground hover:bg-muted"
            )}
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </>
      ) : (
        // Not logged in - single button with updated text
        <button
          onClick={handleAuthClick}
          className={cn(
            "flex-1 py-3 px-4 font-body text-sm font-bold transition-all",
            "flex items-center justify-center gap-2",
            "bg-accent text-accent-foreground shadow-[inset_0_-4px_0_hsl(var(--accent-dark))]"
          )}
        >
          <span>🔑</span>
          <span>회원가입 / 로그인</span>
        </button>
      )}
    </div>
  );
}
