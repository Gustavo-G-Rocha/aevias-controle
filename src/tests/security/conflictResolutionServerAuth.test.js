/**
 * Segurança — Resolução de conflitos: campos server-authoritative (conflictResolution.js)
 *
 * Garante que campos controlados pelo servidor (aprovação, assinatura,
 * integridade) NUNCA sejam sobrescritos por um update forçado do cliente.
 * Mesmo no cenário "force-overwrite" (usuário escolhe "usar minha versão"
 * em conflito offline), estes campos são preservados.
 *
 * Foco:
 *   - SERVER_AUTHORITATIVE_FIELDS: lista imutável de campos protegidos
 *   - detectConflict: replay attack (cliente com timestamp antigo)
 *   - detectBaseConflict: edição concorrente detectada via base_updated_date
 *   - compareFields: não expõe campos server-authoritative no diff
 */
import { describe, it, expect } from 'vitest';
import {
  SERVER_AUTHORITATIVE_FIELDS,
  SENSITIVE_FIELDS,
  isSensitiveField,
  detectConflict,
  detectBaseConflict,
  compareFields,
} from '../../utils/conflictResolution.js';

describe('SERVER_AUTHORITATIVE_FIELDS — campos protegidos do servidor', () => {
  const expected = [
    'approved',
    'approved_by',
    'approved_date',
    'approver_details',
    'rejection_reason',
    'was_rejected',
    'client_signature',
    'manager_signature',
    'integrity_hash',
    'integrity_hash_date',
    'pendente_aprovacao_cliente',
    'cliente_aprovacao',
    'cliente_aprovacao_data',
    'cliente_aprovacao_responsavel',
    'cliente_reprovacao_motivo',
  ];

  it('contém todos os campos críticos de aprovação/assinatura/integridade', () => {
    for (const f of expected) {
      expect(SERVER_AUTHORITATIVE_FIELDS).toContain(f);
    }
  });

  it('é uma lista (não um objeto mutável indesejado)', () => {
    expect(Array.isArray(SERVER_AUTHORITATIVE_FIELDS)).toBe(true);
  });

  it('não inclui campos de dados de ensaio (esses são do cliente)', () => {
    expect(SERVER_AUTHORITATIVE_FIELDS).not.toContain('rodovia');
    expect(SERVER_AUTHORITATIVE_FIELDS).not.toContain('trecho');
    expect(SERVER_AUTHORITATIVE_FIELDS).not.toContain('observacoes');
  });
});

describe('isSensitiveField — campos sensíveis a conflito', () => {
  it('marca campo listado como sensível', () => {
    expect(isSensitiveField('EnsaioProctor', 'umidades')).toBe(true);
    expect(isSensitiveField('EnsaioCAUQ', 'corpos_prova_marshall')).toBe(true);
  });
  it('marca sub-campo (dot notation) como sensível', () => {
    expect(isSensitiveField('EnsaioProctor', 'umidades.0')).toBe(true);
  });
  it('campo não-listado não é sensível', () => {
    expect(isSensitiveField('EnsaioProctor', 'rodovia')).toBe(false);
  });
  it('entidade sem entradas em SENSITIVE_FIELDS → nada é sensível', () => {
    expect(isSensitiveField('EntidadeDesconhecida', 'qualquer')).toBe(false);
  });
  it('SENSITIVE_FIELDS cobre todas as entidades com dados críticos', () => {
    const expectedEntities = [
      'EnsaioCAUQ', 'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
      'EnsaioProctor', 'EnsaioVigaBenkelman', 'EnsaioManchaPendulo',
      'EnsaioGranulometriaIndividual', 'EnsaioTaxaMRAF', 'EnsaioTaxaPinturaImprimacao',
      'AcompanhamentoCarga', 'AcompanhamentoUsinagem', 'BoletimSondagem',
      'BoletimSondagemTrado', 'ChecklistTerraplanagem', 'ChecklistConcretagem',
      'ChecklistReciclagem', 'DiarioObra',
    ];
    for (const e of expectedEntities) {
      expect(SENSITIVE_FIELDS[e]).toBeDefined();
    }
  });
});

describe('detectConflict — replay / stale client', () => {
  it('sem timestamps → sem conflito', () => {
    expect(detectConflict(null, '2025-01-01').conflict).toBe(false);
    expect(detectConflict('2025-01-01', null).conflict).toBe(false);
  });

  it('cliente salvou ANTES do servidor atualizar → conflito (stale)', () => {
    const r = detectConflict('2025-01-01T10:00:00Z', '2025-01-01T11:00:00Z');
    expect(r.conflict).toBe(true);
    expect(r.reason).toBeDefined();
  });

  it('cliente salvou DEPOIS do servidor → sem conflito (cliente viu a versão nova)', () => {
    expect(detectConflict('2025-01-01T12:00:00Z', '2025-01-01T11:00:00Z').conflict).toBe(false);
  });

  it('timestamps iguais → sem conflito', () => {
    expect(detectConflict('2025-01-01T10:00:00Z', '2025-01-01T10:00:00Z').conflict).toBe(false);
  });

  it('timestamps inválidos → sem conflito (não crasha)', () => {
    expect(detectConflict('invalid', '2025-01-01').conflict).toBe(false);
    expect(detectConflict('2025-01-01', 'not-a-date').conflict).toBe(false);
  });
});

describe('detectBaseConflict — edição concorrente', () => {
  it('base === server → sem conflito (ninguém editou entre o load e o save)', () => {
    expect(detectBaseConflict('2025-01-01T10:00:00Z', '2025-01-01T10:00:00Z').conflict).toBe(false);
  });
  it('base !== server → conflito (registro mudou enquanto editava)', () => {
    const r = detectBaseConflict('2025-01-01T10:00:00Z', '2025-01-01T11:00:00Z');
    expect(r.conflict).toBe(true);
    expect(r.reason).toBeDefined();
  });
  it('sem base → sem conflito (registro novo)', () => {
    expect(detectBaseConflict(null, '2025-01-01').conflict).toBe(false);
  });
  it('sem server → sem conflito', () => {
    expect(detectBaseConflict('2025-01-01', null).conflict).toBe(false);
  });
  it('timestamps inválidos → sem conflito (não crasha)', () => {
    expect(detectBaseConflict('bad', '2025-01-01').conflict).toBe(false);
  });
});

describe('compareFields — protege campos server-authoritative', () => {
  it('NÃO inclui campos server-authoritative no diff', () => {
    const local = { rodovia: 'BR-116', approved: true, approved_by: 'admin' };
    const server = { rodovia: 'BR-116', approved: false, approved_by: 'other' };
    const diff = compareFields('EnsaioProctor', local, server);
    const fields = diff.map((d) => d.field);
    expect(fields).not.toContain('approved');
    expect(fields).not.toContain('approved_by');
    expect(fields).not.toContain('approved_date');
    expect(fields).not.toContain('integrity_hash');
    expect(fields).not.toContain('client_signature');
  });

  it('NÃO inclui campos built-in (id, created_date, etc.)', () => {
    const local = { id: '1', created_date: 'a', rodovia: 'BR-116' };
    const server = { id: '2', created_date: 'b', rodovia: 'BR-101' };
    const diff = compareFields('EnsaioProctor', local, server);
    const fields = diff.map((d) => d.field);
    expect(fields).not.toContain('id');
    expect(fields).not.toContain('created_date');
    expect(fields).toContain('rodovia');
  });

  it('marca campos sensíveis com flag sensitive=true', () => {
    const local = { umidades: [{ x: 1 }] };
    const server = { umidades: [{ x: 2 }] };
    const diff = compareFields('EnsaioProctor', local, server);
    expect(diff).toHaveLength(1);
    expect(diff[0].field).toBe('umidades');
    expect(diff[0].sensitive).toBe(true);
  });

  it('campo não-sensível tem sensitive=false', () => {
    const local = { observacoes: 'a' };
    const server = { observacoes: 'b' };
    const diff = compareFields('EnsaioProctor', local, server);
    expect(diff[0].sensitive).toBe(false);
  });

  it('retorna vazio para input null', () => {
    expect(compareFields('EnsaioProctor', null, { a: 1 })).toEqual([]);
    expect(compareFields('EnsaioProctor', { a: 1 }, null)).toEqual([]);
  });

  it('retorna vazio quando nada mudou', () => {
    const data = { rodovia: 'BR-116', observacoes: 'x' };
    expect(compareFields('EnsaioProctor', data, { ...data })).toEqual([]);
  });

  it('fornece localValue e serverValue para revisão manual', () => {
    const local = { rodovia: 'BR-116' };
    const server = { rodovia: 'BR-101' };
    const diff = compareFields('EnsaioProctor', local, server);
    expect(diff[0].localValue).toBe('BR-116');
    expect(diff[0].serverValue).toBe('BR-101');
  });
});

describe('compareFields — simula ataque de force-overwrite', () => {
  it('cliente mal-intencionado tenta forçar approved=true; compareFields ignora', () => {
    // Cliente edita offline e define approved=true (tentando auto-aprovar)
    const local = {
      rodovia: 'BR-116',
      approved: true,         // tentativa de auto-aprovação
      approved_by: 'hacker@evil.com',
      approver_details: { name: 'Hacker' },
      integrity_hash: 'fake-hash',
    };
    // Servidor tem approved=null (pendente)
    const server = {
      rodovia: 'BR-116',
      approved: null,
      approved_by: null,
      approver_details: null,
      integrity_hash: null,
    };
    const diff = compareFields('EnsaioProctor', local, server);
    const fields = diff.map((d) => d.field);
    // Nenhum campo server-authoritative aparece — não pode ser sobrescrito
    expect(fields).not.toContain('approved');
    expect(fields).not.toContain('approved_by');
    expect(fields).not.toContain('approver_details');
    expect(fields).not.toContain('integrity_hash');
    // rodovia é igual → também não aparece
    expect(fields).toEqual([]);
  });
});