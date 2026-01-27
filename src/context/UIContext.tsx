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
  const { 
    colorMode, setColorMode, 
    showSidebar, setShowSidebar, 
    showColumnMenu, setShowColumnMenu, 
    visibleColumnIds, activeColumns, toggleColumnVisibility,
    focusedNodeId, activeColumnIndex, setFocus 
  } = useOutlinerUI();

  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const state: UIState = {
    darkMode,
    colorMode,
    showSidebar,
    showColumnMenu,
    visibleColumnIds,
    activeColumns,
    focusedNodeId,
    activeColumnIndex,
    editingTag,
    editValue
  };

  const actions: UIActions = {
    setDarkMode,
    setColorMode,
    setShowSidebar,
    setShowColumnMenu,
    toggleColumnVisibility,
    setFocus,
    setEditingTag,
    setEditValue,
    focusPrev: (nodes, currentId) => {
        const index = nodes.findIndex(n => n.id === currentId);
        if (index > 0) setFocus(nodes[index - 1].id, 0);
    },
    focusNext: (nodes, currentId) => {
        const index = nodes.findIndex(n => n.id === currentId);
        if (index < nodes.length - 1) setFocus(nodes[index + 1].id, 0);
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
