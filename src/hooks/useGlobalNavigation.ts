import { useEffect, useRef } from 'preact/hooks';
import { useUIState, useUIActions } from '../context/UIContext';
import { useOutlinerData, useOutlinerActions } from '../context/OutlinerContext';
import { outlinerStore } from '../services/store';
import { commandStore } from '../services/commands';

export function useGlobalNavigation() {
  const {
    mode,
    focusedNodeId,
    activeColumnIndex,
    showShortcutsModal,
    showSidebar,
    showColumnMenu,
    darkMode,
    colorMode
  } = useUIState();

  const {
    setMode,
    setFocus,
    setPendingFocus,
    setShowSidebar,
    setShowShortcutsModal,
    setDarkMode,
    setColorMode,
    setShowColumnMenu,
    getNodeRef,
    triggerSearchFocus
  } = useUIActions();

  const { nodes } = useOutlinerData();
  const actions = useOutlinerActions();

  // Integrated calculation of visible nodes directly from signals
  const visibleNodes = outlinerStore.visibleNodesInfo.value.map((v) => v.node);

  const isPaletteOpen = commandStore.isOpen.value;

  const stateRef = useRef({
    mode,
    focusedNodeId,
    activeColumnIndex,
    showShortcutsModal,
    nodes,
    visibleNodes,
    isPaletteOpen,
    showSidebar,
    darkMode,
    colorMode,
    showColumnMenu
  });

  useEffect(() => {
    stateRef.current = {
      mode,
      focusedNodeId,
      activeColumnIndex,
      showShortcutsModal,
      nodes,
      visibleNodes,
      isPaletteOpen,
      showSidebar,
      darkMode,
      colorMode,
      showColumnMenu
    };
  }, [
    mode,
    focusedNodeId,
    activeColumnIndex,
    showShortcutsModal,
    nodes,
    visibleNodes,
    isPaletteOpen,
    showSidebar,
    darkMode,
    colorMode,
    showColumnMenu
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const state = stateRef.current;
      if (state.showShortcutsModal || state.isPaletteOpen) return;

      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          e.stopPropagation();
          setShowSidebar(!state.showSidebar);
          return;
        }
        if (key === 'h') {
          e.preventDefault();
          e.stopPropagation();
          setShowShortcutsModal(!state.showShortcutsModal);
          return;
        }
        if (key === 't') {
          e.preventDefault();
          e.stopPropagation();
          setDarkMode(!state.darkMode);
          return;
        }
        if (key === 'c') {
          e.preventDefault();
          e.stopPropagation();
          setColorMode(!state.colorMode);
          return;
        }
        if (key === 'k') {
          e.preventDefault();
          e.stopPropagation();
          setShowColumnMenu(!state.showColumnMenu);
          return;
        }
        if (key === 'l') {
          e.preventDefault();
          e.stopPropagation();
          if (!state.showSidebar) setShowSidebar(true);
          const focusSidebar = () => {
            const firstBtn = document.getElementById('sidebar-first-btn');
            if (firstBtn) {
              firstBtn.focus();
              return true;
            }
            return false;
          };
          if (!focusSidebar()) {
            setTimeout(focusSidebar, 10);
          }
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        e.stopPropagation();
        triggerSearchFocus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        commandStore.open();
        return;
      }

      if (state.mode === 'normal') {
        const isBodyFocused =
          document.activeElement === document.body || document.activeElement === null;
        if (isBodyFocused && state.nodes.length > 0) {
          const recoveryKeys = [
            'j',
            'k',
            'h',
            'l',
            'i',
            'a',
            'o',
            ':',
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Escape',
            'Enter',
            ' '
          ];
          if (recoveryKeys.includes(e.key)) {
            const nodeId = state.focusedNodeId || state.nodes[0].id;
            if (e.key === 'o') {
              e.preventDefault();
              e.stopPropagation();
              const newId = actions.addNode(nodeId);
              setPendingFocus(newId, 'insert');
              return;
            }
            if (e.key === ':') {
              e.preventDefault();
              e.stopPropagation();
              setMode('command');
              return;
            }
            e.preventDefault();
            setFocus(nodeId, state.activeColumnIndex);
            if (e.key === 'i' || e.key === 'a') setMode('insert');
            return;
          }
        }
      }

      if (state.mode === 'insert') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setMode('normal');
          if (state.focusedNodeId) {
            const el = getNodeRef(state.focusedNodeId);
            if (el) el.focus();
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, false);
    return () => window.removeEventListener('keydown', handleKeyDown, false);
  }, [
    actions,
    setMode,
    setFocus,
    setPendingFocus,
    setShowSidebar,
    setShowShortcutsModal,
    setDarkMode,
    setColorMode,
    setShowColumnMenu,
    getNodeRef
  ]);
}
