/**
 * tests/services/recordsServicePagination.test.js
 * Cobre a paginação do recordsService:
 * - parada antecipada quando a página vem incompleta (sem custo extra de rede)
 * - AVISO ao usuário quando o teto de LIST_MAX_PAGES é atingido
 * - modo dashboard usa list() simples (sem paginação)
 * - deduplicação de registros repetidos entre páginas
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { state } = vi.hoisted(() => ({
  state: { recordsPerEntity: 600, listCalls: 0, filterCalls: 0 },
}));

vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn() }));

vi.mock('@/api/base44Client', () => {
  const cache = {};
  const makeEntity = (name) => ({
    list: async (_sort, limit = 500) => {
      state.listCalls++;
      const n = Math.min(state.recordsPerEntity, limit);
      return Array.from({ length: n }, (_, i) => ({ id: `${name}-${i}` }));
    },
    filter: async (_q, _sort, limit = 500, skip = 0) => {
      state.filterCalls++;
      if (state.recordsPerEntity === Infinity) {
        // Sempre página cheia com ids únicos — força atingir o teto
        return Array.from({ length: limit }, (_, i) => ({ id: `${name}-${skip + i}` }));
      }
      const total = state.recordsPerEntity;
      const n = Math.max(0, Math.min(limit, total - skip));
      return Array.from({ length: n }, (_, i) => ({ id: `${name}-${skip + i}` }));
    },
  });
  return {
    base44: {
      entities: new Proxy({}, {
        get: (_t, name) => cache[name] || (cache[name] = makeEntity(String(name))),
      }),
    },
  };
});

import { toast } from '@/components/ui/use-toast';
import {
  loadAllRecords,
  loadRecordsByObra,
  deduplicateRecords,
  ALL_RECORD_ENTITIES,
  LIST_MAX_PAGES,
} from '@/services/recordsService';

beforeEach(() => {
  vi.clearAllMocks();
  state.recordsPerEntity = 600;
  state.listCalls = 0;
  state.filterCalls = 0;
});

describe('loadAllRecords — modo list (paginado)', () => {
  it('para na primeira página incompleta e NÃO exibe aviso de teto', async () => {
    state.recordsPerEntity = 600; // página 1: 500, página 2: 100 → para
    const r = await loadAllRecords('list');

    expect(r).toHaveLength(600 * ALL_RECORD_ENTITIES.length);
    // 2 páginas por entidade, nunca as 40 do teto
    expect(state.filterCalls).toBe(2 * ALL_RECORD_ENTITIES.length);
    expect(toast).not.toHaveBeenCalled();
  });

  it('AVISA o usuário quando o teto de paginação é atingido', async () => {
    state.recordsPerEntity = Infinity; // páginas sempre cheias
    const r = await loadAllRecords('list');

    // Teto: LIST_MAX_PAGES × 500 por entidade
    expect(r).toHaveLength(LIST_MAX_PAGES * 500 * ALL_RECORD_ENTITIES.length);
    expect(state.filterCalls).toBe(LIST_MAX_PAGES * ALL_RECORD_ENTITIES.length);
    // Um aviso destrutivo por entidade que atingiu o teto
    expect(toast).toHaveBeenCalledTimes(ALL_RECORD_ENTITIES.length);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive',
      title: expect.stringContaining('Volume muito alto'),
    }));
  });

  it('anexa entityType a todos os registros', async () => {
    state.recordsPerEntity = 10;
    const r = await loadAllRecords('list');
    expect(r.every(rec => typeof rec.entityType === 'string')).toBe(true);
    expect(new Set(r.map(rec => rec.entityType)).size).toBe(ALL_RECORD_ENTITIES.length);
  });
});

describe('loadAllRecords — modo dashboard', () => {
  it('usa list() simples com limite reduzido, sem paginação', async () => {
    state.recordsPerEntity = 600;
    await loadAllRecords('dashboard');

    expect(state.listCalls).toBe(ALL_RECORD_ENTITIES.length);
    expect(state.filterCalls).toBe(0);
    expect(toast).not.toHaveBeenCalled();
  });
});

describe('deduplicateRecords', () => {
  it('remove duplicatas por id preservando a primeira ocorrência', () => {
    const r = deduplicateRecords([
      { id: 'a', v: 1 }, { id: 'b', v: 2 }, { id: 'a', v: 99 },
    ]);
    expect(r).toEqual([{ id: 'a', v: 1 }, { id: 'b', v: 2 }]);
  });

  it('registros repetidos entre páginas não aparecem duplicados na lista', async () => {
    // Sobrescreve filter de UMA entidade para retornar a mesma página 2×
    const { base44 } = await import('@/api/base44Client');
    const entity = base44.entities.DiarioObra;
    const originalFilter = entity.filter;
    entity.filter = async (_q, _s, limit) =>
      Array.from({ length: limit }, (_, i) => ({ id: `dup-${i % 250}` })); // 500 itens, 250 únicos, sempre cheia

    try {
      state.recordsPerEntity = 0; // demais entidades vazias
      const r = await loadAllRecords('list');

      const diarios = r.filter(rec => rec.entityType === 'DiarioObra');
      expect(diarios).toHaveLength(250);
    } finally {
      entity.filter = originalFilter; // restaura para os demais testes
    }
  });
});

describe('loadRecordsByObra', () => {
  it('carrega todas as entidades filtradas por obra com entityType e dedup', async () => {
    state.recordsPerEntity = 5;
    const r = await loadRecordsByObra('obra-1');

    expect(r).toHaveLength(5 * ALL_RECORD_ENTITIES.length);
    expect(r.every(rec => typeof rec.entityType === 'string')).toBe(true);
  });
});