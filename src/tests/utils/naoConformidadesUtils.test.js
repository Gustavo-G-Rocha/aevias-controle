import { describe, it, expect } from 'vitest';
import {
  applyRncFilters,
  applyCncFilters,
  extrairNaoConformidadesChecklist,
  mapOutroRegistroToCnc,
  mapNcExplicitaToCnc,
  isOutroRegistroNaoConforme,
} from '@/utils/naoConformidadesUtils';

// ---- helpers ----
const makeRnc = (overrides = {}) => ({
  id: 'r1', obra_id: 'o1', status: 'aberta', executora: 'Emp A',
  rodovia: 'BR-101', data_nc: '2026-01-10', ...overrides,
});
const makeCnc = (overrides = {}) => ({
  id: 'c1', obra_id: 'o1', parametro: 'Granulometria',
  empreiteira: 'Emp A', rodovia: 'BR-101', usina: 'Usina X',
  data: '2026-01-10', ...overrides,
});
const emptyFilters = () => ({
  status: null, parametro: null, obraId: null,
  empreiteira: null, rodovia: null, usina: null,
  dataInicial: null, dataFinal: null,
});

// ---- applyRncFilters ----
describe('applyRncFilters', () => {
  it('retorna todos quando não há filtros ativos', () => {
    const rncs = [makeRnc(), makeRnc({ id: 'r2', obra_id: 'o2' })];
    expect(applyRncFilters(rncs, [], emptyFilters())).toHaveLength(2);
  });

  it('filtra por obraId', () => {
    const rncs = [makeRnc({ obra_id: 'o1' }), makeRnc({ id: 'r2', obra_id: 'o2' })];
    const result = applyRncFilters(rncs, [], { ...emptyFilters(), obraId: 'o1' });
    expect(result).toHaveLength(1);
    expect(result[0].obra_id).toBe('o1');
  });

  it('filtra por status', () => {
    const rncs = [makeRnc({ status: 'aberta' }), makeRnc({ id: 'r2', status: 'encerrada' })];
    const result = applyRncFilters(rncs, [], { ...emptyFilters(), status: 'aberta' });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('aberta');
  });

  it('pula filtro obraId quando skip="obraId"', () => {
    const rncs = [makeRnc({ obra_id: 'o1' }), makeRnc({ id: 'r2', obra_id: 'o2' })];
    const result = applyRncFilters(rncs, [], { ...emptyFilters(), obraId: 'o1' }, 'obraId');
    expect(result).toHaveLength(2);
  });

  it('filtra por data_nc — dataInicial', () => {
    const rncs = [makeRnc({ data_nc: '2026-01-05' }), makeRnc({ id: 'r2', data_nc: '2026-01-20' })];
    const result = applyRncFilters(rncs, [], { ...emptyFilters(), dataInicial: new Date('2026-01-10') });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r2');
  });

  it('filtra por data_nc — dataFinal', () => {
    const rncs = [makeRnc({ data_nc: '2026-01-05' }), makeRnc({ id: 'r2', data_nc: '2026-01-20' })];
    const result = applyRncFilters(rncs, [], { ...emptyFilters(), dataFinal: new Date('2026-01-10') });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('exclui RNC sem data_nc quando filtro de data está ativo', () => {
    const rncs = [makeRnc({ data_nc: '' })];
    const result = applyRncFilters(rncs, [], { ...emptyFilters(), dataInicial: new Date('2026-01-01') });
    expect(result).toHaveLength(0);
  });
});

// ---- applyCncFilters ----
describe('applyCncFilters', () => {
  it('retorna todos quando não há filtros', () => {
    const cncs = [makeCnc(), makeCnc({ id: 'c2', obra_id: 'o2' })];
    expect(applyCncFilters(cncs, [], emptyFilters())).toHaveLength(2);
  });

  it('filtra por parametro', () => {
    const cncs = [makeCnc({ parametro: 'Granulometria' }), makeCnc({ id: 'c2', parametro: 'Slump Test' })];
    const result = applyCncFilters(cncs, [], { ...emptyFilters(), parametro: 'Granulometria' });
    expect(result).toHaveLength(1);
    expect(result[0].parametro).toBe('Granulometria');
  });

  it('filtra por usina', () => {
    const cncs = [makeCnc({ usina: 'Usina X' }), makeCnc({ id: 'c2', usina: 'Usina Y' })];
    const result = applyCncFilters(cncs, [], { ...emptyFilters(), usina: 'Usina X' });
    expect(result).toHaveLength(1);
  });

  it('pula filtro status quando skip="status"', () => {
    const rncs = [makeRnc({ status: 'aberta', obra_id: 'o1' })];
    const cncs = [makeCnc({ obra_id: 'o1' }), makeCnc({ id: 'c2', obra_id: 'o2' })];
    // Com filtro status=aberta normalmente filtraria por ids de obras com rncs abertos
    const result = applyCncFilters(cncs, rncs, { ...emptyFilters(), status: 'aberta' }, 'status');
    expect(result).toHaveLength(2); // skip — retorna todos
  });
});

// ---- extrairNaoConformidadesChecklist ----
describe('extrairNaoConformidadesChecklist', () => {
  it('retorna vazio para checklist sem NCs', () => {
    expect(extrairNaoConformidadesChecklist({}, 'ChecklistUsina')).toHaveLength(0);
  });

  it('ChecklistUsina — detecta granulometria não conforme', () => {
    const cl = { controle_cauq: { granulometria: { realizado: true, conforme: false } } };
    const result = extrairNaoConformidadesChecklist(cl, 'ChecklistUsina');
    expect(result).toContain('granulometria');
  });

  it('ChecklistUsina — não inclui item conforme', () => {
    const cl = { controle_cauq: { granulometria: { realizado: true, conforme: true } } };
    const result = extrairNaoConformidadesChecklist(cl, 'ChecklistUsina');
    expect(result).not.toContain('granulometria');
  });

  it('ChecklistUsina — equivalente de areia abaixo do limite', () => {
    const cl = { controle_cauq: {}, equivalente_areia_status: 'realizado', equivalente_areia_resultados: [40, 60], projeto_equivalente_areia_minimo: 55 };
    const result = extrairNaoConformidadesChecklist(cl, 'ChecklistUsina');
    expect(result.filter(r => r === 'Equivalente de Areia')).toHaveLength(1);
  });

  it('ChecklistAplicacao — detecta taxa de pintura não conforme', () => {
    const cl = { pintura_ligacao: { taxa_pintura: { realizado: true, conforme: false } } };
    const result = extrairNaoConformidadesChecklist(cl, 'ChecklistAplicacao');
    expect(result).toContain('Taxa de Pintura');
  });

  it('ChecklistConcretagem — detecta slump test não conforme', () => {
    const cl = { cargas_concreto: [{ slump_test: { realizado: true, conforme: false } }] };
    const result = extrairNaoConformidadesChecklist(cl, 'ChecklistConcretagem');
    expect(result).toContain('Slump Test');
  });

  it('ChecklistTerraplanagem — detecta compactacao_proctor não conforme', () => {
    const cl = { ensaios_empreiteira: { compactacao_proctor: { realizado: true, conforme: false } } };
    const result = extrairNaoConformidadesChecklist(cl, 'ChecklistTerraplanagem');
    expect(result.some(r => r.includes('compactacao proctor'))).toBe(true);
  });

  it('ChecklistMRAF — detecta taxa_aplicacao não conforme', () => {
    const cl = { acompanhamento_aplicacao: { taxa_aplicacao: { realizado: true, conforme: false } } };
    const result = extrairNaoConformidadesChecklist(cl, 'ChecklistMRAF');
    expect(result.some(r => r.includes('MRAF'))).toBe(true);
  });

  it('tipo desconhecido retorna vazio', () => {
    expect(extrairNaoConformidadesChecklist({ tudo: 'ok' }, 'TipoDesconhecido')).toHaveLength(0);
  });
});

// ---- isOutroRegistroNaoConforme ----
describe('isOutroRegistroNaoConforme', () => {
  it('retorna true para approved === false', () => {
    expect(isOutroRegistroNaoConforme({ approved: false }, 'EnsaioCAUQ')).toBe(true);
  });

  it('retorna false para approved === null', () => {
    expect(isOutroRegistroNaoConforme({ approved: null }, 'EnsaioCAUQ')).toBe(false);
  });

  it('retorna false para approved === true', () => {
    expect(isOutroRegistroNaoConforme({ approved: true }, 'EnsaioCAUQ')).toBe(false);
  });

  it('EnsaioManchaPendulo — retorna true para NÃO CONFORME', () => {
    expect(isOutroRegistroNaoConforme({ condicao_conformidade: 'NÃO CONFORME' }, 'EnsaioManchaPendulo')).toBe(true);
  });

  it('EnsaioVigaBenkelman — retorna false para CONFORME', () => {
    expect(isOutroRegistroNaoConforme({ condicao_conformidade: 'CONFORME' }, 'EnsaioVigaBenkelman')).toBe(false);
  });
});

// ---- mapOutroRegistroToCnc ----
describe('mapOutroRegistroToCnc', () => {
  it('mapeia campos corretamente', () => {
    const reg = { id: 'r1', obra_id: 'o1', laboratorista_name: 'João', data_ensaio: '2026-01-10', empreiteira: 'Emp A', rodovia: 'BR-101', usina: '' };
    const tipo = { value: 'EnsaioCAUQ', label: 'Ensaio CAUQ', page: 'RelatorioCAUQ' };
    const result = mapOutroRegistroToCnc(reg, tipo);
    expect(result.parametro).toBe('Ensaio CAUQ');
    expect(result.data).toBe('2026-01-10');
    expect(result._page).toBe('RelatorioCAUQ');
    expect(result.obra_id).toBe('o1');
  });

  it('usa data_nc como fallback para campo de data', () => {
    const reg = { id: 'r1', obra_id: 'o1', data: '2026-02-05' };
    const tipo = { value: 'AcompanhamentoCarga', label: 'Acomp. de Cargas', page: 'RelatorioAcompanhamentoCarga' };
    const result = mapOutroRegistroToCnc(reg, tipo);
    expect(result.data).toBe('2026-02-05');
  });
});

// ---- mapNcExplicitaToCnc ----
describe('mapNcExplicitaToCnc', () => {
  it('constrói parametro de categoria + parametro_nc', () => {
    const registro = { id: 'cl1', obra_id: 'o1', laboratorista_name: 'Ana', data: '2026-01-15', empreiteira: 'E1', rodovia: 'BR-040' };
    const nc = { categoria_nc: 'Geometria', parametro_nc: 'Espessura', local_nc: 'CAMPO' };
    const tipo = { value: 'ChecklistUsina', page: 'RelatorioChecklist' };
    const result = mapNcExplicitaToCnc(registro, nc, tipo);
    expect(result.parametro).toBe('Geometria / Espessura');
    expect(result._ncLocal).toBe('CAMPO');
    expect(result.obra_id).toBe('o1');
  });

  it('usa descricao quando categoria e parametro_nc estão ausentes', () => {
    const registro = { id: 'cl1', obra_id: 'o1', data: '', empreiteira: '', rodovia: '' };
    const nc = { descricao: 'Problema identificado' };
    const tipo = { value: 'DiarioObra', page: 'RelatorioDiario' };
    const result = mapNcExplicitaToCnc(registro, nc, tipo);
    expect(result.parametro).toBe('Problema identificado');
  });

  it('usa "NC" como fallback quando nenhum campo está preenchido', () => {
    const registro = { id: 'cl1', obra_id: 'o1', data: '', empreiteira: '', rodovia: '' };
    const nc = {};
    const tipo = { value: 'DiarioObra', page: 'RelatorioDiario' };
    const result = mapNcExplicitaToCnc(registro, nc, tipo);
    expect(result.parametro).toBe('NC');
  });
});