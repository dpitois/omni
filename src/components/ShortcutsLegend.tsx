import { HelpCircle } from 'lucide-preact';
import { useUIActions } from '../context/UIContext';

export function ShortcutsLegend() {
  const { setShowShortcutsModal } = useUIActions();

  const primaryShortcuts = [
    { keys: 'Enter', label: 'New' },
    { keys: 'Tab', label: 'Indent' },
    { keys: 'Alt + ↕', label: 'Move' },
    { keys: 'Alt + S', label: 'Sidebar' },
  ];

  return (
    <footer className="min-h-10 py-2 border-t border-border-subtle bg-sidebar-bg/50 backdrop-blur-md flex items-center px-6 flex-shrink-0 z-20">
      <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {primaryShortcuts.map((s, i) => (
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

        <button 
          onClick={() => setShowShortcutsModal(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all text-[10px] font-bold uppercase tracking-widest border border-blue-500/20"
        >
          <HelpCircle size={14} />
          <span>All Shortcuts <span className="hidden sm:inline">(Alt+H)</span></span>
        </button>
      </div>
    </footer>
  );
}
