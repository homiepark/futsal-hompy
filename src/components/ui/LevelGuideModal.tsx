import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { levelOptions } from '@/lib/teamData';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface LevelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 8x8 pixel question mark icon
const QuestionMarkIcon = ({ size = 2, className }: { size?: number; className?: string }) => {
  const pattern = [
    [0,1,1,1,1,1,0,0],
    [1,1,0,0,0,1,1,0],
    [0,0,0,0,0,1,1,0],
    [0,0,0,0,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0],
  ];

  return (
    <div 
      className={cn('relative', className)}
      style={{ width: size * 8, height: size * 8 }}
    >
      {pattern.map((row, y) =>
        row.map((pixel, x) => (
          pixel === 1 && (
            <div
              key={`${x}-${y}`}
              className="absolute bg-current"
              style={{
                width: size,
                height: size,
                left: x * size,
                top: y * size,
              }}
            />
          )
        ))
      )}
    </div>
  );
};

const levelColorMap: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))] text-white border-[hsl(var(--level-1))]',
  '2': 'bg-[hsl(var(--level-2))] text-white border-[hsl(var(--level-2))]',
  '3': 'bg-[hsl(var(--level-3))] text-white border-[hsl(var(--level-3))]',
  '4': 'bg-[hsl(var(--level-4))] text-white border-[hsl(var(--level-4))]',
};

export function LevelGuideModal({ isOpen, onClose }: LevelGuideModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-card border-4 border-border-dark shadow-[8px_8px_0_hsl(var(--pixel-shadow))] max-w-sm w-full max-h-[85vh] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-4 border-border-dark bg-primary">
            <div className="flex items-center gap-2">
              <QuestionMarkIcon size={2} className="text-primary-foreground" />
              <h2 className="font-pixel text-[10px] text-primary-foreground">팀 레벨 가이드</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-6 h-6 bg-accent border-2 border-accent-dark flex items-center justify-center hover:bg-accent/80 transition-colors"
            >
              <X size={14} className="text-accent-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Formula Section */}
            <div className="bg-muted border-2 border-border-dark p-3">
              <h3 className="font-body font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-accent">📊</span>
                팀 레벨 산정 방식
              </h3>
              <div className="bg-background border-2 border-border p-3 font-mono text-xs text-foreground overflow-x-auto">
                <code className="whitespace-pre">
{`팀 레벨 = 팀원들의 경력 수준에 따라 산정

팀원 평균 경력 기반으로 자동 계산
상위 실력자 가중 반영`}
                </code>
              </div>
            </div>

            {/* Level Cards */}
            <div>
              <h3 className="font-body font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary">🏅</span>
                레벨별 상세 안내
              </h3>
              <div className="space-y-2">
                {levelOptions.map((level) => (
                  <div 
                    key={level.value}
                    className={cn(
                      'p-3 border-3 rounded-sm',
                      levelColorMap[level.value]
                    )}
                    style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
                  >
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{level.icon}</span>
                      <span className="font-pixel text-[11px]">{level.label}</span>
                      <span className="font-pixel text-[11px] font-bold">{level.name}</span>
                      <span className="font-body text-[10px] opacity-80">({level.tier})</span>
                    </div>
                    
                    {/* Description */}
                    <p className="font-body text-[11px] opacity-95 mb-1">
                      {level.desc}
                    </p>
                    
                    {/* Characteristic */}
                    <p className="font-body text-[10px] opacity-90 mb-1">
                      <span className="font-bold">특징:</span> {level.characteristic}
                    </p>
                    
                    {/* Operating Style */}
                    <p className="font-body text-[10px] opacity-90">
                      <span className="font-bold">운영:</span> {level.operatingStyle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trainer's Note */}
            <div className="bg-accent/10 border-2 border-accent p-3 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-xl">⚽</div>
              <div>
                <p className="font-pixel text-[11px] text-accent mb-1">TRAINER'S NOTE</p>
                <p className="font-body text-xs text-foreground">
                  정확한 레벨 정보는 모두에게 공정하고 안전한 경기를 보장합니다!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function LevelInfoButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={cn(
          'w-4 h-4 bg-muted border border-border-dark flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors',
          className
        )}
        aria-label="레벨 정보 보기"
      >
        <QuestionMarkIcon size={1.5} />
      </button>
      <LevelGuideModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
