/**
 * Segurança — Hash de Integridade: detecção de tampering (integrityHash.js)
 *
 * O hash SHA-256 detecta alterações pós-assinatura em registros assinados.
 * Mesmo que um atacante bypassse o RLS e alterasse um campo, a divergência
 * de hash seria detectada ao exibir/exportar o registro.
 *
 * Foco: tampering detection, EXCLUDED_FIELDS (campos que mudam
 * legitimamente não invalidam o hash), determinismo e localizações
 * de armazenamento (approver_details vs client_signature).
 */
import { describe, it, expect } from 'vitest';
import {
  computeIntegrityHash,
  verifyIntegrity,
  getStoredHash,
  hasIntegrityHash,
  serializeForHash,
  EXCLUDED_FIELDS,
} from '../../utils/integrityHash.js';

const SIGNED_RECORD = {
  id: 'rec1',
  obra_id: 'o1',
  rodovia: 'BR-116',
  trecho: 'Trecho A',
  observacoes: 'texto original',
  status: 'finalizado',
  approved: true,
  approved_by: 'admin@evias.com',
  approved_date: '2025-01-01T10:00:00Z',
  approver_details: { name: 'Admin', integrity_hash: 'PLACEHOLDER' },
  client_signature: null,
};

describe('computeIntegrityHash — determinismo', () => {
  it('mesmo registro → mesmo hash', async () => {
    const h1 = await computeIntegrityHash(SIGNED_RECORD);
    const h2 = await computeIntegrityHash(SIGNED_RECORD);
    expect(h1).toBe(h2);
  });

  it('hash é string hex de 64 chars (SHA-256)', async () => {
    const h = await computeIntegrityHash(SIGNED_RECORD);
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  it('ordem das chaves não afeta o hash (serialização ordenada)', async () => {
    const a = { rodovia: 'BR-116', trecho: 'A', obra_id: 'o1' };
    const b = { obra_id: 'o1', trecho: 'A', rodovia: 'BR-116' };
    const h1 = await computeIntegrityHash(a);
    const h2 = await computeIntegrityHash(b);
    expect(h1).toBe(h2);
  });

  it('registros diferentes → hashes diferentes', async () => {
    const h1 = await computeIntegrityHash({ ...SIGNED_RECORD, observacoes: 'A' });
    const h2 = await computeIntegrityHash({ ...SIGNED_RECORD, observacoes: 'B' });
    expect(h1).not.toBe(h2);
  });
});

describe('computeIntegrityHash — EXCLUDED_FIELDS não afetam o hash', () => {
  it('mudar status não muda o hash', async () => {
    const base = { ...SIGNED_RECORD, approver_details: {} };
    const h1 = await computeIntegrityHash({ ...base, status: 'rascunho' });
    const h2 = await computeIntegrityHash({ ...base, status: 'finalizado' });
    expect(h1).toBe(h2);
  });

  it('mudar approved/approved_by/approved_date não muda o hash', async () => {
    const base = { ...SIGNED_RECORD, approver_details: {} };
    const h1 = await computeIntegrityHash({ ...base, approved: false, approved_by: 'x' });
    const h2 = await computeIntegrityHash({ ...base, approved: true, approved_by: 'y' });
    expect(h1).toBe(h2);
  });

  it('mudar client_signature não muda o hash', async () => {
    const base = { ...SIGNED_RECORD, approver_details: {} };
    const h1 = await computeIntegrityHash({ ...base, client_signature: null });
    const h2 = await computeIntegrityHash({ ...base, client_signature: { signed_by: 'a' } });
    expect(h1).toBe(h2);
  });

  it('mudar id/created_date/updated_date não muda o hash', async () => {
    const base = { ...SIGNED_RECORD, approver_details: {} };
    const h1 = await computeIntegrityHash({ ...base, id: 'rec1', created_date: '2025-01-01' });
    const h2 = await computeIntegrityHash({ ...base, id: 'rec2', created_date: '2025-06-01' });
    expect(h1).toBe(h2);
  });

  it('integrity_hash/ integrity_hash_date não se auto-referenciam', async () => {
    const base = { ...SIGNED_RECORD, approver_details: {} };
    const h1 = await computeIntegrityHash({ ...base, integrity_hash: 'aaa' });
    const h2 = await computeIntegrityHash({ ...base, integrity_hash: 'bbb' });
    expect(h1).toBe(h2);
    expect(EXCLUDED_FIELDS.has('integrity_hash')).toBe(true);
  });
});

describe('computeIntegrityHash — TAMPER DETECTION (campos assinados)', () => {
  it('alterar rodovia (campo assinado) muda o hash', async () => {
    const h1 = await computeIntegrityHash(SIGNED_RECORD);
    const h2 = await computeIntegrityHash({ ...SIGNED_RECORD, rodovia: 'BR-999' });
    expect(h1).not.toBe(h2);
  });

  it('alterar observacoes muda o hash', async () => {
    const h1 = await computeIntegrityHash(SIGNED_RECORD);
    const h2 = await computeIntegrityHash({ ...SIGNED_RECORD, observacoes: 'texto adulterado' });
    expect(h1).not.toBe(h2);
  });

  it('adicionar campo novo muda o hash', async () => {
    const h1 = await computeIntegrityHash(SIGNED_RECORD);
    const h2 = await computeIntegrityHash({ ...SIGNED_RECORD, novo_campo: 'inject' });
    expect(h1).not.toBe(h2);
  });

  it('remover campo assinado muda o hash', async () => {
    const { rodovia, ...semRodovia } = SIGNED_RECORD;
    const h1 = await computeIntegrityHash(SIGNED_RECORD);
    const h2 = await computeIntegrityHash(semRodovia);
    expect(h1).not.toBe(h2);
  });

  it('alterar objeto aninhado (array de fotos) muda o hash', async () => {
    const rec = { ...SIGNED_RECORD, fotos: ['url1', 'url2'] };
    const h1 = await computeIntegrityHash(rec);
    const h2 = await computeIntegrityHash({ ...rec, fotos: ['url1', 'url2', 'url3'] });
    expect(h1).not.toBe(h2);
  });
});

describe('verifyIntegrity — fluxo de verificação', () => {
  it('registro sem hash → hasHash=false, valid=true (nada a verificar)', async () => {
    const rec = { ...SIGNED_RECORD, approver_details: {}, client_signature: null };
    const result = await verifyIntegrity(rec);
    expect(result.hasHash).toBe(false);
    expect(result.valid).toBe(true);
  });

  it('registro íntegro → hasHash=true, valid=true', async () => {
    const clean = { ...SIGNED_RECORD, approver_details: {}, client_signature: null };
    const hash = await computeIntegrityHash(clean);
    const signed = { ...clean, approver_details: { integrity_hash: hash } };
    const result = await verifyIntegrity(signed);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.storedHash).toBe(hash);
    expect(result.computedHash).toBe(hash);
  });

  it('registro adulterado → valid=false (detecta tampering)', async () => {
    const clean = { ...SIGNED_RECORD, approver_details: {}, client_signature: null };
    const hash = await computeIntegrityHash(clean);
    // Assina com hash do estado original...
    const signed = { ...clean, approver_details: { integrity_hash: hash } };
    // ...depois adultera um campo assinado
    const tampered = { ...signed, rodovia: 'BR-TAMPERED' };
    const result = await verifyIntegrity(tampered);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.storedHash).toBe(hash);
    expect(result.computedHash).not.toBe(hash);
  });

  it('hash armazenado em client_signature (assinatura cliente)', async () => {
    const clean = { ...SIGNED_RECORD, approver_details: {}, client_signature: null };
    const hash = await computeIntegrityHash(clean);
    const signed = { ...clean, client_signature: { integrity_hash: hash, signed_by: 'eng@cliente.com' } };
    const result = await verifyIntegrity(signed);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(true);
  });
});

describe('getStoredHash / hasIntegrityHash — localizações de hash', () => {
  it('getStoredHash prefere approver_details.integrity_hash', () => {
    const rec = {
      approver_details: { integrity_hash: 'HASH_APPROVER' },
      client_signature: { integrity_hash: 'HASH_CLIENTE' },
    };
    expect(getStoredHash(rec)).toBe('HASH_APPROVER');
  });

  it('getStoredHash usa client_signature se approver_details não tem hash', () => {
    const rec = {
      approver_details: { name: 'Admin' },
      client_signature: { integrity_hash: 'HASH_CLIENTE' },
    };
    expect(getStoredHash(rec)).toBe('HASH_CLIENTE');
  });

  it('getStoredHash retorna null se nenhum hash', () => {
    expect(getStoredHash({ approver_details: {}, client_signature: null })).toBeNull();
    expect(getStoredHash(null)).toBeNull();
  });

  it('hasIntegrityHash true quando há hash em qualquer localização', () => {
    expect(hasIntegrityHash({ approver_details: { integrity_hash: 'x' } })).toBe(true);
    expect(hasIntegrityHash({ client_signature: { integrity_hash: 'x' } })).toBe(true);
    expect(hasIntegrityHash({ approver_details: {}, client_signature: null })).toBe(false);
  });
});

describe('serializeForHash — serialização determinística', () => {
  it('null → "null"', () => {
    expect(serializeForHash(null)).toBe('null');
    expect(serializeForHash(undefined)).toBe('null');
  });

  it('array serializa com [ ] e elementos', () => {
    expect(serializeForHash([1, 2])).toBe('[1,2]');
  });

  it('objeto serializa com chaves ordenadas e excluídas removidas', () => {
    const result = serializeForHash({ b: 2, a: 1, id: 'x', status: 's' });
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('null vs null aninhado são distintos de string "null"', () => {
    expect(serializeForHash({ x: null })).toBe('{"x":null}');
    expect(serializeForHash({ x: 'null' })).toBe('{"x":"null"}');
  });
});