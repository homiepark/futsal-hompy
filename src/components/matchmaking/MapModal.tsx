import { MapPin, ExternalLink, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PixelButton } from '@/components/ui/PixelButton';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  groundName: string;
  groundAddress: string;
  teamName?: string;
  teamEmblem?: string;
}

export function MapModal({
  isOpen,
  onClose,
  groundName,
  groundAddress,
  teamName,
  teamEmblem,
}: MapModalProps) {
  // Create a Kakao Map or Google Maps link for external navigation
  const getMapUrl = () => {
    const encodedAddress = encodeURIComponent(groundAddress || groundName);
    // Kakao Map search URL
    return `https://map.kakao.com/link/search/${encodedAddress}`;
  };

  const getNaverMapUrl = () => {
    const encodedAddress = encodeURIComponent(groundAddress || groundName);
    return `https://map.naver.com/v5/search/${encodedAddress}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-sm mx-4 bg-card border-4 border-border-dark p-0 overflow-hidden"
        style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
      >
        <DialogHeader className="bg-field-green border-b-4 border-border-dark p-4">
          <DialogTitle className="font-pixel text-[11px] text-foreground flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            홈 구장 위치
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Team Info */}
          {teamName && (
            <div className="flex items-center gap-3 p-3 bg-secondary border-3 border-border-dark" style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}>
              <div className="w-10 h-10 bg-field-green border-2 border-primary-dark flex items-center justify-center">
                <span className="text-lg">{teamEmblem || '⚽'}</span>
              </div>
              <div>
                <p className="font-pixel text-[10px] text-foreground">{teamName}</p>
                <p className="font-pixel text-[11px] text-muted-foreground">홈 구장</p>
              </div>
            </div>
          )}

          {/* Location Info */}
          <div 
            className="bg-primary/10 border-3 border-primary p-4"
            style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
          >
            {/* Pixel Art Map Placeholder */}
            <div 
              className="h-32 bg-muted border-3 border-border-dark mb-3 flex flex-col items-center justify-center"
              style={{ 
                backgroundImage: `
                  linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
                  linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, hsl(var(--border)) 75%),
                  linear-gradient(-45deg, transparent 75%, hsl(var(--border)) 75%)
                `,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
              }}
            >
              <div className="w-12 h-12 bg-primary border-3 border-primary-dark flex items-center justify-center mb-2" style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}>
                <MapPin size={24} className="text-primary-foreground" />
              </div>
              <p className="font-pixel text-[11px] text-muted-foreground">
                아래 버튼으로 지도 앱에서 확인하세요
              </p>
            </div>

            {/* Ground Details */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-pixel text-[9px] text-muted-foreground w-12 flex-shrink-0">구장명</span>
                <span className="font-pixel text-[10px] text-foreground">{groundName}</span>
              </div>
              {groundAddress && (
                <div className="flex items-start gap-2">
                  <span className="font-pixel text-[9px] text-muted-foreground w-12 flex-shrink-0">주소</span>
                  <span className="font-pixel text-[9px] text-foreground">{groundAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Map App Links */}
          <div className="space-y-2">
            <p className="font-pixel text-[11px] text-muted-foreground text-center">
              지도 앱에서 위치 확인
            </p>
            <div className="flex gap-2">
              <a
                href={getMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <PixelButton
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1"
                >
                  <ExternalLink size={10} />
                  카카오맵
                </PixelButton>
              </a>
              <a
                href={getNaverMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <PixelButton
                  type="button"
                  variant="accent"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1"
                >
                  <ExternalLink size={10} />
                  네이버지도
                </PixelButton>
              </a>
            </div>
          </div>

          {/* Close Button */}
          <PixelButton
            type="button"
            variant="default"
            size="sm"
            className="w-full"
            onClick={onClose}
          >
            닫기
          </PixelButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
