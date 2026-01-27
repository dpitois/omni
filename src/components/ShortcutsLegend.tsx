export function ShortcutsLegend() {
  const shortcuts = [
    { keys: 'Alt + ↔', label: 'Cols' },
    { keys: 'Enter', label: 'New' },
    { keys: 'Tab', label: 'Ind' },
    { keys: 'Alt + ↕', label: 'Move' },
    { keys: 'Ctrl + .', label: 'Fold' },
    { keys: 'Ctrl + B/I/U', label: 'Sty' },
    { keys: 'Ctrl + Shift + S', label: 'Strike' },
    { keys: '#tag', label: 'Tag' },
  ];

  return (
    <footer className="min-h-10 py-2 border-t border-border-subtle bg-sidebar-bg/50 backdrop-blur-md flex items-center px-6 flex-shrink-0 z-20">
      <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-6">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono text-[10px] font-bold text-text-main bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded border border-border-subtle shadow-sm">
              {s.keys}
            </span>
            <span className="text-[10px] font-medium text-text-dim uppercase tracking-wider hidden sm:inline">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
