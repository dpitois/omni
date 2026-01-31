import { useEffect, useRef } from 'preact/hooks';
import { commandStore } from '../services/commands';
import { Command, Search, CornerDownLeft } from 'lucide-preact';

export function CommandPalette() {
  const isOpen = commandStore.isOpen.value;
  const query = commandStore.query.value;
  const filtered = commandStore.filteredCommands.value;
  const selectedIndex = commandStore.selectedIndex.value;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Robust Focus Management
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure we win any focus race condition (like global navigation recovery)
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 10);

      if (listRef.current) listRef.current.scrollTop = 0;
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global Key Listener when open
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Always stop propagation if palette is open to avoid triggering outliner shortcuts
      e.stopPropagation();

      if (e.key === 'Escape') {
        e.preventDefault();
        commandStore.close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        commandStore.selectedIndex.value = (selectedIndex + 1) % filtered.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        commandStore.selectedIndex.value = (selectedIndex - 1 + filtered.length) % filtered.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          commandStore.close();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-[2px]"
      onClick={() => commandStore.close()}
    >
      <div
        className="w-full max-w-2xl bg-app-bg text-text-main rounded-xl shadow-2xl border border-border-subtle overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-border-subtle">
          <Search className="w-5 h-5 text-text-dim mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-text-main placeholder:text-text-dim/50"
            placeholder="Search commands..."
            value={query}
            onInput={(e) => {
              commandStore.query.value = (e.target as HTMLInputElement).value;
              commandStore.selectedIndex.value = 0;
            }}
          />
          <div className="flex items-center gap-1 ml-2">
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-item-hover text-text-dim rounded border border-border-subtle">
              ESC
            </span>
          </div>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-dim italic">No commands found</div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                  idx === selectedIndex
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'hover:bg-item-hover text-text-main'
                }`}
                onClick={() => {
                  cmd.action();
                  commandStore.close();
                }}
              >
                <div
                  className={`p-2 rounded-lg mr-3 ${
                    idx === selectedIndex ? 'bg-blue-500/20' : 'bg-item-hover'
                  }`}
                >
                  <Command className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-text-dim truncate">{cmd.description}</div>
                  )}
                </div>
                {idx === selectedIndex && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 ml-2">
                    <span className="opacity-50 uppercase tracking-tighter">Enter</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-item-hover border-t border-border-subtle flex items-center justify-between text-[10px] text-text-dim font-bold uppercase tracking-wider">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-app-bg border border-border-subtle rounded shadow-sm">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-app-bg border border-border-subtle rounded shadow-sm">
                ↵
              </kbd>
              Select
            </span>
          </div>
          {filtered[selectedIndex]?.category && (
            <span className="text-blue-500/70">{filtered[selectedIndex].category}</span>
          )}
        </div>
      </div>
    </div>
  );
}
