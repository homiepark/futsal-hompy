import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, ChevronUp, ChevronDown } from 'lucide-react';
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

const emojiOptions = ['📁', '⚽', '🏆', '🎯', '📸', '🎬', '🏃', '💪', '🔥', '⭐', '🎉', '📝', '🥅', '👕', '🏅', '📋'];

export function FolderManageModal({ isOpen, onClose, folders, onSave }: FolderManageModalProps) {
  useBodyScrollLock(isOpen);
  const [editableFolders, setEditableFolders] = useState<Folder[]>(folders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [emojiPickerId, setEmojiPickerId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditableFolders(folders);
      setEditingId(null);
      setEditingName('');
      setEmojiPickerId(null);
    }
  }, [isOpen, folders]);

  if (!isOpen) return null;

  const isLocked = (folder: Folder) => folder.id === 'all';

  const handleAddFolder = () => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: '새 폴더',
      emoji: '📁',
    };
    setEditableFolders([...editableFolders, newFolder]);
    setEditingId(newFolder.id);
    setEditingName(newFolder.name);
    setEmojiPickerId(null);
  };

  const handleDeleteFolder = (id: string) => {
    if (isLocked(editableFolders.find(f => f.id === id)!)) {
      toast.error('전체보기 폴더는 삭제할 수 없습니다');
      return;
    }
    setEditableFolders(editableFolders.filter(f => f.id !== id));
    if (editingId === id) setEditingId(null);
    if (emojiPickerId === id) setEmojiPickerId(null);
  };

  const handleStartEdit = (folder: Folder) => {
    if (isLocked(folder)) {
      toast.error('전체보기 폴더는 수정할 수 없습니다');
      return;
    }
    setEditingId(folder.id);
    setEditingName(folder.name);
    setEmojiPickerId(null);
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
    setEmojiPickerId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0 || isLocked(editableFolders[index - 1])) return;
    const newFolders = [...editableFolders];
    [newFolders[index - 1], newFolders[index]] = [newFolders[index], newFolders[index - 1]];
    setEditableFolders(newFolders);
  };

  const handleMoveDown = (index: number) => {
    if (index >= editableFolders.length - 1) return;
    const newFolders = [...editableFolders];
    [newFolders[index], newFolders[index + 1]] = [newFolders[index + 1], newFolders[index]];
    setEditableFolders(newFolders);
  };

  const handleSave = () => {
    let finalFolders = editableFolders;
    if (editingId && editingName.trim()) {
      finalFolders = editableFolders.map(f =>
        f.id === editingId ? { ...f, name: editingName.trim() } : f
      );
    }
    setEditingId(null);
    setEditingName('');
    onSave(finalFolders);
    toast.success('폴더가 저장되었습니다');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm kairo-panel animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="kairo-panel-header justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>📂</span>
            <span>폴더 관리</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-primary-dark/50 hover:bg-destructive transition-colors">
            <X size={14} className="text-primary-foreground" />
          </button>
        </div>

        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          {editableFolders.map((folder, index) => {
            const locked = isLocked(folder);
            return (
              <div key={folder.id}>
                <div
                  className={cn(
                    'flex items-center gap-2 p-2.5 bg-muted border-2 border-border-dark',
                    locked && 'opacity-50'
                  )}
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.4)' }}
                >
                  {/* Move Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={locked || index === 0 || isLocked(editableFolders[index - 1])}
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={locked || index === editableFolders.length - 1}
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Emoji Button */}
                  <button
                    onClick={() => {
                      if (locked) return;
                      setEmojiPickerId(emojiPickerId === folder.id ? null : folder.id);
                    }}
                    className={cn(
                      'w-10 h-10 bg-secondary border-2 border-border-dark flex items-center justify-center text-xl flex-shrink-0',
                      !locked && 'hover:border-primary cursor-pointer active:scale-95'
                    )}
                    disabled={locked}
                  >
                    {folder.emoji}
                  </button>

                  {/* Folder Name */}
                  <div className="flex-1 min-w-0">
                    {editingId === folder.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="w-full px-2 py-1.5 bg-input border-2 border-primary font-pixel text-[11px] focus:outline-none"
                        maxLength={20}
                        autoFocus
                      />
                    ) : (
                      <span className="font-pixel text-[11px] text-foreground truncate block">
                        {folder.name}
                        {locked && <span className="ml-1 text-muted-foreground">(기본)</span>}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {editingId === folder.id ? (
                      <button onClick={handleSaveEdit}
                        className="w-8 h-8 bg-primary border-2 border-primary-dark flex items-center justify-center hover:brightness-110">
                        <Check size={14} className="text-primary-foreground" />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleStartEdit(folder)}
                          className={cn('w-8 h-8 border-2 border-border-dark flex items-center justify-center',
                            locked ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-secondary hover:bg-primary hover:text-primary-foreground'
                          )} disabled={locked}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteFolder(folder.id)}
                          className={cn('w-8 h-8 border-2 border-border-dark flex items-center justify-center',
                            locked ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-secondary hover:bg-destructive hover:text-destructive-foreground'
                          )} disabled={locked}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Emoji Picker */}
                {emojiPickerId === folder.id && (
                  <div className="mt-1 p-2.5 bg-card border-2 border-primary rounded grid grid-cols-8 gap-1.5"
                    style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                  >
                    {emojiOptions.map((emoji) => (
                      <button key={emoji} onClick={() => handleEmojiSelect(folder.id, emoji)}
                        className={cn(
                          'w-9 h-9 flex items-center justify-center text-lg rounded transition-colors',
                          folder.emoji === emoji ? 'bg-primary/20 border-2 border-primary' : 'hover:bg-muted active:scale-95'
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button onClick={handleAddFolder}
            className="w-full py-3 border-3 border-dashed border-border-dark bg-muted/30 flex items-center justify-center gap-2 hover:border-primary hover:bg-muted transition-colors">
            <Plus size={16} className="text-muted-foreground" />
            <span className="font-pixel text-[10px] text-muted-foreground">새 폴더 추가</span>
          </button>
        </div>

        <div className="p-3 border-t-3 border-border-dark bg-muted/50 flex gap-2 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-secondary border-3 border-border-dark font-pixel text-[10px] text-foreground hover:bg-muted transition-colors"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}>
            취소
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 bg-primary border-3 border-primary-dark font-pixel text-[10px] text-primary-foreground hover:brightness-110 transition-all"
            style={{ boxShadow: '2px 2px 0 hsl(var(--primary-dark))' }}>
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
