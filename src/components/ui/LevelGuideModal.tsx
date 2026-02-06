import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { levelOptions } from '@/lib/teamData';

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

// 8x8 pixel whistle icon
const WhistleIcon = ({ size = 2 }: { size?: number }) => {
  const pattern = [
    [0,0,0,0,0,1,1,0],
    [0,0,0,0,1,1,1,1],
    [0,0,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,0,0],
    [0,1,1,1,1,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];

  return (
    <div 
      className="relative"
      style={{ width: size * 8, height: size * 8 }}
    >
      {pattern.map((row, y) =>
        row.map((pixel, x) => (
          pixel === 1 && (
            <div
              key={`${x}-${y}`}
              className="absolute"
              style={{
                width: size,
                height: size,
                left: x * size,
                top: y * size,
                backgroundColor: 'hsl(45 80% 55%)', // Gold whistle
              }}
            />
          )
        ))
      )}
    </div>
  );
};

const levelColorMap: Record<string, string> = {
  S: 'bg-accent text-accent-foreground border-accent-dark',
  A: 'bg-primary text-primary-foreground border-primary-dark',
  B: 'bg-primary/70 text-primary-foreground border-primary-dark/70',
  C: 'bg-primary/50 text-primary-foreground border-primary-dark/50',
};

export function LevelGuideModal({ isOpen, onClose }: LevelGuideModalProps) {
  if (!isOpen) return null;

  const levelRanges: Record<string, string> = {
    S: '90 - 100',
    A: '70 - 89',
    B: '50 - 69',
    C: '0 - 49',
  };

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
                팀 레벨 산정 공식
              </h3>
              <div className="bg-background border-2 border-border p-3 font-mono text-xs text-foreground overflow-x-auto">
                <code className="whitespace-pre">
{`팀 레벨 = 0.4 × 전체평균 + 0.6 × Top5평균

전체평균 = Σ(개인점수) / 팀원수
Top5평균 = 상위 5명 평균 점수

개인점수 = 경력년수 × 10
가중치   = 프로출신(×2) + 엘리트(×1.5)`}
                </code>
              </div>
            </div>

            {/* Level Cards with Detailed Descriptions */}
            <div>
              <h3 className="font-body font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-primary">🏆</span>
                레벨별 상세 안내
              </h3>
              <div className="space-y-2">
                {levelOptions.map((level) => (
                  <div 
                    key={level.value}
                    className={cn(
                      'p-3 border-3',
                      levelColorMap[level.value]
                    )}
                    style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
                  >
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{level.icon}</span>
                      <span className="font-pixel text-[11px]">{level.label}</span>
                      <span className="font-body text-[10px] opacity-80">({level.tier})</span>
                    </div>
                    
                    {/* Title */}
                    <p className="font-pixel text-[9px] mb-1">"{level.desc}"</p>
                    
                    {/* Characteristic */}
                    <p className="font-body text-[10px] opacity-90 mb-1">
                      <span className="font-bold">특징:</span> {level.characteristic}
                    </p>
                    
                    {/* Operating Style */}
                    <p className="font-body text-[10px] opacity-90">
                      <span className="font-bold">운영:</span> {level.operatingStyle}
                    </p>
                    
                    {/* Score Range */}
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <span className="font-mono text-[9px] opacity-75">
                        점수: {levelRanges[level.value]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Factors */}
            <div className="bg-secondary/50 border-2 border-border p-3 rounded-lg">
              <h4 className="font-body font-bold text-foreground text-sm mb-2">레벨 산정 요소:</h4>
              <ul className="space-y-1.5 text-xs font-body text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  개인 풋살/축구 경력 연수
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent" />
                  프로/엘리트 선수 출신 여부
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  상위 5명 가중 반영 (60%)
                </li>
              </ul>
            </div>

            {/* Trainer's Note */}
            <div className="bg-accent/10 border-2 border-accent p-3 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <WhistleIcon size={3} />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-accent mb-1">TRAINER'S NOTE</p>
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
