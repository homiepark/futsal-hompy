import { useState } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const emblemOptions = ['⚽', '🔥', '⭐', '🦁', '🦅', '🐉', '💎', '⚡', '🌊', '🏆', '🎯', '🛡️', '⚔️', '🏅', '🎖️'];

interface EmblemSelectorProps {
  value: string;
  customLogoUrl: string | null;
  onChange: (emblem: string) => void;
  onCustomLogoChange: (url: string | null) => void;
}

export function EmblemSelector({ value, customLogoUrl, onChange, onCustomLogoChange }: EmblemSelectorProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('파일 크기는 2MB 이하여야 합니다');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `team-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-banners')
        .getPublicUrl(filePath);

      onCustomLogoChange(publicUrl);
      onChange(''); // Clear emoji selection when custom logo is uploaded
      toast.success('로고가 업로드되었습니다!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('업로드 중 오류가 발생했습니다');
    } finally {
      setUploading(false);
    }
  };

  const handleEmojiSelect = (emblem: string) => {
    onChange(emblem);
    onCustomLogoChange(null); // Clear custom logo when emoji is selected
  };

  return (
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">🎨</span>
        <span>팀 엠블럼</span>
      </div>
      <div className="p-3 space-y-3">
        {/* Custom Logo Preview */}
        {customLogoUrl && (
          <div className="flex justify-center mb-3">
            <div className="relative">
              <img 
                src={customLogoUrl} 
                alt="Custom logo" 
                className="w-16 h-16 object-cover border-3 border-primary"
                style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
              />
              <button
                type="button"
                onClick={() => onCustomLogoChange(null)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-pixel flex items-center justify-center border-2 border-border-dark"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Emoji Grid */}
        <div className="flex flex-wrap gap-2 justify-center">
          {emblemOptions.map((emblem) => (
            <button
              key={emblem}
              type="button"
              onClick={() => handleEmojiSelect(emblem)}
              className={cn(
                'w-10 h-10 text-xl flex items-center justify-center',
                'border-3 transition-all',
                value === emblem && !customLogoUrl
                  ? 'bg-primary/20 border-primary scale-110'
                  : 'bg-muted border-border-dark hover:bg-muted/70'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              {emblem}
            </button>
          ))}
        </div>

        {/* Upload Button */}
        <div className="flex justify-center pt-2">
          <label className={cn(
            'flex items-center gap-2 px-4 py-2 cursor-pointer',
            'bg-secondary border-3 border-border-dark',
            'font-pixel text-[9px] text-foreground',
            'hover:bg-secondary/80 transition-colors',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
          style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <Camera size={14} />
            <span>{uploading ? '업로드 중...' : '커스텀 로고 업로드'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
