import { render } from '@testing-library/preact';
import { describe, test, vi } from 'vitest';
import { NodeItem } from '../components/NodeItem';
import { measureRenderPerformance } from './perfUtils';
import { OutlinerProvider } from '../context/OutlinerContext';
import { UIProvider } from '../context/UIContext';
import type { Node, Column } from '../types';
import { outlinerStore } from '../services/store';

// Mock storage to avoid real DB I/O while keeping logic real
vi.mock('../services/storage', () => ({
  storage: {
    load: vi.fn().mockResolvedValue([]),
    loadDocuments: vi
      .fn()
      .mockResolvedValue([{ id: 'default', title: 'Main Outline', updatedAt: Date.now() }]),
    loadFilters: vi.fn().mockResolvedValue([]),
    saveDocument: vi.fn().mockResolvedValue(undefined),
    deleteDocument: vi.fn().mockResolvedValue(undefined),
    saveFilter: vi.fn().mockResolvedValue(undefined),
    deleteFilter: vi.fn().mockResolvedValue(undefined),
    saveNode: vi.fn().mockResolvedValue(undefined),
    saveNodes: vi.fn().mockResolvedValue(undefined),
    deleteNodes: vi.fn().mockResolvedValue(undefined),
    flush: vi.fn().mockResolvedValue(undefined)
  }
}));

const createMockNode = (id: string, text: string, level: number = 0): Node => ({
  id,
  text,
  level,
  rank: 0,
  checked: false,
  collapsed: false,
  parentId: null,
  updatedAt: Date.now(),
  docId: 'default',
  metadata: {}
});

const mockColumns: Column[] = [{ id: 'text', label: 'Text', type: 'text', width: '100%' }];

describe('Real Performance Benchmarks (with Contexts)', () => {
  test('NodeItem render performance with real Contexts', () => {
    const node = createMockNode('1', 'Hello Performance #test');
    outlinerStore.setNodes([node]);
    const tags = [{ name: 'test', count: 1 }];
    const visibleNodesRef = { current: [node] };

    measureRenderPerformance('Single NodeItem Render (Real Context)', () => {
      render(
        <UIProvider>
          <OutlinerProvider>
            <NodeItem
              id={node.id}
              hasChildren={false}
              isDimmed={false}
              isFocused={false}
              colorMode={false}
              activeColumns={mockColumns}
              activeColumnIndex={0}
              tags={tags}
              visibleNodesRef={visibleNodesRef}
            />
          </OutlinerProvider>
        </UIProvider>
      );
    });
  });

  test('Large list (100) render performance with real Contexts', () => {
    const count = 100;
    const nodes = Array.from({ length: count }, (_, i) =>
      createMockNode(String(i), `Node ${i} with #tag${i}`)
    );
    outlinerStore.setNodes(nodes);
    const tags = nodes.map((n) => ({ name: `tag${String(n.id)}`, count: 1 }));
    const visibleNodesRef = { current: nodes };

    measureRenderPerformance(`${count} NodeItems Render (Real Context)`, () => {
      render(
        <UIProvider>
          <OutlinerProvider>
            <div className="flex flex-col">
              {nodes.map((node) => (
                <NodeItem
                  key={node.id}
                  id={node.id}
                  hasChildren={false}
                  isDimmed={false}
                  isFocused={false}
                  colorMode={false}
                  activeColumns={mockColumns}
                  activeColumnIndex={0}
                  tags={tags}
                  visibleNodesRef={visibleNodesRef}
                />
              ))}
            </div>
          </OutlinerProvider>
        </UIProvider>
      );
    });
  });
});
