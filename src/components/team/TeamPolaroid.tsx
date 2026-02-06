import { Camera } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';

interface TeamPolaroidProps {
  imageUrl?: string;
  caption?: string;
}

export function TeamPolaroid({ 
  imageUrl, 
  caption = '2024.01.15 우승 기념!' 
}: TeamPolaroidProps) {
  return (
    <PixelCard variant="frame" className="max-w-xs mx-auto">
      <div className="aspect-square bg-muted flex items-center justify-center mb-3 border-2 border-border-dark">
        {imageUrl ? (
          <img src={imageUrl} alt="팀 사진" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="font-pixel text-[8px] text-muted-foreground">팀 사진을 추가하세요</p>
          </div>
        )}
      </div>
      <p className="font-body text-sm text-center text-foreground">{caption}</p>
      <div className="flex justify-center gap-1 mt-2">
        <span className="text-accent animate-sparkle">✦</span>
        <span className="text-primary animate-sparkle" style={{ animationDelay: '0.5s' }}>✦</span>
        <span className="text-accent animate-sparkle" style={{ animationDelay: '1s' }}>✦</span>
      </div>
    </PixelCard>
  );
}
