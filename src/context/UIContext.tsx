import { createContext, type ComponentChildren } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { useOutlinerUI, ALL_COLUMNS } from '../hooks/useOutlinerUI';
import { useTheme } from '../hooks/useTheme';
import type { Column, Node } from '../types';

interface UIState {
  darkMode: boolean;
  colorMode: boolean;
  showSidebar: boolean;
  showColumnMenu: boolean;
  showShortcutsModal: boolean;
  visibleColumnIds: string[];
  activeColumns: Column[];
  focusedNodeId: string | null;
  activeColumnIndex: number;
  editingTag: string | null;
  editValue: string;
}

interface UIActions {
  setDarkMode: (dark: boolean) => void;
  setColorMode: (color: boolean) => void;
  setShowSidebar: (show: boolean) => void;
  setShowColumnMenu: (show: boolean) => void;
  setShowShortcutsModal: (show: boolean) => void;
  toggleColumnVisibility: (id: string) => void;
  setFocus: (id: string | null, colIdx?: number) => void;
  setEditingTag: (tag: string | null) => void;
  setEditValue: (val: string) => void;
  focusPrev: (nodes: Node[], currentId: string) => void;
  focusNext: (nodes: Node[], currentId: string) => void;
}

const UIStateContext = createContext<UIState | undefined>(undefined);
const UIActionsContext = createContext<UIActions | undefined>(undefined);

export function UIProvider({ children }: { children: ComponentChildren }) {
  const { darkMode, setDarkMode } = useTheme();
  const ui = useOutlinerUI();

  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const state: UIState = {
    darkMode,
    colorMode: ui.colorMode,
    showSidebar: ui.showSidebar,
    showColumnMenu: ui.showColumnMenu,
    showShortcutsModal,
    visibleColumnIds: ui.visibleColumnIds,
    activeColumns: ui.activeColumns,
    focusedNodeId: ui.focusedNodeId,
    activeColumnIndex: ui.activeColumnIndex,
    editingTag,
    editValue
  };

  const actions: UIActions = {
    setDarkMode,
    setColorMode: ui.setColorMode,
    setShowSidebar: ui.setShowSidebar,
    setShowColumnMenu: ui.setShowColumnMenu,
    setShowShortcutsModal,
    toggleColumnVisibility: ui.toggleColumnVisibility,
    setFocus: ui.setFocus,
    setEditingTag,
    setEditValue,
    focusPrev: (nodes, currentId) => {
        const index = nodes.findIndex(n => n.id === currentId);
        if (index > 0) ui.setFocus(nodes[index - 1].id, 0);
    },
    focusNext: (nodes, currentId) => {
        const index = nodes.findIndex(n => n.id === currentId);
        if (index < nodes.length - 1) ui.setFocus(nodes[index + 1].id, 0);
    }
  };

  return (
    <UIStateContext.Provider value={state}>
      <UIActionsContext.Provider value={actions}>
        {children}
      </UIActionsContext.Provider>
    </UIStateContext.Provider>
  );
}

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) throw new Error('useUIState must be used within UIProvider');
  return context;
};

export const useUIActions = () => {
  const context = useContext(UIActionsContext);
  if (!context) throw new Error('useUIActions must be used within UIProvider');
  return context;
};

export { ALL_COLUMNS };