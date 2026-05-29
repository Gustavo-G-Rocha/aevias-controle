import { vi } from 'vitest';

// Mock global de IndexedDB para todos os testes
const mockStorage = new Map();

globalThis.indexedDB = {
  databases: {},
  open: vi.fn((name, version) => {
    if (!mockStorage.has(name)) {
      mockStorage.set(name, new Map());
    }
    
    const dbStorage = mockStorage.get(name);
    const request = {
      result: {
        objectStoreNames: { contains: () => false },
        createObjectStore: vi.fn(() => ({
          createIndex: vi.fn(),
          add: vi.fn(),
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          getAll: vi.fn(),
          clear: vi.fn(),
        })),
      },
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      addEventListener: vi.fn(function(event, handler) {
        if (event === 'success') setTimeout(() => this.onsuccess?.(), 0);
      }),
    };
    
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess();
    }, 0);
    
    return request;
  }),
};