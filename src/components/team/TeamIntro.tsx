import { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamIntroProps {
  introduction?: string;
  isAdmin?: boolean;
  onSave?: (text: string) => void;
}

export function TeamIntro({ introduction, isAdmin = false, onSave }: TeamIntroProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(introduction || '');

  const handleSave = () => {
    onSave?.(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(introduction || '');
    setIsEditing(false);
  };

  if (!introduction && !isAdmin) {
    return null;
  }

  return (
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">📋</span>
        <span>팀 소개</span>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-auto p-1 hover:bg-muted/50 transition-colors"
          >
            <Edit3 size={12} className="text-muted-foreground" />
          </button>
        )}
      </div>
      
      <div className="p-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="팀을 소개해주세요..."
              className={cn(
                'w-full px-2 py-1.5 min-h-[60px] resize-none',
                'bg-input border-2 border-border-dark',
                'font-body text-sm leading-relaxed',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:border-primary'
              )}
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              <span className="font-body text-[11px] text-muted-foreground">
                {editText.length}/200
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleCancel}
                  className={cn(
                    'px-2 py-1 flex items-center gap-1',
                    'bg-secondary border-2 border-border-dark',
                    'font-pixel text-[11px] text-foreground',
                    'hover:bg-muted transition-colors'
                  )}
                  style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
                >
                  <X size={10} />
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className={cn(
                    'px-2 py-1 flex items-center gap-1',
                    'bg-primary border-2 border-primary-dark',
                    'font-pixel text-[11px] text-primary-foreground',
                    'hover:brightness-110 transition-all'
                  )}
                  style={{ boxShadow: '1px 1px 0 hsl(var(--primary-dark))' }}
                >
                  <Check size={10} />
                  저장
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {introduction || (isAdmin ? '팀 소개를 작성해주세요...' : '')}
          </p>
        )}
      </div>
    </div>
  );
}
