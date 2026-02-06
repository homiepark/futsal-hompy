import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Instagram, Youtube } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const levelOptions = [
  { value: 'S', label: 'S급', desc: '프로/세미프로 수준' },
  { value: 'A', label: 'A급', desc: '고급 아마추어' },
  { value: 'B', label: 'B급', desc: '중급 수준' },
  { value: 'C', label: 'C급', desc: '입문/초급 수준' },
];

const emblemOptions = ['⚽', '🔥', '⭐', '🦁', '🦅', '🐉', '💎', '⚡', '🌊', '🏆'];

export default function CreateTeam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    emblem: '⚽',
    level: 'B',
    region: '',
    trainingTime: '',
    introduction: '',
    instagramUrl: '',
    youtubeUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('팀 이름을 입력해주세요');
      return;
    }

    // TODO: Integrate with Supabase when auth is ready
    toast.success('팀이 생성되었습니다!', {
      description: `${formData.name} 팀의 관리자가 되셨습니다.`,
    });
    navigate('/my-team');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-4 border-border-dark">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <span className="font-pixel text-xs text-foreground">팀 만들기</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-4">
        {/* Team Emblem Selection */}
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">🎨</span>
            <span>팀 엠블럼</span>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {emblemOptions.map((emblem) => (
                <button
                  key={emblem}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emblem }))}
                  className={cn(
                    'w-12 h-12 text-2xl flex items-center justify-center',
                    'border-3 transition-all',
                    formData.emblem === emblem
                      ? 'bg-primary/20 border-primary scale-110'
                      : 'bg-muted border-border-dark hover:bg-muted/70'
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  {emblem}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Name */}
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">✏️</span>
            <span>팀 이름</span>
          </div>
          <div className="p-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="예: FC 불꽃"
              className={cn(
                'w-full px-3 py-2',
                'bg-input border-3 border-border-dark',
                'font-pixel text-[10px] placeholder:text-muted-foreground',
                'focus:outline-none focus:border-primary'
              )}
              maxLength={20}
            />
          </div>
        </div>

        {/* Team Level */}
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">🏅</span>
            <span>팀 레벨</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {levelOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, level: option.value }))}
                  className={cn(
                    'p-2 text-left border-3 transition-all',
                    formData.level === option.value
                      ? 'bg-primary/20 border-primary'
                      : 'bg-muted border-border-dark hover:bg-muted/70'
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  <span className="font-pixel text-[10px] text-foreground block">{option.label}</span>
                  <span className="font-pixel text-[7px] text-muted-foreground">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Region & Training Time */}
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">📍</span>
            <span>활동 정보</span>
          </div>
          <div className="p-3 space-y-2">
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              placeholder="활동 지역 (예: 서울 강남구)"
              className={cn(
                'w-full px-3 py-2',
                'bg-input border-3 border-border-dark',
                'font-pixel text-[10px] placeholder:text-muted-foreground',
                'focus:outline-none focus:border-primary'
              )}
            />
            <input
              type="text"
              value={formData.trainingTime}
              onChange={(e) => setFormData(prev => ({ ...prev, trainingTime: e.target.value }))}
              placeholder="훈련 시간 (예: 주말 오전 9시)"
              className={cn(
                'w-full px-3 py-2',
                'bg-input border-3 border-border-dark',
                'font-pixel text-[10px] placeholder:text-muted-foreground',
                'focus:outline-none focus:border-primary'
              )}
            />
          </div>
        </div>

        {/* Team Introduction */}
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">📋</span>
            <span>팀 소개</span>
          </div>
          <div className="p-3">
            <textarea
              value={formData.introduction}
              onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
              placeholder="팀을 소개해주세요..."
              className={cn(
                'w-full px-3 py-2 min-h-[80px] resize-none',
                'bg-input border-3 border-border-dark',
                'font-pixel text-[10px] placeholder:text-muted-foreground',
                'focus:outline-none focus:border-primary'
              )}
              maxLength={200}
            />
            <span className="font-pixel text-[7px] text-muted-foreground">
              {formData.introduction.length}/200
            </span>
          </div>
        </div>

        {/* Social Links */}
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">🔗</span>
            <span>소셜 링크 (선택)</span>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted border-2 border-border-dark flex items-center justify-center">
                <Instagram size={14} />
              </div>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                placeholder="Instagram URL"
                className={cn(
                  'flex-1 px-3 py-2',
                  'bg-input border-3 border-border-dark',
                  'font-pixel text-[9px] placeholder:text-muted-foreground',
                  'focus:outline-none focus:border-primary'
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted border-2 border-border-dark flex items-center justify-center">
                <Youtube size={14} />
              </div>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="YouTube URL"
                className={cn(
                  'flex-1 px-3 py-2',
                  'bg-input border-3 border-border-dark',
                  'font-pixel text-[9px] placeholder:text-muted-foreground',
                  'focus:outline-none focus:border-primary'
                )}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <PixelButton
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
        >
          🏆 팀 만들기
        </PixelButton>
      </form>
    </div>
  );
}
