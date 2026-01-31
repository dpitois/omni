import { useState, useMemo } from 'preact/hooks';
import type { RefObject } from 'preact';

interface UseTagSuggestionsProps {
  availableTags: string[];
  textareaRef: RefObject<HTMLTextAreaElement>;
  onApply: (tag: string) => void;
}

export function useTagSuggestions({ availableTags, textareaRef, onApply }: UseTagSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionQuery, setSuggestionQuery] = useState('');

  const filteredTags = useMemo(() => {
    if (!suggestionQuery) return availableTags.slice(0, 5);
    return availableTags
      .filter((t) => t.toLowerCase().includes(suggestionQuery.toLowerCase()))
      .slice(0, 5);
  }, [availableTags, suggestionQuery]);

  const handleInputForTags = (value: string) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursor);
    const tagMatch = textBeforeCursor.match(/#([\w\u00C0-\u00FF-]*)$/);

    if (tagMatch) {
      setSuggestionQuery(tagMatch[1]);
      setShowSuggestions(true);
      setSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (tag: string) => {
    onApply(tag);
    setShowSuggestions(false);
  };

  const handleSuggestionKeyDown = (e: KeyboardEvent) => {
    if (!showSuggestions || filteredTags.length === 0) return false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex((prev) => (prev + 1) % filteredTags.length);
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex((prev) => (prev - 1 + filteredTags.length) % filteredTags.length);
      return true;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      applySuggestion(filteredTags[suggestionIndex]);
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      return true;
    }
    return false;
  };

  return {
    showSuggestions,
    setShowSuggestions,
    suggestionIndex,
    filteredTags,
    handleInputForTags,
    applySuggestion,
    handleSuggestionKeyDown
  };
}
