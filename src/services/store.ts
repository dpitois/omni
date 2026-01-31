import { signal, computed, batch } from '@preact/signals';
import { storage, type Document } from './storage';
import type { Node, SavedFilter } from '../types';

class OutlinerStore {
  // --- STATE ---
  public nodes = signal<Node[]>([]);
  public isLoading = signal<boolean>(true);
  public currentDocId = signal<string>(localStorage.getItem('mvo_current_doc_id') || 'default');
  public availableDocuments = signal<Document[]>([]);
  public savedFilters = signal<SavedFilter[]>([]);

  // Filtering state
  public searchQuery = signal<string>('');
  public activeTags = signal<string[]>([]);
  public hoistedNodeId = signal<string | null>(null);

  private undoStack: Node[][] = [];
  private redoStack: Node[][] = [];

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const docs = await storage.loadDocuments();
      this.availableDocuments.value = docs;

      if (!docs.find((d) => d.id === this.currentDocId.value)) {
        this.currentDocId.value = docs[0].id;
      }

      await this.loadCurrentDocument();
    } catch (err) {
      console.error('Failed to init store:', err);
    } finally {
      this.isLoading.value = false;
    }
  }

  private async loadCurrentDocument() {
    this.isLoading.value = true;
    const docId = this.currentDocId.value;
    localStorage.setItem('mvo_current_doc_id', docId);

    const [nodes, filters] = await Promise.all([storage.load(docId), storage.loadFilters(docId)]);

    batch(() => {
      this.nodes.value = nodes.sort((a, b) => a.rank - b.rank);
      this.savedFilters.value = filters;
      this.searchQuery.value = '';
      this.activeTags.value = [];
      this.hoistedNodeId.value = null;
    });
    this.isLoading.value = false;
  }

  // --- WORKSPACE ACTIONS ---

  public async switchDocument(docId: string) {
    if (docId === this.currentDocId.value) return;
    this.currentDocId.value = docId;
    await this.loadCurrentDocument();
  }

  public async createDocument(title: string) {
    const id = crypto.randomUUID();
    const newDoc: Document = { id, title, updatedAt: Date.now() };
    await storage.saveDocument(newDoc);
    this.availableDocuments.value = [...this.availableDocuments.value, newDoc];
    await this.switchDocument(id);
  }

  public async renameDocument(id: string, title: string) {
    const doc = this.availableDocuments.value.find((d) => d.id === id);
    if (doc) {
      const updated = { ...doc, title, updatedAt: Date.now() };
      await storage.saveDocument(updated);
      this.availableDocuments.value = this.availableDocuments.value.map((d) =>
        d.id === id ? updated : d
      );
    }
  }

  public async deleteDocument(id: string) {
    await storage.deleteDocument(id);
    this.availableDocuments.value = this.availableDocuments.value.filter((d) => d.id !== id);
    if (this.currentDocId.value === id && this.availableDocuments.value.length > 0) {
      await this.switchDocument(this.availableDocuments.value[0].id);
    }
  }

  // --- FILTER PERSISTENCE ACTIONS ---

  public async saveCurrentFilter(label: string) {
    const filter: SavedFilter = {
      id: crypto.randomUUID(),
      label,
      query: this.searchQuery.value,
      tags: [...this.activeTags.value],
      docId: this.currentDocId.value
    };
    await storage.saveFilter(filter);
    this.savedFilters.value = [...this.savedFilters.value, filter];
  }

  public async deleteSavedFilter(id: string) {
    await storage.deleteFilter(id);
    this.savedFilters.value = this.savedFilters.value.filter((f) => f.id !== id);
  }

  public applySavedFilter(filter: SavedFilter) {
    batch(() => {
      this.searchQuery.value = filter.query;
      this.activeTags.value = [...filter.tags];
    });
  }

  // --- COMPUTED VIEWS ---

  public currentDocument = computed(() =>
    this.availableDocuments.value.find((d) => d.id === this.currentDocId.value)
  );

  public tags = computed(() => {
    const tagMap = new Map<string, number>();
    const tagRegex = /#[\w\u00C0-\u00FF-]+/g;
    this.nodes.value.forEach((node) => {
      const matches = node.text.match(tagRegex);
      if (matches) {
        matches.forEach((tag) => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });
    return Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));
  });

  public indeterminateStates = computed(() => {
    const states: Record<string, boolean> = {};
    const nodes = this.nodes.value;

    const checkIndeterminate = (id: string): boolean => {
      const children = nodes.filter((n) => n.parentId === id);
      if (children.length === 0) return false;

      const allChecked = children.every((n) => n.checked);
      const noneChecked = children.every((n) => !n.checked);
      const anyIndeterminate = children.some((n) => checkIndeterminate(n.id));

      const isIndet = anyIndeterminate || (!allChecked && !noneChecked);
      states[id] = isIndet;
      return isIndet;
    };

    nodes.filter((n) => !n.parentId).forEach((n) => checkIndeterminate(n.id));
    return states;
  });

  public visibleNodesInfo = computed(() => {
    const q = this.searchQuery.value.toLowerCase();
    const tags = this.activeTags.value;
    const allNodes = this.nodes.value;
    const hoistedId = this.hoistedNodeId.value;

    const matches = new Set<string>();
    allNodes.forEach((n) => {
      const textMatch = !q || n.text.toLowerCase().includes(q);
      const tagMatch = tags.length === 0 || tags.every((t) => n.text.includes(t));
      if (textMatch && tagMatch) matches.add(n.id);
    });

    const ancestors = new Set<string>();
    matches.forEach((id) => {
      const current = allNodes.find((n) => n.id === id);
      let pId = current?.parentId;
      while (pId) {
        if (ancestors.has(pId)) break;
        ancestors.add(pId);
        const parent = allNodes.find((x) => x.id === pId);
        pId = parent?.parentId || null;
      }
    });

    return allNodes
      .filter((n) => {
        if (hoistedId) {
          if (n.id === hoistedId) return true;
          let pId = n.parentId;
          let isDescendant = false;
          while (pId) {
            if (pId === hoistedId) {
              isDescendant = true;
              break;
            }
            const parent = allNodes.find((x) => x.id === pId);
            pId = parent?.parentId || null;
          }
          if (!isDescendant) return false;
        }

        if (q || tags.length > 0) {
          return matches.has(n.id) || ancestors.has(n.id);
        }

        let pId = n.parentId;
        while (pId) {
          const parent = allNodes.find((x) => x.id === pId);
          if (parent?.collapsed) return false;
          pId = parent?.parentId || null;
        }
        return true;
      })
      .map((n) => ({
        node: n,
        hasChildren: allNodes.some((x) => x.parentId === n.id),
        isDimmed: (q !== '' || tags.length > 0) && !matches.has(n.id)
      }));
  });

  // --- NODE ACTIONS ---

  public setNodes(nodes: Node[]) {
    this.nodes.value = nodes.map((n) => ({
      ...n,
      docId: n.docId || this.currentDocId.value,
      collapsed: n.collapsed ?? false,
      metadata: n.metadata || {}
    }));
  }

  public updateNode(id: string, updates: Partial<Node>, save = true) {
    const updated = this.nodes.value.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    this.nodes.value = updated;
    if (save) {
      const node = updated.find((n) => n.id === id);
      if (node) storage.saveNode(node);
    }
  }

  public async saveNode(node: Node) {
    await storage.saveNode({ ...node, docId: node.docId || this.currentDocId.value });
  }

  public async saveNodes(nodes: Node[]) {
    const nodesToSave = nodes.map((n) => ({ ...n, docId: n.docId || this.currentDocId.value }));
    await storage.saveNodes(nodesToSave);
  }

  public async deleteNodes(ids: string[]) {
    await storage.deleteNodes(ids);
    this.nodes.value = this.nodes.value.filter((n) => !ids.includes(n.id));
  }

  public async flushChanges() {
    await this.saveNodes(this.nodes.value);
  }

  public async clearAll() {
    const ids = this.nodes.value.map((n) => n.id);
    await storage.deleteNodes(ids);
    this.nodes.value = [];
  }

  public setHoistedNodeId(id: string | null) {
    this.hoistedNodeId.value = id;
  }

  // --- UNDO / REDO ---

  public takeSnapshot() {
    this.undoStack.push([...this.nodes.value]);
    this.redoStack = [];
    if (this.undoStack.length > 50) this.undoStack.shift();
  }

  public async undo() {
    const prev = this.undoStack.pop();
    if (prev) {
      this.redoStack.push([...this.nodes.value]);
      this.nodes.value = prev;
      await this.saveNodes(prev);
    }
  }

  public async redo() {
    const next = this.redoStack.pop();
    if (next) {
      this.undoStack.push([...this.nodes.value]);
      this.nodes.value = next;
      await this.saveNodes(next);
    }
  }

  public getNodeSignal(id: string) {
    return computed(() => this.nodes.value.find((n) => n.id === id));
  }
}

export const outlinerStore = new OutlinerStore();
