import { useMemo } from 'preact/hooks';
import { OutlinerProvider, useOutlinerData } from '../context/OutlinerContext';
import { UIProvider, useUIState, useUIActions } from '../context/UIContext';
import { FilterProvider, useFilterState } from '../context/FilterContext';

import { NodeItem } from './NodeItem';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ShortcutsLegend } from './ShortcutsLegend';
import { ImportExportZone } from './ImportExportZone';

export function OutlinerWrapper() {
  return (
    <OutlinerProvider>
      <UIProvider>
        <FilterProvider>
          <ImportExportZone>
            <OutlinerContent />
          </ImportExportZone>
        </FilterProvider>
      </UIProvider>
    </OutlinerProvider>
  );
}

function OutlinerContent() {
  const { nodes, isLoading } = useOutlinerData();
  const { visibleNodesInfo } = useFilterState();
  const { activeColumns } = useUIState();
  const { setFocus } = useUIActions();

  const gridTemplate = useMemo(() => activeColumns.map(c => c.width).join(' '), [activeColumns]);

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
    <div className="flex h-screen bg-app-bg text-text-main font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full bg-app-bg min-w-0" style={{ '--grid-template': gridTemplate } as any}>
        <Header />

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto relative" onClick={() => setFocus(null)}>
          <div className="max-w-7xl mx-auto py-12 px-8 sm:px-12 pb-40 relative z-10" onClick={(e) => e.stopPropagation()}>
             {/* Column Header */}
             <div className="hidden md:grid border-b border-border-subtle mb-4 pb-2 sticky top-0 bg-app-bg/90 backdrop-blur-sm z-20" style={{ gridTemplateColumns: 'var(--grid-template)' }}>
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
                   key={node.id} 
                   node={node} 
                   hasChildren={hasChildren} 
                   isDimmed={isDimmed} 
                   isIndeterminate={indeterminateStates[node.id]}
                 />
               ))}
             </div>
             )}
          </div>
        </div>

        {/* Persistent Footer */}
        <ShortcutsLegend />
      </div>
    </div>
  );
}