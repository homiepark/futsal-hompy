import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Folder {
  id: string;
  name: string;
  emoji: string;
  isDefault?: boolean;
}

interface ArchiveFolderTabsProps {
  folders: Folder[];
  selectedFolder: string;
  onSelect: (folderId: string) => void;
  isAdmin?: boolean;
  onManageFolders?: () => void;
}

export function ArchiveFolderTabs({ 
  folders, 
  selectedFolder, 
  onSelect, 
  isAdmin,
  onManageFolders 
}: ArchiveFolderTabsProps) {
  return (
    <div className="relative">
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onSelect(folder.id)}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 border-2 font-pixel text-[11px] transition-all whitespace-nowrap',
            selectedFolder === folder.id
              ? 'bg-primary border-primary-dark text-primary-foreground'
              : 'bg-muted border-border-dark text-foreground hover:border-primary'
          )}
          style={{ 
            boxShadow: selectedFolder === folder.id 
              ? '2px 2px 0 hsl(var(--primary-dark))' 
              : '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' 
          }}
        >
          <span className="mr-1">{folder.emoji}</span>
          {folder.name}
        </button>
      ))}
      
      {/* Admin: Manage Folders Button */}
      {isAdmin && onManageFolders && (
        <button
          onClick={onManageFolders}
          className="flex-shrink-0 w-8 h-8 bg-accent border-2 border-accent-dark flex items-center justify-center hover:brightness-110 transition-all"
          style={{ boxShadow: '2px 2px 0 hsl(var(--accent-dark))' }}
          title="폴더 관리"
        >
          <Settings size={14} className="text-accent-foreground" />
        </button>
      )}
    </div>
    </div>
  );
}
