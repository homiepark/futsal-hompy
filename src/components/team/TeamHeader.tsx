import { Star, Camera, Instagram, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamHeaderProps {
  name: string;
  emblem: string;
  photoUrl?: string;
  bannerUrl?: string;
  level: 'S' | 'A' | 'B' | 'C';
  favorites: number;
  region?: string;
  introduction?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  isAdmin?: boolean;
  onPhotoEdit?: () => void;
  onBannerUpdate?: (url: string) => void;
  onIntroUpdate?: (text: string) => void;
}

const levelColors = {
  S: 'bg-[hsl(45,100%,50%)] border-[hsl(45,100%,35%)] text-foreground shadow-[0_0_8px_hsl(45,100%,50%)]',
  A: 'bg-accent border-accent-dark text-accent-foreground',
  B: 'bg-primary border-primary-dark text-primary-foreground',
  C: 'bg-secondary border-border-dark text-foreground',
};

export function TeamHeader({
  name,
  emblem,
  photoUrl,
  bannerUrl,
  level,
  favorites,
  region,
  introduction,
  instagramUrl,
  youtubeUrl,
  isAdmin = false,
  onPhotoEdit,
  onBannerUpdate,
  onIntroUpdate,
}: TeamHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('team-banners')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-banners')
        .getPublicUrl(fileName);

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
      {/* Background Banner - Custom or Kairosoft striped pattern */}
      <div 
        className="h-24 border-b-4 border-border-dark relative overflow-hidden"
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
          <img src={bannerUrl} alt="Team banner" className="w-full h-full object-cover" />
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

        {/* Admin Banner Upload Button */}
        {isAdmin && (
          <>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <button
              onClick={() => bannerInputRef.current?.click()}
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

      {/* Team Info - Compact */}
      <div className="px-3 -mt-10">
        <div className="flex items-end gap-3">
          {/* Team Photo - Kairosoft frame */}
          <div className="relative">
            <div 
              className="w-20 h-20 bg-muted border-4 border-border-dark overflow-hidden"
              style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-3xl">
                  {emblem}
                </div>
              )}
            </div>
            {isAdmin && (
              <button 
                onClick={onPhotoEdit}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent border-2 border-accent-dark flex items-center justify-center"
                style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
              >
                <Camera size={12} className="text-accent-foreground" />
              </button>
            )}
          </div>

          {/* Team Name & Info */}
          <div className="flex-1 pb-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="font-pixel text-xs text-foreground leading-tight">{name}</h1>
              <div className={cn(
                'px-1.5 py-0.5 border-2 font-pixel text-[8px]',
                levelColors[level]
              )}>
                LV.{level}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {region && (
                <p className="font-pixel text-[8px] text-muted-foreground">{region}</p>
              )}
              <div className="flex items-center gap-0.5">
                <Star size={12} className="text-[hsl(45,100%,50%)] fill-[hsl(45,100%,50%)]" />
                <span className="font-pixel text-[8px] text-foreground">{favorites}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
