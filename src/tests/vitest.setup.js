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

// ── Shims mínimos de browser (ambiente node) ──
// Vários módulos de src/ referenciam window/document/localStorage no momento
// do import (ex.: lib/utils.js `window.self !== window.top`). Sem jsdom,
// fornecemos shims suficientes para os módulos carregarem; testes que
// precisam de DOM real devem mockar explicitamente.
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
  globalThis.window.self = globalThis.window;
  globalThis.window.top = globalThis.window;
}
if (typeof globalThis.window.addEventListener !== 'function') {
  globalThis.window.addEventListener = vi.fn();
  globalThis.window.removeEventListener = vi.fn();
  globalThis.window.dispatchEvent = vi.fn(() => true);
}
if (typeof globalThis.window.matchMedia === 'undefined') {
  globalThis.window.matchMedia = vi.fn(() => ({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}
if (typeof globalThis.window.location === 'undefined') {
  globalThis.window.location = {
    href: 'http://localhost/', origin: 'http://localhost', pathname: '/',
    search: '', hash: '', assign: vi.fn(), replace: vi.fn(), reload: vi.fn(),
  };
}
if (typeof globalThis.window.history === 'undefined') {
  globalThis.window.history = {
    replaceState: vi.fn(), pushState: vi.fn(), back: vi.fn(),
    forward: vi.fn(), go: vi.fn(), state: null, length: 1,
  };
}
if (typeof globalThis.document === 'undefined') {
  const fakeElement = () => ({
    style: {}, classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn(), contains: vi.fn(() => false) },
    setAttribute: vi.fn(), getAttribute: vi.fn(() => null), removeAttribute: vi.fn(),
    appendChild: vi.fn(), removeChild: vi.fn(), remove: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    querySelector: vi.fn(() => null), querySelectorAll: vi.fn(() => []),
    getContext: vi.fn(() => null), click: vi.fn(), focus: vi.fn(), blur: vi.fn(),
  });
  globalThis.document = {
    documentElement: fakeElement(),
    head: fakeElement(),
    body: fakeElement(),
    createElement: vi.fn(fakeElement),
    createTextNode: vi.fn(() => ({})),
    getElementById: vi.fn(() => null),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    visibilityState: 'visible',
    hidden: false,
    cookie: '',
    title: '',
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  globalThis.sessionStorage = globalThis.localStorage;
}
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { onLine: true, userAgent: 'vitest-node', language: 'pt-BR' };
}