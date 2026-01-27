import { useMemo } from 'preact/hooks';
import type { Node } from '../types';

export interface TagInfo {
  name: string;
  count: number;
}

export function useTags(nodes: Node[]) {
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    const tagRegex = /#[\w\u00C0-\u00FF]+/g; // Support basic alphanumeric and accents

    nodes.forEach(node => {
      const matches = node.text.match(tagRegex);
      if (matches) {
        // We use a Set to deduplicate tags per node 
        // (if a node has #tag twice, it counts as 1 matching note)
        const uniqueNodeTags = new Set(matches);
        uniqueNodeTags.forEach(tag => {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes]);

  return { tags };
}