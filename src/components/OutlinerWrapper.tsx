import { useMemo, useEffect, useRef } from 'preact/hooks';
import { ChevronLeft } from 'lucide-preact';
import { useOutlinerData } from '../context/OutlinerContext';
import { useUIState, useUIActions } from '../context/UIContext';

import { NodeItem } from './NodeItem';
import { ImportExportZone } from './ImportExportZone';

import { useGlobalNavigation } from '../hooks/useGlobalNavigation';
import { outlinerStore } from '../services/store';

export function OutlinerWrapper() {
  return (
    <ImportExportZone>
      <OutlinerContent />
    </ImportExportZone>
  );
}

function OutlinerContent() {
  const { isLoading, tags } = useOutlinerData();
  const { activeColumns, focusedNodeId, colorMode, activeColumnIndex } = useUIState();
  const { setFocus, getNodeRef } = useUIActions();

  // READ SIGNALS DIRECTLY FOR MAXIMUM REACTIVITY
  const visibleNodesInfo = outlinerStore.visibleNodesInfo.value;
  const hoistedNodeId = outlinerStore.hoistedNodeId.value;
  const nodes = outlinerStore.nodes.value;

  const gridTemplate = useMemo(() => activeColumns.map((c) => c.width).join(' '), [activeColumns]);

  const visibleNodesRef = useRef(visibleNodesInfo.map((v) => v.node));
  useEffect(() => {
    visibleNodesRef.current = visibleNodesInfo.map((v) => v.node);
  }, [visibleNodesInfo]);

  // Centralized Navigation and Global Shortcuts
  useGlobalNavigation();

  const indeterminateStates = outlinerStore.indeterminateStates.value;

  const handleBackgroundClick = () => {
    if (focusedNodeId) {
      const el = getNodeRef(focusedNodeId);
      if (el) el.focus();
    } else if (nodes.length > 0) {
      setFocus(nodes[0].id, 0);
    }
  };

  const hoistedNode = useMemo(
    () => (hoistedNodeId ? nodes.find((n) => n.id === hoistedNodeId) : null),
    [hoistedNodeId, nodes]
  );

  return (
    <div
      className="h-full w-full flex flex-col min-w-0 bg-app-bg text-text-main"
      style={{ '--grid-template': gridTemplate } as { [key: string]: string }}
      onClick={handleBackgroundClick}
    >
      {/* Breadcrumb / Focus Indicator */}
      {hoistedNode && (
        <div className="max-w-7xl mx-auto w-full px-8 sm:px-12 mt-6 -mb-6 relative z-30">
          <button
            onClick={() => outlinerStore.setHoistedNodeId(null)}
            className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/20 shadow-sm"
          >
            <ChevronLeft size={14} />
            <span>Back to full outline</span>
            <span className="mx-1 text-blue-500/30">|</span>
            <span className="text-text-main/60 truncate max-w-[200px]">
              Focusing: {hoistedNode.text || 'Untitled'}
            </span>
          </button>
        </div>
      )}

      {/* Column Header */}
      <div className="max-w-7xl mx-auto w-full px-8 sm:px-12 mt-12 mb-4">
        <div
          className="hidden md:grid border-b border-border-subtle pb-2 sticky top-0 bg-app-bg/90 backdrop-blur-sm z-20"
          style={{ gridTemplateColumns: 'var(--grid-template)' }}
        >
          {activeColumns.map((col, idx) => (
            <div
              key={col.id}
              className={`text-[10px] font-bold uppercase tracking-widest text-text-dim/50 ${idx > 0 ? 'px-4 border-l border-border-subtle text-center' : 'px-8'}`}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-6 h-6 border-2 border-border-subtle border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div
          className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            {visibleNodesInfo.map(({ node, hasChildren, isDimmed }) => {
              const visualLevel = hoistedNode
                ? Math.max(0, node.level - hoistedNode.level)
                : node.level;
              const isRowFocused = focusedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  className={`max-w-7xl mx-auto w-full px-8 sm:px-12 transition-all duration-200 ${isRowFocused ? 'relative z-[100]' : 'relative z-0'}`}
                >
                  <NodeItem
                    id={node.id}
                    hasChildren={hasChildren}
                    isDimmed={isDimmed}
                    isIndeterminate={indeterminateStates[node.id]}
                    isFocused={isRowFocused}
                    colorMode={colorMode}
                    activeColumns={activeColumns}
                    activeColumnIndex={activeColumnIndex}
                    tags={tags}
                    visibleNodesRef={visibleNodesRef}
                    visualLevel={visualLevel}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
