/**
 * tests/performance/escalabilidadeAlgoritmos.test.js
 *
 * Benchmarks de escalabilidade dos algoritmos client-side em volumes
 * grandes (até 50.000 registros). Objetivo: capturar algoritmos
 * acidentalmente quadráticos (O(n²)) e custos de processamento que
 * travariam a UI (main thread) em produção.
 *
 * Orçamentos: processamento client-side acima de ~200ms trava frames;
 * acima de ~500ms o usuário percebe a UI congelada.
 */
import { describe, it, afterAll, vi } from 'vitest';
import { createBenchSuite, generateRecords } from './benchUtils';

// Benchmarks pesados: mais tempo por teste (suíte completa roda em paralelo,
// com contenção de CPU — orçamentos têm folga p/ pegar só regressões reais).
vi.setConfig({ testTimeout: 60000 });

vi.mock('@/api/base44Client', () => ({ base44: { entities: {} } }));

import { normalizeRecords, deduplicateRecords } from '@/services/recordsService';
import { groupEnsaiosByStatus } from '@/utils/ensaioStatusGrouper';
import { filterRecordsByDateRange, extractLaboratoristas } from '@/utils/relatoriosUnificadosUtils';
import { computeAuditDiff, reconstructHistory, verifyChainIntegrity } from '@/utils/auditTrail';
import { computeIntegrityHash } from '@/utils/integrityHash';
import { compareFields } from '@/utils/conflictResolution';
import { sanitizeText, sanitizeTextFields, sanitizeNestedNumbers } from '@/utils/dataSanitization';
import { generatePayloadHash, createQueueItem, areQueueItemsDuplicate } from '@/utils/offlineQueue';
import {
  calcularStats, calcularGraficoMensal, calcularGraficoStatus,
  calcularGraficoPorObra, calcularGraficoPorTipo,
} from '@/utils/dashboardCalculations';

const { bench, printReport } = createBenchSuite('RELATÓRIO — ESCALABILIDADE DE ALGORITMOS (client-side)');
afterAll(printReport);

describe('Escalabilidade — pipeline de registros (recordsService)', () => {
  it('normalizeRecords: 25 entidades × 2.000 = 50.000 registros', async () => {
    const results = [];
    const types = [];
    for (let i = 0; i < 25; i++) {
      results.push(generateRecords(2000, `E${i}`));
      types.push(`E${i}`);
    }
    await bench('PIPELINE', 'normalizeRecords — 50.000 registros', 5, 1500, () => {
      normalizeRecords(results, types);
    });
  });

  it('deduplicateRecords: 50.000 registros com 50% de duplicatas', async () => {
    const base = generateRecords(25000, 'X');
    const withDupes = [...base, ...base];
    await bench('PIPELINE', 'deduplicateRecords — 50.000 (50% dup)', 5, 800, () => {
      deduplicateRecords(withDupes);
    });
  });

  it('groupEnsaiosByStatus: 50.000 registros', async () => {
    const ensaios = generateRecords(50000, 'X');
    await bench('PIPELINE', 'groupEnsaiosByStatus — 50.000 registros', 5, 800, () => {
      groupEnsaiosByStatus(ensaios);
    });
  });

  it('filterRecordsByDateRange + extractLaboratoristas: 50.000 registros', async () => {
    const records = generateRecords(50000, 'X');
    await bench('PIPELINE', 'filtro período + laboratoristas — 50.000', 5, 800, () => {
      const filtered = filterRecordsByDateRange(records, '2026-01-01', '2026-12-31');
      extractLaboratoristas(filtered);
    });
  });
});

describe('Escalabilidade — dashboard com volume extremo', () => {
  it('cálculo de stats + 4 gráficos com 50.000 registros', async () => {
    const ensaios = generateRecords(50000, 'X');
    const obras = generateRecords(200, 'Obra');
    const projects = generateRecords(100, 'Project');
    await bench('DASHBOARD', 'stats + 4 gráficos — 50.000 registros', 5, 2000, () => {
      calcularStats(ensaios, obras, projects, false, false);
      calcularGraficoMensal(ensaios, '6meses', false);
      calcularGraficoStatus(ensaios, false, false);
      calcularGraficoPorObra(ensaios, obras);
      calcularGraficoPorTipo(ensaios);
    });
  });
});

describe('Escalabilidade — auditoria e integridade', () => {
  it('computeAuditDiff em registro grande (200 campos + arrays aninhados)', async () => {
    const buildBig = (seed) => {
      const r = {};
      for (let i = 0; i < 200; i++) r[`campo_${i}`] = `valor-${seed}-${i % 7}`;
      r.furos = Array.from({ length: 100 }, (_, i) => ({ numero: i, estaca: `${i + seed}`, umidade: i * 1.1 }));
      return r;
    };
    const oldData = buildBig(0);
    const newData = buildBig(1);
    await bench('AUDITORIA', 'computeAuditDiff — registro c/ 200 campos + 100 furos', 20, 100, () => {
      computeAuditDiff(oldData, newData);
    });
  });

  it('reconstructHistory + verifyChainIntegrity: 5.000 entradas de auditoria', async () => {
    const entries = [];
    let prev = null;
    for (let i = 0; i < 5000; i++) {
      const hash = `hash-${i}`;
      entries.push({
        id: `a-${i}`,
        entity_name: 'EnsaioCAUQ',
        operation: 'update',
        changes: [{ field: 'observacoes', old_value: `v${i - 1}`, new_value: `v${i}` }],
        chain_hash: hash,
        previous_hash: prev,
        created_date: `2026-01-01T00:00:${String(i % 60).padStart(2, '0')}`,
      });
      prev = hash;
    }
    await bench('AUDITORIA', 'reconstruct + verifyChain — 5.000 entradas', 10, 300, () => {
      reconstructHistory(entries);
      verifyChainIntegrity(entries);
    });
  });

  it('computeIntegrityHash (SHA-256) em registro profundo', async () => {
    const record = {
      obra_id: 'o1',
      furos: Array.from({ length: 200 }, (_, i) => ({
        numero: i, estaca: `E${i}`, pista: 'Direita',
        peso_areia_garrafa_antes: 5000 + i, peso_areia_garrafa_apos: 3000 + i,
        densidade_umida_furo: 2.1, grau_compactacao: 98.5,
      })),
      observacoes: 'x'.repeat(5000),
    };
    await bench('AUDITORIA', 'computeIntegrityHash — registro c/ 200 furos', 20, 100, async () => {
      await computeIntegrityHash(record);
    });
  });

  it('compareFields (resolução de conflito) em registros grandes', async () => {
    const local = generateRecords(1, 'X', { furos: Array.from({ length: 200 }, (_, i) => ({ n: i, v: i })) })[0];
    const server = { ...local, observacoes: 'diferente', furos: local.furos.map(f => ({ ...f, v: f.v + 1 })) };
    await bench('AUDITORIA', 'compareFields — conflito em registro grande', 20, 100, () => {
      compareFields('EnsaioCAUQ', local, server);
    });
  });
});

describe('Escalabilidade — sanitização e fila offline', () => {
  it('sanitizeText em texto de 1MB', async () => {
    const bigText = 'Texto com <b>tags</b> & caracteres especiais "aspas" '.repeat(20000); // ~1MB
    await bench('SANITIZAÇÃO', 'sanitizeText — string de ~1MB', 10, 300, () => {
      sanitizeText(bigText);
    });
  });

  it('sanitizeTextFields + sanitizeNestedNumbers em payload grande', async () => {
    const payload = {
      observacoes: 'obs '.repeat(1000),
      atividades_realizadas: 'atv '.repeat(1000),
      cargas: Array.from({ length: 500 }, (_, i) => ({
        numero_carga: i, placa: `ABC-${i}`, peso_toneladas: `${i}.5`, observacoes: `carga ${i}`,
      })),
    };
    await bench('SANITIZAÇÃO', 'sanitize payload — 500 cargas + textos longos', 20, 100, () => {
      sanitizeTextFields(payload);
      sanitizeNestedNumbers(payload);
    });
  });

  it('generatePayloadHash em 1.000 payloads grandes', async () => {
    const payloads = Array.from({ length: 1000 }, (_, i) =>
      generateRecords(1, 'X', { idx: i, fotos: Array.from({ length: 20 }, (_, j) => `url-${i}-${j}`) })[0]
    );
    await bench('FILA OFFLINE', 'generatePayloadHash — 1.000 payloads', 5, 500, () => {
      for (const p of payloads) generatePayloadHash(p);
    });
  });

  it('detecção de duplicatas par-a-par em fila com 200 itens (pior caso O(n²))', async () => {
    const items = Array.from({ length: 200 }, (_, i) =>
      createQueueItem({
        operation: 'create',
        entityType: 'EnsaioCAUQ',
        entityId: null,
        payload: { obra_id: `obra-${i % 10}`, data: '2026-01-01' },
        clientUpdatedAt: new Date().toISOString(),
      })
    );
    await bench('FILA OFFLINE', 'dedup par-a-par — fila com 200 itens (n²=40k comp.)', 5, 500, () => {
      for (const a of items) {
        for (const b of items) {
          if (a.id !== b.id) areQueueItemsDuplicate(a, b);
        }
      }
    });
  });
});