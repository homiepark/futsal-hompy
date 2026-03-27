import { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Check } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { regionData, regions } from '@/lib/teamData';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  currentRegion: string;
  currentDistrict: string;
  currentHomeGround: string;
  currentHomeGroundAddress: string;
  onUpdate: (data: {
    region?: string;
    district?: string;
    home_ground_name?: string;
    home_ground_address?: string;
  }) => void;
}

export function TeamSettingsModal({
  isOpen,
  onClose,
  teamId,
  currentRegion,
  currentDistrict,
  currentHomeGround,
  currentHomeGroundAddress,
  onUpdate,
}: TeamSettingsModalProps) {
  useBodyScrollLock(isOpen);
  const [region, setRegion] = useState(currentRegion || '');
  const [district, setDistrict] = useState(currentDistrict || '');
  const [homeGround, setHomeGround] = useState(currentHomeGround || '');
  const [homeGroundAddress, setHomeGroundAddress] = useState(currentHomeGroundAddress || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRegion(currentRegion || '');
      setDistrict(currentDistrict || '');
      setHomeGround(currentHomeGround || '');
      setHomeGroundAddress(currentHomeGroundAddress || '');
    }
  }, [isOpen, currentRegion, currentDistrict, currentHomeGround, currentHomeGroundAddress]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, string | null> = {
        region: region || null,
        district: district || null,
        home_ground_name: homeGround || null,
        home_ground_address: homeGroundAddress || null,
      };

      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId);

      if (error) throw error;

      onUpdate(updates);
      toast.success('팀 정보가 저장되었습니다!');
      onClose();
    } catch (err) {
      console.error('Failed to save team settings:', err);
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const openNaverMap = () => {
    if (homeGroundAddress) {
      window.open(`https://map.naver.com/v5/search/${encodeURIComponent(homeGroundAddress)}`, '_blank');
    } else if (homeGround) {
      window.open(`https://map.naver.com/v5/search/${encodeURIComponent(homeGround)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-card border-4 border-border-dark overflow-hidden max-h-[85vh] flex flex-col"
        style={{ boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
          <span className="font-pixel text-[10px]">⚙️ 팀 설정</span>
          <button onClick={onClose} className="hover:opacity-80">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto overscroll-contain flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* 활동 지역 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">📍 활동 지역</label>

            {/* 시/도 선택 */}
            <div className="flex flex-wrap gap-1 mb-2">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRegion(r); setDistrict(''); }}
                  className={`px-2 py-1 font-pixel text-[7px] border-2 transition-all ${
                    region === r
                      ? 'bg-primary text-primary-foreground border-primary-dark'
                      : 'bg-muted text-muted-foreground border-border-dark hover:border-primary/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* 구/군 선택 */}
            {region && regionData[region] && (
              <div className="bg-muted/50 border-2 border-border-dark p-2">
                <span className="font-pixel text-[7px] text-muted-foreground block mb-1.5">{region} 세부 지역</span>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {regionData[region].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDistrict(d)}
                      className={`px-2 py-1 font-pixel text-[7px] border transition-all flex items-center gap-0.5 ${
                        district === d
                          ? 'bg-primary text-primary-foreground border-primary-dark'
                          : 'bg-card text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {district === d && <Check size={8} />}
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {region && district && (
              <div className="mt-2 px-2 py-1.5 bg-primary/10 border border-primary/30 font-pixel text-[8px] text-primary">
                📍 {region} {district}
              </div>
            )}
          </div>

          {/* 활동 구장 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">🏟️ 활동 구장 (홈 그라운드)</label>
            <input
              type="text"
              value={homeGround}
              onChange={(e) => setHomeGround(e.target.value)}
              placeholder="구장 이름 (예: 강남 풋살파크)"
              className="w-full pixel-input mb-2"
            />
            <input
              type="text"
              value={homeGroundAddress}
              onChange={(e) => setHomeGroundAddress(e.target.value)}
              placeholder="구장 주소 (예: 서울 강남구 역삼동 123)"
              className="w-full pixel-input"
            />

            {/* 네이버 지도 미리보기 */}
            {(homeGround || homeGroundAddress) && (
              <button
                onClick={openNaverMap}
                className="w-full mt-2 py-2.5 bg-[#03C75A] text-white font-pixel text-[9px] border-2 border-[#02b351] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
              >
                <Navigation size={12} />
                네이버 지도에서 보기
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-border shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary text-primary-foreground font-pixel text-[10px] border-3 border-primary-dark hover:brightness-110 transition-all disabled:opacity-50"
            style={{ boxShadow: '3px 3px 0 hsl(var(--primary-dark))' }}
          >
            {saving ? '저장 중...' : '💾 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
