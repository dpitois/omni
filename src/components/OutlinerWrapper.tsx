import { useState, useMemo, useEffect } from 'preact/hooks';
import { useOutliner } from '../hooks/useOutliner';
import { useTags } from '../hooks/useTags';
import { useTheme } from '../hooks/useTheme';
import { NodeItem } from './NodeItem';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ShortcutsLegend } from './ShortcutsLegend';
import type { Column } from '../types';

const ALL_COLUMNS: Column[] = [
  { id: 'text', label: 'Outline', type: 'text', width: '1fr' },
  { id: 'status', label: 'Status', type: 'text', width: '120px' },
  { id: 'due', label: 'Due Date', type: 'date', width: '140px' },
  { id: 'progress', label: 'Progress', type: 'progress', width: '120px' }
];

export function OutlinerWrapper() {
  const { nodes, isLoading, addNode, updateNode, updateMetadata, toggleCheck, toggleCollapse, deleteNode, indentNode, outdentNode, moveNodeUp, moveNodeDown, renameTag } = useOutliner();
  const { tags } = useTags(nodes);
  const { darkMode, setDarkMode } = useTheme();
  
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorMode, setColorMode] = useState(true);

  // Column Visibility
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mvo_visible_columns');
    return saved ? JSON.parse(saved) : ['text', 'status', 'due', 'progress'];
  });

  useEffect(() => {
    localStorage.setItem('mvo_visible_columns', JSON.stringify(visibleColumnIds));
  }, [visibleColumnIds]);

  const activeColumns = useMemo(() => ALL_COLUMNS.filter(c => visibleColumnIds.includes(c.id)), [visibleColumnIds]);

  const toggleColumnVisibility = (id: string) => {
    setVisibleColumnIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Tag Editing
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleRename = () => {
    if (editingTag && editValue && editValue !== editingTag) {
      const newTag = editValue.startsWith('#') ? editValue : '#' + editValue;
      renameTag(editingTag, newTag);
      if (activeTag === editingTag) setActiveTag(newTag);
    }
    setEditingTag(null);
  };

  // Visibility Logic
  const visibleNodesInfo = useMemo(() => {
    const hasFilter = activeTag || searchQuery.trim() !== '';
    if (hasFilter) {
      const query = searchQuery.toLowerCase();
      const matchingIndices = new Set<number>();
      nodes.forEach((n, idx) => {
        const matchesTag = activeTag ? n.text.includes(activeTag) : true;
        const matchesSearch = query ? n.text.toLowerCase().includes(query) : true;
        if (matchesTag && matchesSearch) matchingIndices.add(idx);
      });
      const indicesToShow = new Set<number>();
      matchingIndices.forEach(index => {
        indicesToShow.add(index);
        let currentLevel = nodes[index].level;
        for (let i = index - 1; i >= 0; i--) {
          const candidate = nodes[i];
          if (candidate.level < currentLevel) {
            indicesToShow.add(i);
            currentLevel = candidate.level;
            if (currentLevel === 0) break;
          }
        }
      });
      return nodes
        .map((n, idx) => ({ node: n, originalIndex: idx })) 
        .filter(item => indicesToShow.has(item.originalIndex))
        .map(item => ({ node: item.node, isDimmed: !matchingIndices.has(item.originalIndex), hasChildren: false }));
    }

    const result = [];
    let hideUntilLevel: number | null = null;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (hideUntilLevel !== null) {
        if (node.level > hideUntilLevel) continue;
        else hideUntilLevel = null;
      }
      let hasChildren = i < nodes.length - 1 && nodes[i+1].level > node.level;
      result.push({ node, isDimmed: false, hasChildren });
      if (node.collapsed && hasChildren) hideUntilLevel = node.level;
    }
    return result;
  }, [nodes, activeTag, searchQuery]);

  const visibleNodes = visibleNodesInfo.map(info => info.node);

  const indeterminateStates = useMemo(() => {
    const states: Record<string, boolean> = {};
    for (let i = 0; i < nodes.length; i++) {
        const parent = nodes[i];
        if (parent.checked) continue;
        let hasCheckedChild = false;
        for (let j = i + 1; j < nodes.length; j++) {
            const child = nodes[j];
            if (child.level <= parent.level) break;
            if (child.checked) { hasCheckedChild = true; break; }
        }
        if (hasCheckedChild) states[parent.id] = true;
    }
    return states;
  }, [nodes]);

  const setFocus = (id: string | null, colIdx: number = 0) => {
    setFocusedNodeId(id);
    setActiveColumnIndex(colIdx);
  };

  const handleAdd = (afterId: string) => {
    if (activeTag || searchQuery) return;
    const newId = addNode(afterId);
    setFocus(newId, 0);
  };

  const handleFocusPrev = (currentId: string) => {
    const index = visibleNodes.findIndex(n => n.id === currentId);
    if (index > 0) setFocus(visibleNodes[index - 1].id, 0);
  };

  const handleFocusNext = (currentId: string) => {
    const index = visibleNodes.findIndex(n => n.id === currentId);
    if (index < visibleNodes.length - 1) setFocus(visibleNodes[index + 1].id, 0);
  };

  const handleDelete = (id: string) => {
    const index = visibleNodes.findIndex(n => n.id === id);
    deleteNode(id);
    if (index > 0) setFocus(visibleNodes[index - 1].id, 0);
  };

  return (
    <div className="flex h-screen bg-app-bg text-text-main font-sans selection:bg-blue-500/30 overflow-hidden">
      <Sidebar 
        show={showSidebar} activeTag={activeTag} searchQuery={searchQuery} tags={tags} colorMode={colorMode}
        editingTag={editingTag} editValue={editValue}
        onSelectTag={setActiveTag} 
        onStartEditing={(tag) => { setEditingTag(tag); setEditValue(tag); }}
        onEditChange={setEditValue} onRename={handleRename}
        onEditKeyDown={(e) => { if(e.key === 'Enter') handleRename(); else if(e.key === 'Escape') setEditingTag(null); }}
      />

      <div className="flex-1 flex flex-col h-full bg-app-bg min-w-0">
        <Header 
          activeTag={activeTag} searchQuery={searchQuery} darkMode={darkMode} colorMode={colorMode}
          showColumnMenu={showColumnMenu} allColumns={ALL_COLUMNS} visibleColumnIds={visibleColumnIds}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onToggleColorMode={() => setColorMode(!colorMode)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleColumnMenu={() => setShowColumnMenu(!showColumnMenu)}
          onSearchChange={setSearchQuery} onClearTag={() => setActiveTag(null)}
          onToggleColumn={toggleColumnVisibility}
        />

        <div className="flex-1 overflow-y-auto relative">
          <ShortcutsLegend />
          <div className="max-w-7xl mx-auto py-12 px-8 sm:px-12 pb-40 relative z-10">
             <div className="grid border-b border-border-subtle mb-4 pb-2 sticky top-0 bg-app-bg/90 backdrop-blur-sm z-20" style={{ gridTemplateColumns: activeColumns.map(c => c.width).join(' ') }}>
                {activeColumns.map((col, idx) => (
                    <div key={col.id} className={`text-[10px] font-bold uppercase tracking-widest text-text-dim/50 ${idx > 0 ? 'px-4 border-l border-border-subtle text-center' : 'px-8'}`}>
                        {col.label}
                    </div>
                ))}
             </div>

             {isLoading ? (
               <div className="flex justify-center items-center h-40">
                 <div className="w-6 h-6 border-2 border-border-subtle border-t-blue-500 rounded-full animate-spin"></div>
               </div>
             ) : (
             <div className="flex flex-col relative">
               {visibleNodesInfo.map(({ node, isDimmed, hasChildren }) => (
                 <NodeItem 
                   key={node.id} node={node} hasChildren={hasChildren} availableTags={tags.map(t => t.name)}
                   columns={activeColumns} colorMode={colorMode} isDimmed={isDimmed} isIndeterminate={indeterminateStates[node.id]}
                   isFocused={focusedNodeId === node.id} activeColumnIndex={activeColumnIndex} setFocus={setFocus}
                   onAdd={handleAdd} onUpdate={updateNode} onUpdateMetadata={updateMetadata}
                   onToggleCheck={toggleCheck} onToggleCollapse={toggleCollapse} onDelete={handleDelete}
                   onIndent={indentNode} onOutdent={outdentNode} onMoveUp={moveNodeUp} onMoveDown={moveNodeDown}
                   onFocusPrev={handleFocusPrev} onFocusNext={handleFocusNext}
                 />
               ))}
             </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}