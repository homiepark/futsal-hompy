import { cn } from '@/lib/utils';
import { useState } from 'react';

type TabType = 'login' | 'findteam';

export function CategoryTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('findteam');

  return (
    <div className="flex border-b-4 border-border-dark bg-card">
      <button
        onClick={() => setActiveTab('login')}
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
