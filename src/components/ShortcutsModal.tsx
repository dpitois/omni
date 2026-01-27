import { X, Keyboard } from 'lucide-preact';
import { useUIState, useUIActions } from '../context/UIContext';

export function ShortcutsModal() {
  const { showShortcutsModal } = useUIState();
  const { setShowShortcutsModal } = useUIActions();

  if (!showShortcutsModal) return null;

  const sections = [
    {
      title: "System & UI",
      shortcuts: [
        { keys: ["Alt", "S"], label: "Toggle Sidebar" },
        { keys: ["Alt", "L"], label: "Focus Library" },
        { keys: ["Alt", "T"], label: "Switch Theme" },
        { keys: ["Alt", "C"], label: "Toggle Colors" },
        { keys: ["Alt", "K"], label: "Columns Menu" },
        { keys: ["Alt", "H"], label: "Show this Help" },
        { keys: ["Ctrl", "F"], label: "Search" },
      ]
    },
    {
      title: "Library (Focused)",
      shortcuts: [
        { keys: ["↑ / ↓"], label: "Navigate Tags" },
        { keys: ["Enter"], label: "Select Tag" },
        { keys: ["E"], label: "Rename Tag" },
      ]
    },
    {
      title: "Editing",
      shortcuts: [
        { keys: ["Enter"], label: "New Node" },
        { keys: ["Tab"], label: "Indent" },
        { keys: ["Shift", "Tab"], label: "Outdent" },
        { keys: ["Alt", "↑/↓"], label: "Move Node Up/Down" },
        { keys: ["Alt", "←/→"], label: "Navigate Columns" },
        { keys: ["Ctrl", "."], label: "Toggle Fold" },
        { keys: ["Ctrl", "Ent"], label: "Check / Uncheck" },
      ]
    },
    {
      title: "Formatting",
      shortcuts: [
        { keys: ["Ctrl", "B"], label: "Bold (**texte**)" },
        { keys: ["Ctrl", "I"], label: "Italic (*texte*)" },
        { keys: ["Ctrl", "U"], label: "Underline (__texte__)" },
        { keys: ["Ctrl", "Shift", "S"], label: "Strikethrough (~~texte~~)" },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setShowShortcutsModal(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-sidebar-bg border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-app-bg/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Keyboard size={20} />
            </div>
            <h2 className="text-lg font-bold text-text-main">Keyboard Shortcuts</h2>
          </div>
          <button 
            onClick={() => setShowShortcutsModal(false)}
            className="p-2 hover:bg-item-hover rounded-full text-text-dim hover:text-text-main transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4 px-1">{section.title}</h3>
              <div className="space-y-3">
                {section.shortcuts.map(s => (
                  <div key={s.label} className="flex items-center justify-between gap-4 group">
                    <span className="text-sm text-text-main/80 group-hover:text-text-main transition-colors">{s.label}</span>
                    <div className="flex gap-1">
                      {s.keys.map(key => (
                        <kbd key={key} className="min-w-[24px] px-1.5 py-1 bg-app-bg border border-border-subtle rounded shadow-sm text-[10px] font-mono font-bold text-text-main flex items-center justify-center">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-app-bg/30 border-t border-border-subtle text-center">
          <p className="text-xs text-text-dim italic">Tip: Use Alt + Arrows to move nodes and columns instantly.</p>
        </div>
      </div>
    </div>
  );
}