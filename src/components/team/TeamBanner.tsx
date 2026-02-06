import { useState, useRef } from 'react';
import { Camera, Instagram, Youtube, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamBannerProps {
  teamId: string;
  bannerUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  isAdmin?: boolean;
  onBannerUpdate?: (url: string) => void;
}

export function TeamBanner({
  teamId,
  bannerUrl,
  instagramUrl,
  youtubeUrl,
  isAdmin = false,
  onBannerUpdate,
}: TeamBannerProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${teamId}-banner-${Date.now()}.${fileExt}`;
      const filePath = `${teamId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-banners')
        .getPublicUrl(filePath);

      onBannerUpdate?.(publicUrl);
      toast.success('배너가 업로드되었습니다!');
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error('배너 업로드에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Banner Image or Pattern */}
      <div 
        className="h-24 border-b-4 border-border-dark overflow-hidden relative"
        style={bannerUrl ? {} : {
          background: `
            repeating-linear-gradient(
              45deg,
              hsl(var(--primary) / 0.2) 0px,
              hsl(var(--primary) / 0.2) 10px,
              hsl(var(--accent) / 0.15) 10px,
              hsl(var(--accent) / 0.15) 20px
            )
          `
        }}
      >
        {bannerUrl && (
          <img 
            src={bannerUrl} 
            alt="Team banner" 
            className="w-full h-full object-cover"
          />
        )}

        {/* Social Links - Top Right */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'w-8 h-8 flex items-center justify-center',
                'bg-card/95 border-2 border-border-dark',
                'hover:bg-accent hover:border-accent-dark transition-colors'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <Instagram size={14} className="text-foreground" />
            </a>
          )}
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'w-8 h-8 flex items-center justify-center',
                'bg-card/95 border-2 border-border-dark',
                'hover:bg-accent hover:border-accent-dark transition-colors'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
            >
              <Youtube size={14} className="text-foreground" />
            </a>
          )}
        </div>

        {/* Admin Upload Button */}
        {isAdmin && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={cn(
                'absolute bottom-2 right-2',
                'w-8 h-8 flex items-center justify-center',
                'bg-accent border-2 border-accent-dark',
                'hover:brightness-110 transition-all',
                'disabled:opacity-50'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
            >
              <Camera size={14} className="text-accent-foreground" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
