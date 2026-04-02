import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface HomeGroundSelectorProps {
  groundName: string;
  groundAddress: string;
  onGroundNameChange: (name: string) => void;
  onGroundAddressChange: (address: string) => void;
}

export function HomeGroundSelector({
  groundName,
  groundAddress,
  onGroundNameChange,
  onGroundAddressChange,
}: HomeGroundSelectorProps) {
  return (
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">🏟️</span>
        <span>주 훈련 구장</span>
      </div>
      <div className="p-3 space-y-2">
        <input
          type="text"
          value={groundName}
          onChange={(e) => onGroundNameChange(e.target.value)}
          placeholder="구장 이름 (예: 잠앤조이 풋살파크)"
          className="w-full pixel-input"
        />
        <input
          type="text"
          value={groundAddress}
          onChange={(e) => onGroundAddressChange(e.target.value)}
          placeholder="주소 직접 입력 또는 아래 검색 이용"
          className="w-full pixel-input"
        />

        <div className="flex gap-2">
          {/* 구장 이름으로 네이버 지도 검색 */}
          <button
            type="button"
            onClick={() => {
              const query = groundName || groundAddress;
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
                  onGroundAddressChange(data.roadAddress || data.jibunAddress || data.address);
                  if (!groundName && data.buildingName) {
                    onGroundNameChange(data.buildingName);
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

        <p className="font-pixel text-[8px] text-muted-foreground">
          💡 구장 이름만 입력해도 OK! 주소는 선택사항이에요
        </p>
      </div>
    </div>
  );
}
