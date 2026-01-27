import { useMemo, useState } from 'preact/hooks';
import { useOutliner } from '../hooks/useOutliner';
import { useTags } from '../hooks/useTags';
import { useTheme } from '../hooks/useTheme';
import { useOutlinerFilter } from '../hooks/useOutlinerFilter';
import { useOutlinerUI, ALL_COLUMNS } from '../hooks/useOutlinerUI';

import { NodeItem } from './NodeItem';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ShortcutsLegend } from './ShortcutsLegend';

export function OutlinerWrapper() {
  const { nodes, isLoading, addNode, updateNode, updateMetadata, toggleCheck, toggleCollapse, deleteNode, indentNode, outdentNode, moveNodeUp, moveNodeDown, renameTag } = useOutliner();
  const { tags } = useTags(nodes);
  const { darkMode, setDarkMode } = useTheme();
  
  // Custom Logic Hooks
  const ui = useOutlinerUI();
  const filter = useOutlinerFilter(nodes);

  // Tag Editing State (Local to Wrapper for coordination)
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleRename = () => {
    if (editingTag && editValue && editValue !== editingTag) {
      const newTag = editValue.startsWith('#') ? editValue : '#' + editValue;
      renameTag(editingTag, newTag);
      if (filter.activeTag === editingTag) filter.setActiveTag(newTag);
    }
    setEditingTag(null);
  };

  // Focus Handlers
  const setFocus = (id: string | null, colIdx: number = 0) => {
    ui.setFocusedNodeId(id);
    ui.setActiveColumnIndex(colIdx);
  };

  const handleAdd = (afterId: string) => {
    if (filter.activeTag || filter.searchQuery) return;
    const newId = addNode(afterId);
    setFocus(newId, 0);
  };

  const handleFocusPrev = (currentId: string) => {
    const index = filter.visibleNodes.findIndex(n => n.id === currentId);
    if (index > 0) setFocus(filter.visibleNodes[index - 1].id, 0);
  };

  const handleFocusNext = (currentId: string) => {
    const index = filter.visibleNodes.findIndex(n => n.id === currentId);
    if (index < filter.visibleNodes.length - 1) setFocus(filter.visibleNodes[index + 1].id, 0);
  };

  const handleDelete = (id: string) => {
    const index = filter.visibleNodes.findIndex(n => n.id === id);
    deleteNode(id);
    if (index > 0) setFocus(filter.visibleNodes[index - 1].id, 0);
  };

  // Derived state for Checkboxes
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

  return (
    <div className="flex h-screen bg-app-bg text-text-main font-sans selection:bg-blue-500/30 overflow-hidden">
      <Sidebar 
        show={ui.showSidebar} 
        activeTag={filter.activeTag} 
        searchQuery={filter.searchQuery} 
        tags={tags} 
        colorMode={ui.colorMode}
        editingTag={editingTag} 
        editValue={editValue}
        onSelectTag={filter.setActiveTag} 
        onStartEditing={(tag) => { setEditingTag(tag); setEditValue(tag); }}
        onEditChange={setEditValue} 
        onRename={handleRename}
        onEditKeyDown={(e) => { if(e.key === 'Enter') handleRename(); else if(e.key === 'Escape') setEditingTag(null); }}
      />

      <div className="flex-1 flex flex-col h-full bg-app-bg min-w-0">
        <Header 
          activeTag={filter.activeTag} 
          searchQuery={filter.searchQuery} 
          darkMode={darkMode} 
          colorMode={ui.colorMode}
          showColumnMenu={ui.showColumnMenu} 
          allColumns={ALL_COLUMNS} 
          visibleColumnIds={ui.visibleColumnIds}
          onToggleSidebar={() => ui.setShowSidebar(!ui.showSidebar)}
          onToggleColorMode={() => ui.setColorMode(!ui.colorMode)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleColumnMenu={() => ui.setShowColumnMenu(!ui.showColumnMenu)}
          onSearchChange={filter.setSearchQuery} 
          onClearTag={() => filter.setActiveTag(null)}
          onToggleColumn={ui.toggleColumnVisibility}
        />

        <div className="flex-1 overflow-y-auto relative">
          <ShortcutsLegend />
          <div className="max-w-7xl mx-auto py-12 px-8 sm:px-12 pb-40 relative z-10">
             <div className="grid border-b border-border-subtle mb-4 pb-2 sticky top-0 bg-app-bg/90 backdrop-blur-sm z-20" style={{ gridTemplateColumns: ui.activeColumns.map(c => c.width).join(' ') }}>
                {ui.activeColumns.map((col, idx) => (
                    <div key={col.id} className={`text-[10px] font-bold uppercase tracking-widest text-text-dim/50 ${idx > 0 ? 'px-4 border-l border-border-subtle text-center' : 'px-8'}`}>
                        {col.label}
                    </div>
                ))}
             </div>

             {isLoading ? (
               <LoadingSpinner />
             ) : (
             <div className="flex flex-col relative">
               {filter.visibleNodesInfo.map(({ node, isDimmed, hasChildren }) => (
                 <NodeItem 
                   key={node.id} 
                   node={node} 
                   hasChildren={hasChildren} 
                   availableTags={tags.map(t => t.name)}
                   columns={ui.activeColumns} 
                   colorMode={ui.colorMode} 
                   isDimmed={isDimmed} 
                   isIndeterminate={indeterminateStates[node.id]}
                   isFocused={ui.focusedNodeId === node.id} 
                   activeColumnIndex={ui.activeColumnIndex} 
                   setFocus={setFocus}
                   onAdd={handleAdd} 
                   onUpdate={updateNode} 
                   onUpdateMetadata={updateMetadata}
                   onToggleCheck={toggleCheck} 
                   onToggleCollapse={toggleCollapse} 
                   onDelete={handleDelete}
                   onIndent={indentNode} 
                   onOutdent={outdentNode} 
                   onMoveUp={moveNodeUp} 
                   onMoveDown={moveNodeDown}
                   onFocusPrev={handleFocusPrev} 
                   onFocusNext={handleFocusNext}
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

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-40">
            <div className="w-6 h-6 border-2 border-border-subtle border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
}
