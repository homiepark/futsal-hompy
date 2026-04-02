import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

interface ArchiveItem {
  id: string;
  imageUrl: string;
  content?: string;
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
    <div className="kairo-panel">
      <div className="kairo-panel-header">
        <span className="text-sm">📸</span>
        <span>팀 스토리</span>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              to={`/archive?team=${teamId}&post=${item.id}`}
              className="kairo-grid-item aspect-square group overflow-hidden"
            >
              {item.imageUrl ? (
                <>
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-5 h-5 bg-primary/90 border-2 border-primary-dark flex items-center justify-center">
                        <Play size={10} className="text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-card p-1.5 flex flex-col justify-between">
                  <p className="font-body text-[8px] text-foreground leading-tight line-clamp-4 overflow-hidden">
                    {item.content || ''}
                  </p>
                  <span className="font-pixel text-[7px] text-muted-foreground">📝</span>
                </div>
              )}
            </Link>
          ))}
          {displayItems.length === 0 && (
            <div className="col-span-4 py-6 text-center">
              <p className="font-pixel text-[9px] text-muted-foreground">아직 스토리가 없습니다</p>
            </div>
          )}
        </div>

        <Link
          to={`/archive?team=${teamId}`}
          className="block w-full py-2 bg-accent text-accent-foreground text-center font-pixel text-[9px] uppercase border-3 border-accent-dark hover:brightness-110 transition-all active:translate-y-0.5"
          style={{
            boxShadow: '2px 2px 0 hsl(var(--accent-dark)), inset -1px -1px 0 hsl(var(--accent-dark) / 0.4), inset 1px 1px 0 hsl(0 0% 100% / 0.3)'
          }}
        >
          📷 더보기
        </Link>
      </div>
    </div>
  );
}
