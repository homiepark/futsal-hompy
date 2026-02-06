import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';

interface ArchiveItem {
  id: string;
  imageUrl: string;
  isVideo?: boolean;
  date: string;
}

interface LatestArchiveProps {
  teamId: string;
  items: ArchiveItem[];
}

export function LatestArchive({ teamId, items }: LatestArchiveProps) {
  const displayItems = items.slice(0, 4);

  return (
    <PixelCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-[10px] text-foreground flex items-center gap-2">
          <span className="text-accent">📸</span>
          최근 아카이브
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {displayItems.map((item) => (
          <Link
            key={item.id}
            to={`/archive?team=${teamId}&post=${item.id}`}
            className="aspect-square relative border-2 border-border-dark overflow-hidden bg-muted hover:border-primary transition-colors group"
          >
            <img 
              src={item.imageUrl} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {item.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-6 h-6 bg-primary/90 border-2 border-primary-dark flex items-center justify-center">
                  <Play size={12} className="text-primary-foreground ml-0.5" />
                </div>
              </div>
            )}
          </Link>
        ))}
        {displayItems.length === 0 && (
          <div className="col-span-4 py-8 text-center">
            <p className="font-body text-sm text-muted-foreground">아직 아카이브가 없습니다</p>
            <p className="font-pixel text-[8px] text-muted-foreground mt-1">첫 번째 사진을 올려보세요!</p>
          </div>
        )}
      </div>

      {/* See More Archive Button */}
      <Link 
        to={`/archive?team=${teamId}`}
        className="block w-full py-3 bg-secondary border-4 border-border-dark text-center font-pixel text-[10px] text-foreground hover:bg-muted hover:border-primary transition-all shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_hsl(var(--pixel-shadow))]"
      >
        📷 아카이브 더보기
      </Link>
    </PixelCard>
  );
}
