import { useState, useEffect, useCallback } from 'preact/hooks';
import type { Node } from '../types';
import { storage } from '../services/storage';

export function useOutliner() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to ensure parentIds and Ranks are correct
  const sanitizeNodes = useCallback((rawNodes: Node[]) => {
    const lastAtLevel = new Map<number, string>();
    
    return rawNodes.map((node, index) => {
      lastAtLevel.set(node.level, node.id);
      
      const calculatedParentId = node.level === 0 ? null : (lastAtLevel.get(node.level - 1) || null);
      
      return { 
        ...node, 
        parentId: calculatedParentId,
        rank: index * 1000 
      };
    });
  }, []);

  // Initial Load
  useEffect(() => {
    storage.load().then(loadedNodes => {
      const cleanNodes = sanitizeNodes(loadedNodes);
      setNodes(cleanNodes);
      setIsLoading(false);
    });
  }, []);

  // -- ATOMIC ACTIONS --

  const updateNode = useCallback((id: string, updates: Partial<Node>) => {
    setNodes(prev => {
      const newNodes = prev.map(n => {
        if (n.id === id) {
          const updatedNode = { ...n, ...updates, updatedAt: Date.now() };
          storage.saveNode(updatedNode); 
          return updatedNode;
        }
        return n;
      });
      return newNodes;
    });
  }, []);

  const updateMetadata = useCallback((id: string, columnId: string, value: any) => {
    setNodes(prev => {
      return prev.map(n => {
        if (n.id === id) {
          const updatedNode = { 
            ...n, 
            metadata: { ...n.metadata, [columnId]: value },
            updatedAt: Date.now() 
          };
          storage.saveNode(updatedNode);
          return updatedNode;
        }
        return n;
      });
    });
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index === -1) return prev;

      let newNodes = [...prev];
      const node = newNodes[index];
      const newCheckedState = !node.checked;
      const nodesToSave: Node[] = [];

      newNodes[index] = { ...node, checked: newCheckedState, updatedAt: Date.now() };
      nodesToSave.push(newNodes[index]);

      const parentLevel = node.level;
      for (let i = index + 1; i < newNodes.length; i++) {
        if (newNodes[i].level <= parentLevel) break;
        newNodes[i] = { ...newNodes[i], checked: newCheckedState, updatedAt: Date.now() };
        nodesToSave.push(newNodes[i]);
      }

      const getParentIndex = (list: Node[], childIdx: number) => {
        const childLvl = list[childIdx].level;
        if (childLvl === 0) return -1;
        for (let k = childIdx - 1; k >= 0; k--) {
          if (list[k].level < childLvl) return k;
        }
        return -1;
      };

      let currentIndex = index;
      while (true) {
        const parentIndex = getParentIndex(newNodes, currentIndex);
        if (parentIndex === -1) break;

        const parent = newNodes[parentIndex];
        let allSiblingsChecked = true;
        for (let k = parentIndex + 1; k < newNodes.length; k++) {
            if (newNodes[k].level <= parent.level) break;
            if (newNodes[k].level === parent.level + 1) {
                if (!newNodes[k].checked) {
                    allSiblingsChecked = false;
                    break;
                }
            }
        }

        if (newNodes[parentIndex].checked !== allSiblingsChecked) {
             newNodes[parentIndex] = { ...parent, checked: allSiblingsChecked, updatedAt: Date.now() };
             nodesToSave.push(newNodes[parentIndex]);
             currentIndex = parentIndex;
        } else {
            break;
        }
      }

      storage.saveNodes(nodesToSave);
      return newNodes;
    });
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, collapsed: !n.collapsed, updatedAt: Date.now() };
        storage.saveNode(updated);
        return updated;
      }
      return n;
    }));
  }, []);

  const persistStructure = (nodes: Node[]) => {
    const cleanNodes = sanitizeNodes(nodes);
    storage.saveNodes(cleanNodes);
    return cleanNodes;
  };

  const addNodeWithReturn = useCallback((afterId: string | null) => {
    const newNode: Node = {
        id: self.crypto.randomUUID(),
        text: '',
        level: 0,
        rank: 0,
        checked: false,
        collapsed: false,
        parentId: null,
        updatedAt: Date.now(),
        metadata: {}
    };
    
    setNodes(prev => {
        const index = prev.findIndex(n => n.id === afterId);
        const newNodes = [...prev];
        if (index === -1) {
            newNodes.push(newNode);
        } else {
            const prevNode = prev[index];
            newNode.level = prevNode.level;
            newNodes.splice(index + 1, 0, newNode);
        }
        return persistStructure(newNodes);
    });
    return newNode.id;
  }, [sanitizeNodes]);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => {
        const index = prev.findIndex(n => n.id === id);
        if (index === -1) return prev;
        
        const indicesToRemove = new Set<number>();
        indicesToRemove.add(index);
        const parentLevel = prev[index].level;
        for(let i = index + 1; i < prev.length; i++) {
            if(prev[i].level <= parentLevel) break;
            indicesToRemove.add(i);
        }

        const idsToDelete = Array.from(indicesToRemove).map(i => prev[i].id);
        const newNodes = prev.filter((_, i) => !indicesToRemove.has(i));
        storage.deleteNodes(idsToDelete);
        return persistStructure(newNodes);
    });
  }, [sanitizeNodes]);

  const indentNode = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index <= 0) return prev;

      const node = prev[index];
      const prevNode = prev[index - 1];
      if (node.level > prevNode.level || node.level >= 5) return prev;
      
      const newNodes = [...prev];
      newNodes[index] = { ...node, level: node.level + 1 };
      for(let i = index + 1; i < newNodes.length; i++) {
          if(newNodes[i].level <= node.level) break; 
          newNodes[i] = { ...newNodes[i], level: newNodes[i].level + 1 };
      }
      return persistStructure(newNodes);
    });
  }, [sanitizeNodes]);

  const outdentNode = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index === -1) return prev;
      const node = prev[index];
      if (node.level === 0) return prev;

      const newNodes = [...prev];
      newNodes[index] = { ...node, level: node.level - 1 };
      for(let i = index + 1; i < newNodes.length; i++) {
          if(newNodes[i].level <= node.level) break;
          newNodes[i] = { ...newNodes[i], level: newNodes[i].level - 1 };
      }
      return persistStructure(newNodes);
    });
  }, [sanitizeNodes]);

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
      let myBlockEnd = index + 1;
      while(myBlockEnd < prev.length && prev[myBlockEnd].level > myLevel) myBlockEnd++;
      
      const newNodes = [...prev];
      const myBlock = newNodes.splice(index, myBlockEnd - index);
      myBlock[0] = { ...myBlock[0], updatedAt: Date.now() };
      newNodes.splice(prevSiblingIndex, 0, ...myBlock);
      return persistStructure(newNodes);
    });
  }, [sanitizeNodes]);

  const moveNodeDown = useCallback((id: string) => {
    setNodes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index === -1) return prev;
      const myLevel = prev[index].level;
      let myBlockEnd = index + 1;
      while(myBlockEnd < prev.length && prev[myBlockEnd].level > myLevel) myBlockEnd++;
      const myBlockSize = myBlockEnd - index;

      const nextSiblingIndex = index + myBlockSize;
      if (nextSiblingIndex >= prev.length || prev[nextSiblingIndex].level < myLevel) return prev;

      let nextBlockEnd = nextSiblingIndex + 1;
      while(nextBlockEnd < prev.length && prev[nextBlockEnd].level > myLevel) nextBlockEnd++;
      
      const newNodes = [...prev];
      const myBlock = newNodes.splice(index, myBlockSize);
      myBlock[0] = { ...myBlock[0], updatedAt: Date.now() };
      const newInsertPos = index + (nextBlockEnd - nextSiblingIndex);
      newNodes.splice(newInsertPos, 0, ...myBlock);
      return persistStructure(newNodes);
    });
  }, [sanitizeNodes]);

  const renameTag = useCallback((oldTag: string, newTag: string) => {
    setNodes(prev => {
       const nodesToSave: Node[] = [];
       const newNodes = prev.map(n => {
        if (!n.text.includes(oldTag)) return n;
        const safeOldTag = oldTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeOldTag})(?![\\w\\u00C0-\\u00FF])`, 'g');
        if (regex.test(n.text)) {
            const updated = { ...n, text: n.text.replace(regex, newTag), updatedAt: Date.now() };
            nodesToSave.push(updated);
            return updated;
        }
        return n;
      });
      storage.saveNodes(nodesToSave);
      return newNodes;
    });
  }, []);

  const importNodes = useCallback(async (newNodes: Node[]) => {
    const sanitized = sanitizeNodes(newNodes);
    setNodes(sanitized);
    await storage.saveNodes(sanitized);
  }, [sanitizeNodes]);

  return {
    nodes,
    isLoading,
    addNode: addNodeWithReturn,
    updateNode,
    updateMetadata,
    toggleCheck,
    toggleCollapse,
    deleteNode,
    indentNode,
    outdentNode,
    moveNodeUp,
    moveNodeDown,
    renameTag,
    importNodes
  };
}