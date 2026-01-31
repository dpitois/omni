import { useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useOutlinerActions } from '../context/OutlinerContext';
import { outlinerStore } from '../services/store';

export function ImportExportZone({ children }: { children: ComponentChildren }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { takeSnapshot } = useOutlinerActions();

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      let nodes = [];
      if (file.name.endsWith('.json')) {
        nodes = JSON.parse(text);
      } else if (file.name.endsWith('.opml') || file.name.endsWith('.xml')) {
        const { parseOPML } = await import('../utils/export');
        nodes = parseOPML(text);
      }

      if (Array.isArray(nodes) && nodes.length > 0) {
        if (confirm(`Import ${nodes.length} nodes?`)) {
          takeSnapshot();
          await outlinerStore.clearAll();
          outlinerStore.setNodes(nodes);
          await outlinerStore.saveNodes(nodes);
        }
      }
    } catch (err) {
      alert('Failed to import file. Check console for details.');
      console.error(err);
    }
  };

  return (
    <div className="relative h-full w-full group">
      {children}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.opml,.xml"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Visual cue for drag & drop or click import if no nodes */}
      {outlinerStore.nodes.value.length === 0 && !outlinerStore.isLoading.value && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 border-2 border-dashed border-border-subtle rounded-3xl bg-app-bg/50 backdrop-blur-sm">
            <p className="text-text-dim mb-4">Your outline is empty.</p>
            <button
              onClick={handleImport}
              className="pointer-events-auto px-6 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg"
            >
              Import Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
