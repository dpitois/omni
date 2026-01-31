import { createContext, type ComponentChildren } from 'preact';
import { useContext, useState, useMemo, useCallback, useRef, useEffect } from 'preact/hooks';
import { useTheme } from '../hooks/useTheme';
import type { Column, Node, UIMode } from '../types';

export const ALL_COLUMNS: Column[] = [
  { id: 'text', label: 'Outline', type: 'text', width: '1fr' },
  { id: 'status', label: 'Status', type: 'text', width: '120px' },
  { id: 'due', label: 'Due Date', type: 'date', width: '140px' },
  { id: 'progress', label: 'Progress', type: 'progress', width: '120px' }
];

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface UIState {
  darkMode: boolean;
  colorMode: boolean;
  showSidebar: boolean;
  showColumnMenu: boolean;
  showShortcutsModal: boolean;
  visibleColumnIds: string[];
  activeColumns: Column[];
  focusedNodeId: string | null;
  pendingFocusId: string | null;
  pendingFocusMode: UIMode | null;
  initialCursorPos: 'start' | 'end' | 'none';
  activeColumnIndex: number;
  selectedNodeIds: string[];
  anchorNodeId: string | null;
  shouldScroll: boolean;
  editingTag: string | null;
  editValue: string;
  mode: UIMode;
  statusMessage: string;
  notifications: Notification[];
  searchFocusTrigger: number;
}

interface UIActions {
  setDarkMode: (dark: boolean) => void;
  setColorMode: (color: boolean) => void;
  setShowSidebar: (show: boolean) => void;
  setShowColumnMenu: (show: boolean) => void;
  setShowShortcutsModal: (show: boolean) => void;
  toggleColumnVisibility: (id: string) => void;
  setFocus: (
    id: string | null,
    colIdx?: number,
    targetMode?: UIMode,
    cursorPos?: 'start' | 'end' | 'none',
    skipScroll?: boolean
  ) => void;
  setPendingFocus: (
    id: string | null,
    mode: UIMode | null,
    cursorPos?: 'start' | 'end' | 'none'
  ) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  toggleNodeSelection: (id: string) => void;
  extendSelection: (targetId: string, nodes: Node[]) => void;
  setEditingTag: (tag: string | null) => void;
  setEditValue: (val: string) => void;
  setStatusMessage: (msg: string) => void;
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
  setMode: (mode: UIMode) => void;
  executeCommand: (cmd: string) => void;
  focusPrev: (nodes: Node[], currentId: string) => void;
  focusNext: (nodes: Node[], currentId: string) => void;
  registerNodeRef: (id: string, el: HTMLElement | null, type?: 'container' | 'input') => void;
  getNodeRef: (id: string, type?: 'container' | 'input') => HTMLElement | null;
  triggerSearchFocus: () => void;
}

const UIStateContext = createContext<UIState | undefined>(undefined);
const UIActionsContext = createContext<UIActions | undefined>(undefined);

export function UIProvider({ children }: { children: ComponentChildren }) {
  const { darkMode, setDarkMode } = useTheme();

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const [pendingFocusMode, setPendingFocusMode] = useState<UIMode | null>(null);
  const [initialCursorPos, setInitialCursorPos] = useState<'start' | 'end' | 'none'>('none');
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [anchorNodeId, setAnchorNodeId] = useState<string | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [colorMode, setColorMode] = useState(true);
  const [mode, setModeState] = useState<UIMode>('normal');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [statusMessage, setStatusMessageState] = useState('');
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0);

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mvo_visible_columns');
    return saved ? JSON.parse(saved) : ['text', 'status', 'due', 'progress'];
  });

  const modeLockRef = useRef<number>(0);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const inputRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setMode = useCallback((newMode: UIMode | ((prev: UIMode) => UIMode)) => {
    setModeState((prev) => {
      const resolvedMode = typeof newMode === 'function' ? newMode(prev) : newMode;
      if (resolvedMode === 'normal' && Date.now() < modeLockRef.current) return prev;
      if (resolvedMode !== 'normal') modeLockRef.current = Date.now() + 300;
      if (resolvedMode === 'insert') setSelectedNodeIds([]);
      return resolvedMode;
    });
  }, []);

  const setStatusMessage = useCallback((msg: string) => {
    setStatusMessageState(msg);
    if (msg) setTimeout(() => setStatusMessageState(''), 3000);
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = self.crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const setFocus = useCallback(
    (
      id: string | null,
      colIdx: number = 0,
      targetMode?: UIMode,
      cursorPos: 'start' | 'end' | 'none' = 'none',
      skipScroll: boolean = false
    ) => {
      setFocusedNodeId(id);
      setActiveColumnIndex(colIdx);
      setPendingFocusId(null);
      setPendingFocusMode(null);
      setInitialCursorPos(cursorPos);
      setAnchorNodeId(id);
      setShouldScroll(!skipScroll);
      if (targetMode) setMode(targetMode);
    },
    [setMode]
  );

  const extendSelection = useCallback(
    (targetId: string, nodes: Node[]) => {
      const anchorId = anchorNodeId || focusedNodeId;
      if (!anchorId) {
        setAnchorNodeId(targetId);
        setSelectedNodeIds([targetId]);
        return;
      }
      if (!anchorNodeId) setAnchorNodeId(anchorId);
      const anchorIdx = nodes.findIndex((n) => n.id === anchorId);
      const targetIdx = nodes.findIndex((n) => n.id === targetId);
      if (anchorIdx === -1 || targetIdx === -1) return;
      const start = Math.min(anchorIdx, targetIdx);
      const end = Math.max(anchorIdx, targetIdx);
      const newSelection = nodes.slice(start, end + 1).map((n) => n.id);
      setSelectedNodeIds(newSelection);
      setFocusedNodeId(targetId);
      setShouldScroll(true);
    },
    [anchorNodeId, focusedNodeId]
  );

  useEffect(() => {
    localStorage.setItem('mvo_visible_columns', JSON.stringify(visibleColumnIds));
  }, [visibleColumnIds]);

  const activeColumns = useMemo(
    () => ALL_COLUMNS.filter((c) => visibleColumnIds.includes(c.id)),
    [visibleColumnIds]
  );

  const toggleColumnVisibility = useCallback((id: string) => {
    setVisibleColumnIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const registerNodeRef = useCallback(
    (id: string, el: HTMLElement | null, type: 'container' | 'input' = 'container') => {
      const map = type === 'input' ? inputRefs.current : nodeRefs.current;
      if (el) map.set(id, el);
      else map.delete(id);
    },
    []
  );

  const getNodeRef = useCallback((id: string, type: 'container' | 'input' = 'container') => {
    const map = type === 'input' ? inputRefs.current : nodeRefs.current;
    return map.get(id) || null;
  }, []);

  const setPendingFocus = useCallback(
    (
      id: string | null,
      targetMode: UIMode | null,
      cursorPos: 'start' | 'end' | 'none' = 'none'
    ) => {
      setPendingFocusId(id);
      setPendingFocusMode(targetMode);
      setInitialCursorPos(cursorPos);
      setAnchorNodeId(id);
      setShouldScroll(true);
      if (targetMode) setMode(targetMode);
    },
    [setMode]
  );

  const toggleNodeSelection = useCallback((id: string) => {
    setSelectedNodeIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  }, []);

  const triggerSearchFocus = useCallback(() => {
    setSearchFocusTrigger((prev) => prev + 1);
  }, []);

  const focusPrev = useCallback(
    (nodes: Node[], currentId: string) => {
      const index = nodes.findIndex((n) => n.id === currentId);
      if (index > 0) setFocus(nodes[index - 1].id, 0);
    },
    [setFocus]
  );

  const focusNext = useCallback(
    (nodes: Node[], currentId: string) => {
      const index = nodes.findIndex((n) => n.id === currentId);
      if (index < nodes.length - 1) setFocus(nodes[index + 1].id, 0);
    },
    [setFocus]
  );

  const executeCommand = useCallback(
    (cmd: string) => {
      const cleanCmd = cmd.trim().toLowerCase();
      if (cleanCmd === ':h' || cleanCmd === ':help') setShowShortcutsModal(true);
      else if (cleanCmd === ':w' || cleanCmd === ':write')
        addNotification('All changes saved to IndexedDB', 'success');
      else if (cleanCmd === ':q' || cleanCmd === ':quit') window.close();
      setMode('normal');
    },
    [setMode, addNotification]
  );

  const state: UIState = useMemo(
    () => ({
      darkMode,
      colorMode,
      showSidebar,
      showColumnMenu,
      showShortcutsModal,
      visibleColumnIds,
      activeColumns,
      focusedNodeId,
      pendingFocusId,
      pendingFocusMode,
      initialCursorPos,
      activeColumnIndex,
      selectedNodeIds,
      anchorNodeId,
      shouldScroll,
      editingTag,
      editValue,
      mode,
      statusMessage,
      notifications,
      searchFocusTrigger
    }),
    [
      darkMode,
      colorMode,
      showSidebar,
      showColumnMenu,
      showShortcutsModal,
      visibleColumnIds,
      activeColumns,
      focusedNodeId,
      pendingFocusId,
      pendingFocusMode,
      initialCursorPos,
      activeColumnIndex,
      selectedNodeIds,
      anchorNodeId,
      shouldScroll,
      editingTag,
      editValue,
      mode,
      statusMessage,
      notifications,
      searchFocusTrigger
    ]
  );

  const actions: UIActions = useMemo(
    () => ({
      setDarkMode,
      setColorMode,
      setShowSidebar,
      setShowColumnMenu,
      setShowShortcutsModal,
      toggleColumnVisibility,
      setFocus,
      setPendingFocus,
      setSelectedNodeIds,
      toggleNodeSelection,
      extendSelection,
      setEditingTag,
      setEditValue,
      setStatusMessage,
      addNotification,
      removeNotification,
      setMode,
      executeCommand,
      focusPrev,
      focusNext,
      registerNodeRef,
      getNodeRef,
      triggerSearchFocus
    }),
    [
      setDarkMode,
      setColorMode,
      setShowSidebar,
      setShowColumnMenu,
      setShowShortcutsModal,
      toggleColumnVisibility,
      setFocus,
      setPendingFocus,
      setSelectedNodeIds,
      toggleNodeSelection,
      extendSelection,
      setEditingTag,
      setEditValue,
      setStatusMessage,
      addNotification,
      removeNotification,
      setMode,
      executeCommand,
      focusPrev,
      focusNext,
      registerNodeRef,
      getNodeRef,
      triggerSearchFocus
    ]
  );

  return (
    <UIStateContext.Provider value={state}>
      <UIActionsContext.Provider value={actions}>{children}</UIActionsContext.Provider>
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
