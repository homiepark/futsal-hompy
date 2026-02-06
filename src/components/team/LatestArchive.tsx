import { Link } from 'react-router-dom';
import { ChevronRight, Play } from 'lucide-react';
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
        <Link 
          to={`/archive?team=${teamId}`}
          className="flex items-center gap-1 text-primary font-body text-xs hover:underline"
        >
          더보기
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2">
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
    </PixelCard>
  );
}
