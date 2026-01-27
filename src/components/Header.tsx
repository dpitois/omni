import { useRef, useEffect } from 'preact/hooks';
import { Sidebar as SidebarIcon, X, Palette, Sun, Moon, Search, Columns, Check, CloudOff } from 'lucide-preact';
import { getTagColor } from '../utils/colors';
import { useUIState, useUIActions, ALL_COLUMNS } from '../context/UIContext';
import { useFilterState, useFilterActions } from '../context/FilterContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function Header() {
  const { activeTag, searchQuery } = useFilterState();
  const { setSearchQuery, setActiveTag } = useFilterActions();
  const { darkMode, colorMode, showColumnMenu, visibleColumnIds, showSidebar } = useUIState();
  const { setShowSidebar, setColorMode, setDarkMode, setShowColumnMenu, toggleColumnVisibility } = useUIActions();
  const isOnline = useOnlineStatus();
  
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        <button onClick={() => setShowSidebar(!showSidebar)} className="p-1.5 rounded-md text-text-dim hover:bg-item-hover hover:text-text-main transition-colors mr-4">
          <SidebarIcon size={18} />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium text-text-dim flex items-center truncate gap-2">
              {activeTag ? (
                <>
                  <span className="text-text-dim/50">Tag:</span> 
                  <TagBadge tag={activeTag} colorMode={colorMode} onClear={() => setActiveTag(null)} />
                </>
              ) : (
                  <span className="font-bold tracking-tight text-text-main/80">Omni</span>
              )}
          </h1>
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
              <CloudOff size={12} />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} inputRef={searchInputRef} />

        <div className="flex items-center gap-1 border-l border-border-subtle pl-4">
          <IconButton onClick={() => setColorMode(!colorMode)} active={colorMode} title="Toggle Colors"><Palette size={14} /></IconButton>
          <IconButton onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">{darkMode ? <Sun size={14} /> : <Moon size={14} />}</IconButton>
          
          <div className="relative ml-2">
            <button onClick={() => setShowColumnMenu(!showColumnMenu)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors border ${showColumnMenu ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'text-text-dim border-border-subtle hover:bg-item-hover hover:text-text-main'}`}>
              <Columns size={14} />
              <span>Columns</span>
            </button>
            {showColumnMenu && (
              <ColumnDropdown 
                columns={ALL_COLUMNS} 
                visibleIds={visibleColumnIds} 
                onToggle={toggleColumnVisibility} 
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function TagBadge({ tag, colorMode, onClear }: { tag: string, colorMode: boolean, onClear: () => void }) {
  const colors = getTagColor(tag);
  return (
    <div className="flex items-center">
      <span className={`px-2 py-0.5 rounded text-xs ${colorMode ? `${colors.bg} ${colors.text}` : 'text-blue-500 bg-blue-500/10'}`}>
        {tag}
      </span>
      <button onClick={onClear} className="ml-2 hover:bg-item-hover p-1 rounded-full"><X size={12}/></button>
    </div>
  );
}

function SearchBar({ value, onChange, inputRef }: { value: string, onChange: (v: string) => void, inputRef: any }) {
  return (
    <div className="max-w-xs relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim/50"><Search size={14} /></div>
      <input 
        ref={inputRef} 
        type="text" 
        value={value} 
        onInput={(e) => onChange(e.currentTarget.value)} 
        placeholder="Search..." 
        className="w-full bg-sidebar-bg/50 border border-border-subtle rounded-full py-1.5 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-blue-500/50 focus:bg-sidebar-bg transition-all" 
      />
    </div>
  );
}

function IconButton({ children, onClick, active, title }: any) {
    return (
        <button 
            onClick={onClick} 
            className={`p-1.5 rounded transition-colors ${active ? 'text-text-main bg-app-bg shadow-sm' : 'text-text-dim hover:text-text-main'}`}
            title={title}
        >
            {children}
        </button>
    );
}

function ColumnDropdown({ columns, visibleIds, onToggle }: any) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-sidebar-bg border border-border-subtle rounded-lg shadow-xl py-2 z-50 backdrop-blur-md">
      <div className="px-3 py-1 mb-1 text-[10px] font-bold text-text-dim uppercase tracking-wider">Display Columns</div>
      {columns.slice(1).map((col: any) => (
        <button key={col.id} onClick={() => onToggle(col.id)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-main hover:bg-item-hover transition-colors">
          <span>{col.label}</span>
          {visibleIds.includes(col.id) && <Check size={14} className="text-blue-500" />}
        </button>
      ))}
    </div>
  );
}
