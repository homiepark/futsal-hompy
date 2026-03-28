import { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Check } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { regionData, regions, genderOptions, GenderValue, trainingDays, DayValue, timeOptions } from '@/lib/teamData';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  currentRegion: string;
  currentDistrict: string;
  currentLevel: string;
  currentHomeGround: string;
  currentHomeGroundAddress: string;
  currentGender: string;
  currentTrainingDays: string[];
  currentTrainingStartTime: string;
  currentTrainingEndTime: string;
  currentIntroduction: string;
  currentInstagramUrl: string;
  currentYoutubeUrl: string;
  currentEmblem: string;
  onUpdate: (data: Record<string, any>) => void;
}

export function TeamSettingsModal({
  isOpen,
  onClose,
  teamId,
  currentRegion,
  currentDistrict,
  currentLevel,
  currentHomeGround,
  currentHomeGroundAddress,
  currentGender,
  currentTrainingDays,
  currentTrainingStartTime,
  currentTrainingEndTime,
  currentIntroduction,
  currentInstagramUrl,
  currentYoutubeUrl,
  currentEmblem,
  onUpdate,
}: TeamSettingsModalProps) {
  useBodyScrollLock(isOpen);
  const [region, setRegion] = useState(currentRegion || '');
  const [district, setDistrict] = useState(currentDistrict || '');
  const [level, setLevel] = useState(currentLevel || '1');
  const [homeGround, setHomeGround] = useState(currentHomeGround || '');
  const [homeGroundAddress, setHomeGroundAddress] = useState(currentHomeGroundAddress || '');
  const [gender, setGender] = useState<GenderValue>((currentGender as GenderValue) || 'mixed');
  const [selectedDays, setSelectedDays] = useState<DayValue[]>(currentTrainingDays as DayValue[] || []);
  const [trainingStartTime, setTrainingStartTime] = useState(currentTrainingStartTime || '');
  const [trainingEndTime, setTrainingEndTime] = useState(currentTrainingEndTime || '');
  const [introduction, setIntroduction] = useState(currentIntroduction || '');
  const [instagramUrl, setInstagramUrl] = useState(currentInstagramUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(currentYoutubeUrl || '');
  const [emblem, setEmblem] = useState(currentEmblem || '⚽');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRegion(currentRegion || '');
      setDistrict(currentDistrict || '');
      setLevel(currentLevel || '1');
      setHomeGround(currentHomeGround || '');
      setHomeGroundAddress(currentHomeGroundAddress || '');
      setGender((currentGender as GenderValue) || 'mixed');
      setSelectedDays(currentTrainingDays as DayValue[] || []);
      setTrainingStartTime(currentTrainingStartTime || '');
      setTrainingEndTime(currentTrainingEndTime || '');
      setIntroduction(currentIntroduction || '');
      setInstagramUrl(currentInstagramUrl || '');
      setYoutubeUrl(currentYoutubeUrl || '');
      setEmblem(currentEmblem || '⚽');
    }
  }, [isOpen, currentRegion, currentDistrict, currentLevel, currentHomeGround, currentHomeGroundAddress, currentGender, currentTrainingDays, currentTrainingStartTime, currentTrainingEndTime, currentIntroduction, currentInstagramUrl, currentYoutubeUrl, currentEmblem]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        region: region || null,
        district: district || null,
        level: level,
        home_ground_name: homeGround || null,
        home_ground_address: homeGroundAddress || null,
        gender: gender || null,
        training_days: selectedDays,
        training_start_time: trainingStartTime || null,
        training_end_time: trainingEndTime || null,
        introduction: introduction || null,
        instagram_url: instagramUrl || null,
        youtube_url: youtubeUrl || null,
        emblem: emblem || '⚽',
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

          {/* 팀 레벨 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">🏅 팀 레벨</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { lv: '1', name: '풋린이', emoji: '🌱', desc: '풋살을 막 시작한 팀' },
                { lv: '2', name: '풋내기', emoji: '⚽', desc: '기본기가 갖춰진 팀' },
                { lv: '3', name: '풋살러', emoji: '🔥', desc: '경험 많은 팀' },
                { lv: '4', name: '풋살왕', emoji: '👑', desc: '대회 수준의 경기력' },
              ].map(opt => (
                <button
                  key={opt.lv}
                  type="button"
                  onClick={() => setLevel(opt.lv)}
                  className={`p-2.5 border-2 text-left transition-all flex items-center gap-2 ${
                    level === opt.lv
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-card border-border-dark text-foreground hover:border-primary/50'
                  }`}
                  style={{ boxShadow: level === opt.lv ? '2px 2px 0 hsl(var(--primary-dark) / 0.3)' : '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <span className="font-pixel text-[9px] block">LV.{opt.lv} {opt.name}</span>
                    <span className="font-pixel text-[6px] text-muted-foreground">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 활동 구장 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">🏟️ 활동 구장 (홈 그라운드)</label>
            <input
              type="text"
              value={homeGround}
              onChange={(e) => setHomeGround(e.target.value)}
              placeholder="구장 이름 (예: 잠앤조이 풋살파크)"
              className="w-full pixel-input mb-2"
            />
            <input
              type="text"
              value={homeGroundAddress}
              onChange={(e) => setHomeGroundAddress(e.target.value)}
              placeholder="주소 직접 입력 또는 아래 검색 이용"
              className="w-full pixel-input mb-2"
            />

            {/* 검색 버튼 2개 */}
            <div className="flex gap-2">
              {/* 구장 이름으로 네이버 지도 검색 */}
              <button
                type="button"
                onClick={() => {
                  const query = homeGround || homeGroundAddress;
                  if (!query) {
                    toast.error('구장 이름을 먼저 입력해주세요');
                    return;
                  }
                  window.open(`https://map.naver.com/v5/search/${encodeURIComponent(query + ' 풋살')}`, '_blank');
                }}
                className="flex-1 py-2 bg-[#03C75A] text-white font-pixel text-[8px] border-2 border-[#02b351] hover:brightness-110 transition-all flex items-center justify-center gap-1"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
              >
                <Navigation size={10} />
                구장 이름으로 찾기
              </button>

              {/* 도로명 주소 검색 */}
              <button
                type="button"
                onClick={() => {
                  const daum = (window as any).daum;
                  if (!daum?.Postcode) {
                    toast.error('주소 검색을 불러오는 중입니다');
                    return;
                  }
                  new daum.Postcode({
                    oncomplete: (data: any) => {
                      setHomeGroundAddress(data.roadAddress || data.jibunAddress || data.address);
                      if (!homeGround && data.buildingName) {
                        setHomeGround(data.buildingName);
                      }
                    },
                  }).open();
                }}
                className="flex-1 py-2 bg-secondary text-foreground font-pixel text-[8px] border-2 border-border-dark hover:bg-muted transition-all flex items-center justify-center gap-1"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
              >
                <MapPin size={10} />
                도로명 주소 검색
              </button>
            </div>

            <p className="font-pixel text-[6px] text-muted-foreground mt-1.5">
              💡 구장 이름만 입력해도 OK! 주소는 선택사항이에요
            </p>
          </div>

          {/* 엠블럼 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">🎨 엠블럼 (이모지)</label>
            <input
              type="text"
              value={emblem}
              onChange={(e) => setEmblem(e.target.value)}
              placeholder="⚽"
              className="w-20 pixel-input text-center text-lg"
              maxLength={4}
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">👫 성별</label>
            <div className="flex gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value as GenderValue)}
                  className={`flex-1 py-2 font-pixel text-[9px] border-2 transition-all ${
                    gender === opt.value
                      ? 'bg-primary text-primary-foreground border-primary-dark'
                      : 'bg-card text-foreground border-border-dark hover:border-primary/50'
                  }`}
                  style={{ boxShadow: gender === opt.value ? '2px 2px 0 hsl(var(--primary-dark) / 0.3)' : '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 활동 요일 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">📅 활동 요일</label>
            <div className="flex gap-1">
              {trainingDays.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      setSelectedDays(prev =>
                        isSelected ? prev.filter(d => d !== day.value) : [...prev, day.value]
                      );
                    }}
                    className={`w-9 h-9 font-pixel text-[9px] border-2 transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary-dark'
                        : 'bg-card text-foreground border-border-dark hover:border-primary/50'
                    }`}
                    style={{ boxShadow: isSelected ? '2px 2px 0 hsl(var(--primary-dark) / 0.3)' : '1px 1px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 훈련 시간 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">🕐 훈련 시간</label>
            <div className="flex items-center gap-2">
              <select
                value={trainingStartTime}
                onChange={(e) => setTrainingStartTime(e.target.value)}
                className="flex-1 pixel-input font-pixel text-[8px]"
              >
                <option value="">시작 시간</option>
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="font-pixel text-[9px] text-muted-foreground">~</span>
              <select
                value={trainingEndTime}
                onChange={(e) => setTrainingEndTime(e.target.value)}
                className="flex-1 pixel-input font-pixel text-[8px]"
              >
                <option value="">종료 시간</option>
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 팀 소개 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">📝 팀 소개</label>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="팀을 소개해주세요"
              className="w-full pixel-input h-20 resize-none font-pixel text-[8px]"
              maxLength={500}
            />
            <p className="font-pixel text-[6px] text-muted-foreground text-right">{introduction.length}/500</p>
          </div>

          {/* SNS 링크 */}
          <div>
            <label className="font-pixel text-[9px] text-foreground mb-2 block">🔗 SNS 링크</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">📸</span>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="인스타그램 URL"
                  className="w-full pixel-input font-pixel text-[8px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">▶️</span>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="유튜브 URL"
                  className="w-full pixel-input font-pixel text-[8px]"
                />
              </div>
            </div>
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
