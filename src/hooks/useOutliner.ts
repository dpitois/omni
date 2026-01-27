import { useState, useEffect, useCallback } from 'preact/hooks';
import type { Node } from '../types';
import { storage } from '../services/storage';

export function useOutliner() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to ensure parentIds are correct based on hierarchy
  const sanitizeNodes = useCallback((rawNodes: Node[]) => {
    const lastAtLevel = new Map<number, string>();
    
    return rawNodes.map(node => {
      lastAtLevel.set(node.level, node.id);
      
      // My parent is the last one seen at level - 1
      const calculatedParentId = node.level === 0 ? null : (lastAtLevel.get(node.level - 1) || null);
      
      if (node.parentId !== calculatedParentId) {
        return { ...node, parentId: calculatedParentId };
      }
      return node;
    });
  }, []);

  useEffect(() => {
    storage.load().then(loadedNodes => {
      setNodes(loadedNodes);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const cleanNodes = sanitizeNodes(nodes);
      storage.save(cleanNodes);
    }
  }, [nodes, isLoading, sanitizeNodes]);

  const updateNode = useCallback((id: string, updates: Partial<Node>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  }, []);

  const getDescendantIndices = (nodes: Node[], parentIndex: number) => {
    const indices: number[] = [];
    const parentLevel = nodes[parentIndex].level;
    for (let i = parentIndex + 1; i < nodes.length; i++) {
      if (nodes[i].level <= parentLevel) break;
      indices.push(i);
    }
    return indices;
  };

  const getParentIndex = (nodes: Node[], childIndex: number) => {
    const childLevel = nodes[childIndex].level;
    if (childLevel === 0) return -1;
    for (let i = childIndex - 1; i >= 0; i--) {
      if (nodes[i].level < childLevel) return i;
    }
    return -1;
  };

  const toggleCheck = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index === -1) return prev;

      const node = prev[index];
      const newCheckedState = !node.checked;
      let newNodes = [...prev];

      newNodes[index] = { ...node, checked: newCheckedState, updatedAt: Date.now() };

      const descendantIndices = getDescendantIndices(prev, index);
      descendantIndices.forEach(idx => {
        newNodes[idx] = { ...newNodes[idx], checked: newCheckedState, updatedAt: Date.now() };
      });

      let currentIndex = index;
      while (true) {
        const parentIndex = getParentIndex(newNodes, currentIndex);
        if (parentIndex === -1) break;

        const parent = newNodes[parentIndex];
        const siblingsIndices = getDescendantIndices(newNodes, parentIndex).filter(idx => 
          newNodes[idx].level === parent.level + 1
        );

        const allSiblingsChecked = siblingsIndices.every(idx => newNodes[idx].checked);
        
        if (newNodes[parentIndex].checked !== allSiblingsChecked) {
             newNodes[parentIndex] = { ...parent, checked: allSiblingsChecked, updatedAt: Date.now() };
             currentIndex = parentIndex;
        } else {
            break; 
        }
      }

      return newNodes;
    });
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, collapsed: !n.collapsed, updatedAt: Date.now() } : n));
  }, []);

  const addNode = useCallback((afterId: string | null) => {
    const newNode: Node = {
      id: self.crypto.randomUUID(), // Native browser UUID
      text: '',
      level: 0,
      checked: false,
      collapsed: false,
      parentId: null,
      updatedAt: Date.now()
    };

    setNodes(prev => {
      const index = prev.findIndex(n => n.id === afterId);
      if (index === -1) return [...prev, newNode];

      const prevNode = prev[index];
      newNode.level = prevNode.level;
      
      const newNodes = [...prev];
      newNodes.splice(index + 1, 0, newNode);
      return newNodes;
    });
    return newNode.id;
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => {
        const index = prev.findIndex(n => n.id === id);
        if (index === -1) return prev;
        
        const descendantIndices = getDescendantIndices(prev, index);
        const indicesToRemove = new Set([index, ...descendantIndices]);
        
        return prev.filter((_, i) => !indicesToRemove.has(i));
    });
  }, []);

  const indentNode = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index <= 0) return prev;

      const node = prev[index];
      const prevNode = prev[index - 1];

      if (node.level > prevNode.level) return prev;
      if (node.level >= 5) return prev;
      
      const descendantIndices = getDescendantIndices(prev, index);
      
      const newNodes = [...prev];
      newNodes[index] = { ...node, level: node.level + 1 };
      descendantIndices.forEach(idx => {
          newNodes[idx] = { ...newNodes[idx], level: newNodes[idx].level + 1 };
      });

      return newNodes;
    });
  }, []);

  const outdentNode = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index === -1) return prev;
      const node = prev[index];
      if (node.level === 0) return prev;

      const descendantIndices = getDescendantIndices(prev, index);
      
      const newNodes = [...prev];
      newNodes[index] = { ...node, level: node.level - 1 };
      descendantIndices.forEach(idx => {
          newNodes[idx] = { ...newNodes[idx], level: newNodes[idx].level - 1 };
      });
      return newNodes;
    });
  }, []);

  const moveNodeUp = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index <= 0) return prev;

      const myLevel = prev[index].level;

      let prevSiblingIndex = -1;
      for (let i = index - 1; i >= 0; i--) {
        if (prev[i].level < myLevel) break;
        if (prev[i].level === myLevel) {
          prevSiblingIndex = i;
          break;
        }
      }

      if (prevSiblingIndex === -1) return prev;

      const myBlockIndices = getDescendantIndices(prev, index);
      const myBlockSize = 1 + myBlockIndices.length;

      const newNodes = [...prev];
      // Extract My Block
      const myBlock = newNodes.splice(index, myBlockSize);
      
      // Update timestamp to force re-render and keep focus
      myBlock[0] = { ...myBlock[0], updatedAt: Date.now() };

      // Insert My Block BEFORE Previous Sibling
      newNodes.splice(prevSiblingIndex, 0, ...myBlock);

      return newNodes;
    });
  }, []);

  const moveNodeDown = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index === -1) return prev;

      const myLevel = prev[index].level;
      const myBlockIndices = getDescendantIndices(prev, index);
      const myBlockSize = 1 + myBlockIndices.length;

      const nextSiblingIndex = index + myBlockSize;
      
      if (nextSiblingIndex >= prev.length) return prev;
      if (prev[nextSiblingIndex].level < myLevel) return prev;
      
      const nextBlockIndices = getDescendantIndices(prev, nextSiblingIndex);
      const nextBlockSize = 1 + nextBlockIndices.length;

      const newNodes = [...prev];
      const myBlock = newNodes.splice(index, myBlockSize);
      
      // Update timestamp to force re-render and keep focus
      myBlock[0] = { ...myBlock[0], updatedAt: Date.now() };

      newNodes.splice(index + nextBlockSize, 0, ...myBlock);

      return newNodes;
    });
  }, []);

  const renameTag = useCallback((oldTag: string, newTag: string) => {
    setNodes(prev => prev.map(n => {
      if (!n.text.includes(oldTag)) return n;
      const safeOldTag = oldTag.replace(/[.*+?^${}()|[\\]/g, '\\$&');
      const regex = new RegExp(`(${safeOldTag})(?![\\w\\u00C0-\u00FF])`, 'g');
      if (regex.test(n.text)) {
        return { ...n, text: n.text.replace(regex, newTag), updatedAt: Date.now() };
      }
      return n;
    }));
  }, []);

  return {
    nodes,
    isLoading,
    addNode,
    updateNode,
    toggleCheck,
    toggleCollapse,
    deleteNode,
    indentNode,
    outdentNode,
    moveNodeUp,
    moveNodeDown,
    renameTag
  };
}