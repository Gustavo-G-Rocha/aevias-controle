/**
 * tests/hooks/useOfflineDetection.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { renderHook, act } from 'vitest';

describe('useOfflineDetection', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  it('deve inicializar com estado online', () => {
    const { result } = renderHook(() => useOfflineDetection());
    expect(result.current.isOnline).toBe(true);
  });

  it('deve detectar mudança para offline', async () => {
    const { result } = renderHook(() => useOfflineDetection());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { 
        writable: true,
        configurable: true,
        value: false 
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('deve detectar mudança para online', async () => {
    Object.defineProperty(navigator, 'onLine', { 
      writable: true,
      configurable: true,
      value: false 
    });
    const { result } = renderHook(() => useOfflineDetection());
    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { 
        writable: true,
        configurable: true,
        value: true 
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('deve limpar listeners ao desmontar', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOfflineDetection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});