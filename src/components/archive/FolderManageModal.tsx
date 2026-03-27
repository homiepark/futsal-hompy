import { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface Folder {
  id: string;
  name: string;
  emoji: string;
  isDefault?: boolean;
}

interface FolderManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onSave: (folders: Folder[]) => void;
}

const emojiOptions = ['📁', '⚽', '🏆', '🎯', '📸', '🎬', '🏃', '💪', '🔥', '⭐', '🎉', '📝'];

export function FolderManageModal({ isOpen, onClose, folders, onSave }: FolderManageModalProps) {
  const [editableFolders, setEditableFolders] = useState<Folder[]>(folders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFolder = () => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: '새 폴더',
      emoji: '📁',
    };
    setEditableFolders([...editableFolders, newFolder]);
    setEditingId(newFolder.id);
    setEditingName(newFolder.name);
  };

  const handleDeleteFolder = (id: string) => {
    const folder = editableFolders.find(f => f.id === id);
    if (folder?.isDefault) {
      toast.error('기본 폴더는 삭제할 수 없습니다');
      return;
    }
    setEditableFolders(editableFolders.filter(f => f.id !== id));
  };

  const handleStartEdit = (folder: Folder) => {
    if (folder.isDefault) {
      toast.error('기본 폴더는 수정할 수 없습니다');
      return;
    }
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast.error('폴더 이름을 입력해주세요');
      return;
    }
    setEditableFolders(editableFolders.map(f => 
      f.id === editingId ? { ...f, name: editingName.trim() } : f
    ));
    setEditingId(null);
    setEditingName('');
  };

  const handleEmojiSelect = (folderId: string, emoji: string) => {
    setEditableFolders(editableFolders.map(f => 
      f.id === folderId ? { ...f, emoji } : f
    ));
    setShowEmojiPicker(null);
  };

  const handleSave = () => {
    onSave(editableFolders);
    toast.success('폴더가 저장되었습니다');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm kairo-panel animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="kairo-panel-header justify-between">
          <div className="flex items-center gap-2">
            <span>📂</span>
            <span>폴더 관리</span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors"
          >
            <X size={12} className="text-primary-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
          {editableFolders.map((folder) => (
            <div 
              key={folder.id}
              className={cn(
                'flex items-center gap-2 p-2 bg-muted border-2 border-border-dark',
                folder.isDefault && 'opacity-60'
              )}
              style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.4)' }}
            >
              {/* Drag Handle */}
              <GripVertical size={14} className="text-muted-foreground cursor-grab" />

              {/* Emoji Selector */}
              <div className="relative">
                <button
                  onClick={() => !folder.isDefault && setShowEmojiPicker(showEmojiPicker === folder.id ? null : folder.id)}
                  className={cn(
                    'w-8 h-8 bg-secondary border-2 border-border-dark flex items-center justify-center text-lg',
                    !folder.isDefault && 'hover:border-primary cursor-pointer'
                  )}
                  disabled={folder.isDefault}
                >
                  {folder.emoji}
                </button>
                
                {/* Emoji Picker */}
                {showEmojiPicker === folder.id && (
                  <div className="absolute left-0 top-full mt-1 z-10 p-2 bg-card border-3 border-border-dark grid grid-cols-6 gap-1"
                    style={{ boxShadow: '3px 3px 0 hsl(var(--pixel-shadow))' }}
                  >
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(folder.id, emoji)}
                        className="w-7 h-7 hover:bg-primary/20 flex items-center justify-center text-base transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Folder Name */}
              <div className="flex-1 min-w-0">
                {editingId === folder.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    className="w-full px-2 py-1 bg-input border-2 border-primary font-pixel text-[9px] focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="font-pixel text-[9px] text-foreground truncate block">
                    {folder.name}
                    {folder.isDefault && (
                      <span className="ml-1 text-muted-foreground">(기본)</span>
                    )}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {editingId === folder.id ? (
                  <button
                    onClick={handleSaveEdit}
                    className="w-6 h-6 bg-primary border-2 border-primary-dark flex items-center justify-center hover:brightness-110 transition-colors"
                  >
                    <Check size={12} className="text-primary-foreground" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(folder)}
                      className={cn(
                        'w-6 h-6 border-2 border-border-dark flex items-center justify-center transition-colors',
                        folder.isDefault 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : 'bg-secondary hover:bg-primary hover:text-primary-foreground'
                      )}
                      disabled={folder.isDefault}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className={cn(
                        'w-6 h-6 border-2 border-border-dark flex items-center justify-center transition-colors',
                        folder.isDefault 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : 'bg-secondary hover:bg-destructive hover:text-destructive-foreground'
                      )}
                      disabled={folder.isDefault}
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Add Folder Button */}
          <button
            onClick={handleAddFolder}
            className="w-full py-2.5 border-3 border-dashed border-border-dark bg-muted/30 flex items-center justify-center gap-2 hover:border-primary hover:bg-muted transition-colors"
          >
            <Plus size={14} className="text-muted-foreground" />
            <span className="font-pixel text-[8px] text-muted-foreground">새 폴더 추가</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t-3 border-border-dark bg-muted/50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-secondary border-3 border-border-dark font-pixel text-[9px] text-foreground hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-primary border-3 border-primary-dark font-pixel text-[9px] text-primary-foreground hover:brightness-110 transition-all"
            style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
