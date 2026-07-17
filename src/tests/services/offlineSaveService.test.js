/**
 * tests/services/offlineSaveService.test.js
 * Cobre a camada única de salvamento offline-aware:
 * roteamento online/offline, fallback em queda de rede e cache de leitura.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/functions/validarESalvarRegistro', () => ({
  validarESalvarRegistro: vi.fn(),
}));
vi.mock('@/services/syncService', () => ({
  addOrUpdateQueueItem: vi.fn(async () => 'queue-id-1'),
}));
vi.mock('@/services/offlineStorageService', () => ({
  saveDataCache: vi.fn(async () => {}),
  getDataCache: vi.fn(async () => null),
}));
vi.mock('@/utils/offlineSimulation', () => ({
  isEffectivelyOffline: vi.fn(() => false),
}));

import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';
import { addOrUpdateQueueItem } from '@/services/syncService';
import { saveDataCache, getDataCache } from '@/services/offlineStorageService';
import { isEffectivelyOffline } from '@/utils/offlineSimulation';
import {
  salvarRegistroOfflineAware,
  obterRegistroDoCache,
  cacheRecord,
} from '@/services/offlineSaveService';

beforeEach(() => {
  vi.clearAllMocks();
  isEffectivelyOffline.mockReturnValue(false);
  if (typeof globalThis.CustomEvent === 'undefined') {
    globalThis.CustomEvent = class CustomEvent { constructor(type) { this.type = type; } };
  }
  globalThis.window.dispatchEvent = vi.fn();
});

describe('salvarRegistroOfflineAware — caminho online', () => {
  it('salva via validarESalvarRegistro e retorna o registro do servidor', async () => {
    validarESalvarRegistro.mockResolvedValue({ data: { data: { id: 'srv-1', obra_id: 'o1' } } });

    const result = await salvarRegistroOfflineAware({
      entityName: 'EnsaioCAUQ',
      data: { obra_id: 'o1' },
      operation: 'create',
    });

    expect(result).toEqual({ id: 'srv-1', obra_id: 'o1' });
    expect(validarESalvarRegistro).toHaveBeenCalledWith(expect.objectContaining({
      entityName: 'EnsaioCAUQ',
      operation: 'create',
      data: { obra_id: 'o1' },
    }));
    expect(addOrUpdateQueueItem).not.toHaveBeenCalled();
  });

  it('propaga client_updated_at e base_updated_date (LWW)', async () => {
    validarESalvarRegistro.mockResolvedValue({ data: { data: { id: 'srv-1' } } });

    await salvarRegistroOfflineAware({
      entityName: 'DiarioObra',
      data: { data: '2026-01-01' },
      operation: 'update',
      recordId: 'rec-9',
      clientUpdatedAt: '2026-01-02T10:00:00Z',
      baseUpdatedDate: '2026-01-01T08:00:00Z',
    });

    expect(validarESalvarRegistro).toHaveBeenCalledWith(expect.objectContaining({
      recordId: 'rec-9',
      client_updated_at: '2026-01-02T10:00:00Z',
      base_updated_date: '2026-01-01T08:00:00Z',
    }));
  });

  it('re-lança erros de servidor (validação/permissão) sem enfileirar', async () => {
    const serverError = new Error('Obra não encontrada');
    serverError.response = { status: 400, data: { error: 'Obra não encontrada' } };
    validarESalvarRegistro.mockRejectedValue(serverError);

    await expect(salvarRegistroOfflineAware({
      entityName: 'EnsaioCAUQ',
      data: {},
      operation: 'create',
    })).rejects.toThrow('Obra não encontrada');

    expect(addOrUpdateQueueItem).not.toHaveBeenCalled();
  });
});

describe('salvarRegistroOfflineAware — caminho offline', () => {
  it('enfileira quando o dispositivo está offline e retorna registro temporário', async () => {
    isEffectivelyOffline.mockReturnValue(true);

    const result = await salvarRegistroOfflineAware({
      entityName: 'EnsaioCAUQ',
      data: { obra_id: 'o1', observacoes: 'teste' },
      operation: 'create',
    });

    expect(validarESalvarRegistro).not.toHaveBeenCalled();
    expect(addOrUpdateQueueItem).toHaveBeenCalledWith(expect.objectContaining({
      operation: 'create',
      entityType: 'EnsaioCAUQ',
      payload: { obra_id: 'o1', observacoes: 'teste' },
    }));
    expect(result._offline).toBe(true);
    expect(result.id).toMatch(/^offline-/);
    expect(result.obra_id).toBe('o1');
    expect(result.entityType).toBe('EnsaioCAUQ');
  });

  it('update offline preserva o id real do registro', async () => {
    isEffectivelyOffline.mockReturnValue(true);

    const result = await salvarRegistroOfflineAware({
      entityName: 'DiarioObra',
      data: { observacoes: 'editado' },
      operation: 'update',
      recordId: 'rec-42',
    });

    expect(result.id).toBe('rec-42');
    expect(result._offline).toBe(true);
    expect(addOrUpdateQueueItem).toHaveBeenCalledWith(expect.objectContaining({
      entityId: 'rec-42',
      operation: 'update',
    }));
  });

  it('notifica a UI via evento offline-queue-updated', async () => {
    isEffectivelyOffline.mockReturnValue(true);

    await salvarRegistroOfflineAware({
      entityName: 'EnsaioCAUQ',
      data: {},
      operation: 'create',
    });

    expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'offline-queue-updated' })
    );
  });

  it('faz fallback para a fila quando a rede cai no meio do save (ERR_NETWORK)', async () => {
    const netError = new Error('Network Error');
    netError.code = 'ERR_NETWORK';
    validarESalvarRegistro.mockRejectedValue(netError);

    const result = await salvarRegistroOfflineAware({
      entityName: 'EnsaioCAUQ',
      data: { obra_id: 'o1' },
      operation: 'create',
    });

    expect(result._offline).toBe(true);
    expect(addOrUpdateQueueItem).toHaveBeenCalledTimes(1);
  });

  it('faz fallback também para erros fetch sem response/status', async () => {
    validarESalvarRegistro.mockRejectedValue(new Error('Failed to fetch'));

    const result = await salvarRegistroOfflineAware({
      entityName: 'EnsaioCAUQ',
      data: {},
      operation: 'create',
    });

    expect(result._offline).toBe(true);
  });
});

describe('cache de leitura offline', () => {
  it('cacheRecord salva com chave record:<entidade>:<id>', async () => {
    await cacheRecord('EnsaioCAUQ', { id: 'rec-1', obra_id: 'o1' });
    expect(saveDataCache).toHaveBeenCalledWith(
      'record:EnsaioCAUQ:rec-1',
      { id: 'rec-1', obra_id: 'o1' },
      'records'
    );
  });

  it('cacheRecord ignora registros sem id', async () => {
    await cacheRecord('EnsaioCAUQ', { obra_id: 'o1' });
    await cacheRecord('EnsaioCAUQ', null);
    expect(saveDataCache).not.toHaveBeenCalled();
  });

  it('obterRegistroDoCache retorna os dados cacheados', async () => {
    getDataCache.mockResolvedValue({ data: { id: 'rec-1', obra_id: 'o1' } });
    const r = await obterRegistroDoCache('EnsaioCAUQ', 'rec-1');
    expect(r).toEqual({ id: 'rec-1', obra_id: 'o1' });
    expect(getDataCache).toHaveBeenCalledWith('record:EnsaioCAUQ:rec-1');
  });

  it('obterRegistroDoCache retorna null quando não há cache', async () => {
    getDataCache.mockResolvedValue(null);
    const r = await obterRegistroDoCache('EnsaioCAUQ', 'rec-x');
    expect(r).toBeNull();
  });
});