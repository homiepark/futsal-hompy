import { cn } from '@/lib/utils';

interface PixelEnvelopeIconProps {
  hasUnread?: boolean;
  unreadCount?: number;
  size?: number;
  className?: string;
}

export function PixelEnvelopeIcon({ hasUnread = false, unreadCount = 0, size = 4, className }: PixelEnvelopeIconProps) {
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center bg-card/95 backdrop-blur-sm border-3 border-border-dark shadow-[3px_3px_0_hsl(var(--pixel-shadow))] hover:bg-card transition-colors cursor-pointer',
        className
      )}
      style={{
        width: size * 12,
        height: size * 10,
      }}
    >
      {/* Envelope body */}
      <div 
        className="absolute"
        style={{
          width: size * 10,
          height: size * 6,
          bottom: size * 1.5,
          backgroundColor: 'hsl(45 80% 75%)',
          border: '2px solid hsl(35 60% 45%)',
          borderRadius: '2px',
        }}
      />
      
      {/* Envelope flap */}
      <div 
        className="absolute"
        style={{
          width: 0,
          height: 0,
          top: size * 1.5,
          borderLeft: `${size * 5}px solid transparent`,
          borderRight: `${size * 5}px solid transparent`,
          borderTop: `${size * 3}px solid hsl(45 80% 65%)`,
        }}
      />
      
      {/* Envelope flap border */}
      <div 
        className="absolute"
        style={{
          width: 0,
          height: 0,
          top: size * 1,
          borderLeft: `${size * 5.5}px solid transparent`,
          borderRight: `${size * 5.5}px solid transparent`,
          borderTop: `${size * 3.5}px solid hsl(35 60% 45%)`,
        }}
      />

      {/* Unread badge */}
      {hasUnread && unreadCount > 0 && (
        <div 
          className="absolute flex items-center justify-center bg-accent border-2 border-accent-dark text-accent-foreground"
          style={{
            top: -size * 1.5,
            right: -size * 1.5,
            width: size * 5,
            height: size * 5,
            fontSize: size * 2.5,
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
}
