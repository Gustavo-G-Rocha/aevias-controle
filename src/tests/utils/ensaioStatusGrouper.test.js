/**
 * tests/utils/ensaioStatusGrouper.test.js
 *
 * Testes do mapper de categorização de ensaios por status de workflow.
 * Valida: input bruto → output esperado (grupos corretos).
 *
 * Critério de aceite: os componentes de visualização recebem dados já no
 * formato de apresentação; a mesma função de mapper pode ser reaproveitada.
 */

import { describe, it, expect } from 'vitest';
import {
  isEmExecucao,
  isPendente,
  isAprovado,
  groupEnsaiosByStatus,
} from '@/utils/ensaioStatusGrouper';

// ── Factory de ensaios para testes ─────────────────────────────────────────────
const makeEnsaio = (overrides = {}) => ({
  id: 'test-id',
  status: 'finalizado',
  approved: null,
  client_signature: null,
  ...overrides,
});

// ── Predicados ─────────────────────────────────────────────────────────────────

describe('isEmExecucao', () => {
  it('rascunho sem assinatura → true', () => {
    expect(isEmExecucao(makeEnsaio({ status: 'rascunho', approved: null }))).toBe(true);
  });

  it('reprovado sem assinatura → true', () => {
    expect(isEmExecucao(makeEnsaio({ status: 'finalizado', approved: false }))).toBe(true);
  });

  it('rascunho assinado → false', () => {
    expect(
      isEmExecucao(
        makeEnsaio({
          status: 'rascunho',
          client_signature: { signed_by: 'cliente@test.com' },
        })
      )
    ).toBe(false);
  });

  it('finalizado e aprovado → false', () => {
    expect(isEmExecucao(makeEnsaio({ status: 'finalizado', approved: true }))).toBe(false);
  });

  it('finalizado e pendente → false', () => {
    expect(isEmExecucao(makeEnsaio({ status: 'finalizado', approved: null }))).toBe(false);
  });
});

describe('isPendente', () => {
  it('finalizado sem aprovação e sem assinatura → true', () => {
    expect(isPendente(makeEnsaio({ status: 'finalizado', approved: null }))).toBe(true);
  });

  it('rascunho → false (não está finalizado)', () => {
    expect(isPendente(makeEnsaio({ status: 'rascunho', approved: null }))).toBe(false);
  });

  it('aprovado → false', () => {
    expect(isPendente(makeEnsaio({ status: 'finalizado', approved: true }))).toBe(false);
  });

  it('reprovado → false', () => {
    expect(isPendente(makeEnsaio({ status: 'finalizado', approved: false }))).toBe(false);
  });

  it('assinado → false', () => {
    expect(
      isPendente(
        makeEnsaio({
          status: 'finalizado',
          approved: true,
          client_signature: { signed_by: 'cliente@test.com' },
        })
      )
    ).toBe(false);
  });
});

describe('isAprovado', () => {
  it('approved true → true', () => {
    expect(isAprovado(makeEnsaio({ approved: true }))).toBe(true);
  });

  it('assinado → true', () => {
    expect(
      isAprovado(
        makeEnsaio({
          approved: true,
          client_signature: { signed_by: 'cliente@test.com' },
        })
      )
    ).toBe(true);
  });

  it('pendente → false', () => {
    expect(isAprovado(makeEnsaio({ approved: null }))).toBe(false);
  });

  it('reprovado → false', () => {
    expect(isAprovado(makeEnsaio({ approved: false }))).toBe(false);
  });
});

// ── Mapper principal ───────────────────────────────────────────────────────────

describe('groupEnsaiosByStatus', () => {
  it('lista vazia → três grupos vazios', () => {
    const result = groupEnsaiosByStatus([]);
    expect(result.emExecucao).toEqual([]);
    expect(result.pendentes).toEqual([]);
    expect(result.aprovados).toEqual([]);
  });

  it('undefined → três grupos vazios (defensive)', () => {
    const result = groupEnsaiosByStatus(undefined);
    expect(result.emExecucao).toEqual([]);
    expect(result.pendentes).toEqual([]);
    expect(result.aprovados).toEqual([]);
  });

  it('classifica cada ensaio exatamente em um grupo', () => {
    const ensaios = [
      makeEnsaio({ id: 'r1', status: 'rascunho', approved: null }),
      makeEnsaio({ id: 'r2', status: 'finalizado', approved: false }),
      makeEnsaio({ id: 'r3', status: 'finalizado', approved: null }),
      makeEnsaio({ id: 'r4', status: 'finalizado', approved: true }),
      makeEnsaio({ id: 'r5', status: 'finalizado', approved: true, client_signature: { signed_by: 'c@test.com' } }),
    ];

    const result = groupEnsaiosByStatus(ensaios);

    expect(result.emExecucao.map((e) => e.id)).toEqual(['r1', 'r2']);
    expect(result.pendentes.map((e) => e.id)).toEqual(['r3']);
    expect(result.aprovados.map((e) => e.id)).toEqual(['r4', 'r5']);
  });

  it('não perde registros: soma dos grupos == total de entrada', () => {
    const ensaios = [
      makeEnsaio({ id: '1', status: 'rascunho', approved: null }),
      makeEnsaio({ id: '2', status: 'finalizado', approved: null }),
      makeEnsaio({ id: '3', status: 'finalizado', approved: true }),
      makeEnsaio({ id: '4', status: 'finalizado', approved: false }),
      makeEnsaio({ id: '5', status: 'finalizado', approved: true, client_signature: { signed_by: 'c@test.com' } }),
      makeEnsaio({ id: '6', status: 'finalizado', approved: null }),
    ];

    const result = groupEnsaiosByStatus(ensaios);
    const total =
      result.emExecucao.length + result.pendentes.length + result.aprovados.length;
    expect(total).toBe(ensaios.length);
  });

  it('preserva as referências dos objetos originais (sem clonagem)', () => {
    const e1 = makeEnsaio({ id: 'r1', status: 'rascunho' });
    const e2 = makeEnsaio({ id: 'r2', status: 'finalizado', approved: true });

    const result = groupEnsaiosByStatus([e1, e2]);

    expect(result.emExecucao[0]).toBe(e1);
    expect(result.aprovados[0]).toBe(e2);
  });

  it('single-pass: performance O(n) sem iterações duplicadas', () => {
    // Teste estrutural: cada ensaio aparece no máximo uma vez em um único grupo
    const ensaios = Array.from({ length: 100 }, (_, i) =>
      makeEnsaio({
        id: `r${i}`,
        status: i % 4 === 0 ? 'rascunho' : 'finalizado',
        approved: i % 4 === 1 ? null : i % 4 === 2 ? true : false,
      })
    );

    const result = groupEnsaiosByStatus(ensaios);
    const allIds = [
      ...result.emExecucao.map((e) => e.id),
      ...result.pendentes.map((e) => e.id),
      ...result.aprovados.map((e) => e.id),
    ];

    // Nenhum ID duplicado
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  // ── Paridade com comportamento anterior (filtro inline) ─────────────────────
  it('PARIDADE: produz os mesmos grupos que o filtro inline original', () => {
    const ensaios = [
      // emExecucao: rascunho ou reprovado, sem assinatura
      { id: 'exec1', status: 'rascunho', approved: null, client_signature: null },
      { id: 'exec2', status: 'finalizado', approved: false, client_signature: null },
      // pendentes: finalizado, approved null, sem assinatura, approved !== false
      { id: 'pend1', status: 'finalizado', approved: null, client_signature: null },
      // aprovados: approved true ou assinado
      { id: 'apro1', status: 'finalizado', approved: true, client_signature: null },
      { id: 'apro2', status: 'finalizado', approved: true, client_signature: { signed_by: 'c@test.com' } },
    ];

    // Replica exata do filtro inline que existia no LaboratoristaInterface
    const oldEmExecucao = ensaios.filter(
      (e) => (e.status === 'rascunho' || e.approved === false) && !e.client_signature?.signed_by
    );
    const oldPendentes = ensaios.filter((e) => {
      const isFinalizadoOuSemStatus = e.status === 'finalizado' || (!e.status && e.status !== 'rascunho');
      return isFinalizadoOuSemStatus && e.approved === null && !e.client_signature?.signed_by && e.approved !== false;
    });
    const oldAprovados = ensaios.filter(
      (e) => e.approved === true || e.client_signature?.signed_by
    );

    const result = groupEnsaiosByStatus(ensaios);

    expect(result.emExecucao.map((e) => e.id)).toEqual(oldEmExecucao.map((e) => e.id));
    expect(result.pendentes.map((e) => e.id)).toEqual(oldPendentes.map((e) => e.id));
    expect(result.aprovados.map((e) => e.id)).toEqual(oldAprovados.map((e) => e.id));
  });
});