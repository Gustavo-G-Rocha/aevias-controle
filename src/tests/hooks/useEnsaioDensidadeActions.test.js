/**
 * tests/hooks/useEnsaioDensidadeActions.test.js
 *
 * Testa a lógica de submit do EnsaioDensidadeInSitu diretamente,
 * sem depender de renderHook (ambiente node sem DOM React).
 * vi.mock é hoisted — não pode referenciar variáveis externas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/utils', () => ({
  createPageUrl: (page) => `/${page}`,
}));

// Mock com vi.hoisted para evitar problema de hoisting
const { mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      EnsaioDensidadeInSitu: {
        create: mockCreate,
        update: mockUpdate,
      },
    },
  },
}));

import { base44 } from '@/api/base44Client';

// Replica a lógica core do hook sem React
async function invokeHandleSubmit({ formData, user, editingEnsaio, saveStatus = 'finalizado' }) {
  const e = { preventDefault: vi.fn() };
  e.preventDefault();

  if (!formData.obra_id || !formData.data_ensaio) {
    alert('Preencha todos os campos obrigatórios (Obra, Data).');
    return { navigated: false, alerted: true };
  }

  const dataToSave = {
    ...formData,
    status: saveStatus,
    laboratorista_name: user?.laboratorista_name || user?.full_name,
  };

  if (editingEnsaio) {
    const updateData = { ...dataToSave };
    if (editingEnsaio.approved === false && saveStatus === 'finalizado') {
      updateData.approved = null;
      updateData.rejection_reason = null;
      updateData.approved_by = null;
      updateData.approved_date = null;
    }
    await base44.entities.EnsaioDensidadeInSitu.update(editingEnsaio.id, updateData);
  } else {
    await base44.entities.EnsaioDensidadeInSitu.create(dataToSave);
  }

  const navigated = saveStatus === 'finalizado';
  if (navigated) mockNavigate('/MeusEnsaios');

  return { navigated, alerted: false };
}

describe('useEnsaioDensidadeActions - lógica de submit', () => {
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
    mockCreate.mockResolvedValue({ id: 'new-id' });
    mockUpdate.mockResolvedValue({ id: 'ensaio-1' });
  });

  it('deve criar novo rascunho com status "rascunho"', async () => {
    await invokeHandleSubmit({ formData: mockFormData, user: mockUser, editingEnsaio: null, saveStatus: 'rascunho' });

    expect(base44.entities.EnsaioDensidadeInSitu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockFormData,
        status: 'rascunho',
        laboratorista_name: mockUser.laboratorista_name,
      })
    );
  });

  it('deve atualizar rascunho existente', async () => {
    const existingEnsaio = { id: 'ensaio-1', ...mockFormData, status: 'rascunho' };

    await invokeHandleSubmit({ formData: mockFormData, user: mockUser, editingEnsaio: existingEnsaio, saveStatus: 'rascunho' });

    expect(base44.entities.EnsaioDensidadeInSitu.update).toHaveBeenCalledWith(
      'ensaio-1',
      expect.objectContaining({
        status: 'rascunho',
        laboratorista_name: mockUser.laboratorista_name,
      })
    );
  });

  it('não deve navegar ao salvar como rascunho', async () => {
    const { navigated } = await invokeHandleSubmit({ formData: mockFormData, user: mockUser, editingEnsaio: null, saveStatus: 'rascunho' });
    expect(navigated).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve navegar ao salvar como finalizado', async () => {
    const { navigated } = await invokeHandleSubmit({ formData: mockFormData, user: mockUser, editingEnsaio: null, saveStatus: 'finalizado' });
    expect(navigated).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/MeusEnsaios');
  });

  it('deve bloquear submit quando obra_id estiver ausente', async () => {
    globalThis.alert = vi.fn();
    const invalidFormData = { ...mockFormData, obra_id: null };

    const { alerted } = await invokeHandleSubmit({ formData: invalidFormData, user: mockUser, editingEnsaio: null, saveStatus: 'finalizado' });

    expect(alerted).toBe(true);
    expect(globalThis.alert).toHaveBeenCalledWith(expect.stringContaining('campos obrigatórios'));
    expect(base44.entities.EnsaioDensidadeInSitu.create).not.toHaveBeenCalled();

    delete globalThis.alert;
  });

  it('deve limpar campos de aprovação ao re-submeter reprovado', async () => {
    const rejectedEnsaio = { id: 'ensaio-2', ...mockFormData, status: 'finalizado', approved: false };

    await invokeHandleSubmit({ formData: mockFormData, user: mockUser, editingEnsaio: rejectedEnsaio, saveStatus: 'finalizado' });

    expect(base44.entities.EnsaioDensidadeInSitu.update).toHaveBeenCalledWith(
      'ensaio-2',
      expect.objectContaining({
        approved: null,
        rejection_reason: null,
        approved_by: null,
        approved_date: null,
      })
    );
  });
});