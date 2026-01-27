import { useState, useEffect } from 'preact/hooks';
import { UploadCloud } from 'lucide-preact';
import { useOutlinerActions } from '../context/OutlinerContext';

export function ImportExportZone({ children }: { children: any }) {
  const [isDragging, setIsDragging] = useState(false);
  const { importNodes } = useOutlinerActions();

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer?.files[0];
      if (file && file.name.endsWith('.json')) {
        const text = await file.text();
        try {
          const importedNodes = JSON.parse(text);
          if (Array.isArray(importedNodes)) {
            if (confirm(`Import ${importedNodes.length} nodes? This will replace your current outline.`)) {
              await importNodes(importedNodes);
            }
          }
        } catch (err) {
          alert("Invalid JSON file.");
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [importNodes]);

  return (
    <div className="relative h-full w-full">
      {children}
      
      {isDragging && (
        <div className="absolute inset-0 z-[100] bg-blue-500/10 backdrop-blur-md border-4 border-dashed border-blue-500/50 flex flex-col items-center justify-center p-12 pointer-events-none">
          <div className="bg-app-bg p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <UploadCloud size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-text-main">Drop to Import</h3>
              <p className="text-sm text-text-dim mt-1">Accepts Omni .json exports</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function exportData(nodes: any[]) {
  const data = JSON.stringify(nodes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `omni-export-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}