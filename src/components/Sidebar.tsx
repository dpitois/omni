import { useRef, useEffect } from 'preact/hooks';
import { Hash, Sidebar as SidebarIcon, X, Download, Upload } from 'lucide-preact';
import { getTagColor } from '../utils/colors';
import { useUIState, useUIActions } from '../context/UIContext';
import { useOutlinerData, useOutlinerActions } from '../context/OutlinerContext';
import { useFilterState, useFilterActions } from '../context/FilterContext';
import { exportData } from './ImportExportZone';

export function Sidebar() {
  const { showSidebar, colorMode, editingTag, editValue } = useUIState();
  const { setEditingTag, setEditValue, setShowSidebar } = useUIActions();
  const { nodes, tags } = useOutlinerData();
  const { renameTag, importNodes } = useOutlinerActions();
  const { activeTag, searchQuery } = useFilterState();
  const { setActiveTag } = useFilterActions();

  const editInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTag && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTag]);

  const handleRename = () => {
    if (editingTag && editValue && editValue !== editingTag) {
      const newTag = editValue.startsWith('#') ? editValue : '#' + editValue;
      renameTag(editingTag, newTag);
      if (activeTag === editingTag) setActiveTag(newTag);
    }
    setEditingTag(null);
  };

  const handleEditKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleRename();
    else if (e.key === 'Escape') setEditingTag(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      try {
        const importedNodes = JSON.parse(text);
        if (Array.isArray(importedNodes)) {
          if (confirm(`Import ${importedNodes.length} nodes?`)) {
            await importNodes(importedNodes);
          }
        }
      } catch (err) {
        alert("Invalid JSON file.");
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg border-r border-border-subtle flex flex-col transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 pt-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-semibold text-text-dim uppercase tracking-widest">Library</h2>
            <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1 hover:bg-item-hover rounded-md text-text-dim">
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-0.5 flex-1 overflow-y-auto">
            <button 
              onClick={() => { setActiveTag(null); setShowSidebar(false); }} 
              className={`w-full text-left flex items-center px-2 py-1.5 rounded-md text-sm transition-colors mb-2 ${(!activeTag && !searchQuery) ? 'bg-blue-500/10 text-blue-500' : 'text-text-dim hover:text-text-main hover:bg-item-hover'}`}
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
                        onClick={() => { setActiveTag(name); setShowSidebar(false); }} 
                        onDblClick={() => { setEditingTag(name); setEditValue(name); }} 
                        className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all group ${isActive ? (colorMode ? `${colors.bg} ${colors.text}` : 'bg-blue-500/10 text-blue-500') : 'text-text-dim hover:bg-item-hover hover:text-text-main'}`}
                      >
                        <div className="flex items-center truncate">
                          <Hash size={14} className={`mr-2 flex-shrink-0 ${isActive ? (colorMode ? colors.text : 'text-blue-500') : (colorMode ? `${colors.text} opacity-70 group-hover:opacity-100` : 'text-text-dim group-hover:text-blue-500')}`} />
                          <span className="truncate">{name.replace('#', '')}</span>
                        </div>
                        <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActive ? (colorMode ? 'bg-black/10' : 'bg-blue-500/20 text-blue-600 dark:text-blue-300') : 'bg-black/5 dark:bg-white/5 text-text-dim group-hover:text-text-main'}`}>{count}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-border-subtle space-y-1">
            <h2 className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-2 mb-2">Actions</h2>
            <button 
              onClick={() => exportData(nodes)}
              className="w-full text-left flex items-center px-2 py-1.5 rounded-md text-sm text-text-dim hover:text-text-main hover:bg-item-hover transition-colors"
            >
              <Download size={14} className="mr-2" />
              Backup JSON
            </button>
            <button 
              onClick={handleImportClick}
              className="w-full text-left flex items-center px-2 py-1.5 rounded-md text-sm text-text-dim hover:text-text-main hover:bg-item-hover transition-colors"
            >
              <Upload size={14} className="mr-2" />
              Restore JSON
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              onChange={handleFileChange}
              className="hidden" 
            />
          </div>
        </div>
      </div>
    </>
  );
}