/**
 * tests/hooks/useEnsaiosList.test.js
 *
 * Testes comportamentais das funções puras de useEnsaiosList:
 *   - filtrarPorAcesso: filtragem de registros por nível de acesso/regional
 *     (o tipo exato de cenário de bug de permissão citado em T2)
 *   - sortByEnsaioDate: ordenação por data do ensaio com fallback e tiebreak
 *
 * As funções são puras (recebem todos os dados por parâmetro), então testamos
 * diretamente sem renderHook (ambiente 'node' sem DOM/RTL).
 */
import { describe, it, expect } from 'vitest';
import { filtrarPorAcesso, sortByEnsaioDate } from '@/hooks/useEnsaiosList';

const regionais = [
  { id: 'r1', salas_tecnicas_responsaveis: ['tech@x.com'], gestor_contrato_responsavel: 'gc@x.com', clientes_responsaveis: ['cli@x.com'] },
  { id: 'r2', salas_tecnicas_responsaveis: [], gestores_contrato_responsaveis: ['gc2@x.com'], clientes_responsaveis: [] },
];

const obras = [
  { id: 'o1', regional_id: 'r1' },
  { id: 'o2', regional_id: 'r2' },
  { id: 'o3', regional_id: 'r9' }, // sem regional correspondente
];

const ensaios = [
  { id: 'e1', obra_id: 'o1', created_by: 'other@x.com', laboratorista_name: 'Other' },
  { id: 'e2', obra_id: 'o2', created_by: 'other@x.com' },
  { id: 'e3', obra_id: 'o3', created_by: 'lab@x.com', laboratorista_name: 'Lab Nome' },
];

describe('filtrarPorAcesso — filtragem por nível de acesso', () => {
  it('admin retorna todos os registros (sem filtragem)', () => {
    const admin = { email: 'admin@x.com', role: 'admin' };
    const out = filtrarPorAcesso(ensaios, admin, 'admin', obras, regionais);
    expect(out).toHaveLength(3);
    expect(out).toBe(ensaios);
  });

  it('sala_tecnica filtra pelas regionais onde é responsável', () => {
    const user = { email: 'tech@x.com' };
    const out = filtrarPorAcesso(ensaios, user, 'sala_tecnica_afirmaevias', obras, regionais);
    expect(out.map((e) => e.id)).toEqual(['e1']);
  });

  it('gestor_contrato casa por gestor_contrato_responsavel (campo único)', () => {
    const user = { email: 'gc@x.com' };
    const out = filtrarPorAcesso(ensaios, user, 'gestor_contrato', obras, regionais);
    expect(out.map((e) => e.id)).toEqual(['e1']);
  });

  it('gestor_contrato casa por gestores_contrato_responsaveis (array)', () => {
    const user = { email: 'gc2@x.com' };
    const out = filtrarPorAcesso(ensaios, user, 'gestor_contrato', obras, regionais);
    expect(out.map((e) => e.id)).toEqual(['e2']);
  });

  it('cliente filtra por regional E exige aprovado ou assinado', () => {
    const user = { email: 'cli@x.com' };
    const clienteEnsaios = [
      { id: 'c1', obra_id: 'o1', approved: true },
      { id: 'c2', obra_id: 'o1', approved: null, client_signature: { signed_by: 'cli@x.com' } },
      { id: 'c3', obra_id: 'o1', approved: null }, // pendente, sem assinatura → removido
      { id: 'c4', obra_id: 'o2', approved: true }, // outra regional → removido
    ];
    const out = filtrarPorAcesso(clienteEnsaios, user, 'cliente', obras, regionais);
    expect(out.map((e) => e.id)).toEqual(['c1', 'c2']);
  });

  it('laboratorista filtra por created_by (email, case-insensitive)', () => {
    const user = { email: 'lab@x.com', laboratorista_name: 'Lab Nome' };
    const labEnsaios = [
      { id: 'l1', obra_id: 'o1', created_by: 'LAB@X.COM', laboratorista_name: 'Other' },
      { id: 'l2', obra_id: 'o2', created_by: 'someone@x.com', laboratorista_name: 'Lab Nome' },
      { id: 'l3', obra_id: 'o3', created_by: 'someone@x.com', laboratorista_name: 'Other' },
    ];
    const out = filtrarPorAcesso(labEnsaios, user, 'user', obras, regionais);
    expect(out.map((e) => e.id)).toEqual(['l1', 'l2']);
  });

  it('laboratorista sem nome configurado casa apenas por email', () => {
    const user = { email: 'lab@x.com' };
    const out = filtrarPorAcesso(ensaios, user, 'user', obras, regionais);
    expect(out.map((e) => e.id)).toEqual(['e3']);
  });
});

describe('sortByEnsaioDate — ordenação', () => {
  const mk = (id, date, updated) => ({
    id,
    entityType: 'EnsaioCAUQ', // dateField = data_ensaio
    data_ensaio: date,
    updated_date: updated,
  });

  it('ordena por data do ensaio descendente; datas inválidas vão para o fim', () => {
    const records = [
      mk('old', '2026-03-01', '2026-03-01T00:00:00Z'),
      mk('new', '2026-05-01', '2026-05-01T00:00:00Z'),
      { id: 'nodate', entityType: 'EnsaioCAUQ', data_ensaio: 'invalid-date', updated_date: '2026-06-01T00:00:00Z' },
    ];
    const out = sortByEnsaioDate(records);
    expect(out.map((e) => e.id)).toEqual(['new', 'old', 'nodate']);
  });

  it('desempata por updated_date descendente quando as datas são iguais', () => {
    const records = [
      mk('a', '2026-03-01', '2026-03-01T10:00:00Z'),
      mk('b', '2026-03-01', '2026-03-01T12:00:00Z'),
    ];
    const out = sortByEnsaioDate(records);
    expect(out.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('usa o dateField da configuração do entityType (data_realizacao para VigaBenkelman)', () => {
    const records = [
      { id: 'v', entityType: 'EnsaioVigaBenkelman', data_realizacao: '2026-07-01', updated_date: '2026-07-01T00:00:00Z' },
      mk('c', '2026-05-01', '2026-05-01T00:00:00Z'),
    ];
    const out = sortByEnsaioDate(records);
    expect(out.map((e) => e.id)).toEqual(['v', 'c']);
  });

  it('não muta o array original', () => {
    const records = [mk('a', '2026-01-01', 'x'), mk('b', '2026-02-01', 'y')];
    const snapshot = records.map((r) => r.id);
    sortByEnsaioDate(records);
    expect(records.map((r) => r.id)).toEqual(snapshot);
  });
});