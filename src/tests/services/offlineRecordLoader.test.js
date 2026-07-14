/**
 * tests/services/offlineRecordLoader.test.js
 *
 * Testes eliminatorios do carregador de registro individual tolerante a offline.
 * Cobre: (1) online -> get direto no servidor; (2) offline -> fallback ao cache
 * IndexedDB encontrando o registro e removendo o campo auxiliar entityType;
 * (3) offline sem registro no cache -> rejeita com mensagem clara.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
const { entities } = vi.hoisted(() => {
  const make = () => ({ get: vi.fn() });
  return { entities: { DiarioObra: make(), EnsaioCAUQ: make() } };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

const { getDataCacheMock, isOfflineMock } = vi.hoisted(() => ({
  getDataCacheMock: vi.fn(),
  isOfflineMock: vi.fn(),
}));

vi.mock('@/services/offlineStorageService', () => ({
  getDataCache: getDataCacheMock,
}));

vi.mock('@/services/offlinePhotoService', () => ({
  isOffline: isOfflineMock,
}));

import { obterRegistroOfflineAware } from '@/services/offlineRecordLoader';

beforeEach(() => {
  vi.clearAllMocks();
  entities.DiarioObra.get.mockResolvedValue({ id: 'd1', obra_id: 'o1', data: '2026-01-01' });
  entities.EnsaioCAUQ.get.mockResolvedValue({ id: 'e1' });
  getDataCacheMock.mockResolvedValue(null);
  isOfflineMock.mockReturnValue(false);
});

describe('offlineRecordLoader — online', () => {
  it('busca direto no servidor quando online', async () => {
    const rec = await obterRegistroOfflineAware('DiarioObra', 'd1');
    expect(entities.DiarioObra.get).toHaveBeenCalledWith('d1');
    expect(rec).toEqual({ id: 'd1', obra_id: 'o1', data: '2026-01-01' });
    // Não toca o cache quando online
    expect(getDataCacheMock).not.toHaveBeenCalled();
  });

  it('cai para o cache quando o get online falha (rede instavel)', async () => {
    entities.DiarioObra.get.mockRejectedValueOnce(new Error('NetworkError'));
    getDataCacheMock.mockResolvedValueOnce({
      data: [{ id: 'd1', entityType: 'DiarioObra', obra_id: 'o1' }],
    });
    const rec = await obterRegistroOfflineAware('DiarioObra', 'd1');
    expect(rec).toEqual({ id: 'd1', obra_id: 'o1' });
    expect(rec.entityType).toBeUndefined();
  });
});

describe('offlineRecordLoader — offline (cache)', () => {
  beforeEach(() => {
    isOfflineMock.mockReturnValue(true);
  });

  it('encontra o registro no cache records:list e remove entityType', async () => {
    getDataCacheMock.mockResolvedValueOnce({
      data: [{ id: 'd1', entityType: 'DiarioObra', obra_id: 'o1', data: '2026-01-01' }],
    });
    const rec = await obterRegistroOfflineAware('DiarioObra', 'd1');
    expect(entities.DiarioObra.get).not.toHaveBeenCalled();
    expect(rec).toEqual({ id: 'd1', obra_id: 'o1', data: '2026-01-01' });
    expect(rec.entityType).toBeUndefined();
  });

  it('procura em records:dashboard se records:list nao tiver o registro', async () => {
    getDataCacheMock.mockResolvedValueOnce({ data: [{ id: 'outro', entityType: 'DiarioObra' }] });
    getDataCacheMock.mockResolvedValueOnce({
      data: [{ id: 'd1', entityType: 'DiarioObra', obra_id: 'o1' }],
    });
    const rec = await obterRegistroOfflineAware('DiarioObra', 'd1');
    expect(rec).toEqual({ id: 'd1', obra_id: 'o1' });
  });

  it('respeita o entityType ao buscar (nao devolve registro de outra entidade com mesmo id)', async () => {
    getDataCacheMock.mockResolvedValueOnce({
      data: [{ id: 'd1', entityType: 'EnsaioCAUQ' }],
    });
    await expect(obterRegistroOfflineAware('DiarioObra', 'd1')).rejects.toThrow();
  });
});

describe('offlineRecordLoader — offline sem cache', () => {
  beforeEach(() => {
    isOfflineMock.mockReturnValue(true);
  });

  it('rejeita com mensagem clara quando o registro nao esta no cache', async () => {
    getDataCacheMock.mockResolvedValue(null);
    await expect(obterRegistroOfflineAware('DiarioObra', 'inexistente')).rejects.toThrow(
      /não disponível offline/i
    );
  });
});