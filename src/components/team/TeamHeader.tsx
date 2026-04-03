import { Star, Camera, Pencil, Check, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { shareToKakao } from '@/lib/kakaoShare';

interface TeamHeaderProps {
  name: string;
  emblem: string;
  photoUrl?: string;
  bannerUrl?: string;
  level: string;
  favorites: number;
  region?: string;
  homeGroundName?: string;
  homeGroundAddress?: string;
  instagramUrl?: string;
  trainingInfo?: string;
  youtubeUrl?: string;
  teamId?: string;
  isAdmin?: boolean;
  isFavorited?: boolean;
  onFavoriteToggle?: (isFavorited: boolean) => void;
  onPhotoUpdate?: (url: string) => void;
  onBannerUpdate?: (url: string) => void;
  onNameUpdate?: (name: string) => void;
  onNameClick?: () => void;
  onLevelClick?: () => void;
  /** @deprecated use onPhotoUpdate */
  onPhotoEdit?: () => void;
}

const levelColors: Record<string, string> = {
  '1': 'bg-[hsl(var(--level-1))] border-[hsl(var(--level-1))] text-white',
  '2': 'bg-[hsl(var(--level-2))] border-[hsl(var(--level-2))] text-white',
  '3': 'bg-[hsl(var(--level-3))] border-[hsl(var(--level-3))] text-white',
  '4': 'bg-[hsl(var(--level-4))] border-[hsl(var(--level-4))] text-white shadow-[0_0_8px_hsl(var(--level-4))]',
};

export function TeamHeader({
  name,
  emblem,
  photoUrl,
  bannerUrl,
  level,
  favorites,
  region,
  homeGroundName,
  homeGroundAddress,
  trainingInfo,
  instagramUrl,
  youtubeUrl,
  teamId,
  isAdmin = false,
  onPhotoUpdate,
  onBannerUpdate,
  onNameUpdate,
  onNameClick,
  onLevelClick,
  isFavorited = false,
  onFavoriteToggle,
}: TeamHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(name);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 가능합니다'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('5MB 이하만 가능합니다'); return; }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `banners/${teamId || 'team'}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('archive-images').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('archive-images').getPublicUrl(path);
      onBannerUpdate?.(publicUrl);
      toast.success('배너가 변경되었습니다!');
    } catch (err) {
      console.error(err);
      toast.error('배너 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 가능합니다'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('5MB 이하만 가능합니다'); return; }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `photos/${teamId || 'team'}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('archive-images').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('archive-images').getPublicUrl(path);

      // Save to DB
      if (teamId) {
        await supabase.from('teams').update({ photo_url: publicUrl }).eq('id', teamId);
      }
      onPhotoUpdate?.(publicUrl);
      toast.success('팀 사진이 변경되었습니다!');
    } catch (err) {
      console.error(err);
      toast.error('사진 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!editName.trim() || editName.trim() === name) {
      setIsEditingName(false);
      setEditName(name);
      return;
    }
    if (!teamId) return;

    try {
      const { error } = await supabase.from('teams').update({ name: editName.trim() }).eq('id', teamId);
      if (error) throw error;
      onNameUpdate?.(editName.trim());
      toast.success('팀명이 변경되었습니다!');
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      toast.error('팀명 변경 실패');
    }
  };

  return (
    <div className="bg-card border-b-3 border-border-dark px-4 py-4">
      <div className="flex items-start gap-4">
        {/* Team Photo */}
        <div className="relative shrink-0">
          <div
            className="w-24 h-24 bg-muted border-3 border-border-dark rounded-lg overflow-hidden"
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
            <>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent border-2 border-accent-dark flex items-center justify-center disabled:opacity-50"
                style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
              >
                <Camera size={12} className="text-accent-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Team Info */}
        <div className="flex-1 min-w-0">
          {/* Name Row */}
          <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="font-pixel text-sm text-foreground bg-input border-2 border-primary px-2 py-1 w-32"
                  autoFocus
                  maxLength={20}
                />
                <button onClick={handleNameSave} className="w-6 h-6 bg-primary border-2 border-primary-dark flex items-center justify-center">
                  <Check size={10} className="text-primary-foreground" />
                </button>
                <button onClick={() => { setIsEditingName(false); setEditName(name); }} className="w-6 h-6 bg-secondary border-2 border-border-dark flex items-center justify-center">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => onFavoriteToggle?.(!isFavorited)} className="transition-transform active:scale-125">
                  <Star size={16} className={isFavorited ? 'text-[hsl(45,100%,50%)] fill-[hsl(45,100%,50%)]' : 'text-muted-foreground'} />
                </button>
                <h1 className="font-pixel text-base text-foreground leading-tight">{name}</h1>
                {isAdmin && (
                  <button onClick={() => onNameClick ? onNameClick() : setIsEditingName(true)} className="text-muted-foreground hover:text-primary">
                    <Pencil size={10} />
                  </button>
                )}
              </>
            )}
            <button
              onClick={onLevelClick}
              className={cn('px-2 py-0.5 border-2 font-pixel text-[11px] hover:brightness-110 transition-all cursor-pointer', levelColors[level] || 'bg-primary text-primary-foreground')}
            >
              LV.{level}
            </button>
          </div>

          {/* Location Info */}
          <div className="space-y-1">
            {region && (
              <div className="flex items-center gap-1.5">
                <span className="font-body text-xs text-muted-foreground/60 w-14 shrink-0">활동지역</span>
                <span className="font-body text-xs text-foreground">📍 {region}</span>
              </div>
            )}
            {homeGroundName && (
              <div className="flex items-center gap-1.5">
                <span className="font-body text-xs text-muted-foreground/60 w-14 shrink-0">홈구장</span>
                <button
                  onClick={() => {
                    const query = homeGroundAddress || homeGroundName;
                    if (query) window.open(`https://map.naver.com/v5/search/${encodeURIComponent(query)}`, '_blank');
                  }}
                  className="font-body text-xs text-[#03C75A] hover:underline flex items-center gap-0.5"
                >
                  <MapPin size={9} />
                  {homeGroundName}
                </button>
              </div>
            )}
            {trainingInfo && (
              <div className="flex items-center gap-1.5">
                <span className="font-body text-xs text-muted-foreground/60 w-14 shrink-0">훈련시간</span>
                <span className="font-body text-xs text-foreground">🕐 {trainingInfo}</span>
              </div>
            )}
          </div>

          {/* Social Links + Kakao Share */}
          <div className="flex items-center gap-1.5 mt-2">
            {youtubeUrl && (
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center bg-[#FF0000] rounded-md hover:brightness-90 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-md hover:brightness-90 transition-all"
                style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            )}
            <button
              onClick={() => shareToKakao({
                title: name,
                imageUrl: photoUrl || bannerUrl || undefined,
                linkUrl: `https://xn--oy2bq2kj9eita652c.com/team/${teamId}`,
              })}
              className="w-8 h-8 flex items-center justify-center bg-[#FEE500] rounded-md hover:brightness-90 transition-all"
              title="카카오톡 공유"
            >
              <svg width="18" height="18" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.726.914 2.382 1.121.656 2.436.126 2.436.126 3.217-.453 37.272-24.266 43.151-28.373A175.896 175.896 0 00128 200c57.438 0 104-36.713 104-82S185.438 36 128 36z" fill="#191919"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
