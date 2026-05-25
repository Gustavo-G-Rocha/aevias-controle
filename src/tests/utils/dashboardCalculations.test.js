import { describe, it, expect } from 'vitest';
import {
  calcularStats,
  calcularGraficoStatus,
  calcularGraficoPorObra,
  calcularGraficoPorTipo,
  calcularApprovalPercentage,
} from '@/utils/dashboardCalculations';

// ─── helpers ─────────────────────────────────────────────────────────────────

const mkEnsaio = (overrides = {}) => ({
  obra_id: 'obra-1',
  approved: null,
  entityType: 'EnsaioCAUQ',
  created_date: new Date().toISOString(),
  client_signature: null,
  ...overrides,
});

// ─── calcularStats ─────────────────────────────────────────────────────────────

describe('calcularStats', () => {
  it('conta aprovados, pendentes e reprovados corretamente', () => {
    const ensaios = [
      mkEnsaio({ approved: true }),
      mkEnsaio({ approved: null }),
      mkEnsaio({ approved: null }),
      mkEnsaio({ approved: false }),
    ];
    const stats = calcularStats(ensaios, [{ id: 'o1' }], [{ id: 'p1' }], false, false);
    expect(stats.approved).toBe(1);
    expect(stats.pending).toBe(2);
    expect(stats.rejected).toBe(1);
    expect(stats.obras).toBe(1);
    expect(stats.projects).toBe(1);
  });

  it('para cliente, pending e rejected são sempre 0', () => {
    const ensaios = [
      mkEnsaio({ approved: null }),
      mkEnsaio({ approved: false }),
    ];
    const stats = calcularStats(ensaios, [], [], true, false);
    expect(stats.pending).toBe(0);
    expect(stats.rejected).toBe(0);
  });

  it('conta assinados corretamente', () => {
    const ensaios = [
      mkEnsaio({ client_signature: { signed_by: 'x@x.com' } }),
      mkEnsaio({ client_signature: null }),
    ];
    const stats = calcularStats(ensaios, [], [], false, false);
    expect(stats.assinados).toBe(1);
  });

  it('conta aguardando_assinatura para engenheiro cliente', () => {
    const ensaios = [
      mkEnsaio({ approved: true, client_signature: null }),
      mkEnsaio({ approved: true, client_signature: { signed_by: 'x@x.com' } }),
    ];
    const stats = calcularStats(ensaios, [], [], true, true);
    expect(stats.aguardando_assinatura).toBe(1);
  });
});

// ─── calcularGraficoStatus ────────────────────────────────────────────────────

describe('calcularGraficoStatus', () => {
  it('retorna items corretos para não-cliente', () => {
    const ensaios = [
      mkEnsaio({ approved: true }),
      mkEnsaio({ approved: null }),
      mkEnsaio({ approved: false }),
    ];
    const result = calcularGraficoStatus(ensaios, false, false);
    const names = result.map(r => r.name);
    expect(names).toContain('Aprovados');
    expect(names).toContain('Pendentes');
    expect(names).toContain('Reprovados');
  });

  it('filtra items com value === 0', () => {
    const ensaios = [mkEnsaio({ approved: true })];
    const result = calcularGraficoStatus(ensaios, false, false);
    expect(result.every(r => r.value > 0)).toBe(true);
  });

  it('para cliente retorna Assinados e Aguardando', () => {
    const ensaios = [
      mkEnsaio({ approved: true, client_signature: { signed_by: 'x@x.com' } }),
    ];
    const result = calcularGraficoStatus(ensaios, true, true);
    const names = result.map(r => r.name);
    expect(names).toContain('Assinados');
  });
});

// ─── calcularGraficoPorObra ───────────────────────────────────────────────────

describe('calcularGraficoPorObra', () => {
  it('agrupa ensaios por obra corretamente', () => {
    const ensaios = [
      mkEnsaio({ obra_id: 'o1' }),
      mkEnsaio({ obra_id: 'o1' }),
      mkEnsaio({ obra_id: 'o2' }),
    ];
    const obras = [{ id: 'o1', name: 'Obra A' }, { id: 'o2', name: 'Obra B' }];
    const result = calcularGraficoPorObra(ensaios, obras);
    expect(result[0].name).toBe('Obra A');
    expect(result[0].value).toBe(2);
    expect(result[1].value).toBe(1);
  });

  it('usa "Desconhecida" para obra não encontrada', () => {
    const ensaios = [mkEnsaio({ obra_id: 'inexistente' })];
    const result = calcularGraficoPorObra(ensaios, []);
    expect(result[0].name).toBe('Desconhecida');
  });

  it('limita resultado a 10 obras', () => {
    const ensaios = Array.from({ length: 15 }, (_, i) => mkEnsaio({ obra_id: `o${i}` }));
    const obras = Array.from({ length: 15 }, (_, i) => ({ id: `o${i}`, name: `Obra ${i}` }));
    const result = calcularGraficoPorObra(ensaios, obras);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('ignora ensaios sem obra_id', () => {
    const ensaios = [mkEnsaio({ obra_id: null })];
    const result = calcularGraficoPorObra(ensaios, []);
    expect(result.length).toBe(0);
  });
});

// ─── calcularGraficoPorTipo ───────────────────────────────────────────────────

describe('calcularGraficoPorTipo', () => {
  it('agrupa ensaios por tipo', () => {
    const ensaios = [
      mkEnsaio({ entityType: 'EnsaioCAUQ' }),
      mkEnsaio({ entityType: 'EnsaioCAUQ' }),
      mkEnsaio({ entityType: 'DiarioObra' }),
    ];
    const result = calcularGraficoPorTipo(ensaios);
    const cauq = result.find(r => r.entityType === 'EnsaioCAUQ');
    expect(cauq.value).toBe(2);
  });

  it('ignora ensaios sem entityType', () => {
    const ensaios = [mkEnsaio({ entityType: null })];
    const result = calcularGraficoPorTipo(ensaios);
    expect(result.length).toBe(0);
  });

  it('retorna itens em ordem decrescente de quantidade', () => {
    const ensaios = [
      mkEnsaio({ entityType: 'DiarioObra' }),
      mkEnsaio({ entityType: 'EnsaioCAUQ' }),
      mkEnsaio({ entityType: 'EnsaioCAUQ' }),
    ];
    const result = calcularGraficoPorTipo(ensaios);
    expect(result[0].value).toBeGreaterThanOrEqual(result[1].value);
  });
});

// ─── calcularApprovalPercentage ───────────────────────────────────────────────

describe('calcularApprovalPercentage', () => {
  it('calcula percentual de aprovação para não-cliente', () => {
    const stats = { ensaios: 10, approved: 8, assinados: 0, aguardando_assinatura: 0 };
    expect(calcularApprovalPercentage(stats, false)).toBe('80');
  });

  it('retorna "0" quando ensaios é 0 para não-cliente', () => {
    const stats = { ensaios: 0, approved: 0, assinados: 0, aguardando_assinatura: 0 };
    expect(calcularApprovalPercentage(stats, false)).toBe('0');
  });

  it('calcula percentual de assinados para cliente', () => {
    const stats = { ensaios: 10, approved: 10, assinados: 5, aguardando_assinatura: 5 };
    expect(calcularApprovalPercentage(stats, true)).toBe('50');
  });

  it('retorna "100" quando total de assinados + aguardando é 0 para cliente', () => {
    const stats = { ensaios: 0, approved: 0, assinados: 0, aguardando_assinatura: 0 };
    expect(calcularApprovalPercentage(stats, true)).toBe('100');
  });
});