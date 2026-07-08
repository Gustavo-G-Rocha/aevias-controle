/**
 * tests/hooks/useNaoConformidadesData.test.js
 *
 * Testes de orquestração do hook useNaoConformidadesData.
 *
 * O ambiente é 'node' (sem DOM/RTL), então não usamos renderHook.
 * Em vez disso, testamos a função extraída loadNaoConformidadesData,
 * que é o queryFn puro do hook — cobrindo o fluxo completo:
 *   carregar obras/regionais → calcular obras acessíveis →
 *   buscar registros → extrair NCs (checklist + diário + outros).
 *
 * Todos os services e accessControl são mockados para isolar a orquestração.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependências ───────────────────────────────────────────
// accessControl é importado diretamente pelo hook — mockamos as duas funções usadas.
vi.mock('@/utils/accessControl', () => ({
  getUserAccessLevel: vi.fn((user) => {
    if (!user) return 'user';
    return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
  }),
  getAccessibleObraIds: vi.fn(() => new Set()),
}));

// recordsService — mockamos listarRegistros e filtrarRegistros
const mockListarRegistros = vi.fn();
const mockFiltrarRegistros = vi.fn();
vi.mock('@/services/recordsService', () => ({
  listarRegistros: (...args) => mockListarRegistros(...args),
  filtrarRegistros: (...args) => mockFiltrarRegistros(...args),
}));

// regionaisService
const mockListarRegionais = vi.fn();
vi.mock('@/services/regionaisService', () => ({
  listarRegionais: (...args) => mockListarRegionais(...args),
}));

// base44Client stub (o hook importa useQueryData que importa base44Client)
vi.mock('@/api/base44Client', () => ({ base44: { entities: {} } }));

// app-params stub (referenciado por base44Client)
vi.mock('@/lib/app-params', () => ({
  appId: 'test-app',
  appOwner: 'test-owner',
}));

import { loadNaoConformidadesData } from '@/hooks/useNaoConformidadesData';
import { getAccessibleObraIds } from '@/utils/accessControl';
import { TIPOS_CHECKLIST, OUTROS_TIPOS_REGISTRO } from '@/utils/naoConformidadesUtils';

// ── Dados de fixture ─────────────────────────────────────────────────
const obras = [
  { id: 'o1', regional_id: 'r1' },
  { id: 'o2', regional_id: 'r1' },
  { id: 'o3', regional_id: 'r2' },
];
const regionais = [{ id: 'r1' }, { id: 'r2' }];

const adminUser = { email: 'admin@x.com', access_level: 'admin' };
const clienteUser = { email: 'cli@x.com', access_level: 'cliente' };

// Helper: configura getAccessibleObraIds para retornar um Set específico
const setAccessibleObras = (ids) => {
  getAccessibleObraIds.mockReturnValue(new Set(ids));
};

// Helper: configura filtrarRegistros para retornar dados por tipo de entidade
// mapData: { 'RelatorioNC': [...], 'ChecklistUsina': [...], ... }
const setupFiltrarRegistros = (mapData) => {
  mockFiltrarRegistros.mockImplementation((tipo, _filter, _sort, _limit) => {
    return Promise.resolve(mapData[tipo] || []);
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockListarRegistros.mockResolvedValue(obras);
  mockListarRegionais.mockResolvedValue(regionais);
});

// ── Testes ───────────────────────────────────────────────────────────

describe('loadNaoConformidadesData — admin (acesso total)', () => {
  beforeEach(() => {
    setAccessibleObras(['o1', 'o2', 'o3']);
  });

  it('retorna obras acessíveis e RNCs filtrados por obra_id', async () => {
    const rncs = [
      { id: 'rnc1', obra_id: 'o1' },
      { id: 'rnc2', obra_id: 'o9' }, // obra não acessível → removido
    ];
    setupFiltrarRegistros({ RelatorioNC: rncs });

    const result = await loadNaoConformidadesData(adminUser);

    expect(result.obras).toHaveLength(3);
    expect(result.rncs).toHaveLength(1);
    expect(result.rncs[0].id).toBe('rnc1');
    expect(result.checklistNCs).toEqual([]);
  });

  it('passa obraFilter vazio para admin (sem filtro server-side)', async () => {
    setupFiltrarRegistros({});

    await loadNaoConformidadesData(adminUser);

    // RelatorioNC é a primeira chamada de filtrarRegistros
    const [tipo, filter] = mockFiltrarRegistros.mock.calls[0];
    expect(tipo).toBe('RelatorioNC');
    expect(filter).toEqual({});
  });

  it('extrai NCs de checklists via extrairNaoConformidadesChecklist', async () => {
    const checklistUsina = {
      id: 'cu1', obra_id: 'o1', _tipo: 'ChecklistUsina',
      laboratorista_name: 'Lab', data: '2026-01-01',
      controle_cauq: {
        granulometria: { realizado: true, conforme: false },
        estabilidade: { realizado: true, conforme: false },
        volume_vazios: { realizado: true, conforme: true }, // conforme → não entra
      },
    };
    setupFiltrarRegistros({ ChecklistUsina: [checklistUsina] });

    const result = await loadNaoConformidadesData(adminUser);

    const params = result.checklistNCs.map(c => c.parametro);
    expect(params).toContain('Granulometria');
    expect(params).toContain('Estabilidade');
    expect(params).not.toContain('Volume de vazios');
  });

  it('extrai NCs explícitas (nao_conformidades) de checklists sem duplicar', async () => {
    const checklist = {
      id: 'cl1', obra_id: 'o1', _tipo: 'ChecklistMRAF',
      laboratorista_name: 'Lab', data: '2026-01-01',
      acompanhamento_aplicacao: {
        taxa_aplicacao: { realizado: true, conforme: false },
      },
      nao_conformidades: [
        { categoria_nc: 'Execução', parametro_nc: 'Taxa', descricao: 'desc' },
      ],
    };
    setupFiltrarRegistros({ ChecklistMRAF: [checklist] });

    const result = await loadNaoConformidadesData(adminUser);

    // NC extraída do controle + NC explícita do array
    expect(result.checklistNCs.length).toBeGreaterThanOrEqual(2);
    const params = result.checklistNCs.map(c => c.parametro);
    expect(params).toContain('Taxa aplicacao (MRAF)');
    expect(params).toContain('Execução / Taxa');
  });

  it('extrai NCs explícitas do diário de obra', async () => {
    const diario = {
      id: 'd1', obra_id: 'o1',
      laboratorista_name: 'Lab', data: '2026-01-01',
      nao_conformidades: [
        { categoria_nc: 'Campo', parametro_nc: 'Compactação', descricao: 'falha' },
      ],
    };
    setupFiltrarRegistros({ DiarioObra: [diario] });

    const result = await loadNaoConformidadesData(adminUser);

    const nc = result.checklistNCs.find(c => c.parametro === 'Campo / Compactação');
    expect(nc).toBeDefined();
    expect(nc.tipo).toBe('DiarioObra');
    expect(nc._page).toBe('RelatorioDiario');
  });

  it('extrai NCs de outros registros (approved=false)', async () => {
    const ensaio = {
      id: 'e1', obra_id: 'o1', approved: false,
      laboratorista_name: 'Lab', data_ensaio: '2026-01-01',
    };
    setupFiltrarRegistros({ EnsaioCAUQ: [ensaio] });

    const result = await loadNaoConformidadesData(adminUser);

    const nc = result.checklistNCs.find(c => c.id === 'e1');
    expect(nc).toBeDefined();
    expect(nc.tipo).toBe('EnsaioCAUQ');
  });

  it('extrai NCs de ManchaPendulo via condicao_conformidade NÃO CONFORME', async () => {
    const mancha = {
      id: 'm1', obra_id: 'o1', condicao_conformidade: 'NÃO CONFORME',
      laboratorista_name: 'Lab', data_ensaio: '2026-01-01',
    };
    setupFiltrarRegistros({ EnsaioManchaPendulo: [mancha] });

    const result = await loadNaoConformidadesData(adminUser);

    const nc = result.checklistNCs.find(c => c.id === 'm1');
    expect(nc).toBeDefined();
    expect(nc.tipo).toBe('EnsaioManchaPendulo');
  });

  it('ignora outros registros aprovados (approved !== false)', async () => {
    const ensaio = {
      id: 'e2', obra_id: 'o1', approved: true,
      laboratorista_name: 'Lab', data_ensaio: '2026-01-01',
    };
    setupFiltrarRegistros({ EnsaioDensidade: [ensaio] });

    const result = await loadNaoConformidadesData(adminUser);

    expect(result.checklistNCs.find(c => c.id === 'e2')).toBeUndefined();
  });

  it('combina NCs de checklists, diário e outros registros', async () => {
    const checklist = {
      id: 'c1', obra_id: 'o1', _tipo: 'ChecklistConcretagem',
      laboratorista_name: 'Lab', data: '2026-01-01',
      cargas_concreto: [{ slump_test: { realizado: true, conforme: false } }],
    };
    const diario = {
      id: 'd1', obra_id: 'o1', laboratorista_name: 'Lab', data: '2026-01-01',
      nao_conformidades: [{ categoria_nc: 'NC', descricao: 'falha geral' }],
    };
    const outro = {
      id: 'e1', obra_id: 'o1', approved: false, laboratorista_name: 'Lab',
    };
    setupFiltrarRegistros({
      ChecklistConcretagem: [checklist],
      DiarioObra: [diario],
      EnsaioSondagem: [outro],
    });

    const result = await loadNaoConformidadesData(adminUser);

    const ids = new Set(result.checklistNCs.map(c => c.id));
    expect(ids.has('c1')).toBe(true);
    expect(ids.has('d1')).toBe(true);
    expect(ids.has('e1')).toBe(true);
  });
});

describe('loadNaoConformidadesData — usuário restrito (cliente)', () => {
  it('passa obraFilter com $in das obras acessíveis', async () => {
    setAccessibleObras(['o1', 'o3']);
    setupFiltrarRegistros({});

    await loadNaoConformidadesData(clienteUser);

    const [tipo, filter] = mockFiltrarRegistros.mock.calls[0];
    expect(tipo).toBe('RelatorioNC');
    expect(filter).toEqual({ obra_id: { $in: ['o1', 'o3'] } });
  });

  it('retorna vazio quando cliente não tem obras acessíveis', async () => {
    setAccessibleObras([]);

    const result = await loadNaoConformidadesData(clienteUser);

    expect(result.obras).toEqual([]);
    expect(result.rncs).toEqual([]);
    expect(result.checklistNCs).toEqual([]);
    // Não deve chamar filtrarRegistros (skip de Phase 2)
    expect(mockFiltrarRegistros).not.toHaveBeenCalled();
  });

  it('filtra RNCs por obra_id mesmo quando server-side retornou extras', async () => {
    setAccessibleObras(['o1']);
    const rncs = [
      { id: 'rnc1', obra_id: 'o1' },
      { id: 'rnc2', obra_id: 'o2' }, // não acessível → removido
    ];
    setupFiltrarRegistros({ RelatorioNC: rncs });

    const result = await loadNaoConformidadesData(clienteUser);

    expect(result.rncs).toHaveLength(1);
    expect(result.rncs[0].id).toBe('rnc1');
  });

  it('aplica filtro de NC (approved=false) para outros registros não-condicao', async () => {
    setAccessibleObras(['o1']);
    setupFiltrarRegistros({});

    await loadNaoConformidadesData(clienteUser);

    // Encontra a chamada para EnsaioDensidade (não-condicao)
    const densidadeCall = mockFiltrarRegistros.mock.calls.find(
      ([tipo]) => tipo === 'EnsaioDensidade'
    );
    expect(densidadeCall).toBeDefined();
    expect(densidadeCall[1]).toEqual({
      obra_id: { $in: ['o1'] },
      approved: false,
    });
  });

  it('aplica filtro de condicao_conformidade para ManchaPendulo', async () => {
    setAccessibleObras(['o1']);
    setupFiltrarRegistros({});

    await loadNaoConformidadesData(clienteUser);

    const manchaCall = mockFiltrarRegistros.mock.calls.find(
      ([tipo]) => tipo === 'EnsaioManchaPendulo'
    );
    expect(manchaCall).toBeDefined();
    expect(manchaCall[1]).toEqual({
      obra_id: { $in: ['o1'] },
      condicao_conformidade: 'NÃO CONFORME',
    });
  });
});

describe('loadNaoConformidadesData — integridade da orquestração', () => {
  beforeEach(() => {
    setAccessibleObras(['o1', 'o2', 'o3']);
  });

  it('faz exatamente 1 chamada listarRegistros (Obra) e 1 listarRegionais', async () => {
    setupFiltrarRegistros({});

    await loadNaoConformidadesData(adminUser);

    expect(mockListarRegistros).toHaveBeenCalledTimes(1);
    expect(mockListarRegistros.mock.calls[0][0]).toBe('Obra');
    expect(mockListarRegionais).toHaveBeenCalledTimes(1);
  });

  it('fama chamadas de filtrarRegistros para RNC + cada tipo de checklist + Diario + cada outro tipo', async () => {
    setupFiltrarRegistros({});

    await loadNaoConformidadesData(adminUser);

    const expectedCalls =
      1 + // RelatorioNC
      TIPOS_CHECKLIST.length +
      1 + // DiarioObra
      OUTROS_TIPOS_REGISTRO.length;
    expect(mockFiltrarRegistros).toHaveBeenCalledTimes(expectedCalls);
  });

  it('preserva _page em CNCs extraídas de checklists', async () => {
    const checklist = {
      id: 'cu1', obra_id: 'o1', _tipo: 'ChecklistUsina',
      laboratorista_name: 'Lab', data: '2026-01-01',
      controle_cauq: { granulometria: { realizado: true, conforme: false } },
    };
    setupFiltrarRegistros({ ChecklistUsina: [checklist] });

    const result = await loadNaoConformidadesData(adminUser);

    const nc = result.checklistNCs[0];
    expect(nc._page).toBe('RelatorioChecklist');
  });

  it('normaliza campos opcionais (laboratorista, empreiteira, rodovia, usina) para string vazia', async () => {
    const checklist = {
      id: 'cu1', obra_id: 'o1', _tipo: 'ChecklistUsina', data: '2026-01-01',
      controle_cauq: { granulometria: { realizado: true, conforme: false } },
      // sem laboratorista_name, empreiteira, rodovia, usina
    };
    setupFiltrarRegistros({ ChecklistUsina: [checklist] });

    const result = await loadNaoConformidadesData(adminUser);

    const nc = result.checklistNCs[0];
    expect(nc.laboratorista_name).toBe('');
    expect(nc.empreiteira).toBe('');
    expect(nc.rodovia).toBe('');
    expect(nc.usina).toBe('');
  });

  it('usa usina_selecionada como fallback para usina', async () => {
    const diario = {
      id: 'd1', obra_id: 'o1', laboratorista_name: 'Lab', data: '2026-01-01',
      usina_selecionada: 'Usina Central',
      nao_conformidades: [{ descricao: 'falha' }],
    };
    setupFiltrarRegistros({ DiarioObra: [diario] });

    const result = await loadNaoConformidadesData(adminUser);

    const nc = result.checklistNCs[0];
    expect(nc.usina).toBe('Usina Central');
  });
});