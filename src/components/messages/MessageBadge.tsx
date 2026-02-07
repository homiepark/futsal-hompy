import { cn } from '@/lib/utils';

type BadgeType = 'team' | 'personal' | 'broadcast' | 'inquiry';

interface MessageBadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeConfig: Record<BadgeType, { label: string; emoji: string; colors: string }> = {
  team: {
    label: '팀',
    emoji: '📢',
    colors: 'bg-primary/20 text-primary border-primary',
  },
  personal: {
    label: '개인',
    emoji: '💬',
    colors: 'bg-accent/20 text-accent border-accent',
  },
  broadcast: {
    label: '공지',
    emoji: '📢',
    colors: 'bg-destructive/20 text-destructive border-destructive',
  },
  inquiry: {
    label: '팀 문의',
    emoji: '🏷️',
    colors: 'bg-secondary text-foreground border-border-dark',
  },
};

export function MessageBadge({ type, className }: MessageBadgeProps) {
  const config = badgeConfig[type];
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-pixel border-2 uppercase",
        config.colors,
        className
      )}
      style={{ boxShadow: '1px 1px 0 hsl(var(--pixel-shadow))' }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

// Helper function to determine message type
export function getMessageType(content: string, teamId?: string | null): BadgeType {
  if (content.startsWith('[📢 팀 공지]')) return 'broadcast';
  if (content.startsWith('[팀 문의]')) return 'inquiry';
  if (teamId) return 'team';
  return 'personal';
}
