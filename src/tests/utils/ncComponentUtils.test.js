import { describe, it, expect } from 'vitest';
import {
  buildKpiItems,
  mapRncToRow,
  mapCncToRow,
  filterTableRows,
  formatDateBR,
} from '@/utils/ncComponentUtils';

// ---- helpers ----
const makeRnc = (overrides = {}) => ({
  id: 'r1', obra_id: 'o1', status: 'aberta',
  executora: 'Emp A', rodovia: 'BR-101', data_nc: '2026-01-10',
  parametro_nc: 'Espessura', ...overrides,
});
const makeCnc = (overrides = {}) => ({
  id: 'c1', obra_id: 'o1', tipo: 'ChecklistUsina',
  parametro: 'Granulometria', laboratorista_name: 'João',
  data: '2026-01-15', empreiteira: 'Emp A',
  rodovia: 'BR-101', usina: 'Usina X', _page: 'RelatorioChecklist',
  ...overrides,
});

// ---- buildKpiItems ----
describe('buildKpiItems', () => {
  it('retorna 4 KPIs', () => {
    expect(buildKpiItems([], [])).toHaveLength(4);
  });

  it('Total de RNCs reflete tamanho do array', () => {
    const items = buildKpiItems([makeRnc(), makeRnc({ id: 'r2' })], []);
    const total = items.find(k => k.label === 'Total de RNCs');
    expect(total.value).toBe(2);
  });

  it('RNCs Abertas conta apenas status=aberta', () => {
    const rncs = [
      makeRnc({ status: 'aberta' }),
      makeRnc({ id: 'r2', status: 'encerrada' }),
      makeRnc({ id: 'r3', status: 'aberta' }),
    ];
    const items = buildKpiItems(rncs, []);
    const abertas = items.find(k => k.label === 'RNCs Abertas');
    expect(abertas.value).toBe(2);
  });

  it('Em Tratativa conta apenas status=em_tratativa', () => {
    const rncs = [makeRnc({ status: 'em_tratativa' }), makeRnc({ id: 'r2', status: 'aberta' })];
    const items = buildKpiItems(rncs, []);
    const em = items.find(k => k.label === 'Em Tratativa');
    expect(em.value).toBe(1);
  });

  it('NCs em Registros reflete cncsVisiveis.length', () => {
    const items = buildKpiItems([], [makeCnc(), makeCnc({ id: 'c2' }), makeCnc({ id: 'c3' })]);
    const ncs = items.find(k => k.label === 'NCs em Registros');
    expect(ncs.value).toBe(3);
  });

  it('retorna zeros quando arrays vazios', () => {
    const items = buildKpiItems([], []);
    items.forEach(kpi => expect(kpi.value).toBe(0));
  });
});

// ---- mapRncToRow ----
describe('mapRncToRow', () => {
  it('_kind é "rnc"', () => {
    expect(mapRncToRow(makeRnc())._kind).toBe('rnc');
  });

  it('tipoLabel é "Relatório NC"', () => {
    expect(mapRncToRow(makeRnc()).tipoLabel).toBe('Relatório NC');
  });

  it('usa executora como empreiteira', () => {
    const row = mapRncToRow(makeRnc({ executora: 'Construtora X' }));
    expect(row.empreiteira).toBe('Construtora X');
  });

  it('usa data_nc como data', () => {
    expect(mapRncToRow(makeRnc({ data_nc: '2026-03-01' })).data).toBe('2026-03-01');
  });

  it('usa parametro_nc como parametro', () => {
    expect(mapRncToRow(makeRnc({ parametro_nc: 'Resistência' })).parametro).toBe('Resistência');
  });

  it('fallback para categoria_nc quando parametro_nc ausente', () => {
    const row = mapRncToRow({ ...makeRnc(), parametro_nc: '', categoria_nc: 'Pavimentação' });
    expect(row.parametro).toBe('Pavimentação');
  });

  it('usa fiscal como criador quando relatorio_criador ausente', () => {
    const row = mapRncToRow({ ...makeRnc(), relatorio_criador: '', fiscal: 'Sr. Fiscal' });
    expect(row.criador).toBe('Sr. Fiscal');
  });

  it('usina é sempre string vazia (RNC não tem usina)', () => {
    expect(mapRncToRow(makeRnc()).usina).toBe('');
  });
});

// ---- mapCncToRow ----
describe('mapCncToRow', () => {
  it('_kind é "checklist"', () => {
    expect(mapCncToRow(makeCnc())._kind).toBe('checklist');
  });

  it('resolve tipoLabel pelo TIPOS_CHECKLIST', () => {
    const row = mapCncToRow(makeCnc({ tipo: 'ChecklistUsina' }));
    expect(row.tipoLabel).toBe('Checklist de Usina');
  });

  it('resolve tipoLabel pelo OUTROS_TIPOS_REGISTRO', () => {
    const row = mapCncToRow(makeCnc({ tipo: 'EnsaioCAUQ', _page: 'RelatorioCAUQ' }));
    expect(row.tipoLabel).toBe('Ensaio CAUQ');
  });

  it('usa tipo como fallback para tipoLabel desconhecido', () => {
    const row = mapCncToRow(makeCnc({ tipo: 'TipoDesconhecido' }));
    expect(row.tipoLabel).toBe('TipoDesconhecido');
  });

  it('usa laboratorista_name como criador', () => {
    expect(mapCncToRow(makeCnc({ laboratorista_name: 'Maria' })).criador).toBe('Maria');
  });

  it('usa _page como page quando presente', () => {
    expect(mapCncToRow(makeCnc({ _page: 'RelatorioChecklist' })).page).toBe('RelatorioChecklist');
  });
});

// ---- filterTableRows ----
describe('filterTableRows', () => {
  const rows = [
    { tipoLabel: 'Relatório NC', criador: 'João', parametro: 'Espessura', rodovia: 'BR-101', usina: '', empreiteira: 'Emp A' },
    { tipoLabel: 'Checklist de Usina', criador: 'Maria', parametro: 'Granulometria', rodovia: 'BR-040', usina: 'Usina X', empreiteira: 'Emp B' },
    { tipoLabel: 'Ensaio CAUQ', criador: 'Pedro', parametro: 'Volume de Vazios', rodovia: 'BR-116', usina: '', empreiteira: 'Emp A' },
  ];

  it('retorna todas as linhas com tipo "_all" e busca vazia', () => {
    expect(filterTableRows(rows, '_all', '')).toHaveLength(3);
  });

  it('filtra por tipoLabel quando tipo !== "_all"', () => {
    const result = filterTableRows(rows, 'Relatório NC', '');
    expect(result).toHaveLength(1);
    expect(result[0].tipoLabel).toBe('Relatório NC');
  });

  it('busca textual por criador', () => {
    expect(filterTableRows(rows, '_all', 'Maria')).toHaveLength(1);
  });

  it('busca textual por parametro', () => {
    expect(filterTableRows(rows, '_all', 'granulometria')).toHaveLength(1);
  });

  it('busca textual por rodovia', () => {
    expect(filterTableRows(rows, '_all', 'BR-040')).toHaveLength(1);
  });

  it('busca textual por empreiteira — retorna múltiplos', () => {
    expect(filterTableRows(rows, '_all', 'Emp A')).toHaveLength(2);
  });

  it('busca textual por usina', () => {
    expect(filterTableRows(rows, '_all', 'Usina X')).toHaveLength(1);
  });

  it('busca case-insensitive', () => {
    expect(filterTableRows(rows, '_all', 'JOÃO')).toHaveLength(1);
  });

  it('retorna vazio quando nenhuma linha corresponde', () => {
    expect(filterTableRows(rows, '_all', 'xyz999')).toHaveLength(0);
  });

  it('tipo + busca combinados reduzem corretamente', () => {
    // Apenas ChecklistUsina com empreiteira "Emp B"
    const result = filterTableRows(rows, 'Checklist de Usina', 'Emp B');
    expect(result).toHaveLength(1);
    expect(result[0].criador).toBe('Maria');
  });
});

// ---- formatDateBR ----
describe('formatDateBR', () => {
  it('formata data válida em pt-BR', () => {
    expect(formatDateBR('2026-01-15')).toMatch(/15\/01\/2026/);
  });

  it('retorna "—" para string vazia', () => {
    expect(formatDateBR('')).toBe('—');
  });

  it('retorna "—" para null/undefined', () => {
    expect(formatDateBR(null)).toBe('—');
    expect(formatDateBR(undefined)).toBe('—');
  });

  it('retorna "—" para string inválida', () => {
    expect(formatDateBR('não-é-data')).toBe('—');
  });

  it('formata data de fim de mês corretamente', () => {
    expect(formatDateBR('2026-12-31')).toMatch(/31\/12\/2026/);
  });
});