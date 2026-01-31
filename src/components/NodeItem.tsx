import { memo } from 'preact/compat';
import { useRef, useEffect, useState, useMemo, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import { Maximize2 } from 'lucide-preact';
import type { Node, Column } from '../types';
import { NodeGutter } from './NodeGutter';
import { useOutlinerActions } from '../context/OutlinerContext';
import { useUIState, useUIActions } from '../context/UIContext';
import { applyFormat } from '../utils/markdown';
import { RichTextRenderer } from './RichTextRenderer';
import { NodeItemEdit } from './NodeItemEdit';
import { ErrorBoundary } from './ErrorBoundary';
import { renderCell } from './columns/Registry';
import { useTagSuggestions } from '../hooks/useTagSuggestions';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { outlinerStore } from '../services/store';

interface NodeItemProps {
  id: string;
  hasChildren: boolean;
  isDimmed: boolean;
  isIndeterminate?: boolean;
  isFocused: boolean;
  colorMode: boolean;
  activeColumns: Column[];
  activeColumnIndex: number;
  tags: { name: string; count: number }[];
  visibleNodesRef: { current: Node[] };
  visualLevel?: number;
}

export const NodeItem = memo(function NodeItem({
  id,
  hasChildren,
  isDimmed,
  isIndeterminate,
  isFocused,
  colorMode,
  activeColumns,
  activeColumnIndex,
  tags,
  visibleNodesRef,
  visualLevel
}: NodeItemProps) {
  const {
    addNode,
    updateNode,
    updateMetadata,
    toggleCheck,
    toggleCheckNodes,
    toggleCollapse,
    deleteNode,
    deleteNodes,
    indentNode,
    indentNodes,
    outdentNode,
    outdentNodes,
    moveNodeUp,
    moveNodeDown,
    flushChanges,
    undo,
    redo,
    takeSnapshot
  } = useOutlinerActions();

  const {
    setFocus,
    setPendingFocus,
    focusPrev,
    focusNext,
    setSelectedNodeIds,
    toggleNodeSelection,
    extendSelection,
    setMode,
    registerNodeRef,
    setStatusMessage
  } = useUIActions();

  const { mode, pendingFocusId, pendingFocusMode, selectedNodeIds } = useUIState();
  const hoistedNodeId = outlinerStore.hoistedNodeId.value;
  const isSelected = selectedNodeIds.includes(id);
  const isHoisted = hoistedNodeId === id;

  const nodeSignal = outlinerStore.getNodeSignal(id);
  const node =
    nodeSignal?.value ||
    ({
      id: '',
      text: '',
      level: 0,
      rank: 0,
      checked: false,
      collapsed: false,
      parentId: null,
      updatedAt: 0,
      metadata: {}
    } as Node);

  const displayLevel = visualLevel !== undefined ? visualLevel : node.level;

  const [localText, setLocalText] = useState(node.text);
  const availableTags = useMemo(() => tags.map((t) => t.name), [tags]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const columnRefs = useRef<Array<HTMLElement | null>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (node.text !== localText) setLocalText(node.text);
  }, [node.text, localText]);

  const handleApplyTag = useCallback(
    (tag: string) => {
      const value = localText;
      const cursor = textareaRef.current?.selectionStart || 0;
      const textBeforeCursor = value.substring(0, cursor);
      const textAfterCursor = value.substring(cursor);
      const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
      const newTextBefore = textBeforeCursor.replace(/#([\w\u00C0-\u00FF-]*)$/, `#${cleanTag}`);
      const fullText = newTextBefore + textAfterCursor;
      setLocalText(fullText);
      takeSnapshot();
      updateNode(node.id, { text: fullText });
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = newTextBefore.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [localText, node.id, updateNode, takeSnapshot]
  );

  const {
    showSuggestions,
    setShowSuggestions,
    suggestionIndex,
    filteredTags,
    handleInputForTags,
    handleSuggestionKeyDown
  } = useTagSuggestions({ availableTags, textareaRef, onApply: handleApplyTag });

  const persistChanges = useCallback(() => {
    if (!node.id) return;
    if (node.text !== localText) {
      takeSnapshot();
      updateNode(node.id, { text: localText });
    }
  }, [node.id, node.text, localText, updateNode, takeSnapshot]);

  const handleInput = useCallback(
    (e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => {
      const value = e.currentTarget.value;
      setLocalText(value);
      outlinerStore.updateNode(id, { text: value }, false);
      handleInputForTags(value);
    },
    [id, handleInputForTags]
  );

  const handleFormat = useCallback(
    (symbol: string) => {
      if (!textareaRef.current) return;
      const start = textareaRef.current.selectionStart || 0;
      const end = textareaRef.current.selectionEnd || 0;
      const { text, newStart, newEnd } = applyFormat(localText, start, end, symbol);
      setLocalText(text);
      takeSnapshot();
      updateNode(node.id, { text });
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newStart, newEnd);
        }
      }, 0);
    },
    [localText, node.id, updateNode, takeSnapshot]
  );

  const handleAdd = useCallback(() => {
    if (!node.id) return;
    persistChanges();
    const newId = addNode(node.id);
    setPendingFocus(newId, 'insert', 'end');
  }, [addNode, node.id, setPendingFocus, persistChanges]);

  const handleDelete = useCallback(() => {
    if (!node.id) return;
    deleteNode(node.id);
    const index = visibleNodesRef.current.findIndex((n: Node) => n.id === node.id);
    if (index > 0) setFocus(visibleNodesRef.current[index - 1].id, 0);
  }, [deleteNode, node.id, visibleNodesRef, setFocus]);

  useEffect(() => {
    if (pendingFocusId === node.id && node.id) {
      setFocus(node.id, 0, pendingFocusMode || 'normal');
    }
  }, [node.id, pendingFocusId, pendingFocusMode, setFocus]);

  const { handleKeyDown } = useKeyboardShortcuts({
    node: node as Node,
    activeColumnIndex,
    activeColumns,
    localText,
    textareaRef,
    visibleNodesRef,
    mode,
    selectedNodeIds,
    hoistedNodeId,
    actions: {
      toggleCheck,
      toggleCheckNodes,
      toggleCollapse,
      indentNode,
      indentNodes,
      outdentNode,
      outdentNodes,
      moveNodeUp,
      moveNodeDown,
      setFocus,
      focusPrev,
      focusNext,
      setSelectedNodeIds,
      toggleNodeSelection,
      extendSelection,
      setHoistedNodeId: outlinerStore.setHoistedNodeId.bind(outlinerStore),
      handleFormat,
      handleAdd,
      handleDelete,
      deleteNodes,
      undo,
      redo,
      takeSnapshot,
      flushChanges,
      setStatusMessage,
      setMode
    },
    suggestionHandlers: { handleSuggestionKeyDown }
  });

  useEffect(() => {
    if (isFocused) {
      if (activeColumnIndex === 0 && mode === 'normal' && containerRef.current)
        containerRef.current.focus();
      else if (activeColumnIndex > 0 && columnRefs.current[activeColumnIndex])
        columnRefs.current[activeColumnIndex]?.focus();
    }
  }, [isFocused, activeColumnIndex, mode]);

  useEffect(() => {
    if (node.id) registerNodeRef(node.id, containerRef.current, 'container');
    return () => {
      if (node.id) registerNodeRef(node.id, null, 'container');
    };
  }, [node.id, registerNodeRef]);

  useEffect(() => {
    if (isFocused && textareaRef.current && node.id)
      registerNodeRef(node.id, textareaRef.current, 'input');
    return () => {
      if (node.id) registerNodeRef(node.id, null, 'input');
    };
  }, [node.id, isFocused, registerNodeRef]);

  const handleFocusClick = useCallback(
    (targetId: string, col: number) => {
      setFocus(targetId, col, 'normal', 'none', true);
    },
    [setFocus]
  );

  if (!nodeSignal) return null;

  const levelStyles = LEVEL_STYLES[node.level] || LEVEL_STYLES[0];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      data-node-id={node.id}
      onKeyDown={handleKeyDown}
      className={`group flex items-start py-1.5 relative transition-all duration-300 ease-out ${isDimmed ? 'opacity-20' : 'opacity-100'} even:bg-black/[0.03] dark:even:bg-white/[0.03] hover:bg-blue-500/5 ${
        isSelected
          ? 'bg-blue-500/20 border-l-4 border-blue-500 z-10 shadow-sm scale-[1.002]'
          : isFocused
            ? mode === 'insert'
              ? 'border-l-4 border-emerald-500 bg-emerald-500/5 z-[100]'
              : 'border-l-4 border-blue-500 bg-blue-500/5 z-10'
            : 'border-l-4 border-transparent'
      }`}
    >
      <div
        className="flex-1 flex items-start min-w-0 transition-all duration-300"
        style={{ paddingLeft: `${displayLevel * 28}px` }}
      >
        {displayLevel > 0 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-border-subtle transition-opacity duration-500"
            style={{ left: `${displayLevel * 28 - 16}px` }}
          />
        )}

        <div className="flex items-center shrink-0">
          <NodeGutter
            hasChildren={hasChildren}
            collapsed={!!node.collapsed}
            checked={node.checked}
            isIndeterminate={!!isIndeterminate}
            onToggleCollapse={() => toggleCollapse(node.id)}
            onToggleCheck={() => toggleCheck(node.id)}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              outlinerStore.setHoistedNodeId(isHoisted ? null : id);
            }}
            className={`p-1 rounded-md transition-all duration-200 transform active:scale-90 ${isHoisted ? 'text-blue-500 bg-blue-500/10 opacity-100' : 'text-text-dim/20 opacity-0 group-hover:opacity-100 hover:text-blue-500 hover:bg-blue-500/10'}`}
            title={isHoisted ? 'Unfocus this branch' : 'Focus this branch (Hoist)'}
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {isFocused && mode === 'insert' ? (
          <NodeItemEdit
            textareaRef={textareaRef}
            value={localText}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setShowSuggestions(false);
              persistChanges();
            }}
            fontSize={levelStyles.fontSize}
            fontWeight={levelStyles.fontWeight}
            lineHeight={levelStyles.lineHeight}
            letterSpacing={levelStyles.letterSpacing}
            showSuggestions={showSuggestions}
            suggestions={filteredTags}
            suggestionIndex={suggestionIndex}
            onSelectSuggestion={handleApplyTag}
            mode={mode}
          />
        ) : (
          <div
            className={`flex-1 min-w-0 relative px-2 py-0.5 transition-all duration-200 cursor-pointer ${levelStyles.opacity || ''}`}
            onClick={() => handleFocusClick(node.id, 0)}
          >
            <ErrorBoundary>
              <RichTextRenderer
                text={node.text}
                checked={node.checked}
                colorMode={colorMode}
                fontSize={levelStyles.fontSize}
                fontWeight={levelStyles.fontWeight}
                lineHeight={levelStyles.lineHeight}
                letterSpacing={levelStyles.letterSpacing}
              />
            </ErrorBoundary>
          </div>
        )}
      </div>

      <div className="hidden md:flex items-start">
        {activeColumns.slice(1).map((col, idx) => {
          const colIndex = idx + 1;
          const rawVal = node.metadata?.[col.id];

          return (
            <div
              key={col.id}
              style={{ width: col.width }}
              className={`px-4 flex justify-center items-center min-h-[32px] border-l border-border-subtle transition-colors ${isFocused && activeColumnIndex === colIndex ? 'bg-blue-500/5' : ''}`}
            >
              {renderCell(col.type, {
                value: rawVal ?? null,
                isFocused: isFocused && activeColumnIndex === colIndex,
                onUpdate: (v) => updateMetadata(node.id, col.id, v),
                onKeyDown: handleKeyDown,
                onFocus: () => handleFocusClick(node.id, colIndex)
              })}
              <div
                ref={(el) => {
                  if (el) columnRefs.current[colIndex] = el.previousElementSibling as HTMLElement;
                }}
                className="hidden"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

const LEVEL_STYLES = [
  {
    fontSize: 'text-xl',
    fontWeight: 'font-bold',
    letterSpacing: 'tracking-tight',
    lineHeight: 'leading-tight'
  },
  {
    fontSize: 'text-lg',
    fontWeight: 'font-semibold',
    letterSpacing: 'tracking-tight',
    lineHeight: 'leading-snug'
  },
  {
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    letterSpacing: 'tracking-normal',
    lineHeight: 'leading-relaxed'
  },
  {
    fontSize: 'text-[15px]',
    fontWeight: 'font-normal',
    letterSpacing: 'tracking-normal',
    lineHeight: 'leading-relaxed'
  },
  {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    letterSpacing: 'tracking-normal',
    lineHeight: 'leading-relaxed',
    opacity: 'opacity-90'
  },
  {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    letterSpacing: 'tracking-normal',
    lineHeight: 'leading-relaxed',
    opacity: 'opacity-75'
  }
];
