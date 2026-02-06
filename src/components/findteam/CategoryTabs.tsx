import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

type TabType = 'login' | 'findteam';

export function CategoryTabs() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('findteam');

  const handleLoginClick = () => {
    if (user) {
      // If logged in, navigate to profile
      navigate('/profile');
    } else {
      // If not logged in, navigate to auth page
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('findteam');
  };

  return (
    <div className="flex border-b-4 border-border-dark bg-card">
      {user ? (
        // Logged in: Show profile button and logout
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
        // Not logged in: Show login/signup button
        <button
          onClick={handleLoginClick}
          className={cn(
            "flex-1 py-3 px-4 font-body text-sm font-bold transition-all border-r-2 border-border-dark",
            "flex items-center justify-center gap-2",
            activeTab === 'login'
              ? "bg-accent text-accent-foreground shadow-[inset_0_-4px_0_hsl(var(--accent-dark))]"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          )}
        >
          <span>🔑</span>
          <span>로그인 / 가입</span>
        </button>
      )}
      <button
        onClick={() => setActiveTab('findteam')}
        className={cn(
          "flex-1 py-3 px-4 font-body text-sm font-bold transition-all",
          "flex items-center justify-center gap-2",
          activeTab === 'findteam'
            ? "bg-primary text-primary-foreground shadow-[inset_0_-4px_0_hsl(var(--primary-dark))]"
            : "bg-secondary text-secondary-foreground hover:bg-muted"
        )}
      >
        <span>🔍</span>
        <span>팀 찾기</span>
      </button>
    </div>
  );
}
