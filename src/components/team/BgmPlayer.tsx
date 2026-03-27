import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
}

interface BgmPlayerProps {
  tracks?: Track[];
  teamName?: string;
}

const defaultTracks: Track[] = [
  { id: '1', title: 'We Are The Champions', artist: 'Queen' },
  { id: '2', title: 'Eye of the Tiger', artist: 'Survivor' },
  { id: '3', title: 'Wavin\' Flag', artist: 'K\'naan' },
];

export function BgmPlayer({ tracks = defaultTracks, teamName }: BgmPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const track = tracks[currentTrack];

  const handlePrev = () => {
    setCurrentTrack(prev => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleNext = () => {
    setCurrentTrack(prev => (prev + 1) % tracks.length);
  };

  return (
    <div className="bg-card border-3 border-border-dark overflow-hidden"
      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-2.5 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Music size={10} />
          <span className="font-pixel text-[8px]">BGM</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-pixel text-[8px] hover:opacity-80"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Mini Player */}
      <div className="px-2.5 py-2 flex items-center gap-2">
        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="w-6 h-6 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
            style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
          >
            <SkipBack size={10} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 bg-accent text-accent-foreground border-2 border-accent-dark flex items-center justify-center hover:brightness-110 transition-all"
            style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>
          <button
            onClick={handleNext}
            className="w-6 h-6 bg-secondary border-2 border-border-dark flex items-center justify-center hover:bg-muted transition-colors"
            style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
          >
            <SkipForward size={10} />
          </button>
        </div>

        {/* Track Info - Marquee */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className={`${isPlaying ? 'animate-marquee' : ''} whitespace-nowrap`}>
            <span className="font-pixel text-[8px] text-foreground">
              ♪ {track.title}
            </span>
            <span className="font-pixel text-[8px] text-muted-foreground ml-2">
              - {track.artist}
            </span>
            {isPlaying && (
              <>
                <span className="font-pixel text-[8px] text-foreground ml-8">
                  ♪ {track.title}
                </span>
                <span className="font-pixel text-[8px] text-muted-foreground ml-2">
                  - {track.artist}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Volume */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      </div>

      {/* Expanded Track List */}
      {isExpanded && (
        <div className="border-t-2 border-border px-2.5 py-2 space-y-1">
          {tracks.map((t, i) => (
            <button
              key={t.id}
              onClick={() => { setCurrentTrack(i); setIsPlaying(true); }}
              className={`w-full text-left px-2 py-1.5 flex items-center gap-2 transition-colors ${
                i === currentTrack
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-muted border border-transparent'
              }`}
            >
              <span className="font-pixel text-[8px] text-accent w-3">
                {i === currentTrack && isPlaying ? '▶' : `${i + 1}`}
              </span>
              <span className={`font-pixel text-[8px] truncate ${
                i === currentTrack ? 'text-primary' : 'text-foreground'
              }`}>
                {t.title}
              </span>
              <span className="font-pixel text-[7px] text-muted-foreground ml-auto shrink-0">
                {t.artist}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
