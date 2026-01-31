import { useUIState, useUIActions } from '../context/UIContext';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-preact';

export function NotificationContainer() {
  const { notifications } = useUIState();
  const { removeNotification } = useUIActions();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right-10 fade-in duration-300 min-w-[280px] max-w-md ${
            n.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : n.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                : n.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
          } backdrop-blur-md`}
        >
          <div className="shrink-0">
            {n.type === 'success' && <CheckCircle size={18} />}
            {n.type === 'error' && <AlertCircle size={18} />}
            {n.type === 'warning' && <AlertTriangle size={18} />}
            {n.type === 'info' && <Info size={18} />}
          </div>

          <div className="flex-1 text-sm font-medium">{n.message}</div>

          <button
            onClick={() => removeNotification(n.id)}
            className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
