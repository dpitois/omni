import { useRef, useEffect } from 'preact/hooks';
import { Search, Hash, Palette, Columns, Sun, Moon, X, Settings } from 'lucide-preact';
import { useOutlinerData, useOutlinerActions } from '../context/OutlinerContext';
import { useUIState, useUIActions } from '../context/UIContext';
import { outlinerStore } from '../services/store';

export function Header() {
  const { tags } = useOutlinerData();
  const { setSearchQuery, toggleTag } = useOutlinerActions();
  const { darkMode, colorMode, showColumnMenu, searchFocusTrigger } = useUIState();
  const { setDarkMode, setColorMode, setShowColumnMenu } = useUIActions();

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchFocusTrigger > 0 && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchFocusTrigger]);

  const searchQuery = outlinerStore.searchQuery.value;
  const activeTags = outlinerStore.activeTags.value;

  const clearFilters = () => {
    setSearchQuery('');
    activeTags.forEach((t) => toggleTag(t));
  };

  return (
    <header className="h-16 border-b border-border-subtle bg-app-bg/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-40">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-blue-500 transition-colors"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search nodes..."
            className="w-full bg-item-hover border border-transparent focus:border-blue-500/50 rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all"
            value={searchQuery}
            onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-main"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {tags.slice(0, 8).map((tag) => (
            <button
              key={tag.name}
              onClick={() => toggleTag(tag.name)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTags.includes(tag.name)
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-item-hover text-text-dim hover:text-text-main border border-transparent hover:border-border-subtle'
              }`}
            >
              <Hash size={10} />
              <span>{tag.name.replace('#', '')}</span>
              <span className="opacity-50 text-[10px]">{tag.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setColorMode(!colorMode)}
          className={`p-2 rounded-lg transition-colors ${colorMode ? 'text-blue-500 bg-blue-500/10' : 'text-text-dim hover:bg-item-hover'}`}
          title="Toggle Tag Colors (Alt+C)"
        >
          <Palette size={18} />
        </button>

        <button
          onClick={() => setShowColumnMenu(!showColumnMenu)}
          className={`p-2 rounded-lg transition-colors ${showColumnMenu ? 'text-blue-500 bg-blue-500/10' : 'text-text-dim hover:bg-item-hover'}`}
          title="Columns Menu (Alt+K)"
        >
          <Columns size={18} />
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-text-dim hover:bg-item-hover transition-colors"
          title="Toggle Theme (Alt+T)"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-px h-4 bg-border-subtle mx-1" />

        <button
          onClick={clearFilters}
          className={`p-2 rounded-lg transition-colors ${searchQuery || activeTags.length > 0 ? 'text-blue-500 hover:bg-blue-500/10' : 'text-text-dim opacity-20 pointer-events-none'}`}
          title="Clear filters"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
