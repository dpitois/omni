import type { Node } from '../types';

const STORAGE_KEY = 'mvo_data_v1';

// The Interface ensures we can swap LocalStorage for an APIAdapter later
export interface StorageService {
  load(): Promise<Node[]>;
  save(nodes: Node[]): Promise<void>;
}

// Initial default data
const DEFAULT_NODES: Node[] = [{ 
  id: self.crypto.randomUUID(), 
  text: '', 
  level: 0, 
  checked: false, 
  collapsed: false,
  parentId: null,
  updatedAt: Date.now() 
}];

export const LocalStorageAdapter: StorageService = {
  load: async (): Promise<Node[]> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_NODES;
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load data", e);
      return DEFAULT_NODES;
    }
  },

  save: async (nodes: Node[]): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }
};

// Singleton export
export const storage = LocalStorageAdapter;