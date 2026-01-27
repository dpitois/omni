import { useState, useMemo } from 'preact/hooks';
import type { Node } from '../types';

export function useOutlinerFilter(nodes: Node[]) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return {
    activeTag,
    setActiveTag,
    searchQuery,
    setSearchQuery,
    visibleNodesInfo,
    visibleNodes: visibleNodesInfo.map(info => info.node)
  };
}
