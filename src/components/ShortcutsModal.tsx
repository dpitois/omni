import { useEffect, useState, useRef } from 'preact/hooks';
import { X, Keyboard, Globe, Move, Edit3, Terminal } from 'lucide-preact';
import { useUIState, useUIActions } from '../context/UIContext';
import type { UIMode } from '../types';

type TabId = 'global' | 'navigation' | 'editing' | 'advanced';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Globe;
}

interface ShortcutSection {
  title: string;
  shortcuts: { keys: string[]; label: string }[];
}

const TABS: Tab[] = [
  { id: 'global', label: 'Global', icon: Globe },
  { id: 'navigation', label: 'Navigation', icon: Move },
  { id: 'editing', label: 'Editing', icon: Edit3 },
  { id: 'advanced', label: 'Advanced', icon: Terminal }
];

const SECTIONS: Record<TabId, ShortcutSection[]> = {
  global: [
    {
      title: 'UI Controls',
      shortcuts: [
        { keys: ['Alt', 'S'], label: 'Toggle Sidebar' },
        { keys: ['Alt', 'L'], label: 'Focus Library' },
        { keys: ['Alt', 'T'], label: 'Switch Theme' },
        { keys: ['Alt', 'C'], label: 'Toggle Colors' },
        { keys: ['Alt', 'K'], label: 'Columns Menu' },
        { keys: ['Alt', 'H'], label: 'Show this Help' },
        { keys: ['Ctrl', 'K'], label: 'Command Palette' },
        { keys: ['Ctrl', 'F'], label: 'Focus Search' }
      ]
    }
  ],
  navigation: [
    {
      title: 'Normal Mode (Vim-style)',
      shortcuts: [
        { keys: ['j / ↓'], label: 'Navigate Down' },
        { keys: ['k / ↑'], label: 'Navigate Up' },
        { keys: ['Shift', 'j/k'], label: 'Select Range' },
        { keys: ['z'], label: 'Toggle Focus (Hoist)' },
        { keys: ['h / ←'], label: 'Left / Outdent' },
        { keys: ['l / →'], label: 'Right / Indent' },
        { keys: ['i'], label: 'Insert at Start' },
        { keys: ['a'], label: 'Append at End' },
        { keys: ['u'], label: 'Undo' },
        { keys: ['Ctrl', 'R'], label: 'Redo' },
        { keys: ['o'], label: 'New Node Below' },
        { keys: ['d / ⌫'], label: 'Delete Node' },
        { keys: ['Space'], label: 'Toggle Checkbox' },
        { keys: ['.'], label: 'Toggle Fold' }
      ]
    },

    {
      title: 'Structure',
      shortcuts: [
        { keys: ['Alt', '↑/↓'], label: 'Move Node Up/Down' },
        { keys: ['Alt', '←/→'], label: 'Navigate Columns' }
      ]
    }
  ],
  editing: [
    {
      title: 'Insert Mode',
      shortcuts: [
        { keys: ['Esc'], label: 'Return to Normal' },
        { keys: ['Enter'], label: 'New Node' },
        { keys: ['Ctrl', 'Z'], label: 'Undo' },
        { keys: ['Ctrl', 'Y'], label: 'Redo' },
        { keys: ['Ctrl', 'Enter'], label: 'Toggle Checkbox' },
        { keys: ['Tab'], label: 'Indent' },
        { keys: ['Shift', 'Tab'], label: 'Outdent' },
        { keys: ['Ctrl', '.'], label: 'Toggle Fold' },
        { keys: ['⌫', '(empty)'], label: 'Delete Node' }
      ]
    },
    {
      title: 'Formatting',
      shortcuts: [
        { keys: ['Ctrl', 'B'], label: 'Bold' },
        { keys: ['Ctrl', 'I'], label: 'Italic' },
        { keys: ['Ctrl', 'U'], label: 'Underline' },
        { keys: ['Ctrl', 'Shift', 'S'], label: 'Strikethrough' }
      ]
    }
  ],
  advanced: [
    {
      title: 'Command Mode',
      shortcuts: [
        { keys: [':'], label: 'Enter Command Mode' },
        { keys: [':w'], label: 'Save (auto)' },
        { keys: [':q'], label: 'Quit' },
        { keys: [':h'], label: 'Show Help' }
      ]
    },
    {
      title: 'Library (when focused)',
      shortcuts: [
        { keys: ['↑ / ↓'], label: 'Navigate Tags' },
        { keys: ['Enter'], label: 'Select Tag' },
        { keys: ['E'], label: 'Rename Tag' },
        { keys: ['Esc'], label: 'Return to Outliner' }
      ]
    }
  ]
};

export function ShortcutsModal() {
  const { showShortcutsModal, focusedNodeId, mode } = useUIState();
  const { setShowShortcutsModal, setMode, getNodeRef } = useUIActions();
  const [activeTab, setActiveTab] = useState<TabId>('global');

  useEffect(() => {
    const handleOpen = () => setShowShortcutsModal(true);
    window.addEventListener('open-shortcuts', handleOpen);
    return () => window.removeEventListener('open-shortcuts', handleOpen);
  }, [setShowShortcutsModal]);

  // Store the mode before opening modal to restore it after
  const previousModeRef = useRef<UIMode>('normal');

  useEffect(() => {
    if (showShortcutsModal) {
      // Store current mode when opening
      previousModeRef.current = mode;
    }
  }, [showShortcutsModal, mode]);

  useEffect(() => {
    if (!showShortcutsModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowShortcutsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcutsModal, setShowShortcutsModal]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!showShortcutsModal && focusedNodeId) {
      // Find the focused node element via Registry and focus it
      const focusedElement = getNodeRef(focusedNodeId);
      if (focusedElement) {
        focusedElement.focus();
        // Restore previous mode (normal or insert)
        if (previousModeRef.current === 'insert') {
          // For insert mode, we need to focus the textarea inside
          const textarea = focusedElement.querySelector('textarea') as HTMLTextAreaElement;
          if (textarea) {
            textarea.focus();
          } else {
            // If no textarea, stay in normal mode
            setMode('normal');
          }
        } else {
          setMode('normal');
        }
      }
    }
  }, [showShortcutsModal, focusedNodeId, setMode, getNodeRef]);

  if (!showShortcutsModal) return null;

  const currentSections = SECTIONS[activeTab];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setShowShortcutsModal(false)}
      />

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

        <div className="px-6 pt-4 border-b border-border-subtle">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                    isActive
                      ? 'bg-sidebar-bg text-text-main border-t border-x border-border-subtle -mb-px'
                      : 'text-text-dim hover:text-text-main hover:bg-item-hover'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[50vh] overflow-y-auto">
          {currentSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4 px-1">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.shortcuts.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-4 group">
                    <span className="text-sm text-text-main/80 group-hover:text-text-main transition-colors">
                      {s.label}
                    </span>
                    <div className="flex gap-1">
                      {s.keys.map((key) => (
                        <kbd
                          key={key}
                          className="min-w-[24px] px-1.5 py-1 bg-app-bg border border-border-subtle rounded shadow-sm text-[10px] font-mono font-bold text-text-main flex items-center justify-center"
                        >
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
          <p className="text-xs text-text-dim italic">
            Tip: Use Alt + Arrows to move nodes and columns instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
