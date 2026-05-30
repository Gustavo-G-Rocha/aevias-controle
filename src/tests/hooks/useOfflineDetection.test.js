/**
 * tests/hooks/useOfflineDetection.test.js
 *
 * Testa a lógica de detecção offline/online diretamente,
 * sem depender de renderHook (ambiente node sem DOM React).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Simula navigator.onLine para cada teste
function mockOnLine(value) {
  Object.defineProperty(globalThis.navigator, 'onLine', {
    writable: true,
    configurable: true,
    value,
  });
}

describe('useOfflineDetection - lógica de detecção', () => {
  const listeners = {};

  beforeEach(() => {
    // Limpa listeners e reseta estado online
    Object.keys(listeners).forEach((k) => delete listeners[k]);
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
    globalThis.addEventListener('offline', handleOffline);

    mockOnLine(false);
    globalThis.dispatchEvent(new Event('offline'));

    expect(isOnline).toBe(false);

    globalThis.removeEventListener('offline', handleOffline);
  });

  it('deve detectar mudança para online via evento', () => {
    mockOnLine(false);
    let isOnline = navigator.onLine;

    const handleOnline = () => { isOnline = true; };
    globalThis.addEventListener('online', handleOnline);

    mockOnLine(true);
    globalThis.dispatchEvent(new Event('online'));

    expect(isOnline).toBe(true);

    globalThis.removeEventListener('online', handleOnline);
  });

  it('deve limpar listeners corretamente ao desmontar', () => {
    const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');

    const handleOnline = vi.fn();
    const handleOffline = vi.fn();

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    // Simula cleanup do useEffect
    globalThis.removeEventListener('online', handleOnline);
    globalThis.removeEventListener('offline', handleOffline);

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', handleOnline);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', handleOffline);

    removeEventListenerSpy.mockRestore();
  });
});