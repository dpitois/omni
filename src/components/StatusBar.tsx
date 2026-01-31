import { useRef, useEffect, useState } from 'preact/hooks';
import { useUIState, useUIActions } from '../context/UIContext';
import { useOutlinerActions } from '../context/OutlinerContext';

export function StatusBar() {
  const { mode, statusMessage } = useUIState();
  const { setMode, executeCommand, setStatusMessage } = useUIActions();
  const { flushChanges } = useOutlinerActions();
  const [cmdText, setCmdText] = useState(':');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'command') {
      setCmdText(':');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [mode]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = cmdText.trim().toLowerCase();
      if (cmd === ':w' || cmd === ':write') {
        flushChanges();
        setStatusMessage('All changes saved to IndexedDB');
        setMode('normal');
      } else {
        executeCommand(cmdText);
      }
    } else if (e.key === 'Escape') {
      setMode('normal');
    }
  };

  const config = {
    normal: {
      label: 'NORMAL',
      bg: 'bg-blue-600',
      shortcuts:
        'hjkl: Nav • S-jk: Select • i/a: Insert • z: Focus • u/R: Undo/Redo • o: New • d: Del'
    },
    insert: {
      label: 'INSERT',
      bg: 'bg-emerald-600',
      shortcuts: 'Esc: Normal • Ctrl+Z/Y: Undo/Redo • Ctrl+S: Save • Tab: Indent'
    },
    command: {
      label: 'COMMAND',
      bg: 'bg-amber-600',
      shortcuts: 'Enter: Execute • Esc: Cancel'
    }
  }[mode];

  return (
    <div
      className={`h-8 ${config.bg} text-white flex items-center px-4 text-xs font-mono shadow-inner transition-colors duration-300 relative z-50`}
    >
      <div className="font-bold border-r border-white/20 pr-3 mr-3 shrink-0">{config.label}</div>

      <div className="flex-1 min-w-0">
        {mode === 'command' ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none outline-none text-white placeholder-white/50"
            value={cmdText}
            onInput={(e) => setCmdText(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="truncate opacity-90">{statusMessage || config.shortcuts}</div>
        )}
      </div>

      <div className="pl-3 ml-3 border-l border-white/20 opacity-70 shrink-0">MVO v1.0</div>
    </div>
  );
}
