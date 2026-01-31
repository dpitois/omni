import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useOutliner } from '../hooks/useOutliner';
import { outlinerStore } from '../services/store';
import type { Node } from '../types';

// Mock storage to avoid IndexedDB issues during tests
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

const createTestData = (count: number): Node[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    text: `Node ${i} with #tag${i % 5}`,
    level: 0,
    rank: i,
    checked: false,
    collapsed: false,
    parentId: null,
    updatedAt: Date.now(),
    docId: 'default',
    metadata: {}
  }));
};

describe('Logic Performance Benchmarks (Hooks & Store)', () => {
  it('useOutliner bulk check performance', async () => {
    const { result } = renderHook(() => useOutliner());

    const data = createTestData(500);
    outlinerStore.setNodes(data);
    await outlinerStore.saveNodes(data);

    const start = performance.now();
    result.current.actions.toggleCheck('node-0');
    const end = performance.now();

    console.log(`[PERF] Toggle check on 500 nodes structure: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(10);
  });

  it('useOutliner movement performance', async () => {
    const { result } = renderHook(() => useOutliner());

    const data = createTestData(500);
    outlinerStore.setNodes(data);
    await outlinerStore.saveNodes(data);

    const start = performance.now();
    result.current.actions.moveNodeDown('node-0');
    const end = performance.now();

    console.log(`[PERF] Move node down in 500 nodes list: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(10);
  });

  it('Store reactive filtering performance', async () => {
    const data = createTestData(1000);
    outlinerStore.setNodes(data);

    // Test Search filtering
    let start = performance.now();
    outlinerStore.searchQuery.value = 'Node 500';
    let visible = outlinerStore.visibleNodesInfo.value;
    let end = performance.now();

    console.log(`[PERF] Search signal update in 1000 nodes: ${(end - start).toFixed(2)}ms`);
    expect(visible.length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(20);

    // Test Tag filtering
    outlinerStore.searchQuery.value = '';
    start = performance.now();
    outlinerStore.activeTags.value = ['#tag1'];
    visible = outlinerStore.visibleNodesInfo.value;
    end = performance.now();

    console.log(`[PERF] Multi-tag filtering in 1000 nodes: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(30);
  });
});
