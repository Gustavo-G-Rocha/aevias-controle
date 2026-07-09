/**
 * tests/utils/auditTrail.test.js
 *
 * Testa o sistema de Audit Trail (versionamento de registros).
 *
 * Cenários obrigatórios (do prompt especializado):
 *  - Alterar um registro várias vezes e verificar que o histórico
 *    reflete corretamente cada mudança de campo, na ordem certa,
 *    sem perder eventos.
 *
 * Riscos mitigados:
 *  - Volume de dados de auditoria crescendo descontroladamente → diff
 *    só é gravado quando há mudanças reais (changes.length > 0).
 *  - Impacto de performance → diff via JSON.stringify é O(n) em campos.
 */

import { describe, it, expect } from 'vitest';
import {
  computeAuditDiff,
  reconstructHistory,
  getChangedFields,
  getFieldHistory,
} from '@/utils/auditTrail';

describe('auditTrail — computeAuditDiff', () => {
  it('detecta mudança de campo simples', () => {
    const oldData = { obra_id: '1', observacoes: 'texto antigo' };
    const newData = { obra_id: '1', observacoes: 'texto novo' };
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(1);
    expect(diff[0].field).toBe('observacoes');
    expect(diff[0].old_value).toBe('texto antigo');
    expect(diff[0].new_value).toBe('texto novo');
  });

  it('detecta múltiplas mudanças simultâneas', () => {
    const oldData = { rodovia: 'BR-116', trecho: 'A', status: 'rascunho' };
    const newData = { rodovia: 'BR-101', trecho: 'A', status: 'finalizado' };
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(2);
    const fields = diff.map((d) => d.field).sort();
    expect(fields).toEqual(['rodovia', 'status']);
  });

  it('retorna array vazio quando nada mudou', () => {
    const data = { obra_id: '1', rodovia: 'BR-116' };
    expect(computeAuditDiff(data, { ...data })).toHaveLength(0);
  });

  it('ignora campos do sistema (id, created_date, updated_date, etc.)', () => {
    const oldData = { id: '1', created_date: '2024-01-01', updated_date: '2024-01-01', observacoes: 'old' };
    const newData = { id: '1', created_date: '2024-01-01', updated_date: '2024-01-02', observacoes: 'new' };
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(1);
    expect(diff[0].field).toBe('observacoes');
  });

  it('trata null→null como sem mudança', () => {
    const oldData = { campo: null };
    const newData = { campo: null };
    expect(computeAuditDiff(oldData, newData)).toHaveLength(0);
  });

  it('detecta mudança de objeto aninhado', () => {
    const oldData = { jornada: { horario_inicio: '08:00', horario_fim: '17:00' } };
    const newData = { jornada: { horario_inicio: '08:00', horario_fim: '18:00' } };
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(1);
    expect(diff[0].field).toBe('jornada');
  });

  it('detecta mudança em array', () => {
    const oldData = { fotos: ['url1', 'url2'] };
    const newData = { fotos: ['url1', 'url2', 'url3'] };
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(1);
    expect(diff[0].field).toBe('fotos');
  });

  it('detecta adição de novo campo', () => {
    const oldData = { obra_id: '1' };
    const newData = { obra_id: '1', observacoes: 'novo campo' };
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(1);
    expect(diff[0].field).toBe('observacoes');
    expect(diff[0].old_value).toBeUndefined();
    expect(diff[0].new_value).toBe('novo campo');
  });

  it('detecta remoção de campo (valor → undefined)', () => {
    const oldData = { obra_id: '1', observacoes: 'texto' };
    const newData = { obra_id: '1' };
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(1);
    expect(diff[0].field).toBe('observacoes');
    expect(diff[0].old_value).toBe('texto');
    expect(diff[0].new_value).toBeUndefined();
  });

  it('retorna vazio quando oldData é null', () => {
    expect(computeAuditDiff(null, { obra_id: '1' })).toHaveLength(0);
  });

  it('retorna vazio quando newData é null', () => {
    expect(computeAuditDiff({ obra_id: '1' }, null)).toHaveLength(0);
  });
});

describe('auditTrail — reconstructHistory', () => {
  it('ordena entradas cronologicamente (mais antiga primeiro)', () => {
    const entries = [
      { id: '3', created_date: '2024-03-01T10:00:00Z', operation: 'update', changes: [] },
      { id: '1', created_date: '2024-01-01T10:00:00Z', operation: 'create', changes: [] },
      { id: '2', created_date: '2024-02-01T10:00:00Z', operation: 'update', changes: [] },
    ];
    const ordered = reconstructHistory(entries);
    expect(ordered.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('usa client_timestamp como fallback quando created_date ausente', () => {
    const entries = [
      { id: '2', created_date: null, client_timestamp: '2024-02-01T10:00:00Z', changes: [] },
      { id: '1', created_date: '2024-01-01T10:00:00Z', client_timestamp: null, changes: [] },
    ];
    const ordered = reconstructHistory(entries);
    expect(ordered[0].id).toBe('1');
    expect(ordered[1].id).toBe('2');
  });

  it('retorna array vazio para input inválido', () => {
    expect(reconstructHistory(null)).toEqual([]);
    expect(reconstructHistory(undefined)).toEqual([]);
    expect(reconstructHistory('not an array')).toEqual([]);
  });
});

describe('auditTrail — getChangedFields', () => {
  it('extrai conjunto de todos os campos alterados', () => {
    const entries = [
      { changes: [{ field: 'observacoes' }, { field: 'status' }] },
      { changes: [{ field: 'rodovia' }] },
      { changes: [] },
    ];
    const fields = getChangedFields(entries);
    expect(fields.size).toBe(3);
    expect(fields.has('observacoes')).toBe(true);
    expect(fields.has('status')).toBe(true);
    expect(fields.has('rodovia')).toBe(true);
  });

  it('retorna conjunto vazio quando não há mudanças', () => {
    expect(getChangedFields([]).size).toBe(0);
    expect(getChangedFields(null).size).toBe(0);
  });
});

describe('auditTrail — getFieldHistory (rastreio de campo específico)', () => {
  it('rastreia valor de um campo ao longo do tempo', () => {
    const entries = [
      {
        created_date: '2024-01-01T10:00:00Z',
        operation: 'create',
        changed_by: 'user@test.com',
        changes: [{ field: 'status', old_value: null, new_value: 'rascunho' }],
      },
      {
        created_date: '2024-02-01T10:00:00Z',
        operation: 'update',
        changed_by: 'user@test.com',
        changes: [{ field: 'status', old_value: 'rascunho', new_value: 'finalizado' }],
      },
      {
        created_date: '2024-03-01T10:00:00Z',
        operation: 'approve',
        changed_by: 'admin@test.com',
        changes: [{ field: 'status', old_value: 'finalizado', new_value: 'finalizado' }],
      },
    ];

    const history = getFieldHistory(entries, 'status');
    expect(history).toHaveLength(3);
    expect(history[0].value).toBe('rascunho');
    expect(history[1].value).toBe('finalizado');
    expect(history[2].changed_by).toBe('admin@test.com');
  });

  it('ignora entradas que não alteraram o campo', () => {
    const entries = [
      {
        created_date: '2024-01-01T10:00:00Z',
        operation: 'create',
        changed_by: 'a@test.com',
        changes: [{ field: 'status', old_value: null, new_value: 'rascunho' }],
      },
      {
        created_date: '2024-02-01T10:00:00Z',
        operation: 'update',
        changed_by: 'a@test.com',
        changes: [{ field: 'observacoes', old_value: 'old', new_value: 'new' }],
      },
    ];

    const history = getFieldHistory(entries, 'status');
    expect(history).toHaveLength(1);
    expect(history[0].value).toBe('rascunho');
  });
});

// ── Cenário de Integração: múltiplas edições sequenciais ─────────────────────
describe('auditTrail — Cenário: múltiplas edições sem perder eventos', () => {
  it('5 edições sequenciais produzem 5 entradas de auditoria com diffs corretos', () => {
    // Estado inicial (create)
    let currentState = {
      obra_id: 'obra-1',
      rodovia: 'BR-116',
      trecho: 'Trecho A',
      observacoes: 'Observação inicial',
      status: 'rascunho',
    };

    const auditEntries = [];

    // Entry 1: create
    auditEntries.push({
      created_date: '2024-01-01T08:00:00Z',
      operation: 'create',
      changed_by: 'lab@test.com',
      changes: Object.keys(currentState)
        .filter((k) => !['id', 'created_date', 'updated_date'].includes(k))
        .map((k) => ({ field: k, old_value: null, new_value: currentState[k] })),
    });

    // Edit 1: mudar observacoes
    const edit1 = { ...currentState, observacoes: 'Edit 1' };
    auditEntries.push({
      created_date: '2024-01-02T08:00:00Z',
      operation: 'update',
      changed_by: 'lab@test.com',
      changes: computeAuditDiff(currentState, edit1),
    });
    currentState = edit1;

    // Edit 2: mudar rodovia e status
    const edit2 = { ...currentState, rodovia: 'BR-101', status: 'finalizado' };
    auditEntries.push({
      created_date: '2024-01-03T08:00:00Z',
      operation: 'update',
      changed_by: 'lab@test.com',
      changes: computeAuditDiff(currentState, edit2),
    });
    currentState = edit2;

    // Edit 3: aprovação (muda approved, approved_by)
    const edit3 = { ...currentState, approved: true, approved_by: 'admin@test.com' };
    auditEntries.push({
      created_date: '2024-01-04T08:00:00Z',
      operation: 'approve',
      changed_by: 'admin@test.com',
      changes: computeAuditDiff(currentState, edit3),
    });
    currentState = edit3;

    // Edit 4: adicionar fotos
    const edit4 = { ...currentState, fotos: ['url1', 'url2'] };
    auditEntries.push({
      created_date: '2024-01-05T08:00:00Z',
      operation: 'update',
      changed_by: 'lab@test.com',
      changes: computeAuditDiff(currentState, edit4),
    });
    currentState = edit4;

    // ── Validações ──

    // 5 entradas (1 create + 3 updates + 1 approve)
    expect(auditEntries).toHaveLength(5);

    // Ordem cronológica correta
    const ordered = reconstructHistory(auditEntries);
    expect(ordered[0].operation).toBe('create');
    expect(ordered[1].operation).toBe('update');
    expect(ordered[2].operation).toBe('update');
    expect(ordered[3].operation).toBe('approve');
    expect(ordered[4].operation).toBe('update');

    // Cada entrada tem pelo menos 1 mudança (nenhum evento vazio)
    expect(ordered.every((e) => e.changes.length > 0)).toBe(true);

    // Edit 1 só mudou observacoes
    expect(ordered[1].changes).toHaveLength(1);
    expect(ordered[1].changes[0].field).toBe('observacoes');
    expect(ordered[1].changes[0].old_value).toBe('Observação inicial');
    expect(ordered[1].changes[0].new_value).toBe('Edit 1');

    // Edit 2 mudou rodovia E status
    expect(ordered[2].changes).toHaveLength(2);
    const edit2Fields = ordered[2].changes.map((c) => c.field).sort();
    expect(edit2Fields).toEqual(['rodovia', 'status']);

    // Edit 3 (approve) mudou approved E approved_by
    expect(ordered[3].changes).toHaveLength(2);
    const edit3Fields = ordered[3].changes.map((c) => c.field).sort();
    expect(edit3Fields).toEqual(['approved', 'approved_by']);

    // Edit 4 adicionou fotos
    expect(ordered[4].changes).toHaveLength(1);
    expect(ordered[4].changes[0].field).toBe('fotos');

    // Todos os campos alterados ao longo do histórico
    // create registra 5 campos iniciais + edits adicionam approved, approved_by, fotos = 8
    const allFields = getChangedFields(auditEntries);
    expect(allFields.size).toBe(8);
    expect(allFields.has('observacoes')).toBe(true);
    expect(allFields.has('rodovia')).toBe(true);
    expect(allFields.has('fotos')).toBe(true);
    expect(allFields.has('approved')).toBe(true);
    expect(allFields.has('approved_by')).toBe(true);

    // Rastreio do campo observacoes: valor inicial → Edit 1
    const obsHistory = getFieldHistory(auditEntries, 'observacoes');
    expect(obsHistory).toHaveLength(2);
    expect(obsHistory[0].value).toBe('Observação inicial');
    expect(obsHistory[1].value).toBe('Edit 1');
  });

  it('edição que não muda nenhum campo não produz entrada de auditoria', () => {
    const oldData = { obra_id: '1', rodovia: 'BR-116' };
    const newData = { ...oldData }; // clone idêntico
    const diff = computeAuditDiff(oldData, newData);
    expect(diff).toHaveLength(0);
    // No backend: `if (diff.length > 0)` — entrada não é criada
  });
});