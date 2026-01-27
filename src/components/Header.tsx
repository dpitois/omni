import { useRef, useEffect } from 'preact/hooks';
import { Sidebar as SidebarIcon, X, Palette, Sun, Moon, Search, Columns, Check } from 'lucide-preact';
import { getTagColor } from '../utils/colors';
import type { Column } from '../types';

interface HeaderProps {
  activeTag: string | null;
  searchQuery: string;
  darkMode: boolean;
  colorMode: boolean;
  showColumnMenu: boolean;
  allColumns: Column[];
  visibleColumnIds: string[];
  onToggleSidebar: () => void;
  onToggleColorMode: () => void;
  onToggleDarkMode: () => void;
  onToggleColumnMenu: () => void;
  onSearchChange: (query: string) => void;
  onClearTag: () => void;
  onToggleColumn: (id: string) => void;
}

export function Header({
  activeTag, searchQuery, darkMode, colorMode, showColumnMenu, allColumns, visibleColumnIds,
  onToggleSidebar, onToggleColorMode, onToggleDarkMode, onToggleColumnMenu, onSearchChange, onClearTag, onToggleColumn
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-app-bg/80 backdrop-blur-md z-30 sticky top-0 flex-shrink-0">
      <div className="flex items-center flex-1">
        <button onClick={onToggleSidebar} className="p-1.5 rounded-md text-text-dim hover:bg-item-hover hover:text-text-main transition-colors mr-4">
          <SidebarIcon size={18} />
        </button>
        <h1 className="text-sm font-medium text-text-dim flex items-center truncate">
            {activeTag ? (
              <>
                <span className="text-text-dim/50 mr-2">Tag:</span> 
                {(() => {
                  const colors = getTagColor(activeTag);
                  return <span className={`px-2 py-0.5 rounded text-xs ${colorMode ? `${colors.bg} ${colors.text}` : 'text-blue-500 bg-blue-500/10'}`}>{activeTag}</span>;
                })()}
                <button onClick={onClearTag} className="ml-2 hover:bg-item-hover p-1 rounded-full"><X size={12}/></button>
              </>
            ) : "Untitled Outline"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="max-w-xs relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim/50"><Search size={14} /></div>
          <input 
            ref={searchInputRef} 
            type="text" 
            value={searchQuery} 
            onInput={(e) => onSearchChange(e.currentTarget.value)} 
            placeholder="Search..." 
            className="w-full bg-sidebar-bg/50 border border-border-subtle rounded-full py-1.5 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-blue-500/50 focus:bg-sidebar-bg transition-all" 
          />
        </div>

        <div className="flex items-center gap-1 border-l border-border-subtle pl-4">
          <button onClick={onToggleColorMode} className={`p-1.5 rounded transition-colors ${colorMode ? 'text-text-main bg-app-bg shadow-sm' : 'text-text-dim hover:text-text-main'}`} title="Toggle Colors"><Palette size={14} /></button>
          <button onClick={onToggleDarkMode} className="p-1.5 rounded text-text-dim hover:text-text-main transition-colors" title="Toggle Theme">{darkMode ? <Sun size={14} /> : <Moon size={14} />}</button>
          
          <div className="relative ml-2" ref={menuRef}>
            <button onClick={onToggleColumnMenu} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors border ${showColumnMenu ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'text-text-dim border-border-subtle hover:bg-item-hover hover:text-text-main'}`}>
              <Columns size={14} />
              <span>Columns</span>
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-sidebar-bg border border-border-subtle rounded-lg shadow-xl py-2 z-50 backdrop-blur-md">
                <div className="px-3 py-1 mb-1 text-[10px] font-bold text-text-dim uppercase tracking-wider">Display Columns</div>
                {allColumns.slice(1).map(col => (
                  <button key={col.id} onClick={() => onToggleColumn(col.id)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-main hover:bg-item-hover transition-colors">
                    <span>{col.label}</span>
                    {visibleColumnIds.includes(col.id) && <Check size={14} className="text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
