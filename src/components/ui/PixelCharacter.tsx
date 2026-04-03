/**
 * Pixel art character components for the futsal app
 * CSS-based pixel art characters for decorative use
 */

interface PixelCharacterProps {
  type?: 'player' | 'goalkeeper' | 'referee' | 'cheerleader' | 'ball';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
};

const characters = {
  player: '🏃‍♂️',
  goalkeeper: '🧤',
  referee: '🙋‍♂️',
  cheerleader: '📣',
  ball: '⚽',
};

export function PixelCharacter({ type = 'player', size = 'md', className = '', animate = false }: PixelCharacterProps) {
  return (
    <span
      className={`inline-block ${sizeMap[size]} ${animate ? 'animate-pixel-bounce' : ''} ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {characters[type]}
    </span>
  );
}

/** Decorative pixel scene - a small futsal field with characters */
export function PixelFutsalScene({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Field */}
      <div
        className="w-full h-20 bg-field-green border-2 border-border-dark relative"
        style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
      >
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 border-white/40 rounded-full" />
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white/40" />

        {/* Players */}
        <span className="absolute top-2 left-[20%] text-lg animate-pixel-bounce" style={{ animationDelay: '0s' }}>⚽</span>
        <span className="absolute top-3 left-[35%] text-xl animate-pixel-bounce" style={{ animationDelay: '0.2s' }}>🏃</span>
        <span className="absolute top-1 left-[55%] text-xl animate-pixel-bounce" style={{ animationDelay: '0.4s' }}>🏃‍♂️</span>
        <span className="absolute top-4 left-[75%] text-lg animate-pixel-bounce" style={{ animationDelay: '0.6s' }}>🧤</span>
      </div>
    </div>
  );
}

/** Empty state with pixel character */
export function PixelEmptyState({
  message,
  subMessage,
  character = 'ball',
}: {
  message: string;
  subMessage?: string;
  character?: keyof typeof characters;
}) {
  return (
    <div className="text-center py-8">
      <div className="text-5xl mb-3 animate-pixel-bounce">
        {characters[character]}
      </div>
      <p className="font-pixel text-[10px] text-muted-foreground">{message}</p>
      {subMessage && (
        <p className="font-pixel text-[11px] text-muted-foreground mt-1">{subMessage}</p>
      )}
    </div>
  );
}

/** Pixel mascot for loading states */
export function PixelLoadingMascot({ message = '로딩 중...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="relative">
        <span className="text-4xl animate-bounce inline-block">⚽</span>
        <span className="absolute -top-1 -right-3 text-lg animate-sparkle">✨</span>
      </div>
      <p className="font-pixel text-[10px] text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

/** Pixel trophy decoration for headers */
export function PixelTrophyBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <span className="text-lg">🏆</span>
      <span className="font-pixel text-[9px] text-foreground">{text}</span>
      <span className="text-lg">🏆</span>
    </div>
  );
}
