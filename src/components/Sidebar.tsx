import { useRef, useEffect } from 'preact/hooks';
import { Hash, Sidebar as SidebarIcon } from 'lucide-preact';
import { getTagColor } from '../utils/colors';

interface SidebarProps {
  show: boolean;
  activeTag: string | null;
  searchQuery: string;
  tags: { name: string; count: number }[];
  colorMode: boolean;
  editingTag: string | null;
  editValue: string;
  onSelectTag: (tag: string | null) => void;
  onStartEditing: (tag: string) => void;
  onEditChange: (val: string) => void;
  onRename: () => void;
  onEditKeyDown: (e: KeyboardEvent) => void;
}

export function Sidebar({
  show, activeTag, searchQuery, tags, colorMode, editingTag, editValue,
  onSelectTag, onStartEditing, onEditChange, onRename, onEditKeyDown
}: SidebarProps) {
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTag && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTag]);

  return (
    <div className={`${show ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300 ease-in-out bg-sidebar-bg border-r border-border-subtle flex flex-col flex-shrink-0`}>
      <div className="p-4 pt-6 flex flex-col h-full">
        <h2 className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-4 px-2">Library</h2>
        
        <div className="space-y-0.5 flex-1 overflow-y-auto">
          <button 
            onClick={() => onSelectTag(null)} 
            className={`w-full text-left flex items-center px-2 py-1.5 rounded-md text-sm transition-colors mb-2 ${(!activeTag && !searchQuery) ? 'bg-blue-500/10 text-blue-500' : 'text-text-dim hover:text-text-main hover:bg-item-hover'}`}
          >
            <SidebarIcon size={14} className="mr-2" />
            All Notes
          </button>

          {tags.length === 0 ? (
            <div className="px-2 py-2 text-sm text-text-dim italic">No tags yet</div>
          ) : (
            tags.map(({ name, count }) => {
              const colors = getTagColor(name);
              const isActive = activeTag === name;
              return (
                <div key={name}>
                  {editingTag === name ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onInput={(e) => onEditChange(e.currentTarget.value)}
                      onBlur={onRename}
                      onKeyDown={onEditKeyDown}
                      className="w-full bg-app-bg border border-blue-500/50 rounded-md px-2 py-1 text-sm text-text-main outline-none"
                    />
                  ) : (
                    <button 
                      onClick={() => onSelectTag(name)} 
                      onDblClick={() => onStartEditing(name)} 
                      className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all group ${isActive ? (colorMode ? `${colors.bg} ${colors.text}` : 'bg-blue-500/10 text-blue-500') : 'text-text-dim hover:bg-item-hover hover:text-text-main'}`}
                    >
                      <div className="flex items-center truncate">
                        <Hash size={14} className={`mr-2 flex-shrink-0 ${isActive ? (colorMode ? colors.text : 'text-blue-500') : (colorMode ? `${colors.text} opacity-70 group-hover:opacity-100` : 'text-text-dim group-hover:text-blue-500')}`} />
                        <span className="truncate">{name.replace('#', '')}</span>
                      </div>
                      <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActive ? (colorMode ? 'bg-black/10' : 'bg-blue-500/20 text-blue-600 dark:text-blue-300') : 'bg-black/5 dark:bg-white/5 text-text-dim group-hover:text-text-main'}`}>{count}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
