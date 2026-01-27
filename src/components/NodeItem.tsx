import { useRef, useEffect, useState, useMemo } from 'preact/hooks';
import type { Node } from '../types';
import { Minus, ChevronRight, ChevronDown } from 'lucide-preact';
import { getTagColor } from '../utils/colors';

interface Props {
  node: Node;
  hasChildren?: boolean;
  availableTags?: string[];
  colorMode?: boolean;
  isFocused: boolean;
  isIndeterminate?: boolean;
  isDimmed?: boolean;
  onUpdate: (id: string, updates: Partial<Node>) => void;
  onToggleCheck: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onAdd: (afterId: string) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onFocusNext: (id: string) => void;
  onFocusPrev: (id: string) => void;
  setFocus: (id: string) => void;
}

// Helper to measure text width for popup positioning - Shared Canvas Singleton
const canvas = document.createElement('canvas');
const getTextWidth = (text: string, font: string) => {
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width;
};

const LEVEL_STYLES = [
  { size: '22px', weight: '700', opacity: '1' },
  { size: '19px', weight: '600', opacity: '0.95' },
  { size: '17px', weight: '500', opacity: '0.9' },
  { size: '16px', weight: '400', opacity: '0.85' },
  { size: '15px', weight: '400', opacity: '0.8' },
  { size: '14px', weight: '400', opacity: '0.75' },
];

export function NodeItem({ 
  node, 
  hasChildren = false,
  availableTags = [],
  colorMode = false,
  isFocused, 
  isIndeterminate,
  isDimmed,
  onUpdate, 
  onToggleCheck,
  onToggleCollapse,
  onAdd, 
  onIndent, 
  onOutdent, 
  onMoveUp,
  onMoveDown,
  onDelete,
  onFocusNext,
  onFocusPrev,
  setFocus
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [popupLeftOffset, setPopupLeftOffset] = useState(0);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused, node]);

  useEffect(() => {
    if (!isFocused) setShowSuggestions(false);
  }, [isFocused]);

  const filteredTags = useMemo(() => {
    if (!suggestionQuery) return availableTags;
    const lowerQuery = suggestionQuery.toLowerCase().replace('#', '');
    return availableTags.filter(tag => 
      tag.toLowerCase().replace('#', '').includes(lowerQuery)
    );
  }, [availableTags, suggestionQuery]);

  const checkSuggestions = () => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const cursor = input.selectionStart || 0;
    const text = input.value;
    const textBeforeCursor = text.slice(0, cursor);
    const lastWordMatch = textBeforeCursor.match(/#\S*$/);

    if (lastWordMatch) {
      const matchText = lastWordMatch[0];
      const matchIndex = lastWordMatch.index!;
      const font = window.getComputedStyle(input).font;
      const width = getTextWidth(textBeforeCursor.slice(0, matchIndex), font);
      setPopupLeftOffset(width);
      if (matchText !== suggestionQuery || !showSuggestions) {
        setSuggestionIndex(0);
      }
      setSuggestionQuery(matchText);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (tag: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const cursor = input.selectionStart || 0;
    const text = input.value;
    const textBeforeCursor = text.slice(0, cursor);
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    if (lastHashIndex === -1) return;

    const newText = text.slice(0, lastHashIndex) + tag + ' ' + text.slice(cursor);
    onUpdate(node.id, { text: newText });
    setShowSuggestions(false);
    requestAnimationFrame(() => {
        if(inputRef.current) {
            const newCursorPos = lastHashIndex + tag.length + 1;
            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            inputRef.current.focus();
        }
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showSuggestions && filteredTags.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev > 0 ? prev - 1 : filteredTags.length - 1));
        return;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev < filteredTags.length - 1 ? prev + 1 : 0));
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(filteredTags[suggestionIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    // Move Node (Alt + Arrows)
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      onMoveUp(node.id);
      return;
    }
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      onMoveDown(node.id);
      return;
    }

    // Toggle Collapse (Ctrl + .)
    if ((e.ctrlKey || e.metaKey) && e.key === '.') {
      e.preventDefault();
      onToggleCollapse(node.id);
      return;
    }

    // Toggle Check (Ctrl + Enter)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onToggleCheck(node.id);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd(node.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        onOutdent(node.id);
      } else {
        onIndent(node.id);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onFocusPrev(node.id);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onFocusNext(node.id);
    } else if (e.key === 'Backspace' && node.text === '') {
      e.preventDefault();
      onDelete(node.id);
    }
  };

  const handleInput = (e: any) => {
    onUpdate(node.id, { text: e.currentTarget.value });
    checkSuggestions();
  };

  const indentSize = 28;
  const paddingLeft = node.level * indentSize;
  const levelStyle = LEVEL_STYLES[Math.min(node.level, 5)];

  // Calculate visual height for alignment
  const lineHeight = `calc(${levelStyle.size} * 1.5)`;

  return (
    <div 
      className={`group relative flex items-start py-[4px] transition-all duration-300 ${isDimmed ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : 'opacity-100'}`}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={() => setFocus(node.id)}
    >
      {/* Collapse Toggle (Chevron) */}
      <div 
        className="relative flex-shrink-0 w-[20px] flex items-center justify-center cursor-pointer -ml-[20px] text-neutral-500 hover:text-neutral-300 transition-colors"
        style={{ height: lineHeight }}
        onClick={(e) => { 
          e.stopPropagation(); 
          if(hasChildren) onToggleCollapse(node.id); 
        }}
      >
        {hasChildren && (
          node.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />
        )}
      </div>

      {/* Checkbox Container */}
      <div 
        className="relative flex-shrink-0 w-[24px] flex items-center justify-center mr-1 cursor-pointer" 
        style={{ height: lineHeight }}
        onClick={(e) => { e.stopPropagation(); onToggleCheck(node.id); }}
      >
        <div className={`absolute inset-0.5 rounded transition-colors ${node.checked ? 'bg-transparent' : 'group-hover:bg-white/10'}`} />
        <div className={`relative w-[16px] h-[16px] rounded-[4px] border transition-all duration-200 flex items-center justify-center overflow-hidden
          ${node.checked || isIndeterminate
            ? 'bg-blue-600 border-blue-600' 
            : `bg-transparent ${isDimmed ? 'border-neutral-700' : 'border-neutral-600 group-hover:border-neutral-500'}`
          }
        `}>
          {node.checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 4.5L3.5 6.5L8.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {!node.checked && isIndeterminate && (
            <Minus size={12} className="text-white" strokeWidth={3} />
          )}
        </div>
      </div>
      
      {/* Text Input Container */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={node.text}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={checkSuggestions}
          onClick={checkSuggestions}
          style={{ 
            fontSize: levelStyle.size, 
            fontWeight: levelStyle.weight,
            lineHeight: '1.5'
          }}
          className={`w-full bg-transparent outline-none p-0 m-0 border-none font-sans tracking-normal transition-all duration-200
            ${node.checked ? 'text-neutral-500 line-through !font-normal' : (isDimmed ? 'text-neutral-400 italic' : 'text-neutral-100 placeholder-neutral-700')}
          `}
          placeholder={node.level === 0 ? "Title or Main Idea" : "New Item"} 
          autoComplete="off"
          spellcheck={false}
          readOnly={isDimmed} 
        />
        {isFocused && !isDimmed && (
          <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-[3px] h-[14px] bg-blue-500 rounded-r opacity-50 pointer-events-none" />
        )}

        {showSuggestions && filteredTags.length > 0 && (
           <div 
             className="absolute top-full mt-1 z-50 bg-[#252526] border border-white/10 rounded-md shadow-xl overflow-hidden min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
             style={{ left: `${popupLeftOffset}px` }}
           >
             <div className="text-[10px] uppercase tracking-wider text-neutral-500 px-2 py-1 bg-white/5 font-semibold">
               Tags
             </div>
             {filteredTags.map((tag, idx) => {
               const colors = getTagColor(tag);
               return (
               <div 
                 key={tag}
                 onClick={(e) => { e.stopPropagation(); applySuggestion(tag); }}
                 className={`px-3 py-1.5 text-sm cursor-pointer flex items-center border-l-2
                   ${idx === suggestionIndex 
                     ? (colorMode ? `${colors.bg} ${colors.border}` : 'bg-blue-600 text-white border-blue-600') 
                     : 'text-neutral-300 hover:bg-white/5 border-transparent'
                   }
                 `}
               >
                 <span className={`opacity-50 mr-1 ${idx === suggestionIndex ? '' : (colorMode ? colors.text : '')}`}>#</span>
                 <span className={idx !== suggestionIndex && colorMode ? colors.text : ''}>
                   {tag.replace('#', '')}
                 </span>
               </div>
             )})}
           </div>
        )}
      </div>
    </div>
  );
}
