import { useState, useEffect, useMemo } from 'preact/hooks';
import type { Column } from '../types';

export const ALL_COLUMNS: Column[] = [
  { id: 'text', label: 'Outline', type: 'text', width: '1fr' },
  { id: 'status', label: 'Status', type: 'text', width: '120px' },
  { id: 'due', label: 'Due Date', type: 'date', width: '140px' },
  { id: 'progress', label: 'Progress', type: 'progress', width: '120px' }
];

export function useOutlinerUI() {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [colorMode, setColorMode] = useState(true);

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mvo_visible_columns');
    return saved ? JSON.parse(saved) : ['text', 'status', 'due', 'progress'];
  });

  useEffect(() => {
    localStorage.setItem('mvo_visible_columns', JSON.stringify(visibleColumnIds));
  }, [visibleColumnIds]);

  const activeColumns = useMemo(() => 
    ALL_COLUMNS.filter(c => visibleColumnIds.includes(c.id)), 
    [visibleColumnIds]
  );

  const toggleColumnVisibility = (id: string) => {
    setVisibleColumnIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return {
    focusedNodeId, setFocusedNodeId,
    activeColumnIndex, setActiveColumnIndex,
    showSidebar, setShowSidebar,
    showColumnMenu, setShowColumnMenu,
    colorMode, setColorMode,
    visibleColumnIds, activeColumns, toggleColumnVisibility
  };
}
