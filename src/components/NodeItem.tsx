import { useRef, useEffect, useState, useMemo } from 'preact/hooks';
import type { Node, Column } from '../types';
import { Hash } from 'lucide-preact';
import { getTagColor } from '../utils/colors';
import { NodeGutter } from './NodeGutter';
import { ProgressCell } from './columns/ProgressCell';
import { DateCell, TextCell } from './columns/GenericCells';

interface NodeItemProps {
  node: Node;
  hasChildren: boolean;
  availableTags: string[];
  columns: Column[];
  colorMode: boolean;
  isDimmed: boolean;
  isIndeterminate?: boolean;
  isFocused: boolean;
  activeColumnIndex: number;
  setFocus: (id: string | null, columnIndex?: number) => void;
  onAdd: (afterId: string) => void;
  onUpdate: (id: string, updates: Partial<Node>) => void;
  onUpdateMetadata: (id: string, columnId: string, value: any) => void;
  onToggleCheck: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onDelete: (id: string) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onFocusPrev: (id: string) => void;
  onFocusNext: (id: string) => void;
}

export function NodeItem({ 
  node, hasChildren, availableTags, columns, colorMode, isDimmed, isIndeterminate, isFocused, activeColumnIndex, setFocus,
  onAdd, onUpdate, onUpdateMetadata, onToggleCheck, onToggleCollapse, onDelete, onIndent, onOutdent, onMoveUp, onMoveDown, onFocusPrev, onFocusNext 
}: NodeItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const columnRefs = useRef<(any)[]>([]);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionQuery, setSuggestionQuery] = useState('');

  useEffect(() => {
    if (isFocused) {
      if (activeColumnIndex === 0 && inputRef.current) {
        inputRef.current.focus();
      } else if (activeColumnIndex > 0 && columnRefs.current[activeColumnIndex]) {
        columnRefs.current[activeColumnIndex]?.focus?.();
      }
    }
  }, [isFocused, activeColumnIndex, node.updatedAt]);

  const filteredTags = useMemo(() => {
    if (!suggestionQuery) return availableTags.slice(0, 5);
    return availableTags
      .filter(t => t.toLowerCase().includes(suggestionQuery.toLowerCase()))
      .slice(0, 5);
  }, [availableTags, suggestionQuery]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const newIdx = e.key === 'ArrowRight' ? activeColumnIndex + 1 : activeColumnIndex - 1;
        if (newIdx >= 0 && newIdx < columns.length) setFocus(node.id, newIdx);
        return;
    }

    if (activeColumnIndex === 0) {
        if (showSuggestions) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestionIndex(prev => (prev + 1) % filteredTags.length); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestionIndex(prev => (prev - 1 + filteredTags.length) % filteredTags.length); return; }
            if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applySuggestion(filteredTags[suggestionIndex]); return; }
            if (e.key === 'Escape') { setShowSuggestions(false); return; }
        }

        if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); onToggleCheck(node.id); }
        else if (e.key === 'Enter') { e.preventDefault(); onAdd(node.id); }
        else if (e.key === 'Tab') { e.preventDefault(); if (e.shiftKey) onOutdent(node.id); else onIndent(node.id); }
        else if (e.key === 'Backspace' && node.text === '') { e.preventDefault(); onDelete(node.id); }
        else if (e.key === 'ArrowUp' && !e.altKey && inputRef.current?.selectionStart === 0) { onFocusPrev(node.id); }
        else if (e.key === 'ArrowDown' && !e.altKey && inputRef.current?.selectionStart === node.text.length) { onFocusNext(node.id); }
        else if (e.key === 'ArrowUp' && e.altKey) { e.preventDefault(); onMoveUp(node.id); }
        else if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); onMoveDown(node.id); }
        else if (e.key === '.' && e.ctrlKey) { e.preventDefault(); onToggleCollapse(node.id); }
    } else {
        if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); setFocus(node.id, 0); }
    }
  };

  const handleInput = (e: any) => {
    const value = e.currentTarget.value;
    onUpdate(node.id, { text: value });

    // Tag suggestion logic
    const cursor = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursor);
    const tagMatch = textBeforeCursor.match(/#(\w*)$/);

    if (tagMatch) {
      setSuggestionQuery(tagMatch[1]);
      setShowSuggestions(true);
      setSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (tag: string) => {
    const value = node.text;
    const cursor = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursor);
    const textAfterCursor = value.substring(cursor);
    
    const newTextBefore = textBeforeCursor.replace(/#(\w*)$/, tag);
    onUpdate(node.id, { text: newTextBefore + textAfterCursor });
    setShowSuggestions(false);
    
    setTimeout(() => {
        if (inputRef.current) {
            const newPos = newTextBefore.length;
            inputRef.current.setSelectionRange(newPos, newPos);
        }
    }, 0);
  };

  const renderTextWithTags = () => {
    const parts = node.text.split(/(#[\w\u00C0-\u00FF]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        const colors = getTagColor(part);
        return <span key={i} className={`px-1 rounded mx-0.25 font-medium transition-colors cursor-default inline-block ${colorMode ? `${colors.bg} ${colors.text}` : 'text-blue-500 bg-blue-500/10'}`}>{part}</span>;
      }
      return <span key={i} className={node.checked ? 'text-text-dim line-through decoration-text-dim/50' : 'text-text-main'}>{part}</span>;
    });
  };

  const getCursorPosition = () => {
    if (!inputRef.current) return { x: 0 };
    const cursor = inputRef.current.selectionStart || 0;
    const textBefore = node.text.substring(0, cursor);
    // Use the same font as the input for accurate measurement
    const width = getTextWidth(textBefore, '16px ui-sans-serif, system-ui');
    // Offset by 8px to account for input's px-2 padding
    return { x: width + 8 };
  };

  const styles = LEVEL_STYLES[node.level] || LEVEL_STYLES[0];

  return (
    <div 
      className={`group grid items-center py-0.5 relative transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
      style={{ gridTemplateColumns: columns.map(c => c.width).join(' ') }}
    >
      {/* Column 0: Outline */}
      <div className="flex items-start min-w-0" style={{ paddingLeft: `${node.level * 28}px` }}>
        {node.level > 0 && <div className="absolute top-0 bottom-0 w-px bg-border-subtle transition-colors" style={{ left: `${(node.level * 28) - 16}px` }} />}
        
        <NodeGutter 
          hasChildren={hasChildren} 
          collapsed={!!node.collapsed} 
          checked={node.checked} 
          isIndeterminate={!!isIndeterminate}
          onToggleCollapse={() => onToggleCollapse(node.id)}
          onToggleCheck={() => onToggleCheck(node.id)}
        />

        <div className="flex-1 min-w-0 relative">
            <div className={`absolute inset-0 pointer-events-none px-2 py-1 select-none whitespace-pre-wrap break-words border border-transparent leading-relaxed z-10 ${styles.fontSize} ${styles.fontWeight}`}>{renderTextWithTags()}</div>
            <input
                ref={inputRef}
                value={node.text}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocus(node.id, 0)}
                className={`w-full bg-transparent border border-transparent outline-none px-2 py-1 leading-relaxed caret-blue-500 text-transparent relative z-0 ${styles.fontSize} ${styles.fontWeight} placeholder:text-text-dim/30`}
            />

            {showSuggestions && filteredTags.length > 0 && (
                <div className="absolute z-50 bg-sidebar-bg border border-border-subtle rounded-lg shadow-xl py-1 w-48 mt-1 backdrop-blur-md overflow-hidden" style={{ left: `${getCursorPosition().x}px`, top: '100%' }}>
                    {filteredTags.map((tag, i) => (
                        <button key={tag} onClick={() => applySuggestion(tag)} className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${i === suggestionIndex ? 'bg-blue-500 text-white' : 'text-text-main hover:bg-item-hover'}`}>
                            <Hash size={12} className={i === suggestionIndex ? 'text-white' : 'text-text-dim'} />
                            {tag.replace('#', '')}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Dynamic Columns */}
      {columns.slice(1).map((col, idx) => {
          const colIndex = idx + 1;
          const val = node.metadata?.[col.id] || (col.type === 'progress' ? 0 : '');
          
          return (
            <div key={col.id} className={`px-4 flex justify-center items-center h-full border-l border-border-subtle transition-colors ${isFocused && activeColumnIndex === colIndex ? 'bg-blue-500/5' : ''}`}>
               {col.type === 'progress' ? (
                  <ProgressCell 
                    value={val} isFocused={isFocused && activeColumnIndex === colIndex} 
                    onUpdate={(v) => onUpdateMetadata(node.id, col.id, v)}
                    onKeyDown={handleKeyDown} onFocus={() => setFocus(node.id, colIndex)}
                  />
               ) : col.type === 'date' ? (
                  <DateCell 
                    value={val} onUpdate={(v) => onUpdateMetadata(node.id, col.id, v)}
                    onKeyDown={handleKeyDown} onFocus={() => setFocus(node.id, colIndex)}
                  />
               ) : (
                  <TextCell 
                    value={val} onUpdate={(v) => onUpdateMetadata(node.id, col.id, v)}
                    onKeyDown={handleKeyDown} onFocus={() => setFocus(node.id, colIndex)}
                  />
               )}
               <div ref={(el) => { if(el) columnRefs.current[colIndex] = el.previousElementSibling; }} className="hidden" />
            </div>
          );
      })}
    </div>
  );
}

const canvas = document.createElement('canvas');
const getTextWidth = (text: string, font: string) => {
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width;
};

const LEVEL_STYLES = [
  { fontSize: 'text-xl', fontWeight: 'font-semibold' },
  { fontSize: 'text-lg', fontWeight: 'font-medium' },
  { fontSize: 'text-base', fontWeight: 'font-normal' },
  { fontSize: 'text-sm', fontWeight: 'font-normal' },
  { fontSize: 'text-sm', fontWeight: 'font-normal opacity-90' },
  { fontSize: 'text-xs', fontWeight: 'font-normal opacity-80' },
];