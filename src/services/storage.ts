import * as v from 'valibot';
import type { Node, SavedFilter } from '../types';

// --- SCHEMAS (Validation for IO) ---

export const NodeSchema = v.object({
  id: v.string(),
  text: v.string(),
  level: v.number(),
  rank: v.number(),
  checked: v.boolean(),
  collapsed: v.optional(v.boolean(), false),
  parentId: v.nullable(v.string()),
  updatedAt: v.number(),
  docId: v.optional(v.string(), 'default'),
  metadata: v.optional(v.record(v.string(), v.any()), {})
});

export const DocumentSchema = v.object({
  id: v.string(),
  title: v.string(),
  updatedAt: v.number()
});

export type Document = v.InferOutput<typeof DocumentSchema>;

// --- DB CONFIG ---

const DB_NAME = 'mvo_db';
const DB_VERSION = 3;

class IndexedDBAdapter {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        if (!db.objectStoreNames.contains('nodes')) {
          const nodeStore = db.createObjectStore('nodes', { keyPath: 'id' });
          nodeStore.createIndex('docId', 'docId', { unique: false });
        } else {
          const transaction = (event.target as IDBOpenDBRequest).transaction!;
          const nodeStore = transaction.objectStore('nodes');
          if (!nodeStore.indexNames.contains('docId')) {
            nodeStore.createIndex('docId', 'docId', { unique: false });
          }
        }

        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('filters')) {
          const filterStore = db.createObjectStore('filters', { keyPath: 'id' });
          filterStore.createIndex('docId', 'docId', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  // --- FILTERS ---
  async loadFilters(docId: string): Promise<SavedFilter[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('filters', 'readonly');
      const store = transaction.objectStore('filters');
      const index = store.index('docId');
      const request = index.getAll(docId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveFilter(filter: SavedFilter): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('filters', 'readwrite');
      const store = transaction.objectStore('filters');
      store.put(filter);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteFilter(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('filters', 'readwrite');
      const store = transaction.objectStore('filters');
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // --- DOCUMENTS ---
  async loadDocuments(): Promise<Document[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('documents', 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();
      request.onsuccess = () => {
        const docs = request.result;
        if (docs.length === 0) {
          const defaultDoc = { id: 'default', title: 'Main Outline', updatedAt: Date.now() };
          this.saveDocument(defaultDoc).then(() => resolve([defaultDoc]));
        } else {
          resolve(docs);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveDocument(doc: Document): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('documents', 'readwrite');
      const store = transaction.objectStore('documents');
      store.put(doc);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents', 'nodes', 'filters'], 'readwrite');
      transaction.objectStore('documents').delete(id);

      const nodeStore = transaction.objectStore('nodes');
      const nodeIndex = nodeStore.index('docId');
      const nodeReq = nodeIndex.openKeyCursor(IDBKeyRange.only(id));
      nodeReq.onsuccess = () => {
        const cursor = nodeReq.result;
        if (cursor) {
          nodeStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      const filterStore = transaction.objectStore('filters');
      const filterIndex = filterStore.index('docId');
      const filterReq = filterIndex.openKeyCursor(IDBKeyRange.only(id));
      filterReq.onsuccess = () => {
        const cursor = filterReq.result;
        if (cursor) {
          filterStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // --- NODES ---
  async load(docId: string): Promise<Node[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('nodes', 'readonly');
      const store = transaction.objectStore('nodes');
      const index = store.index('docId');
      const request = index.getAll(docId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveNode(node: Node): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('nodes', 'readwrite');
      const store = transaction.objectStore('nodes');
      store.put(node);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async saveNodes(nodes: Node[]): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('nodes', 'readwrite');
      const store = transaction.objectStore('nodes');
      nodes.forEach((n) => store.put(n));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteNodes(ids: string[]): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('nodes', 'readwrite');
      const store = transaction.objectStore('nodes');
      ids.forEach((id) => store.delete(id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const storage = new IndexedDBAdapter();
