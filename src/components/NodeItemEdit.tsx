import { memo } from 'preact/compat';
import { useLayoutEffect, useRef, useCallback } from 'preact/hooks';
import type { RefObject } from 'preact';
import type { JSX } from 'preact';
import { TagSuggestions } from './TagSuggestions';
import { useUIState } from '../context/UIContext';
import type { UIMode } from '../types';

interface NodeItemEditProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
  value: string;
  onInput: (e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onBlur: () => void;
  fontSize: string;
  fontWeight: string;
  lineHeight?: string;
  letterSpacing?: string;
  showSuggestions: boolean;
  suggestions: string[];
  suggestionIndex: number;
  onSelectSuggestion: (tag: string) => void;
  mode: UIMode;
}

export const NodeItemEdit = memo(function NodeItemEdit({
  textareaRef,
  value,
  onInput,
  onKeyDown,
  onBlur,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  showSuggestions,
  suggestions,
  suggestionIndex,
  onSelectSuggestion,
  mode
}: NodeItemEditProps) {
  const { initialCursorPos } = useUIState();
  const hasFocusedRef = useRef(false);

  // Focus logic
  const focusInput = useCallback(
    (el: HTMLTextAreaElement, forcePos: 'start' | 'end' | 'none' = 'none') => {
      if (mode === 'insert') {
        const isCurrentlyFocused = document.activeElement === el;
        if (!isCurrentlyFocused) {
          el.focus();
        }

        if (forcePos === 'end') {
          const len = el.value.length;
          el.setSelectionRange(len, len);
        } else if (forcePos === 'start') {
          el.setSelectionRange(0, 0);
        }
      }
    },
    [mode]
  );

  // Use a callback ref to handle immediate focus when the element is mounted
  const handleRef = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    if (el && !hasFocusedRef.current) {
      focusInput(el, initialCursorPos);
      hasFocusedRef.current = true;
    }
  };

  // Double check focus after render but avoid resetting selection
  useLayoutEffect(() => {
    if (textareaRef.current) {
      focusInput(textareaRef.current, 'none');
    }
  }, [mode, focusInput, textareaRef]);

  // Auto-resize logic
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '0px';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = scrollHeight + 'px';
    }
  }, [value, textareaRef]);

  return (
    <div className="flex-1 min-w-0 relative px-2 py-0.5">
      <textarea
        ref={handleRef}
        value={value}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        rows={1}
        spellcheck={false}
        className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden text-text-main ${mode === 'normal' ? 'caret-transparent' : 'caret-blue-500'} ${fontSize} ${fontWeight} ${lineHeight || ''} ${letterSpacing || ''} placeholder:text-text-dim/30`}
      />
      {showSuggestions && (
        <TagSuggestions
          suggestions={suggestions}
          selectedIndex={suggestionIndex}
          onSelect={onSelectSuggestion}
          anchorRef={textareaRef}
        />
      )}
    </div>
  );
});
