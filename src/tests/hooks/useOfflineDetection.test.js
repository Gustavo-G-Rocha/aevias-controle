/**
 * tests/hooks/useOfflineDetection.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';

describe('useOfflineDetection', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('deve inicializar com estado online', () => {
    const { result } = renderHook(() => useOfflineDetection());
    expect(result.current.isOnline).toBe(true);
  });

  it('deve detectar mudança para offline', () => {
    const { result } = renderHook(() => useOfflineDetection());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('deve detectar mudança para online', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });
    const { result } = renderHook(() => useOfflineDetection());

    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
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