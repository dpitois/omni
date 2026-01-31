import { Plus, Trash2, Layout, Database, FileOutput, FileInput, Filter, X } from 'lucide-preact';
import { outlinerStore } from '../services/store';
import { commandStore } from '../services/commands';

export function Sidebar() {
  const documents = outlinerStore.availableDocuments.value;
  const currentDocId = outlinerStore.currentDocId.value;
  const savedFilters = outlinerStore.savedFilters.value;

  const currentQuery = outlinerStore.searchQuery.value;
  const currentTags = outlinerStore.activeTags.value;

  return (
    <div className="w-64 h-full bg-sidebar-bg border-r border-border-subtle flex flex-col shrink-0">
      <div className="p-4 border-b border-border-subtle bg-app-bg/50">
        <h1 className="text-sm font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
          <Database size={16} />
          <span>Workspaces</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Documents Section */}
        <div className="space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => outlinerStore.switchDocument(doc.id)}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                currentDocId === doc.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-text-main hover:bg-item-hover'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Layout
                  size={14}
                  className={currentDocId === doc.id ? 'text-white' : 'text-text-dim'}
                />
                <span className="text-sm font-medium truncate">{doc.title}</span>
              </div>

              {currentDocId !== doc.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${doc.title}"?`)) outlinerStore.deleteDocument(doc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              const title = prompt('Document title:', 'New Outline');
              if (title) outlinerStore.createDocument(title);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-dim hover:text-text-main hover:bg-item-hover rounded-lg transition-colors border border-dashed border-border-subtle mt-2"
          >
            <Plus size={14} />
            <span>New Document</span>
          </button>
        </div>

        {/* Saved Views Section */}
        <div className="space-y-2 pt-4 border-t border-border-subtle">
          <h2 className="px-3 text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center justify-between">
            <span>Saved Views</span>
            {(currentQuery || currentTags.length > 0) && (
              <button
                onClick={() => {
                  const name = prompt('Enter view name:', 'My Filter');
                  if (name) outlinerStore.saveCurrentFilter(name);
                }}
                className="text-blue-500 hover:text-blue-600 px-1"
                title="Save current filters as view"
              >
                Save
              </button>
            )}
          </h2>

          <div className="space-y-1">
            {savedFilters.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-text-dim/50 italic">
                No saved views yet.
              </div>
            ) : (
              savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  onClick={() => outlinerStore.applySavedFilter(filter)}
                  className="group flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer text-text-main hover:bg-item-hover transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter size={12} className="text-text-dim" />
                    <span className="text-xs truncate">{filter.label}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      outlinerStore.deleteSavedFilter(filter.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border-subtle bg-app-bg/30 space-y-2">
        <button
          onClick={() => commandStore.open('export')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-item-hover rounded-lg transition-colors"
        >
          <FileOutput size={14} />
          <span>Export...</span>
        </button>
        <button
          onClick={() => commandStore.open('import')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-item-hover rounded-lg transition-colors"
        >
          <FileInput size={14} />
          <span>Import...</span>
        </button>
      </div>
    </div>
  );
}
