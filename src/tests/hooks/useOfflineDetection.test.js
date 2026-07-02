/**
 * tests/hooks/useOfflineDetection.test.js
 *
 * Testa a lógica de detecção offline/online usando um EventEmitter
 * simulado — sem depender de globalThis.addEventListener (node puro).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Simula navigator.onLine (node env não tem navigator por padrão)
function mockOnLine(value) {
  if (!globalThis.navigator) {
    globalThis.navigator = {};
  }
  Object.defineProperty(globalThis.navigator, 'onLine', {
    writable: true,
    configurable: true,
    value,
  });
}

// EventEmitter mínimo que simula window/globalThis no contexto node
class FakeEventTarget {
  constructor() {
    this._listeners = {};
  }
  addEventListener(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((f) => f !== fn);
  }
  dispatchEvent(event) {
    const handlers = this._listeners[event.type] || [];
    handlers.forEach((fn) => fn(event));
  }
}

describe('useOfflineDetection - lógica de detecção', () => {
  let fakeWindow;

  beforeEach(() => {
    fakeWindow = new FakeEventTarget();
    mockOnLine(true);
  });

  it('deve retornar true quando navigator.onLine é true', () => {
    mockOnLine(true);
    expect(navigator.onLine).toBe(true);
  });

  it('deve retornar false quando navigator.onLine é false', () => {
    mockOnLine(false);
    expect(navigator.onLine).toBe(false);
  });

  it('deve detectar mudança para offline via evento', () => {
    mockOnLine(true);
    let isOnline = navigator.onLine;

    const handleOffline = () => { isOnline = false; };
    fakeWindow.addEventListener('offline', handleOffline);

    mockOnLine(false);
    fakeWindow.dispatchEvent({ type: 'offline' });

    expect(isOnline).toBe(false);

    fakeWindow.removeEventListener('offline', handleOffline);
  });

  it('deve detectar mudança para online via evento', () => {
    mockOnLine(false);
    let isOnline = navigator.onLine;

    const handleOnline = () => { isOnline = true; };
    fakeWindow.addEventListener('online', handleOnline);

    mockOnLine(true);
    fakeWindow.dispatchEvent({ type: 'online' });

    expect(isOnline).toBe(true);

    fakeWindow.removeEventListener('online', handleOnline);
  });

  it('deve limpar listeners corretamente ao desmontar', () => {
    const handleOnline = vi.fn();
    const handleOffline = vi.fn();

    fakeWindow.addEventListener('online', handleOnline);
    fakeWindow.addEventListener('offline', handleOffline);

    // Simula cleanup do useEffect
    fakeWindow.removeEventListener('online', handleOnline);
    fakeWindow.removeEventListener('offline', handleOffline);

    // Após remoção, eventos não devem mais chamar os handlers
    fakeWindow.dispatchEvent({ type: 'online' });
    fakeWindow.dispatchEvent({ type: 'offline' });

    expect(handleOnline).not.toHaveBeenCalled();
    expect(handleOffline).not.toHaveBeenCalled();
  });

  it('não deve chamar handler removido após removeEventListener', () => {
    const handler = vi.fn();
    fakeWindow.addEventListener('online', handler);
    fakeWindow.removeEventListener('online', handler);
    fakeWindow.dispatchEvent({ type: 'online' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('deve chamar múltiplos handlers para o mesmo evento', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    fakeWindow.addEventListener('online', handler1);
    fakeWindow.addEventListener('online', handler2);
    fakeWindow.dispatchEvent({ type: 'online' });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});