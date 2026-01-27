import type { Node } from '../types';

const DB_NAME = 'MVO_DB';
const DB_VERSION = 1;
const STORE_NAME = 'nodes';
const OLD_STORAGE_KEY = 'mvo_data_v1';

export interface StorageService {
  load(): Promise<Node[]>;
  saveNode(node: Node): Promise<void>;
  saveNodes(nodes: Node[]): Promise<void>;
  deleteNode(id: string): Promise<void>;
  deleteNodes(ids: string[]): Promise<void>;
}

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('rank', 'rank', { unique: false });
        store.createIndex('parentId', 'parentId', { unique: false });
      }
    };
  });
};

export const IndexedDBAdapter: StorageService = {
  load: async (): Promise<Node[]> => {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        // We use the rank index to get sorted data if possible, 
        // but getAll() on index might not be strictly supported in all older browsers the same way.
        // Safer: getAll() then sort in JS.
        const request = store.getAll();

        request.onsuccess = () => {
          let nodes = request.result as Node[];
          
          // Migration: If DB is empty, check LocalStorage
          if (nodes.length === 0) {
            const legacyData = localStorage.getItem(OLD_STORAGE_KEY);
            if (legacyData) {
              console.log("Migrating data from LocalStorage to IndexedDB...");
              nodes = JSON.parse(legacyData);
              // Assign ranks based on array order
              nodes = nodes.map((n, i) => ({ ...n, rank: i * 1000 }));
              
              // Save to IDB immediately
              IndexedDBAdapter.saveNodes(nodes);
              // Optional: Clear local storage? kept for safety for now.
            } else {
               // Init default if absolutely nothing
               nodes = [{ 
                  id: self.crypto.randomUUID(), 
                  text: '', 
                  level: 0, 
                  rank: 0,
                  checked: false, 
                  collapsed: false,
                  parentId: null,
                  updatedAt: Date.now() 
               }];
               IndexedDBAdapter.saveNodes(nodes);
            }
          }

          // Ensure they are sorted by rank
          nodes.sort((a, b) => a.rank - b.rank);
          resolve(nodes);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IDB Load Error", e);
      return [];
    }
  },

  saveNode: async (node: Node): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(node);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  saveNodes: async (nodes: Node[]): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      nodes.forEach(node => {
        store.put(node);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  deleteNode: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  deleteNodes: async (ids: string[]): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      ids.forEach(id => {
        store.delete(id);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
};

export const storage = IndexedDBAdapter;
