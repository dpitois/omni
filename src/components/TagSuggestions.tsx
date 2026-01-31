import { createPortal } from 'preact/compat';
import { useLayoutEffect, useState, useRef } from 'preact/hooks';
import { Hash } from 'lucide-preact';

interface TagSuggestionsProps {
  suggestions: string[];
  selectedIndex: number;
  onSelect: (tag: string) => void;
  anchorRef: { current: HTMLTextAreaElement | null };
}

/**
 * Helper to get the caret coordinates in a textarea
 */
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const copyStyle = window.getComputedStyle(element);

  for (const prop of Array.from(copyStyle)) {
    div.style.setProperty(
      prop,
      copyStyle.getPropertyValue(prop),
      copyStyle.getPropertyPriority(prop)
    );
  }

  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.style.width = element.offsetWidth + 'px';
  div.style.height = 'auto';

  const textContent = element.value.substring(0, position);
  div.textContent = textContent;

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  document.body.appendChild(div);
  const { offsetLeft: spanLeft, offsetTop: spanTop } = span;
  const lineHeight = parseInt(copyStyle.lineHeight);
  document.body.removeChild(div);

  const rect = element.getBoundingClientRect();

  return {
    top: rect.top + window.scrollY + spanTop + lineHeight,
    left: rect.left + window.scrollX + spanLeft
  };
}

export function TagSuggestions({
  suggestions,
  selectedIndex,
  onSelect,
  anchorRef
}: TagSuggestionsProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (el) {
      const pos = el.selectionStart || 0;
      const { top, left } = getCaretCoordinates(el, pos);
      setCoords({ top, left });
    } else {
      setCoords(null);
    }
  }, [anchorRef, suggestions.length]);

  // If no suggestions OR coordinates haven't been calculated yet, don't show anything.
  // This prevents the "teleportation" flash from (0,0).
  if (suggestions.length === 0 || !coords) return null;

  const content = (
    <div
      ref={paletteRef}
      style={{
        position: 'absolute',
        top: `${coords.top + 8}px`,
        left: `${coords.left}px`,
        zIndex: 9999,
        minWidth: '180px'
      }}
      className="bg-sidebar-bg border border-border-subtle rounded-lg shadow-2xl py-1 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-75"
    >
      <div className="px-2 py-1 text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-border-subtle mb-1">
        Tags
      </div>
      {suggestions.map((tag, i) => (
        <button
          key={tag}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(tag);
          }}
          className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
            i === selectedIndex ? 'bg-blue-500 text-white' : 'text-text-main hover:bg-item-hover'
          }`}
        >
          <Hash size={12} className={i === selectedIndex ? 'text-white' : 'text-text-dim'} />
          <span className="font-medium">{tag.replace('#', '')}</span>
        </button>
      ))}
    </div>
  );

  return createPortal(content, document.body);
}
