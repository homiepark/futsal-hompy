import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MailIconProps {
  unreadCount?: number;
  hasBroadcast?: boolean;
  className?: string;
}

export function MailIcon({ unreadCount = 0, hasBroadcast = false, className }: MailIconProps) {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/messages')}
      className={cn(
        "relative w-9 h-9 bg-secondary border-2 border-border-dark flex items-center justify-center transition-transform hover:translate-y-[-2px]",
        hasBroadcast && "animate-mail-blink",
        className
      )}
      style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
      title="쪽지함"
    >
      {/* Envelope pixel art */}
      <div className="relative">
        <Mail size={16} className="text-foreground" />
        
        {/* Broadcast sparkle effect */}
        {hasBroadcast && (
          <>
            <span className="absolute -top-2 -left-1 text-[8px] animate-ping">✨</span>
            <span className="absolute -top-1 -right-2 text-[8px] animate-ping delay-150">✨</span>
          </>
        )}
      </div>
      
      {/* Unread badge */}
      {unreadCount > 0 && (
        <span 
          className={cn(
            "absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center text-[11px] font-pixel border",
            hasBroadcast 
              ? "bg-destructive text-destructive-foreground border-destructive animate-pulse" 
              : "bg-accent text-accent-foreground border-accent-dark"
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* Cyworld-style aggressive blink overlay for broadcasts */}
      {hasBroadcast && (
        <div className="absolute inset-0 border-2 border-accent animate-mail-ring pointer-events-none" />
      )}
    </button>
  );
}
