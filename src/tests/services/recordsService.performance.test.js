/**
 * tests/services/recordsService.performance.test.js
 *
 * Salvaguarda contra regressões de performance em loadAllRecords.
 * Valida que o carregamento bulk de 25 entidades × 500 registros
 * (volume máximo que a função processa por entidade) completa em
 * tempo aceitável, cobrindo normalizeRecords + deduplicateRecords.
 *
 * Como os mocks retornam dados síncronos, o limite mede apenas o
 * custo de processamento local (normalização + dedup), não latência
 * de rede — o objetivo é detectar algoritmos acidentalmente O(n²).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const RECORDS_PER_ENTITY = 500;

const { entities } = vi.hoisted(() => {
  const make = () => ({
    list: vi.fn(),
    filter: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    schema: vi.fn(),
  });
  const names = [
    'DiarioObra', 'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade',
    'EnsaioDensidadeInSitu', 'EnsaioTaxaPinturaImprimacao', 'ChecklistUsina',
    'ChecklistAplicacao', 'ChecklistMRAF', 'ChecklistConcretagem',
    'ChecklistTerraplanagem', 'ChecklistReciclagem', 'EnsaioSondagem',
    'EnsaioGranulometriaIndividual', 'AcompanhamentoUsinagem',
    'AcompanhamentoCarga', 'EnsaioManchaPendulo', 'EnsaioVigaBenkelman',
    'EnsaioTaxaMRAF', 'BoletimSondagem', 'BoletimSondagemTrado',
    'EnsaioProctor', 'EnsaioRompimentoConcreto', 'GranuMistura',
    'CertificacaoUsina', 'Obra', 'Project', 'Regional', 'User',
  ];
  const entities = {};
  for (const n of names) entities[n] = make();
  return { entities };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

import { loadAllRecords, ALL_RECORD_ENTITIES } from '@/services/recordsService';

function generateRecords(count, entityType) {
  const records = [];
  for (let i = 0; i < count; i++) {
    records.push({
      id: `${entityType}-${i}`,
      obra_id: `obra-${i % 50}`,
      data: '2026-01-01',
      laboratorista_name: `Lab ${i % 20}`,
      sample_id: `S-${i}`,
      extraction_date: '2026-01-01',
    });
  }
  return records;
}

beforeEach(() => {
  vi.clearAllMocks();
  for (const n of ALL_RECORD_ENTITIES) {
    entities[n].list.mockResolvedValue(generateRecords(RECORDS_PER_ENTITY, n));
  }
});

describe('recordsService — loadAllRecords performance', () => {
  it('processa 25 entidades × 500 registros em tempo aceitável (< 2s)', async () => {
    const start = performance.now();
    const result = await loadAllRecords();
    const elapsed = performance.now() - start;

    const expectedCount = ALL_RECORD_ENTITIES.length * RECORDS_PER_ENTITY;
    expect(result).toHaveLength(expectedCount);
    expect(elapsed).toBeLessThan(2000);
  });

  it('deduplicateRecords escala linearamente com duplicatas massivas', async () => {
    // Todas as entidades retornam exatamente os mesmos IDs — pior caso para dedup
    const shared = generateRecords(RECORDS_PER_ENTITY, 'Shared');
    for (const n of ALL_RECORD_ENTITIES) {
      entities[n].list.mockResolvedValue(shared);
    }

    const start = performance.now();
    const result = await loadAllRecords();
    const elapsed = performance.now() - start;

    // Todos os 25 × 500 registros colapsam para 500 únicos
    expect(result).toHaveLength(RECORDS_PER_ENTITY);
    expect(elapsed).toBeLessThan(2000);
  });
});