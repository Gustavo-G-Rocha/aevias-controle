/**
 * tests/services/offlineCacheService.test.js
 * Cobre a preparação do cache offline na abertura do app:
 * - salva usuário + dados auxiliares + faixas para uso offline
 * - NUNCA sobrescreve cache bom com listas vazias (falha silenciosa de rede)
 * - falhas parciais não impedem o cache das demais seções
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/services/recordsService', () => ({ loadAuxData: vi.fn() }));
vi.mock('@/services/faixasService', () => ({ listarFaixas: vi.fn() }));
vi.mock('@/services/offlineStorageService', () => ({ saveDataCache: vi.fn(async () => {}) }));

import { loadAuxData } from '@/services/recordsService';
import { listarFaixas } from '@/services/faixasService';
import { saveDataCache } from '@/services/offlineStorageService';
import { prepararCacheOffline } from '@/services/offlineCacheService';

const USER = { id: 'u1', email: 'lab@x.com' };
const AUX = {
  obras: [{ id: 'o1' }],
  regionais: [{ id: 'r1' }],
  projects: [{ id: 'p1' }],
  users: [{ id: 'u1' }],
};

beforeEach(() => {
  vi.clearAllMocks();
  loadAuxData.mockResolvedValue(AUX);
  listarFaixas.mockResolvedValue([{ id: 'f1' }]);
});

describe('prepararCacheOffline', () => {
  it('não faz nada sem usuário', async () => {
    await prepararCacheOffline(null);
    expect(saveDataCache).not.toHaveBeenCalled();
    expect(loadAuxData).not.toHaveBeenCalled();
  });

  it('salva usuário, dados auxiliares e faixas quando há dados', async () => {
    await prepararCacheOffline(USER);

    expect(saveDataCache).toHaveBeenCalledWith('currentUser', USER, 'auth');
    expect(saveDataCache).toHaveBeenCalledWith('auxData:RU', AUX, 'auxData');
    expect(saveDataCache).toHaveBeenCalledWith('auxData:R', { ...AUX, users: [] }, 'auxData');
    expect(saveDataCache).toHaveBeenCalledWith('auxData:obras', AUX.obras, 'auxData');
    expect(saveDataCache).toHaveBeenCalledWith('auxData:regionais', AUX.regionais, 'auxData');
    expect(saveDataCache).toHaveBeenCalledWith('auxData:projects', AUX.projects, 'auxData');
    expect(saveDataCache).toHaveBeenCalledWith('auxData:faixas', [{ id: 'f1' }], 'auxData');
  });

  it('NÃO sobrescreve o cache quando os dados auxiliares vêm vazios', async () => {
    loadAuxData.mockResolvedValue({ obras: [], regionais: [], projects: [], users: [] });

    await prepararCacheOffline(USER);

    const keys = saveDataCache.mock.calls.map(c => c[0]);
    expect(keys).not.toContain('auxData:RU');
    expect(keys).not.toContain('auxData:obras');
    // usuário e faixas continuam sendo cacheados
    expect(keys).toContain('currentUser');
    expect(keys).toContain('auxData:faixas');
  });

  it('falha nos dados auxiliares não impede o cache das faixas', async () => {
    loadAuxData.mockRejectedValue(new Error('rede caiu'));

    await expect(prepararCacheOffline(USER)).resolves.toBeUndefined();

    const keys = saveDataCache.mock.calls.map(c => c[0]);
    expect(keys).toContain('currentUser');
    expect(keys).toContain('auxData:faixas');
  });

  it('faixas vazias ou com falha não apagam o cache anterior', async () => {
    listarFaixas.mockResolvedValue([]);
    await prepararCacheOffline(USER);
    expect(saveDataCache.mock.calls.map(c => c[0])).not.toContain('auxData:faixas');

    vi.clearAllMocks();
    loadAuxData.mockResolvedValue(AUX);
    listarFaixas.mockRejectedValue(new Error('500'));
    await expect(prepararCacheOffline(USER)).resolves.toBeUndefined();
    expect(saveDataCache.mock.calls.map(c => c[0])).not.toContain('auxData:faixas');
  });
});