import { useMemo, useCallback } from 'preact/hooks';
import type { Node, MetadataValue } from '../types';
import { outlinerStore } from '../services/store';

export function useOutliner() {
  const nodes = outlinerStore.nodes.value;
  const isLoading = outlinerStore.isLoading.value;

  const addNode = useCallback(
    (parentId: string | null = null): string => {
      outlinerStore.takeSnapshot();
      const id = crypto.randomUUID();
      const siblingNodes = nodes.filter((n) => n.parentId === parentId);
      const maxRank = siblingNodes.length > 0 ? Math.max(...siblingNodes.map((n) => n.rank)) : -1;

      const parentNode = parentId ? nodes.find((n) => n.id === parentId) : null;
      const level = parentNode ? parentNode.level + 1 : 0;

      const newNode: Node = {
        id,
        text: '',
        level,
        rank: maxRank + 1,
        checked: false,
        collapsed: false,
        parentId,
        updatedAt: Date.now(),
        docId: outlinerStore.currentDocId.value,
        metadata: {}
      };

      outlinerStore.setNodes([...nodes, newNode]);
      outlinerStore.saveNode(newNode);
      return id;
    },
    [nodes]
  );

  const updateNode = useCallback((id: string, updates: Partial<Node>) => {
    outlinerStore.updateNode(id, updates);
  }, []);

  const updateMetadata = useCallback((id: string, columnId: string, value: MetadataValue) => {
    const nodeSignal = outlinerStore.getNodeSignal(id);
    if (nodeSignal.value) {
      outlinerStore.updateNode(id, {
        metadata: { ...nodeSignal.value.metadata, [columnId]: value }
      });
    }
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    const nodeSignal = outlinerStore.getNodeSignal(id);
    if (nodeSignal.value) {
      outlinerStore.updateNode(id, { collapsed: !nodeSignal.value.collapsed });
    }
  }, []);

  const toggleCheck = useCallback(
    (id: string) => {
      const nodeSignal = outlinerStore.getNodeSignal(id);
      if (nodeSignal.value) {
        const newChecked = !nodeSignal.value.checked;
        outlinerStore.takeSnapshot();

        const updatedNodes = [...nodes];
        const nodeIndex = updatedNodes.findIndex((n) => n.id === id);
        if (nodeIndex === -1) return;

        updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], checked: newChecked };

        const checkChildren = (parentId: string, state: boolean) => {
          updatedNodes.forEach((n, idx) => {
            if (n.parentId === parentId) {
              updatedNodes[idx] = { ...updatedNodes[idx], checked: state };
              checkChildren(n.id, state);
            }
          });
        };
        checkChildren(id, newChecked);

        outlinerStore.setNodes(updatedNodes);
        outlinerStore.saveNodes(updatedNodes);
      }
    },
    [nodes]
  );

  const toggleCheckNodes = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      outlinerStore.takeSnapshot();
      const allChecked = ids.every((id) => nodes.find((n) => n.id === id)?.checked);
      const newChecked = !allChecked;

      const updatedNodes = nodes.map((n) =>
        ids.includes(n.id) ? { ...n, checked: newChecked } : n
      );

      outlinerStore.setNodes(updatedNodes);
      outlinerStore.saveNodes(updatedNodes);
    },
    [nodes]
  );

  const deleteNode = useCallback(
    (id: string) => {
      outlinerStore.takeSnapshot();
      const toDelete = new Set<string>([id]);
      const findChildren = (parentId: string) => {
        nodes.forEach((n) => {
          if (n.parentId === parentId) {
            toDelete.add(n.id);
            findChildren(n.id);
          }
        });
      };
      findChildren(id);
      outlinerStore.deleteNodes(Array.from(toDelete));
    },
    [nodes]
  );

  const deleteNodes = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      outlinerStore.takeSnapshot();
      const toDelete = new Set<string>(ids);
      const findChildren = (parentId: string) => {
        nodes.forEach((n) => {
          if (n.parentId === parentId) {
            toDelete.add(n.id);
            findChildren(n.id);
          }
        });
      };
      ids.forEach((id) => findChildren(id));
      outlinerStore.deleteNodes(Array.from(toDelete));
    },
    [nodes]
  );

  const indentNode = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      const siblings = nodes
        .filter((n) => n.parentId === node.parentId)
        .sort((a, b) => a.rank - b.rank);
      const idx = siblings.findIndex((n) => n.id === id);
      if (idx === 0) return;

      const prevSibling = siblings[idx - 1];
      outlinerStore.takeSnapshot();

      const childrenOfPrev = nodes.filter((n) => n.parentId === prevSibling.id);
      const newRank = childrenOfPrev.length;

      outlinerStore.updateNode(id, {
        parentId: prevSibling.id,
        level: prevSibling.level + 1,
        rank: newRank,
        collapsed: false
      });

      if (prevSibling.collapsed) {
        outlinerStore.updateNode(prevSibling.id, { collapsed: false });
      }
    },
    [nodes]
  );

  const indentNodes = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => indentNode(id));
    },
    [indentNode]
  );

  const outdentNode = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node || !node.parentId) return;

      const parent = nodes.find((n) => n.id === node.parentId);
      if (!parent) return;

      outlinerStore.takeSnapshot();
      outlinerStore.updateNode(id, {
        parentId: parent.parentId,
        level: parent.level,
        rank: parent.rank + 1
      });

      const siblingsOfParent = nodes
        .filter((n) => n.parentId === parent.parentId && n.rank > parent.rank)
        .sort((a, b) => a.rank - b.rank);

      siblingsOfParent.forEach((s, i) => {
        outlinerStore.updateNode(s.id, { rank: parent.rank + 2 + i });
      });
    },
    [nodes]
  );

  const outdentNodes = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => outdentNode(id));
    },
    [outdentNode]
  );

  const moveNodeUp = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      const siblings = nodes
        .filter((n) => n.parentId === node.parentId)
        .sort((a, b) => a.rank - b.rank);
      const idx = siblings.findIndex((n) => n.id === id);
      if (idx === 0) return;

      const prev = siblings[idx - 1];
      outlinerStore.takeSnapshot();
      outlinerStore.updateNode(id, { rank: prev.rank });
      outlinerStore.updateNode(prev.id, { rank: node.rank });
    },
    [nodes]
  );

  const moveNodeDown = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      const siblings = nodes
        .filter((n) => n.parentId === node.parentId)
        .sort((a, b) => a.rank - b.rank);
      const idx = siblings.findIndex((n) => n.id === id);
      if (idx === siblings.length - 1) return;

      const next = siblings[idx + 1];
      outlinerStore.takeSnapshot();
      outlinerStore.updateNode(id, { rank: next.rank });
      outlinerStore.updateNode(next.id, { rank: node.rank });
    },
    [nodes]
  );

  const setSearchQuery = useCallback((q: string) => {
    outlinerStore.searchQuery.value = q;
  }, []);

  const toggleTag = useCallback((tag: string) => {
    if (outlinerStore.activeTags.value.includes(tag)) {
      outlinerStore.activeTags.value = outlinerStore.activeTags.value.filter((t) => t !== tag);
    } else {
      outlinerStore.activeTags.value = [...outlinerStore.activeTags.value, tag];
    }
  }, []);

  const importNodes = useCallback(async (newNodes: Node[]) => {
    outlinerStore.setNodes(newNodes);
    await outlinerStore.saveNodes(newNodes);
  }, []);

  const actions = useMemo(
    () => ({
      addNode,
      updateNode,
      updateMetadata,
      toggleCollapse,
      toggleCheck,
      toggleCheckNodes,
      deleteNode,
      deleteNodes,
      indentNode,
      indentNodes,
      outdentNode,
      outdentNodes,
      moveNodeUp,
      moveNodeDown,
      setSearchQuery,
      toggleTag,
      importNodes,
      flushChanges: outlinerStore.flushChanges.bind(outlinerStore),
      undo: outlinerStore.undo.bind(outlinerStore),
      redo: outlinerStore.redo.bind(outlinerStore),
      takeSnapshot: outlinerStore.takeSnapshot.bind(outlinerStore)
    }),
    [
      addNode,
      updateNode,
      updateMetadata,
      toggleCollapse,
      toggleCheck,
      toggleCheckNodes,
      deleteNode,
      deleteNodes,
      indentNode,
      indentNodes,
      outdentNode,
      outdentNodes,
      moveNodeUp,
      moveNodeDown,
      setSearchQuery,
      toggleTag,
      importNodes
    ]
  );

  return {
    nodes,
    isLoading,
    actions
  };
}
