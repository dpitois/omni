import type { RefObject } from 'preact';
import type { Node, Column, UIMode } from '../types';
import { commandStore } from '../services/commands';

interface UseKeyboardShortcutsProps {
  node: Node;
  activeColumnIndex: number;
  activeColumns: Column[];
  localText: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  visibleNodesRef: { current: Node[] };
  mode: UIMode;
  selectedNodeIds: string[];
  hoistedNodeId: string | null;
  actions: {
    toggleCheck: (id: string) => void;
    toggleCheckNodes: (ids: string[]) => void;
    toggleCollapse: (id: string) => void;
    indentNode: (id: string) => void;
    indentNodes: (ids: string[]) => void;
    outdentNode: (id: string) => void;
    outdentNodes: (ids: string[]) => void;
    moveNodeUp: (id: string) => void;
    moveNodeDown: (id: string) => void;
    setFocus: (
      id: string | null,
      colIdx?: number,
      targetMode?: UIMode,
      cursorPos?: 'start' | 'end' | 'none'
    ) => void;
    focusPrev: (nodes: Node[], id: string) => void;
    focusNext: (nodes: Node[], id: string) => void;
    setSelectedNodeIds: (ids: string[]) => void;
    toggleNodeSelection: (id: string) => void;
    extendSelection: (targetId: string, nodes: Node[]) => void;
    setHoistedNodeId: (id: string | null) => void;
    handleFormat: (symbol: string) => void;
    handleAdd: () => void;
    handleDelete: () => void;
    deleteNodes: (ids: string[]) => void;
    undo: () => void;
    redo: () => void;
    takeSnapshot: () => void;
    flushChanges: () => void;
    setStatusMessage: (msg: string) => void;
    setMode: (mode: UIMode) => void;
  };
  suggestionHandlers: {
    handleSuggestionKeyDown: (e: KeyboardEvent) => boolean;
  };
}

export function useKeyboardShortcuts({
  node,
  activeColumnIndex,
  activeColumns,
  localText,
  textareaRef,
  visibleNodesRef,
  mode,
  selectedNodeIds,
  hoistedNodeId,
  actions,
  suggestionHandlers
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (commandStore.isOpen.value) return;

    // Global/Normal Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.stopPropagation();
      actions.undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      e.stopPropagation();
      actions.redo();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      e.stopPropagation();
      commandStore.open();
      return;
    }

    const hasSelection = selectedNodeIds.length > 0;
    const targets = hasSelection ? selectedNodeIds : [node.id];

    // Normal Mode Logic
    if (mode === 'normal') {
      // Selection Extension (Shift + j/k)
      if (e.shiftKey && (e.key.toLowerCase() === 'j' || e.key === 'ArrowDown')) {
        e.preventDefault();
        e.stopPropagation();
        const nodes = visibleNodesRef.current;
        const currentIndex = nodes.findIndex((n) => n.id === node.id);
        if (currentIndex < nodes.length - 1) {
          actions.extendSelection(nodes[currentIndex + 1].id, nodes);
        }
        return;
      }
      if (e.shiftKey && (e.key.toLowerCase() === 'k' || e.key === 'ArrowUp')) {
        e.preventDefault();
        e.stopPropagation();
        const nodes = visibleNodesRef.current;
        const currentIndex = nodes.findIndex((n) => n.id === node.id);
        if (currentIndex > 0) {
          actions.extendSelection(nodes[currentIndex - 1].id, nodes);
        }
        return;
      }

      // Vim Undo/Redo
      if (e.key === 'u' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        actions.undo();
        return;
      }
      if (e.key.toLowerCase() === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        actions.redo();
        return;
      }

      // Ignore if Alt, Ctrl or Meta are pressed
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      // Navigation
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        actions.setSelectedNodeIds([]);
        actions.focusNext(visibleNodesRef.current, node.id);
        return;
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        actions.setSelectedNodeIds([]);
        actions.focusPrev(visibleNodesRef.current, node.id);
        return;
      }
      if (e.key === 'h' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        if (activeColumnIndex > 0) {
          actions.setFocus(node.id, activeColumnIndex - 1);
        } else {
          actions.outdentNodes(targets);
        }
        return;
      }
      if (e.key === 'l' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        if (activeColumnIndex < activeColumns.length - 1) {
          actions.setFocus(node.id, activeColumnIndex + 1);
        } else {
          actions.indentNodes(targets);
        }
        return;
      }

      // Mode switches
      if (e.key === 'i') {
        e.preventDefault();
        e.stopPropagation();
        actions.setFocus(node.id, 0, 'insert', 'start');
        return;
      }
      if (e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
        actions.setFocus(node.id, 0, 'insert', 'end');
        return;
      }
      if (e.key === 'o') {
        e.preventDefault();
        e.stopPropagation();
        actions.takeSnapshot();
        actions.handleAdd();
        return;
      }
      if (e.key === 'z' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        actions.setHoistedNodeId(hoistedNodeId === node.id ? null : node.id);
        return;
      }
      if (e.key === 'v' && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        actions.toggleNodeSelection(node.id);
        return;
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        commandStore.open();
        return;
      }

      // Modes
      if (e.key === ':') {
        e.preventDefault();
        actions.setMode('command');
        return;
      }

      // Structure
      if (e.key === 'd' || e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        actions.deleteNodes(targets);
        actions.setSelectedNodeIds([]);
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        actions.toggleCheckNodes(targets);
        return;
      }
      if (e.key === '.') {
        e.preventDefault();
        e.stopPropagation();
        actions.toggleCollapse(node.id);
        return;
      }

      return;
    }

    // Insert Mode Logic
    if (mode === 'insert') {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        actions.setMode('normal');
        return;
      }

      if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        e.stopPropagation();
        const newIdx = e.key === 'ArrowRight' ? activeColumnIndex + 1 : activeColumnIndex - 1;
        if (newIdx >= 0 && newIdx < activeColumns.length) {
          actions.setFocus(node.id, newIdx);
        }
        return;
      }

      if (activeColumnIndex === 0) {
        if (suggestionHandlers.handleSuggestionKeyDown(e)) {
          e.stopPropagation();
          return;
        }

        if (e.ctrlKey || e.metaKey) {
          const key = e.key.toLowerCase();
          if (key === 'b') {
            e.preventDefault();
            e.stopPropagation();
            actions.handleFormat('**');
            return;
          }
          if (key === 'i') {
            e.preventDefault();
            e.stopPropagation();
            actions.handleFormat('*');
            return;
          }
          if (key === 'u') {
            e.preventDefault();
            e.stopPropagation();
            actions.handleFormat('__');
            return;
          }
          if (key === 's') {
            e.preventDefault();
            e.stopPropagation();
            if (e.shiftKey) actions.handleFormat('~~');
            else {
              actions.takeSnapshot();
              actions.flushChanges();
              actions.setStatusMessage('Changes saved to IndexedDB');
            }
            return;
          }
        }

        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          actions.toggleCheckNodes([node.id]);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          actions.takeSnapshot();
          actions.handleAdd();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) actions.outdentNodes([node.id]);
          else actions.indentNodes([node.id]);
        } else if (e.key === 'Backspace' && localText === '') {
          e.preventDefault();
          e.stopPropagation();
          actions.deleteNodes([node.id]);
        } else if (e.key === 'ArrowUp' && !e.altKey && textareaRef.current?.selectionStart === 0) {
          e.stopPropagation();
          actions.focusPrev(visibleNodesRef.current, node.id);
        } else if (
          e.key === 'ArrowDown' &&
          !e.altKey &&
          textareaRef.current?.selectionStart === localText.length
        ) {
          e.stopPropagation();
          actions.focusNext(visibleNodesRef.current, node.id);
        } else if (e.key === 'ArrowUp' && e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          actions.moveNodeUp(node.id);
        } else if (e.key === 'ArrowDown' && e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          actions.moveNodeDown(node.id);
        } else if (e.key === '.' && e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          actions.toggleCollapse(node.id);
        }
      } else {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          actions.setFocus(node.id, 0);
        }
      }
    }
  };

  return { handleKeyDown };
}
