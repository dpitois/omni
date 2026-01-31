import { signal, computed } from '@preact/signals';
import { outlinerStore } from './store';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  action: () => void | Promise<void>;
  isVisible?: () => boolean;
}

class CommandPaletteStore {
  public isOpen = signal<boolean>(false);
  public query = signal<string>('');
  public selectedIndex = signal<number>(0);

  private registry = signal<Command[]>([]);

  constructor() {
    this.registerDefaultCommands();
  }

  public register(command: Command) {
    this.registry.value = [...this.registry.value, command];
  }

  public open(initialQuery: string = '') {
    this.isOpen.value = true;
    this.query.value = initialQuery;
    this.selectedIndex.value = 0;
  }

  public close() {
    this.isOpen.value = false;
  }

  public filteredCommands = computed(() => {
    const q = this.query.value.toLowerCase().trim();

    // 1. Get base commands
    const base = this.registry.value.filter((c) => (c.isVisible ? c.isVisible() : true));

    // 2. Add dynamic Document switching commands
    const docCommands: Command[] = outlinerStore.availableDocuments.value.map((doc) => ({
      id: `switch-doc-${doc.id}`,
      label: `Switch to: ${doc.title}`,
      description: `Open workspace "${doc.title}"`,
      category: 'Workspace',
      action: () => outlinerStore.switchDocument(doc.id)
    }));

    const all = [...base, ...docCommands];

    if (!q) return all;

    return all
      .filter((c) => c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
      .sort((a, b) => {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        if (aLabel.startsWith(q) && !bLabel.startsWith(q)) return -1;
        if (!aLabel.startsWith(q) && bLabel.startsWith(q)) return 1;
        return aLabel.localeCompare(bLabel);
      });
  });

  private registerDefaultCommands() {
    const commands: Command[] = [
      {
        id: 'export-json',
        label: 'Export to JSON (Backup)',
        description: 'Download the full database as JSON',
        category: 'IO',
        action: async () => {
          const { exportToJSON } = await import('../utils/export');
          exportToJSON(outlinerStore.nodes.value);
        }
      },
      {
        id: 'export-markdown',
        label: 'Export to Markdown',
        description: 'Download the current outline as a .md file',
        category: 'IO',
        action: async () => {
          const { exportToMarkdown } = await import('../utils/export');
          exportToMarkdown(outlinerStore.nodes.value);
        }
      },
      {
        id: 'export-opml',
        label: 'Export to OPML',
        description: 'Download in standard OPML format for other outliners',
        category: 'IO',
        action: async () => {
          const { exportToOPML } = await import('../utils/export');
          exportToOPML(outlinerStore.nodes.value);
        }
      },
      {
        id: 'import-json',
        label: 'Import from JSON',
        description: 'Restore a JSON backup (replaces current outline)',
        category: 'IO',
        action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const text = await file.text();
              try {
                const nodes = JSON.parse(text);
                if (Array.isArray(nodes)) {
                  if (confirm(`Import ${nodes.length} nodes from JSON?`)) {
                    outlinerStore.takeSnapshot();
                    await outlinerStore.clearAll();
                    outlinerStore.setNodes(nodes);
                    await outlinerStore.saveNodes(nodes);
                  }
                }
              } catch (err) {
                // ignore
              }
            }
          };
          input.click();
        }
      },
      {
        id: 'import-opml',
        label: 'Import from OPML',
        description: 'Load an .opml file (replaces current outline)',
        category: 'IO',
        action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.opml,.xml';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const text = await file.text();
              try {
                const { parseOPML } = await import('../utils/export');
                const nodes = parseOPML(text);
                if (confirm(`Import ${nodes.length} nodes from OPML?`)) {
                  outlinerStore.takeSnapshot();
                  await outlinerStore.clearAll();
                  outlinerStore.setNodes(nodes);
                  await outlinerStore.saveNodes(nodes);
                }
              } catch (err) {
                // ignore
              }
            }
          };
          input.click();
        }
      },
      {
        id: 'unhoist',
        label: 'Show All (Unhoist)',
        description: 'Exit focus mode and show all nodes',
        category: 'View',
        isVisible: () => outlinerStore.hoistedNodeId.value !== null,
        action: () => outlinerStore.setHoistedNodeId(null)
      },
      {
        id: 'save-filter',
        label: 'Save Current View',
        description: 'Save search query and active tags as a persistent filter',
        category: 'Filter',
        isVisible: () =>
          outlinerStore.searchQuery.value !== '' || outlinerStore.activeTags.value.length > 0,
        action: () => {
          const name = prompt('Enter view name:', 'My Filter');
          if (name) outlinerStore.saveCurrentFilter(name);
        }
      },
      {
        id: 'clear-filters',
        label: 'Clear Filters',
        description: 'Reset search and active tags',
        category: 'Filter',
        isVisible: () =>
          outlinerStore.searchQuery.value !== '' || outlinerStore.activeTags.value.length > 0,
        action: () => {
          outlinerStore.searchQuery.value = '';
          outlinerStore.activeTags.value = [];
        }
      },
      {
        id: 'collapse-all',
        label: 'Collapse All',
        description: 'Collapse every node in the outline',
        category: 'Structure',
        action: () => {
          outlinerStore.takeSnapshot();
          outlinerStore.nodes.value.forEach((n) => {
            if (n.collapsed === false) outlinerStore.updateNode(n.id, { collapsed: true }, false);
          });
          outlinerStore.saveNodes(outlinerStore.nodes.value);
        }
      },
      {
        id: 'expand-all',
        label: 'Expand All',
        description: 'Expand every node in the outline',
        category: 'Structure',
        action: () => {
          outlinerStore.takeSnapshot();
          outlinerStore.nodes.value.forEach((n) => {
            if (n.collapsed === true) outlinerStore.updateNode(n.id, { collapsed: false }, false);
          });
          outlinerStore.saveNodes(outlinerStore.nodes.value);
        }
      },
      {
        id: 'toggle-check-all',
        label: 'Check/Uncheck All',
        description: 'Toggle checkbox state for all nodes',
        category: 'Bulk',
        action: () => {
          outlinerStore.takeSnapshot();
          const allChecked = outlinerStore.nodes.value.every((n) => n.checked);
          outlinerStore.nodes.value.forEach((n) => {
            outlinerStore.updateNode(n.id, { checked: !allChecked }, false);
          });
          outlinerStore.saveNodes(outlinerStore.nodes.value);
        }
      },
      {
        id: 'new-document',
        label: 'New Document',
        description: 'Create a fresh independent outline',
        category: 'Workspace',
        action: () => {
          const title = prompt('Enter document title:', 'New Outline');
          if (title) outlinerStore.createDocument(title);
        }
      },
      {
        id: 'rename-document',
        label: 'Rename Document',
        description: 'Rename the current active outline',
        category: 'Workspace',
        action: () => {
          const current = outlinerStore.currentDocument.value;
          const title = prompt('Enter new title:', current?.title || '');
          if (title && current) outlinerStore.renameDocument(current.id, title);
        }
      },
      {
        id: 'delete-document',
        label: 'Delete Document',
        description: 'Permanently remove the current outline',
        category: 'Workspace',
        isVisible: () => outlinerStore.currentDocId.value !== 'default',
        action: () => {
          const current = outlinerStore.currentDocument.value;
          if (
            current &&
            confirm(`Are you sure you want to delete "${current.title}"? This cannot be undone.`)
          ) {
            outlinerStore.deleteDocument(current.id);
          }
        }
      },
      {
        id: 'show-shortcuts',
        label: 'Keyboard Shortcuts',
        description: 'Show help and keyboard shortcuts reference',
        category: 'Help',
        action: () => {
          window.dispatchEvent(new CustomEvent('open-shortcuts'));
        }
      }
    ];

    this.registry.value = commands;
  }
}

export const commandStore = new CommandPaletteStore();
