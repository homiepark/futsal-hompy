import { Trophy } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface WinsCounterProps {
  wins: number;
}

export function WinsCounter({ wins = 42 }: WinsCounterProps) {
  return (
    <PixelCard className="flex items-center gap-3">
      <PixelIcon icon={Trophy} variant="accent" size="lg" />
      <div>
        <p className="font-pixel text-[8px] text-muted-foreground">총 승리</p>
        <p className="font-pixel text-2xl text-accent text-pixel-shadow">{wins}</p>
      </div>
    </PixelCard>
  );
}
