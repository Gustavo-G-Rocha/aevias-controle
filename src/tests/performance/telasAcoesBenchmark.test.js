/**
 * tests/performance/telasAcoesBenchmark.test.js
 *
 * Benchmark de performance por TELA e por AÇÃO.
 *
 * Metodologia:
 * - Backend mockado com latência simulada de 150ms por chamada de API
 *   (aproxima uma rede 4G/Wi-Fi típica), permitindo medir o efeito real
 *   do paralelismo/paginação de cada tela.
 * - Volumes realistas: 500 registros/entidade no modo lista, 200 no dashboard.
 * - Cada item é medido N vezes; o relatório imprime média/min/máx no final.
 * - Cada medição também valida um orçamento máximo (budget) para capturar
 *   regressões de performance (ex.: paginação virando sequencial, O(n²)).
 */
import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';

const API_LATENCY_MS = 150;

const { entities, delay } = vi.hoisted(() => {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
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
  return { entities, delay };
});

vi.mock('@/api/base44Client', () => ({ base44: { entities } }));

// Todos os módulos @/functions/* resolvem para o MESMO stub compartilhado —
// um único factory exporta ambas as functions com latência simulada.
vi.mock('@/functions/validarESalvarRegistro', () => ({
  validarESalvarRegistro: vi.fn(async ({ data, recordId }) => {
    await delay(API_LATENCY_MS);
    return { data: { success: true, data: { id: recordId || 'novo-id', ...data } } };
  }),
  gerenciarAprovacao: vi.fn(async (payload) => {
    await delay(API_LATENCY_MS);
    return { data: { success: true, data: { id: payload.recordId } } };
  }),
}));

// Fila offline mockada (IndexedDB fora do escopo do benchmark de ação)
vi.mock('@/services/syncService', () => ({
  addOrUpdateQueueItem: vi.fn(async () => {}),
}));

const { isEffectivelyOffline } = vi.hoisted(() => ({ isEffectivelyOffline: vi.fn(() => false) }));
vi.mock('@/utils/offlineSimulation', () => ({ isEffectivelyOffline }));

import { loadAllRecords, loadRecordsByObra, ALL_RECORD_ENTITIES } from '@/services/recordsService';
import { loadDashboardData } from '@/services/dashboardService';
import {
  calcularStats, calcularGraficoMensal, calcularGraficoStatus,
  calcularGraficoPorObra, calcularGraficoPorTipo,
} from '@/utils/dashboardCalculations';
import { filterRecordsByDateRange, extractLaboratoristas } from '@/utils/relatoriosUnificadosUtils';
import { extrairNaoConformidadesChecklist } from '@/utils/naoConformidadesUtils';
import {
  criarEnsaio, atualizarEnsaio, aprovarEnsaio, reprovarEnsaio,
  assinarEnsaio, excluirEnsaio,
} from '@/services/ensaiosService';
import { salvarRegistroOfflineAware } from '@/services/offlineSaveService';

// ─────────────────────────── infra de medição ───────────────────────────

const results = [];

async function bench(categoria, nome, iterations, budgetMs, fn) {
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  results.push({
    categoria, nome, iterations,
    avg: Math.round(avg),
    min: Math.round(Math.min(...times)),
    max: Math.round(Math.max(...times)),
    budget: budgetMs,
  });
  expect(avg, `${nome} estourou o orçamento de ${budgetMs}ms (média ${Math.round(avg)}ms)`).toBeLessThan(budgetMs);
}

afterAll(() => {
  const pad = (s, n) => String(s).padEnd(n);
  const lines = [
    '',
    '════════════ RELATÓRIO DE PERFORMANCE (latência simulada: 150ms/chamada) ════════════',
    `${pad('Categoria', 8)} │ ${pad('Item', 48)} │ ${pad('Média', 8)} │ ${pad('Mín', 8)} │ ${pad('Máx', 8)} │ Budget`,
    '─'.repeat(100),
    ...results.map(r =>
      `${pad(r.categoria, 8)} │ ${pad(r.nome, 48)} │ ${pad(r.avg + 'ms', 8)} │ ${pad(r.min + 'ms', 8)} │ ${pad(r.max + 'ms', 8)} │ <${r.budget}ms`
    ),
    '═'.repeat(100),
  ];
  // eslint-disable-next-line no-console
  console.log(lines.join('\n'));
});

// ─────────────────────────── dados sintéticos ───────────────────────────

function generateRecords(count, entityType) {
  const records = [];
  for (let i = 0; i < count; i++) {
    records.push({
      id: `${entityType}-${i}`,
      obra_id: `obra-${i % 50}`,
      data: '2026-01-01',
      created_by: `lab${i % 20}@x.com`,
      laboratorista_name: `Lab ${i % 20}`,
      approved: i % 3 === 0 ? true : i % 3 === 1 ? false : null,
      status: 'finalizado',
      created_date: `2026-${String((i % 12) + 1).padStart(2, '0')}-15T10:00:00.000000`,
    });
  }
  return records;
}

const adminUser = { email: 'admin@x.com', full_name: 'Admin', role: 'admin', access_level: 'admin' };
const labUser = {
  email: 'lab@x.com', full_name: 'Lab', laboratorista_name: 'Lab',
  access_level: 'sala_tecnica_afirmaevias', role: 'user', crea_number: '123',
};

function setupApiMocks() {
  for (const n of Object.keys(entities)) {
    const dataset = generateRecords(500, n);
    entities[n].list.mockImplementation(async (_s, limit = 500) => {
      await delay(API_LATENCY_MS);
      return dataset.slice(0, limit);
    });
    entities[n].filter.mockImplementation(async (_q, _s, limit = 500, skip = 0) => {
      await delay(API_LATENCY_MS);
      return dataset.slice(skip, skip + limit);
    });
  }
  // Auxiliares menores
  entities.Obra.list.mockImplementation(async () => { await delay(API_LATENCY_MS); return generateRecords(50, 'Obra'); });
  entities.Project.list.mockImplementation(async () => { await delay(API_LATENCY_MS); return generateRecords(30, 'Project'); });
  entities.Regional.list.mockImplementation(async () => { await delay(API_LATENCY_MS); return generateRecords(10, 'Regional'); });
  entities.User.list.mockImplementation(async () => { await delay(API_LATENCY_MS); return generateRecords(40, 'User'); });
}

beforeEach(() => {
  isEffectivelyOffline.mockReturnValue(false);
  setupApiMocks();
});

// ─────────────────────────────── TELAS ───────────────────────────────

describe('Benchmark — carregamento de telas', () => {
  it('Meus Ensaios / listas (25 entidades × 500 registros)', async () => {
    await bench('TELA', 'Meus Ensaios — lista completa', 5, 2500, async () => {
      const r = await loadAllRecords();
      expect(r.length).toBeGreaterThan(0);
    });
  });

  it('Dashboard (200/entidade + auxiliares + filtros de acesso)', async () => {
    await bench('TELA', 'Dashboard — dados + filtros de acesso', 5, 2000, async () => {
      const r = await loadDashboardData(adminUser);
      expect(r.ensaios.length).toBeGreaterThan(0);
    });
  });

  it('Registros por obra (filter em todas as entidades)', async () => {
    await bench('TELA', 'Detalhe de Obra — registros da obra', 5, 2500, async () => {
      const r = await loadRecordsByObra('obra-1');
      expect(r.length).toBeGreaterThan(0);
    });
  });

  it('Dashboard — cálculo de stats e 4 gráficos (12.500 registros)', async () => {
    const ensaios = generateRecords(500, 'X');
    const big = [];
    for (let i = 0; i < 25; i++) big.push(...ensaios.map(e => ({ ...e, id: `${i}-${e.id}` })));
    const obras = generateRecords(50, 'Obra');
    const projects = generateRecords(30, 'Project');
    await bench('TELA', 'Dashboard — cálculos de gráficos (client-side)', 10, 500, async () => {
      calcularStats(big, obras, projects, false, false);
      calcularGraficoMensal(big, '6meses', false);
      calcularGraficoStatus(big, false, false);
      calcularGraficoPorObra(big, obras);
      calcularGraficoPorTipo(big);
    });
  });

  it('Relatórios Unificados — filtro por período + laboratoristas (12.500 registros)', async () => {
    const ensaios = [];
    for (let i = 0; i < 25; i++) ensaios.push(...generateRecords(500, `E${i}`));
    await bench('TELA', 'Relatórios Unificados — filtros (client-side)', 10, 500, async () => {
      const filtered = filterRecordsByDateRange(ensaios, '2026-01-01', '2026-12-31');
      extractLaboratoristas(filtered);
    });
  });

  it('Não Conformidades — extração de NCs de 500 checklists', async () => {
    const checklists = generateRecords(500, 'ChecklistTerraplanagem').map(c => ({
      ...c,
      nao_conformidades: [
        { local_nc: 'CAMPO', categoria_nc: 'Execução', parametro_nc: 'Compactação', descricao: 'NC teste' },
        { local_nc: 'USINA', categoria_nc: 'Material', parametro_nc: 'Umidade', descricao: 'NC teste 2' },
      ],
    }));
    await bench('TELA', 'Não Conformidades — extração de NCs (client-side)', 10, 500, async () => {
      for (const c of checklists) {
        extrairNaoConformidadesChecklist(c, { value: 'ChecklistTerraplanagem', label: 'Terraplanagem' });
      }
    });
  });
});

// ─────────────────────────────── AÇÕES ───────────────────────────────

describe('Benchmark — ações do usuário', () => {
  const ensaio = { id: 'e1', entityType: 'EnsaioCAUQ' };

  it('Criar registro (validação server-side)', async () => {
    await bench('AÇÃO', 'Salvar novo registro', 10, 600, () =>
      criarEnsaio('EnsaioCAUQ', { obra_id: 'obra-1', data: '2026-07-17' }));
  });

  it('Atualizar registro', async () => {
    await bench('AÇÃO', 'Atualizar registro existente', 10, 600, () =>
      atualizarEnsaio('EnsaioCAUQ', 'e1', { observacoes: 'x' }));
  });

  it('Aprovar registro', async () => {
    await bench('AÇÃO', 'Aprovar registro (gestor)', 10, 600, () =>
      aprovarEnsaio(ensaio, labUser));
  });

  it('Reprovar registro', async () => {
    await bench('AÇÃO', 'Reprovar registro com motivo', 10, 600, () =>
      reprovarEnsaio(ensaio, labUser, 'fora da tolerância'));
  });

  it('Assinar registro (cliente)', async () => {
    await bench('AÇÃO', 'Assinatura eletrônica (cliente)', 10, 600, () =>
      assinarEnsaio(ensaio, labUser));
  });

  it('Excluir registro', async () => {
    await bench('AÇÃO', 'Excluir registro', 10, 600, () =>
      excluirEnsaio(ensaio));
  });

  it('Salvar offline (enfileiramento local)', async () => {
    isEffectivelyOffline.mockReturnValue(true);
    await bench('AÇÃO', 'Salvar offline — enfileirar na fila local', 10, 200, async () => {
      const r = await salvarRegistroOfflineAware({
        entityName: 'EnsaioCAUQ',
        data: { obra_id: 'obra-1' },
        operation: 'create',
      });
      expect(r._offline).toBe(true);
    });
  });
});