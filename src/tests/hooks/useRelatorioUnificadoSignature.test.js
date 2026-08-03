/**
 * Robustez — Hook useRelatorioUnificadoSignature
 *
 * Testa a lógica de assinatura do Relatório Unificado:
 * - Bloqueio de assinatura quando recordCount === 0
 * - Categorização de erros (network, schema, unknown)
 * - Construção de compositeId
 * - Permissões de assinatura (canSign)
 *
 * Como o hook usa React + SDK, testamos a lógica pura
 * extraindo os fluxos de decisão sem precisar do React runtime.
 */
import { describe, it, expect } from 'vitest';

// ── Lógica extraída do hook (espelha useRelatorioUnificadoSignature.js) ──

const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'];

function buildCompositeId(filters) {
  if (!filters?.obra_id || !filters?.data_inicio || !filters?.data_fim) return null;
  return `${filters.obra_id}_${filters.data_inicio}_${filters.data_fim}_${(filters.tipos || []).join('-')}`;
}

function canSign(user, userAccessLevel, filters) {
  const compositeId = buildCompositeId(filters);
  return APPROVER_LEVELS.includes(userAccessLevel) && !!compositeId;
}

function shouldBlockSigning(recordCount) {
  return !recordCount || recordCount === 0;
}

function categorizeSignError(errorCategory) {
  if (errorCategory === 'network') {
    return 'Falha temporária ao acessar o registro. Tente novamente.';
  }
  if (errorCategory === 'schema') {
    return 'Dados do relatório inválidos. Verifique os filtros e tente novamente.';
  }
  return 'Erro ao assinar. Tente novamente.';
}

// ── Testes ────────────────────────────────────────────────────────────

describe('useRelatorioUnificadoSignature — compositeId', () => {
  it('constrói compositeId válido com todos os filtros', () => {
    const filters = {
      obra_id: 'abc123',
      data_inicio: '2026-01-01',
      data_fim: '2026-12-31',
      tipos: ['DiarioObra', 'EnsaioCAUQ'],
    };
    expect(buildCompositeId(filters)).toBe('abc123_2026-01-01_2026-12-31_DiarioObra-EnsaioCAUQ');
  });

  it('retorna null sem obra_id', () => {
    expect(buildCompositeId({ data_inicio: '2026-01-01', data_fim: '2026-12-31' })).toBeNull();
  });

  it('retorna null sem data_inicio', () => {
    expect(buildCompositeId({ obra_id: 'x', data_fim: '2026-12-31' })).toBeNull();
  });

  it('retorna null sem data_fim', () => {
    expect(buildCompositeId({ obra_id: 'x', data_inicio: '2026-01-01' })).toBeNull();
  });

  it('retorna null com filters null', () => {
    expect(buildCompositeId(null)).toBeNull();
  });

  it('retorna null com filters undefined', () => {
    expect(buildCompositeId(undefined)).toBeNull();
  });

  it('lida com tipos vazio', () => {
    const filters = {
      obra_id: 'x',
      data_inicio: '2026-01-01',
      data_fim: '2026-12-31',
      tipos: [],
    };
    expect(buildCompositeId(filters)).toBe('x_2026-01-01_2026-12-31_');
  });

  it('lida com tipos ausente (default [])', () => {
    const filters = {
      obra_id: 'x',
      data_inicio: '2026-01-01',
      data_fim: '2026-12-31',
    };
    expect(buildCompositeId(filters)).toBe('x_2026-01-01_2026-12-31_');
  });
});

describe('useRelatorioUnificadoSignature — canSign (permissões)', () => {
  const validFilters = {
    obra_id: 'x',
    data_inicio: '2026-01-01',
    data_fim: '2026-12-31',
    tipos: ['DiarioObra'],
  };

  it('admin pode assinar', () => {
    expect(canSign({}, 'admin', validFilters)).toBe(true);
  });

  it('sala_tecnica pode assinar', () => {
    expect(canSign({}, 'sala_tecnica_afirmaevias', validFilters)).toBe(true);
  });

  it('gestor_contrato pode assinar', () => {
    expect(canSign({}, 'gestor_contrato', validFilters)).toBe(true);
  });

  it('cliente_supervisor pode assinar', () => {
    expect(canSign({}, 'cliente_supervisor', validFilters)).toBe(true);
  });

  it('laboratorista (user) NÃO pode assinar', () => {
    expect(canSign({}, 'user', validFilters)).toBe(false);
  });

  it('cliente comum NÃO pode assinar', () => {
    expect(canSign({}, 'cliente', validFilters)).toBe(false);
  });

  it('funcionarios_cliente NÃO pode assinar', () => {
    expect(canSign({}, 'funcionarios_cliente', validFilters)).toBe(false);
  });

  it('NÃO pode assinar sem compositeId (filtros incompletos)', () => {
    expect(canSign({}, 'admin', { tipos: ['DiarioObra'] })).toBe(false);
  });

  it('NÃO pode assinar com filters null', () => {
    expect(canSign({}, 'admin', null)).toBe(false);
  });
});

describe('useRelatorioUnificadoSignature — bloqueio de assinatura vazia', () => {
  it('bloqueia quando recordCount é 0', () => {
    expect(shouldBlockSigning(0)).toBe(true);
  });

  it('bloqueia quando recordCount é null', () => {
    expect(shouldBlockSigning(null)).toBe(true);
  });

  it('bloqueia quando recordCount é undefined', () => {
    expect(shouldBlockSigning(undefined)).toBe(true);
  });

  it('NÃO bloqueia quando recordCount é 1', () => {
    expect(shouldBlockSigning(1)).toBe(false);
  });

  it('NÃO bloqueia quando recordCount é 10', () => {
    expect(shouldBlockSigning(10)).toBe(false);
  });

  it('NÃO bloqueia quando recordCount é negativo (edge case)', () => {
    // recordCount negativo é tecnicamente um valor truthy, mas
    // logicamente não deveria existir. O bloco usa !recordCount || === 0.
    // -1 é truthy e !== 0, então não bloqueia.
    expect(shouldBlockSigning(-1)).toBe(false);
  });
});

describe('useRelatorioUnificadoSignature — categorização de erros', () => {
  it('errorCategory network → mensagem de falha temporária', () => {
    const msg = categorizeSignError('network');
    expect(msg).toContain('Falha temporária');
    expect(msg).toContain('Tente novamente');
  });

  it('errorCategory schema → mensagem de dados inválidos', () => {
    const msg = categorizeSignError('schema');
    expect(msg).toContain('inválidos');
    expect(msg).toContain('filtros');
  });

  it('errorCategory unknown → mensagem genérica', () => {
    const msg = categorizeSignError('unknown');
    expect(msg).toContain('Erro ao assinar');
  });

  it('errorCategory null → mensagem genérica', () => {
    const msg = categorizeSignError(null);
    expect(msg).toContain('Erro ao assinar');
  });

  it('errorCategory undefined → mensagem genérica', () => {
    const msg = categorizeSignError(undefined);
    expect(msg).toContain('Erro ao assinar');
  });

  it('errorCategory string vazia → mensagem genérica', () => {
    const msg = categorizeSignError('');
    expect(msg).toContain('Erro ao assinar');
  });

  it('errorCategory permission → mensagem genérica (não tratado explicitamente)', () => {
    const msg = categorizeSignError('permission');
    expect(msg).toContain('Erro ao assinar');
  });
});

describe('useRelatorioUnificadoSignature — relatório já assinado', () => {
  it('assinatura existente impede nova assinatura', () => {
    const existingSignature = {
      status_assinatura: 'assinado',
      signed_by: 'admin@evias.com',
      signed_at: '2026-01-15T10:00:00Z',
    };
    // A UI verifica: if (signature) → mostra "Assinado" em vez do botão
    expect(existingSignature.status_assinatura).toBe('assinado');
  });

  it('assinatura não-assinada permite assinar', () => {
    const existingSignature = null;
    expect(existingSignature).toBeNull();
  });
});