import { Star, Camera, Pencil, Check, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  youtubeUrl?: string;
  teamId?: string;
  isAdmin?: boolean;
  isFavorited?: boolean;
  onFavoriteToggle?: (isFavorited: boolean) => void;
  onPhotoUpdate?: (url: string) => void;
  onBannerUpdate?: (url: string) => void;
  onNameUpdate?: (name: string) => void;
  onNameClick?: () => void;
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
  instagramUrl,
  youtubeUrl,
  teamId,
  isAdmin = false,
  onPhotoUpdate,
  onBannerUpdate,
  onNameUpdate,
  onNameClick,
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
    <div className="relative">
      {/* Banner */}
      <div
        className="h-24 border-b-4 border-border-dark relative overflow-hidden"
        style={bannerUrl ? {} : {
          background: `repeating-linear-gradient(45deg, hsl(var(--primary) / 0.2) 0px, hsl(var(--primary) / 0.2) 10px, hsl(var(--accent) / 0.15) 10px, hsl(var(--accent) / 0.15) 20px)`
        }}
      >
        {bannerUrl && <img src={bannerUrl} alt="배너" className="w-full h-full object-cover" />}

        {isAdmin && (
          <>
            <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-accent border-2 border-accent-dark hover:brightness-110 disabled:opacity-50"
              style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
            >
              <Camera size={14} className="text-accent-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Team Info */}
      <div className="px-3 -mt-10">
        <div className="flex items-end gap-3">
          {/* Team Photo */}
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

          {/* Team Name & Info */}
          <div className="flex-1 pb-1.5">
            <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="font-pixel text-xs text-foreground bg-input border-2 border-primary px-2 py-1 w-28"
                    autoFocus
                    maxLength={20}
                  />
                  <button
                    onClick={handleNameSave}
                    className="w-6 h-6 bg-primary border-2 border-primary-dark flex items-center justify-center"
                  >
                    <Check size={10} className="text-primary-foreground" />
                  </button>
                  <button
                    onClick={() => { setIsEditingName(false); setEditName(name); }}
                    className="w-6 h-6 bg-secondary border-2 border-border-dark flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onFavoriteToggle?.(!isFavorited)}
                    className="transition-transform active:scale-125"
                    title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기'}
                  >
                    <Star
                      size={14}
                      className={isFavorited ? 'text-[hsl(45,100%,50%)] fill-[hsl(45,100%,50%)]' : 'text-muted-foreground'}
                    />
                  </button>
                  <h1 className="font-pixel text-xs text-foreground leading-tight">{name}</h1>
                  {isAdmin && (
                    <button
                      onClick={() => onNameClick ? onNameClick() : setIsEditingName(true)}
                      className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                      title="팀명 변경"
                    >
                      <Pencil size={10} />
                    </button>
                  )}
                </div>
              )}
              <div className={cn(
                'px-1.5 py-0.5 border-2 font-pixel text-[8px]',
                levelColors[level] || 'bg-primary text-primary-foreground'
              )}>
                LV.{level}
              </div>

              {(youtubeUrl || instagramUrl) && (
                <div className="flex items-center gap-[5px] ml-2">
                  {youtubeUrl && (
                    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-0.5 bg-card border-2 border-border-dark hover:bg-secondary transition-colors"
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                    >
                      <span className="text-[10px]">▶️</span>
                      <span className="font-pixel text-[7px] text-foreground">유튜브</span>
                    </a>
                  )}
                  {instagramUrl && (
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-0.5 bg-card border-2 border-border-dark hover:bg-secondary transition-colors"
                      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                    >
                      <span className="text-[10px]">📸</span>
                      <span className="font-pixel text-[7px] text-foreground">인스타</span>
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
              {region && (
                <div className="flex items-center gap-1">
                  <span className="font-pixel text-[7px] text-muted-foreground/70">활동지역</span>
                  <span className="font-pixel text-[8px] text-muted-foreground">📍 {region}</span>
                </div>
              )}
              {homeGroundName && (
                <div className="flex items-center gap-1">
                  <span className="font-pixel text-[7px] text-muted-foreground/70">홈구장</span>
                  <button
                    onClick={() => {
                      const query = homeGroundAddress || homeGroundName;
                      if (query) window.open(`https://map.naver.com/v5/search/${encodeURIComponent(query)}`, '_blank');
                    }}
                    className="flex items-center gap-0.5 font-pixel text-[7px] text-[#03C75A] hover:underline"
                  >
                    <MapPin size={8} />
                    {homeGroundName}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
