export function ShortcutsLegend() {
  const shortcuts = [
    { keys: 'Alt + ↔', label: 'Columns' },
    { keys: 'Enter', label: 'New' },
    { keys: 'Tab', label: 'Indent' },
    { keys: 'Alt + ↕', label: 'Move' },
    { keys: 'Ctrl + .', label: 'Fold' },
    { keys: 'Ctrl + B/I/U', label: 'Style' },
    { keys: 'Ctrl + S', label: 'Strike' },
    { keys: '#tag', label: 'Tag' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0 hidden lg:block opacity-20 hover:opacity-100 transition-opacity duration-300 w-full max-w-5xl px-8">
      <div className="text-[11px] font-mono text-text-dim flex flex-wrap justify-center gap-x-6 gap-y-2 uppercase tracking-tight">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="font-bold text-text-main bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded border border-border-subtle">{s.keys}</span>
            <span className="text-text-dim">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}