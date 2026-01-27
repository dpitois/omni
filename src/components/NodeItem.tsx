import { useRef, useEffect, useState, useMemo } from 'preact/hooks';
import type { Node } from '../types';
import { Hash } from 'lucide-preact';
import { getTagColor } from '../utils/colors';
import { NodeGutter } from './NodeGutter';
import { ProgressCell } from './columns/ProgressCell';
import { DateCell, TextCell } from './columns/GenericCells';
import { useOutlinerData, useOutlinerActions } from '../context/OutlinerContext';
import { useUIState, useUIActions } from '../context/UIContext';
import { useFilterState } from '../context/FilterContext';
import { parseMarkdown, applyFormat } from '../utils/markdown';

interface NodeItemProps {
  node: Node;
  hasChildren: boolean;
  isDimmed: boolean;
  isIndeterminate?: boolean;
}

export function NodeItem({ 
  node, hasChildren, isDimmed, isIndeterminate
}: NodeItemProps) {
  const { tags } = useOutlinerData();
  const { addNode, updateNode, updateMetadata, toggleCheck, toggleCollapse, deleteNode, indentNode, outdentNode, moveNodeUp, moveNodeDown } = useOutlinerActions();
  const { colorMode, activeColumns, focusedNodeId, activeColumnIndex } = useUIState();
  const { setFocus, focusPrev, focusNext } = useUIActions();
  const { visibleNodes, activeTag, searchQuery } = useFilterState();

  const isFocused = focusedNodeId === node.id;
  const availableTags = useMemo(() => tags.map(t => t.name), [tags]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const columnRefs = useRef<(any)[]>([]);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionQuery, setSuggestionQuery] = useState('');

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [node.text, isFocused]);

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

  const handleFormat = (symbol: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const { text, newStart, newEnd } = applyFormat(node.text, start, end, symbol);
    updateNode(node.id, { text });
    
    setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(newStart, newEnd);
        }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const newIdx = e.key === 'ArrowRight' ? activeColumnIndex + 1 : activeColumnIndex - 1;
        if (newIdx >= 0 && newIdx < activeColumns.length) setFocus(node.id, newIdx);
        return;
    }

    if (activeColumnIndex === 0) {
        if (showSuggestions) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestionIndex(prev => (prev + 1) % filteredTags.length); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestionIndex(prev => (prev - 1 + filteredTags.length) % filteredTags.length); return; }
            if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applySuggestion(filteredTags[suggestionIndex]); return; }
            if (e.key === 'Escape') { setShowSuggestions(false); return; }
        }

        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'b') { e.preventDefault(); handleFormat('**'); return; }
            if (e.key.toLowerCase() === 'i') { e.preventDefault(); handleFormat('*'); return; }
            if (e.key.toLowerCase() === 'u') { e.preventDefault(); handleFormat('__'); return; }
            if (e.key.toLowerCase() === 's' && e.shiftKey) { e.preventDefault(); handleFormat('~~'); return; }
        }

        if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); toggleCheck(node.id); }
        else if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
        else if (e.key === 'Tab') { e.preventDefault(); if (e.shiftKey) outdentNode(node.id); else indentNode(node.id); }
        else if (e.key === 'Backspace' && node.text === '') { e.preventDefault(); handleDelete(); }
        else if (e.key === 'ArrowUp' && !e.altKey && inputRef.current?.selectionStart === 0) { focusPrev(visibleNodes, node.id); }
        else if (e.key === 'ArrowDown' && !e.altKey && inputRef.current?.selectionStart === node.text.length) { focusNext(visibleNodes, node.id); }
        else if (e.key === 'ArrowUp' && e.altKey) { e.preventDefault(); moveNodeUp(node.id); }
        else if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); moveNodeDown(node.id); }
        else if (e.key === '.' && e.ctrlKey) { e.preventDefault(); toggleCollapse(node.id); }
    } else {
        if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); setFocus(node.id, 0); }
    }
  };

  const handleAdd = () => {
    if (activeTag || searchQuery) return;
    const newId = addNode(node.id);
    setFocus(newId, 0);
  };

  const handleDelete = () => {
    const index = visibleNodes.findIndex(n => n.id === node.id);
    deleteNode(node.id);
    if (index > 0) setFocus(visibleNodes[index - 1].id, 0);
  };

  const handleInput = (e: any) => {
    const value = e.currentTarget.value;
    updateNode(node.id, { text: value });
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
    updateNode(node.id, { text: newTextBefore + textAfterCursor });
    setShowSuggestions(false);
    setTimeout(() => {
        if (inputRef.current) {
            const newPos = newTextBefore.length;
            inputRef.current.setSelectionRange(newPos, newPos);
        }
    }, 0);
  };

  const renderRichText = () => {
    const segments = parseMarkdown(node.text);
    return segments.map((seg, i) => {
      if (seg.isTag) {
        const colors = getTagColor(seg.text);
        return (
          <span key={i} className={`px-1 rounded -mx-1 font-medium transition-colors cursor-default inline ${colorMode ? `${colors.bg} ${colors.text}` : 'text-blue-500 bg-blue-500/10'}`}>
            {seg.text}
          </span>
        );
      }
      
      if (seg.isMarker) {
          if (!isFocused) return null;
          // Marqueurs plus visibles en édition
          return <span key={i} className="text-blue-500/40 font-mono font-bold">{seg.text}</span>;
      }

      // Calcul manuel des décorations de texte pour permettre le cumul (Underline + Line-through)
      const decorations = [];
      if (!isFocused && seg.underline) decorations.push('underline');
      if (node.checked || (!isFocused && seg.strikethrough)) decorations.push('line-through');

      const styles = [
          (!isFocused && seg.bold) ? 'font-bold' : '',
          (!isFocused && seg.italic) ? 'italic' : '',
          node.checked ? 'text-text-dim decoration-text-dim/50' : 'text-text-main'
      ].join(' ');

      return (
        <span 
            key={i} 
            className={styles} 
            style={{ textDecorationLine: decorations.join(' '), textDecorationThickness: '2px', textUnderlineOffset: '2px' }}
        >
            {seg.text}
        </span>
      );
    });
  };

  const getCursorPosition = () => {
    if (!inputRef.current) return { x: 0 };
    const width = getTextWidth(node.text.substring(0, inputRef.current.selectionStart || 0), '16px ui-sans-serif, system-ui');
    return { x: width + 8 };
  };

  const levelStyles = LEVEL_STYLES[node.level] || LEVEL_STYLES[0];

  return (
    <div 
      className={`group grid items-center py-0.5 relative transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
      style={{ gridTemplateColumns: activeColumns.map(c => c.width).join(' ') }}
    >
      <div className="flex items-start min-w-0" style={{ paddingLeft: `${node.level * 28}px` }}>
        {node.level > 0 && <div className="absolute top-0 bottom-0 w-px bg-border-subtle transition-colors" style={{ left: `${(node.level * 28) - 16}px` }} />}
        
        <NodeGutter 
          hasChildren={hasChildren} 
          collapsed={!!node.collapsed} 
          checked={node.checked} 
          isIndeterminate={!!isIndeterminate}
          onToggleCollapse={() => toggleCollapse(node.id)}
          onToggleCheck={() => toggleCheck(node.id)}
        />

        <div className="flex-1 min-w-0 relative">
            <div className={`absolute inset-0 pointer-events-none px-2 py-1 select-none whitespace-pre-wrap break-words border border-transparent leading-relaxed z-10 ${levelStyles.fontSize} ${levelStyles.fontWeight}`}>{renderRichText()}</div>
            <textarea
                ref={inputRef}
                value={node.text}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocus(node.id, 0)}
                rows={1}
                spellcheck={false}
                className={`w-full bg-transparent border border-transparent outline-none px-2 py-1 leading-relaxed caret-blue-500 text-transparent relative z-0 resize-none overflow-hidden ${levelStyles.fontSize} ${levelStyles.fontWeight} placeholder:text-text-dim/30`}
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

      {activeColumns.slice(1).map((col, idx) => {
          const colIndex = idx + 1;
          const val = node.metadata?.[col.id] || (col.type === 'progress' ? 0 : '');
          
          return (
            <div key={col.id} className={`px-4 flex justify-center items-center h-full border-l border-border-subtle transition-colors ${isFocused && activeColumnIndex === colIndex ? 'bg-blue-500/5' : ''}`}>
               {col.type === 'progress' ? (
                  <ProgressCell 
                    value={val} isFocused={isFocused && activeColumnIndex === colIndex} 
                    onUpdate={(v) => updateMetadata(node.id, col.id, v)}
                    onKeyDown={handleKeyDown} onFocus={() => setFocus(node.id, colIndex)}
                  />
               ) : col.type === 'date' ? (
                  <DateCell 
                    value={val} onUpdate={(v) => updateMetadata(node.id, col.id, v)}
                    onKeyDown={handleKeyDown} onFocus={() => setFocus(node.id, colIndex)}
                  />
               ) : (
                  <TextCell 
                    value={val} onUpdate={(v) => updateMetadata(node.id, col.id, v)}
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
