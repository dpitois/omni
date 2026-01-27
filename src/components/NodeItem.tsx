import { useRef, useEffect, useState, useMemo } from 'preact/hooks';
import type { Node } from '../types';
import { ChevronRight, ChevronDown, Hash } from 'lucide-preact';
import { getTagColor } from '../utils/colors';

interface NodeItemProps {
  node: Node;
  hasChildren: boolean;
  availableTags: string[];
  colorMode: boolean;
  isDimmed: boolean;
  isIndeterminate?: boolean;
  isFocused: boolean;
  setFocus: (id: string | null) => void;
  onAdd: (afterId: string) => void;
  onUpdate: (id: string, updates: Partial<Node>) => void;
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
  node, hasChildren, availableTags, colorMode, isDimmed, isIndeterminate, isFocused, setFocus,
  onAdd, onUpdate, onToggleCheck, onToggleCollapse, onDelete, onIndent, onOutdent, onMoveUp, onMoveDown, onFocusPrev, onFocusNext 
}: NodeItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionQuery, setSuggestionQuery] = useState('');

  // Auto-focus logic
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused, node.updatedAt]);

  const filteredTags = useMemo(() => {
    if (!suggestionQuery) return availableTags.slice(0, 5);
    return availableTags
      .filter(t => t.toLowerCase().includes(suggestionQuery.toLowerCase()))
      .slice(0, 5);
  }, [availableTags, suggestionQuery]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev + 1) % filteredTags.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev - 1 + filteredTags.length) % filteredTags.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(filteredTags[suggestionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        onToggleCheck(node.id);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onAdd(node.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) onOutdent(node.id);
      else onIndent(node.id);
    } else if (e.key === 'Backspace' && node.text === '') {
      e.preventDefault();
      onDelete(node.id);
    } else if (e.key === 'ArrowUp') {
      if (e.altKey) {
          e.preventDefault();
          onMoveUp(node.id);
      } else if (inputRef.current?.selectionStart === 0) {
          onFocusPrev(node.id);
      }
    } else if (e.key === 'ArrowDown') {
      if (e.altKey) {
          e.preventDefault();
          onMoveDown(node.id);
      } else if (inputRef.current?.selectionStart === node.text.length) {
          onFocusNext(node.id);
      }
    } else if (e.key === '.' && e.ctrlKey) {
        e.preventDefault();
        onToggleCollapse(node.id);
    }
  };

  const handleInput = (e: any) => {
    const value = e.target.value;
    onUpdate(node.id, { text: value });

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
        return (
          <span key={i} className={`px-1 rounded mx-0.25 font-medium transition-colors cursor-default inline-block
            ${colorMode ? `${colors.bg} ${colors.text}` : 'text-blue-500 bg-blue-500/10'}
          `}>
            {part}
          </span>
        );
      }
      return <span key={i} className={node.checked ? 'text-text-dim line-through decoration-text-dim/50' : 'text-text-main'}>{part}</span>;
    });
  };

  const getCursorPosition = () => {
    if (!inputRef.current) return { x: 0 };
    const cursor = inputRef.current.selectionStart || 0;
    const textBefore = node.text.substring(0, cursor);
    const width = getTextWidth(textBefore, '16px ui-sans-serif, system-ui');
    return { x: width + 48 + (node.level * 28) };
  };

  const styles = LEVEL_STYLES[node.level] || LEVEL_STYLES[0];

  return (
    <div 
      className={`group flex items-start py-0.5 relative transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
      style={{ marginLeft: `${node.level * 28}px` }}
    >
      {node.level > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-border-subtle group-hover:bg-text-dim/20 transition-colors" />
      )}

      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
         {hasChildren ? (
           <button 
            onClick={() => onToggleCollapse(node.id)}
            className="p-0.5 rounded hover:bg-item-hover text-text-dim hover:text-text-main transition-all"
           >
             {node.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
           </button>
         ) : (
           <div className="w-1.5 h-1.5 rounded-full bg-text-dim/30 group-hover:bg-text-dim/60 transition-colors" />
         )}
         {node.collapsed && hasChildren && (
             <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500/20 text-blue-500 text-[10px] flex items-center justify-center rounded-full font-bold">
                +
             </div>
         )}
      </div>

      <div className="pt-2 px-1 flex-shrink-0">
        <button 
          onClick={() => onToggleCheck(node.id)}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200
            ${node.checked 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : isIndeterminate 
                ? 'bg-blue-500/30 border-blue-500 text-blue-500' 
                : 'border-border-subtle hover:border-text-dim'
            }
          `}
        >
          {node.checked && <div className="w-2 h-2 bg-white rounded-sm" />}
          {isIndeterminate && !node.checked && <div className="w-2 h-0.5 bg-blue-500 rounded-sm" />}
        </button>
      </div>

      {/* Text Area Container */}
      <div className="flex-1 min-w-0 relative">
        {/* Render Layer (Above) */}
        <div className={`absolute inset-0 pointer-events-none px-2 py-1 select-none whitespace-pre-wrap break-words border border-transparent leading-relaxed z-10 ${styles.fontSize} ${styles.fontWeight}`}>
          {renderTextWithTags()}
        </div>

        {/* Input Layer (Below, transparent text, visible caret) */}
        <input
          ref={inputRef}
          value={node.text}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocus(node.id)}
          onBlur={() => setTimeout(() => setFocus(null), 100)}
          placeholder={node.level === 0 && !node.text ? "Start typing..." : ""}
          className={`w-full bg-transparent border border-transparent outline-none px-2 py-1 leading-relaxed caret-blue-500 text-transparent relative z-0
            ${styles.fontSize} ${styles.fontWeight} 
            placeholder:text-text-dim/30
          `}
        />

        {/* Tag Suggestions Popup */}
        {showSuggestions && filteredTags.length > 0 && (
          <div 
            className="absolute z-50 bg-sidebar-bg border border-border-subtle rounded-lg shadow-xl py-1 w-48 mt-1 backdrop-blur-md overflow-hidden"
            style={{ left: `${getCursorPosition().x}px`, top: '100%' }}
          >
            {filteredTags.map((tag, i) => (
              <button
                key={tag}
                onClick={() => applySuggestion(tag)}
                className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors
                  ${i === suggestionIndex ? 'bg-blue-500 text-white' : 'text-text-main hover:bg-item-hover'}
                `}
              >
                <Hash size={12} className={i === suggestionIndex ? 'text-white' : 'text-text-dim'} />
                {tag.replace('#', '')}
              </button>
            ))}
          </div>
        )}
      </div>
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
