import '@testing-library/preact';
import { vi } from 'vitest';

// Polyfill performance.now if not present (jsdom should have it)
if (typeof window !== 'undefined' && !window.performance) {
  Object.defineProperty(window, 'performance', {
    value: { now: () => Date.now() },
    writable: true
  });
}

// Mock IndexedDB since it's used in hooks
const mockIDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

vi.stubGlobal('indexedDB', mockIDB);
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid'
});
