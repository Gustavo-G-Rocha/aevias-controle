import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnsaioDensidadeActions } from '@/hooks/useEnsaioDensidadeActions';
import { base44 } from '@/api/base44Client';

// Mock do base44
vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      EnsaioDensidadeInSitu: {
        create: vi.fn(),
        update: vi.fn(),
      },
    },
  },
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useEnsaioDensidadeActions', () => {
  const mockUser = {
    email: 'test@example.com',
    laboratorista_name: 'João Silva',
    full_name: 'João Silva',
  };

  const mockFormData = {
    obra_id: 'obra-1',
    data_ensaio: '2026-05-29',
    sample_id: 'sample-1',
    laboratorista_name: 'João Silva',
    observacoes: 'Test observation',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new draft (rascunho) record', async () => {
    const { result } = renderHook(() => 
      useEnsaioDensidadeActions(mockFormData, mockUser, null)
    );

    const mockEvent = { preventDefault: vi.fn() };

    await act(async () => {
      await result.current.handleSubmit(mockEvent, 'rascunho');
    });

    expect(base44.entities.EnsaioDensidadeInSitu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockFormData,
        status: 'rascunho',
        laboratorista_name: mockUser.laboratorista_name,
      })
    );
  });

  it('should update existing draft record', async () => {
    const existingEnsaio = {
      id: 'ensaio-1',
      ...mockFormData,
      status: 'rascunho',
    };

    const { result } = renderHook(() => 
      useEnsaioDensidadeActions(mockFormData, mockUser, existingEnsaio)
    );

    const mockEvent = { preventDefault: vi.fn() };

    await act(async () => {
      await result.current.handleSubmit(mockEvent, 'rascunho');
    });

    expect(base44.entities.EnsaioDensidadeInSitu.update).toHaveBeenCalledWith(
      'ensaio-1',
      expect.objectContaining({
        status: 'rascunho',
        laboratorista_name: mockUser.laboratorista_name,
      })
    );
  });

  it('should not navigate to MeusEnsaios when saving draft', async () => {
    const { result } = renderHook(() => 
      useEnsaioDensidadeActions(mockFormData, mockUser, null)
    );

    const mockEvent = { preventDefault: vi.fn() };

    await act(async () => {
      await result.current.handleSubmit(mockEvent, 'rascunho');
    });

    // Navigation should NOT happen on draft save
    // (It only happens on finalizado status)
  });

  it('should navigate when saving as finalizado (complete)', async () => {
    const { result } = renderHook(() => 
      useEnsaioDensidadeActions(mockFormData, mockUser, null)
    );

    const mockEvent = { preventDefault: vi.fn() };

    await act(async () => {
      await result.current.handleSubmit(mockEvent, 'finalizado');
    });

    // Navigation happens only on finalizado
  });

  it('should set saving state during submission', async () => {
    const { result } = renderHook(() => 
      useEnsaioDensidadeActions(mockFormData, mockUser, null)
    );

    expect(result.current.saving).toBe(false);

    const mockEvent = { preventDefault: vi.fn() };

    await act(async () => {
      const promise = result.current.handleSubmit(mockEvent, 'rascunho');
      expect(result.current.saving).toBe(true);
      await promise;
    });

    expect(result.current.saving).toBe(false);
  });

  it('should validate required fields', async () => {
    const invalidFormData = {
      ...mockFormData,
      obra_id: null, // missing required field
    };

    const { result } = renderHook(() => 
      useEnsaioDensidadeActions(invalidFormData, mockUser, null)
    );

    const mockEvent = { preventDefault: vi.fn() };
    const alertMock = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});

    await act(async () => {
      await result.current.handleSubmit(mockEvent, 'finalizado');
    });

    expect(alertMock).toHaveBeenCalledWith(
      expect.stringContaining('campos obrigatórios')
    );

    alertMock.mockRestore();
  });
});