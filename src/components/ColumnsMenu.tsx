import { X, Check } from 'lucide-preact';
import { useUIState, useUIActions, ALL_COLUMNS } from '../context/UIContext';

export function ColumnsMenu() {
  const { showColumnMenu, activeColumns } = useUIState();
  const { setShowColumnMenu, toggleColumnVisibility } = useUIActions();

  if (!showColumnMenu) return null;

  // Extra columns (excluding the main Outline column)
  const availableColumns = ALL_COLUMNS.slice(1);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setShowColumnMenu(false)}
      />

      <div className="relative w-full max-w-sm bg-sidebar-bg border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-app-bg/50">
          <h2 className="text-sm font-bold text-text-main uppercase tracking-widest">
            Outline Columns
          </h2>
          <button
            onClick={() => setShowColumnMenu(false)}
            className="p-1.5 hover:bg-item-hover rounded-full text-text-dim transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-1">
          {availableColumns.map((col) => {
            const isActive = activeColumns.some((c) => c.id === col.id);
            return (
              <button
                key={col.id}
                onClick={() => toggleColumnVisibility(col.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-500 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]'
                    : 'text-text-main hover:bg-item-hover'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="text-[10px] text-text-dim opacity-70">Type: {col.type}</span>
                </div>
                {isActive && (
                  <div className="bg-blue-500 text-white rounded-full p-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 bg-app-bg/30 border-t border-border-subtle text-center">
          <p className="text-[10px] text-text-dim italic uppercase tracking-widest opacity-50">
            Columns appear on the right side
          </p>
        </div>
      </div>
    </div>
  );
}
