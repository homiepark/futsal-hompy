import { PixelCard } from '@/components/ui/PixelCard';

const moods = ['🔥', '😊', '💪', '⚽', '🎯'];

interface MoodDisplayProps {
  mood?: string;
  teamName?: string;
}

export function MoodDisplay({ mood = '🔥', teamName = 'FC 불꽃' }: MoodDisplayProps) {
  return (
    <PixelCard variant="decorated" className="text-center">
      <p className="font-pixel text-[11px] text-muted-foreground mb-2">오늘의 기분</p>
      <div className="text-4xl mb-2 animate-pixel-bounce">{mood}</div>
      <p className="font-pixel text-[10px] text-foreground">{teamName}</p>
    </PixelCard>
  );
}
