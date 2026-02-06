import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Instagram, Youtube } from 'lucide-react';
import { PixelButton } from '@/components/ui/PixelButton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmblemSelector } from '@/components/team/create/EmblemSelector';
import { LevelSelector } from '@/components/team/create/LevelSelector';
import { RegionSelector } from '@/components/team/create/RegionSelector';
import { TrainingTimeSelector } from '@/components/team/create/TrainingTimeSelector';
import { GenderSelector } from '@/components/team/create/GenderSelector';
import { GenderValue } from '@/lib/teamData';

export default function CreateTeam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    emblem: '⚽',
    customLogoUrl: null as string | null,
    gender: 'mixed' as GenderValue,
    level: 'B',
    region: '',
    district: '',
    trainingDays: [] as string[],
    trainingStartTime: '',
    trainingEndTime: '',
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

    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name.trim(),
          emblem: formData.emblem || '⚽',
          photo_url: formData.customLogoUrl,
          gender: formData.gender,
          level: formData.level,
          region: formData.region || null,
          district: formData.district || null,
          training_days: formData.trainingDays,
          training_start_time: formData.trainingStartTime || null,
          training_end_time: formData.trainingEndTime || null,
          training_time: formData.trainingDays.length > 0 
            ? `${formData.trainingStartTime} - ${formData.trainingEndTime}` 
            : null,
          introduction: formData.introduction || null,
          instagram_url: formData.instagramUrl || null,
          youtube_url: formData.youtubeUrl || null,
          admin_user_id: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add the creator as admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast.success('팀이 생성되었습니다!', {
        description: `${formData.name} 팀의 관리자가 되셨습니다.`,
      });
      navigate('/my-team');
    } catch (error: any) {
      console.error('Team creation error:', error);
      toast.error('팀 생성 중 오류가 발생했습니다', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <EmblemSelector
          value={formData.emblem}
          customLogoUrl={formData.customLogoUrl}
          onChange={(emblem) => setFormData(prev => ({ ...prev, emblem }))}
          onCustomLogoChange={(url) => setFormData(prev => ({ ...prev, customLogoUrl: url }))}
        />

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

        {/* Team Gender */}
        <GenderSelector
          value={formData.gender}
          onChange={(gender) => setFormData(prev => ({ ...prev, gender }))}
        />

        {/* Team Level */}
        <LevelSelector
          value={formData.level}
          onChange={(level) => setFormData(prev => ({ ...prev, level }))}
        />

        {/* Activity Info */}
        <div className="kairo-panel">
          <div className="kairo-panel-header">
            <span className="text-sm">📍</span>
            <span>활동 정보</span>
          </div>
          <div className="p-3 space-y-4">
            <RegionSelector
              region={formData.region}
              district={formData.district}
              onRegionChange={(region) => setFormData(prev => ({ ...prev, region }))}
              onDistrictChange={(district) => setFormData(prev => ({ ...prev, district }))}
            />

            <TrainingTimeSelector
              selectedDays={formData.trainingDays}
              startTime={formData.trainingStartTime}
              endTime={formData.trainingEndTime}
              onDaysChange={(days) => setFormData(prev => ({ ...prev, trainingDays: days }))}
              onStartTimeChange={(time) => setFormData(prev => ({ ...prev, trainingStartTime: time }))}
              onEndTimeChange={(time) => setFormData(prev => ({ ...prev, trainingEndTime: time }))}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? '생성 중...' : '🏆 팀 만들기'}
        </PixelButton>
      </form>
    </div>
  );
}
