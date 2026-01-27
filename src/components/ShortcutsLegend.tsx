export function ShortcutsLegend() {
  const shortcuts = [
    { keys: 'Alt + ↔', label: 'Columns' },
    { keys: 'Enter', label: 'New Node' },
    { keys: 'Tab', label: 'Indent' },
    { keys: 'Alt + ↕', label: 'Move' },
    { keys: 'Ctrl + .', label: 'Fold' },
    { keys: 'Ctrl + Ent', label: 'Check' },
    { keys: '#tag', label: 'Tag' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0 hidden lg:block opacity-20 hover:opacity-100 transition-opacity duration-300 w-full max-w-4xl px-8">
      <div className="text-[11px] font-mono text-text-dim flex flex-wrap justify-center gap-x-6 gap-y-2 uppercase tracking-tight">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="font-bold text-text-dim bg-black/5 dark:bg-white/5 px-1 rounded">{s.keys}</span>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
