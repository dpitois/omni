import { useState, useMemo, useRef, useEffect } from 'preact/hooks';
import { useOutliner } from '../hooks/useOutliner';
import { useTags } from '../hooks/useTags';
import { NodeItem } from './NodeItem';
import { Hash, Sidebar as SidebarIcon, X, Palette, Sun, Moon, Search } from 'lucide-preact';
import { getTagColor } from '../utils/colors';

export function OutlinerWrapper() {
  const { nodes, isLoading, addNode, updateNode, toggleCheck, toggleCollapse, deleteNode, indentNode, outdentNode, moveNodeUp, moveNodeDown, renameTag } = useOutliner();
  const { tags } = useTags(nodes);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorMode, setColorMode] = useState(true);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Theme Management
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mvo_theme');
    return saved ? saved === 'dark' : true; 
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('mvo_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mvo_theme', 'light');
    }
  }, [darkMode]);

  // Global Keyboard Shortcuts (Search)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const tagNames = useMemo(() => tags.map(t => t.name), [tags]);

  // Tag Editing State
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTag && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTag]);

  const startEditing = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
  };

  const handleRename = () => {
    if (editingTag && editValue && editValue !== editingTag) {
      const newTag = editValue.startsWith('#') ? editValue : '#' + editValue;
      renameTag(editingTag, newTag);
      if (activeTag === editingTag) setActiveTag(newTag);
    }
    setEditingTag(null);
  };

  const handleEditKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditingTag(null);
    }
  };

  // Visibility Logic (Search + Tags)
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
        // Show parents for context
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
        .map((n, idx) => ({ 
            node: n, 
            originalIndex: idx, 
            hasChildren: false // Simplify in filter mode
        })) 
        .filter(item => indicesToShow.has(item.originalIndex))
        .map(item => {
            const isMatch = matchingIndices.has(item.originalIndex);
            return {
                node: item.node,
                isDimmed: !isMatch,
                hasChildren: false
            };
        });
    }

    // Standard View (with Collapsing)
    const result = [];
    let hideUntilLevel: number | null = null;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      if (hideUntilLevel !== null) {
        if (node.level > hideUntilLevel) {
          continue;
        } else {
          hideUntilLevel = null;
        }
      }

      let hasChildren = false;
      if (i < nodes.length - 1 && nodes[i+1].level > node.level) {
        hasChildren = true;
      }

      result.push({
        node,
        isDimmed: false,
        hasChildren
      });

      if (node.collapsed && hasChildren) {
        hideUntilLevel = node.level;
      }
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
            if (child.checked) {
                hasCheckedChild = true;
                break;
            }
        }
        if (hasCheckedChild) {
            states[parent.id] = true;
        }
    }
    return states;
  }, [nodes]);

  const handleAdd = (afterId: string) => {
    if (activeTag || searchQuery) return;
    const newId = addNode(afterId);
    setFocusedNodeId(newId);
  };

  const handleFocusPrev = (currentId: string) => {
    const index = visibleNodes.findIndex(n => n.id === currentId);
    if (index > 0) setFocusedNodeId(visibleNodes[index - 1].id);
  };

  const handleFocusNext = (currentId: string) => {
    const index = visibleNodes.findIndex(n => n.id === currentId);
    if (index < visibleNodes.length - 1) setFocusedNodeId(visibleNodes[index + 1].id);
  };

  const handleDelete = (id: string) => {
    const index = visibleNodes.findIndex(n => n.id === id);
    deleteNode(id);
    if (index > 0) setFocusedNodeId(visibleNodes[index - 1].id);
  };

  return (
    <div className="flex h-screen bg-app-bg text-text-main font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300 ease-in-out bg-sidebar-bg border-r border-border-subtle flex flex-col flex-shrink-0`}>
        <div className="p-4 pt-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-semibold text-text-dim uppercase tracking-widest">Library</h2>
            <div className="flex items-center gap-1">
                <button 
                onClick={() => setColorMode(!colorMode)} 
                className={`p-1.5 rounded transition-colors ${colorMode ? 'text-text-main bg-app-bg shadow-sm' : 'text-text-dim hover:text-text-main'}`}
                title="Toggle Colors"
                >
                <Palette size={14} />
                </button>
                <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="p-1.5 rounded text-text-dim hover:text-text-main transition-colors"
                title="Toggle Theme"
                >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
            </div>
          </div>
          
          <div className="space-y-0.5 flex-1 overflow-y-auto">
            <button 
                onClick={() => { setActiveTag(null); setSearchQuery(''); }}
                className={`w-full text-left flex items-center px-2 py-1.5 rounded-md text-sm transition-colors mb-2
                  ${(!activeTag && !searchQuery) ? 'bg-blue-500/10 text-blue-500' : 'text-text-dim hover:text-text-main hover:bg-item-hover'}
                `}
            >
              <SidebarIcon size={14} className="mr-2" />
              All Notes
            </button>

            {tags.length === 0 ? (
               <div className="px-2 py-2 text-sm text-text-dim italic">No tags yet</div>
            ) : (
              tags.map(({ name, count }) => {
                const colors = getTagColor(name);
                const isActive = activeTag === name;
                
                return (
                <div key={name}>
                  {editingTag === name ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onInput={(e) => setEditValue(e.currentTarget.value)}
                      onBlur={handleRename}
                      onKeyDown={handleEditKeyDown}
                      className="w-full bg-app-bg border border-blue-500/50 rounded-md px-2 py-1 text-sm text-text-main outline-none"
                    />
                  ) : (
                    <button 
                      onClick={() => setActiveTag(name)}
                      onDblClick={() => startEditing(name)}
                      className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all group
                        ${isActive 
                           ? (colorMode ? `${colors.bg} ${colors.text}` : 'bg-blue-500/10 text-blue-500')
                           : 'text-text-dim hover:bg-item-hover hover:text-text-main'
                        }
                      `}
                      title="Double click to rename"
                    >
                      <div className="flex items-center truncate">
                        <Hash size={14} className={`mr-2 flex-shrink-0 
                          ${isActive 
                            ? (colorMode ? colors.text : 'text-blue-500') 
                            : (colorMode ? `${colors.text} opacity-70 group-hover:opacity-100` : 'text-text-dim group-hover:text-blue-500')
                          }
                        `} />
                        <span className="truncate">{name.replace('#', '')}</span>
                      </div>
                      
                      <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-full flex-shrink-0
                        ${isActive 
                          ? (colorMode ? 'bg-black/10' : 'bg-blue-500/20 text-blue-600 dark:text-blue-300') 
                          : 'bg-black/5 dark:bg-white/5 text-text-dim group-hover:text-text-main'
                        }
                      `}>
                        {count}
                      </span>
                    </button>
                  )}
                </div>
              )})
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-app-bg min-w-0">
        
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-app-bg/80 backdrop-blur-md z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center flex-1">
            <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-1.5 rounded-md text-text-dim hover:bg-item-hover hover:text-text-main transition-colors mr-4"
            >
                <SidebarIcon size={18} />
            </button>
            <h1 className="text-sm font-medium text-text-dim flex items-center truncate">
                {activeTag ? (
                <>
                    <span className="text-text-dim/50 mr-2">Tag:</span> 
                    {(() => {
                    const colors = getTagColor(activeTag);
                    return (
                        <span className={`px-2 py-0.5 rounded text-xs ${colorMode ? `${colors.bg} ${colors.text}` : 'text-blue-500 bg-blue-500/10'}`}>
                        {activeTag}
                        </span>
                    );
                    })()}
                    <button onClick={() => setActiveTag(null)} className="ml-2 hover:bg-item-hover p-1 rounded-full"><X size={12}/></button>
                </>
                ) : "Untitled Outline"}
            </h1>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md ml-4 relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim/50">
                <Search size={14} />
             </div>
             <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Global Search... (Ctrl+F)"
                className="w-full bg-sidebar-bg/50 border border-border-subtle rounded-full py-1.5 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-blue-500/50 focus:bg-sidebar-bg transition-all placeholder:text-text-dim/30"
             />
             {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-main"
                >
                    <X size={14} />
                </button>
             )}
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Shortcuts Watermark - Centered Bottom */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0 hidden lg:block opacity-20 hover:opacity-80 transition-opacity duration-300 w-full max-w-4xl px-8">
             <div className="text-[11px] font-mono text-text-dim flex flex-wrap justify-center gap-x-6 gap-y-2 uppercase tracking-tight">
                <div className="flex items-center gap-1.5"><span className="font-bold text-text-dim bg-black/5 dark:bg-white/5 px-1 rounded">Enter</span> New Node</div>
                <div className="flex items-center gap-1.5"><span className="font-bold text-text-dim bg-black/5 dark:bg-white/5 px-1 rounded">Tab</span> Indent</div>
                <div className="flex items-center gap-1.5"><span className="font-bold text-text-dim bg-black/5 dark:bg-white/5 px-1 rounded">Alt + ↕</span> Move</div>
                <div className="flex items-center gap-1.5"><span className="font-bold text-text-dim bg-black/5 dark:bg-white/5 px-1 rounded">Ctrl + .</span> Fold</div>
                <div className="flex items-center gap-1.5"><span className="font-bold text-text-dim bg-black/5 dark:bg-white/5 px-1 rounded">Ctrl + Ent</span> Check</div>
                <div className="flex items-center gap-1.5"><span className="font-bold text-text-dim bg-black/5 dark:bg-white/5 px-1 rounded">#tag</span> Tag</div>
             </div>
          </div>

          <div className="max-w-4xl mx-auto py-12 px-8 sm:px-12 pb-40 relative z-10">
             {isLoading ? (
               <div className="flex justify-center items-center h-40">
                 <div className="w-6 h-6 border-2 border-border-subtle border-t-blue-500 rounded-full animate-spin"></div>
               </div>
             ) : (
             <div className="flex flex-col relative">
               
               {visibleNodesInfo.map(({ node, isDimmed, hasChildren }) => (
                 <NodeItem 
                   key={node.id}
                   node={node}
                   hasChildren={hasChildren}
                   availableTags={tagNames}
                   colorMode={colorMode}
                   isDimmed={isDimmed}
                   isIndeterminate={indeterminateStates[node.id]}
                   isFocused={focusedNodeId === node.id}
                   setFocus={setFocusedNodeId}
                   onAdd={handleAdd}
                   onUpdate={updateNode}
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
               
               {visibleNodes.length === 0 && (
                 <div className="text-center py-20 text-text-dim/50">
                   {searchQuery || activeTag ? 'No notes found' : <>Press <span className="font-mono bg-item-hover px-1 rounded">Enter</span> to start writing</>}
                 </div>
               )}
             </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}