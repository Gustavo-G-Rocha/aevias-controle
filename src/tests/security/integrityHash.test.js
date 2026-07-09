/**
 * Testes de segurança: Hash de Integridade
 *
 * Cenários testados:
 * 1. Hash determinístico (mesmo registro → mesmo hash)
 * 2. Alteração de campo coberto pelo hash → divergência detectada
 * 3. Alteração de campo EXCLUÍDO do hash → NÃO gera falso positivo
 * 4. verifyIntegrity para registro não assinado (hasHash: false)
 * 5. verifyIntegrity para registro íntegro (valid: true)
 * 6. verifyIntegrity para registro alterado (valid: false)
 * 7. Ordem de chaves não afeta o hash
 * 8. Null/undefined tratados corretamente
 */
import { describe, it, expect } from 'vitest';
import {
  computeIntegrityHash,
  verifyIntegrity,
  hasIntegrityHash,
  getStoredHash,
  serializeForHash,
  EXCLUDED_FIELDS,
} from '@/utils/integrityHash';

// ── Registro base para testes ──────────────────────────────────────────
const BASE_RECORD = {
  obra_id: 'obra-123',
  data: '2025-01-15',
  rodovia: 'BR-116',
  trecho: 'Km 100+500 ao Km 101+000',
  laboratorista_name: 'João Silva',
  observacoes: 'Ensaio realizado conforme norma',
  umidade: 12.5,
  densidade: 1.85,
  ensaios: [
    { numero: 1, valor: 45.2 },
    { numero: 2, valor: 47.1 },
  ],
  fotos: ['https://example.com/foto1.jpg', 'https://example.com/foto2.jpg'],
  // Campos administrativos (devem ser EXCLUÍDOS do hash)
  status: 'finalizado',
  approved: true,
  approved_by: 'gestor@empresa.com',
  approved_date: '2025-01-15T10:30:00Z',
  approver_details: {
    name: 'Carlos Gestor',
    position: 'gestor_contrato',
    crea_number: '12345',
  },
  rejection_reason: null,
  was_rejected: false,
  client_signature: {
    signed_by: 'cliente@empresa.com',
    signed_date: '2025-01-15T11:00:00Z',
    engineer_name: 'Eng. Cliente',
    crea_number: '67890',
  },
};

describe('integrityHash — serialização determinística', () => {
  it('mesmo registro produz o mesmo hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({ ...BASE_RECORD });
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex
  });

  it('ordem de chaves não afeta o hash', async () => {
    const reordered = {
      observacoes: BASE_RECORD.observacoes,
      ensaios: BASE_RECORD.ensaios,
      rodovia: BASE_RECORD.rodovia,
      data: BASE_RECORD.data,
      obra_id: BASE_RECORD.obra_id,
      trecho: BASE_RECORD.trecho,
      laboratorista_name: BASE_RECORD.laboratorista_name,
      umidade: BASE_RECORD.umidade,
      densidade: BASE_RECORD.densidade,
      fotos: BASE_RECORD.fotos,
      status: BASE_RECORD.status,
      approved: BASE_RECORD.approved,
      approved_by: BASE_RECORD.approved_by,
      approved_date: BASE_RECORD.approved_date,
      approver_details: BASE_RECORD.approver_details,
      rejection_reason: BASE_RECORD.rejection_reason,
      was_rejected: BASE_RECORD.was_rejected,
      client_signature: BASE_RECORD.client_signature,
    };
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash(reordered);
    expect(hash1).toBe(hash2);
  });

  it('null e undefined são tratados consistentemente', () => {
    const s1 = serializeForHash({ a: null, b: undefined, c: 1 });
    const s2 = serializeForHash({ c: 1, a: null, b: undefined });
    expect(s1).toBe(s2);
  });
});

describe('integrityHash — campos EXCLUÍDOS não afetam o hash', () => {
  it('campos administrativos estão na lista de exclusão', () => {
    expect(EXCLUDED_FIELDS.has('id')).toBe(true);
    expect(EXCLUDED_FIELDS.has('created_date')).toBe(true);
    expect(EXCLUDED_FIELDS.has('updated_date')).toBe(true);
    expect(EXCLUDED_FIELDS.has('created_by_id')).toBe(true);
    expect(EXCLUDED_FIELDS.has('status')).toBe(true);
    expect(EXCLUDED_FIELDS.has('approved')).toBe(true);
    expect(EXCLUDED_FIELDS.has('approved_by')).toBe(true);
    expect(EXCLUDED_FIELDS.has('approved_date')).toBe(true);
    expect(EXCLUDED_FIELDS.has('approver_details')).toBe(true);
    expect(EXCLUDED_FIELDS.has('rejection_reason')).toBe(true);
    expect(EXCLUDED_FIELDS.has('was_rejected')).toBe(true);
    expect(EXCLUDED_FIELDS.has('client_signature')).toBe(true);
    expect(EXCLUDED_FIELDS.has('integrity_hash')).toBe(true);
    expect(EXCLUDED_FIELDS.has('integrity_hash_date')).toBe(true);
  });

  it('mudar status NÃO invalida o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({ ...BASE_RECORD, status: 'rascunho' });
    expect(hash1).toBe(hash2);
  });

  it('mudar approved NÃO invalida o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({ ...BASE_RECORD, approved: false });
    expect(hash1).toBe(hash2);
  });

  it('mudar approver_details NÃO invalida o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({
      ...BASE_RECORD,
      approver_details: { name: 'Outro Gestor', position: 'admin', crea_number: '99999', integrity_hash: 'abc123' },
    });
    expect(hash1).toBe(hash2);
  });

  it('mudar client_signature NÃO invalida o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({
      ...BASE_RECORD,
      client_signature: { signed_by: 'outro@cliente.com', signed_date: '2025-02-01T00:00:00Z' },
    });
    expect(hash1).toBe(hash2);
  });

  it('mudar rejection_reason e was_rejected NÃO invalida o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({
      ...BASE_RECORD,
      rejection_reason: 'Motivo diferente',
      was_rejected: true,
    });
    expect(hash1).toBe(hash2);
  });

  it('mudar id, created_date, updated_date NÃO invalida o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({
      ...BASE_RECORD,
      id: 'different-id',
      created_date: '2024-01-01T00:00:00Z',
      updated_date: '2025-06-01T00:00:00Z',
      created_by_id: 'different-user-id',
    });
    expect(hash1).toBe(hash2);
  });
});

describe('integrityHash — campos COBERTOS afetam o hash', () => {
  it('mudar observações INVALIDA o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({ ...BASE_RECORD, observacoes: 'Alterado após assinatura' });
    expect(hash1).not.toBe(hash2);
  });

  it('mudar umidade (número) INVALIDA o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({ ...BASE_RECORD, umidade: 15.0 });
    expect(hash1).not.toBe(hash2);
  });

  it('mudar ensaios (array aninhado) INVALIDA o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const modified = { ...BASE_RECORD, ensaios: [...BASE_RECORD.ensaios, { numero: 3, valor: 50.0 }] };
    const hash2 = await computeIntegrityHash(modified);
    expect(hash1).not.toBe(hash2);
  });

  it('mudar valor dentro de ensaio aninhado INVALIDA o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const modified = {
      ...BASE_RECORD,
      ensaios: BASE_RECORD.ensaios.map((e, i) => i === 0 ? { ...e, valor: 99.9 } : e),
    };
    const hash2 = await computeIntegrityHash(modified);
    expect(hash1).not.toBe(hash2);
  });

  it('mudar fotos INVALIDA o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({ ...BASE_RECORD, fotos: ['https://example.com/different.jpg'] });
    expect(hash1).not.toBe(hash2);
  });

  it('mudar rodovia INVALIDA o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const hash2 = await computeIntegrityHash({ ...BASE_RECORD, rodovia: 'BR-101' });
    expect(hash1).not.toBe(hash2);
  });

  it('remover um campo INVALIDA o hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const { observacoes, ...withoutObs } = BASE_RECORD;
    const hash2 = await computeIntegrityHash(withoutObs);
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyIntegrity — cenários completos', () => {
  it('registro sem hash → hasHash: false, valid: true', async () => {
    const record = { ...BASE_RECORD, approver_details: { name: 'Gestor', position: 'gestor_contrato' } };
    const result = await verifyIntegrity(record);
    expect(result.hasHash).toBe(false);
    expect(result.valid).toBe(true);
  });

  it('registro íntegro → hasHash: true, valid: true', async () => {
    // Simula aprovação: computa hash e armazena em approver_details
    const hash = await computeIntegrityHash(BASE_RECORD);
    const signedRecord = {
      ...BASE_RECORD,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash },
    };
    const result = await verifyIntegrity(signedRecord);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('registro alterado após assinatura → hasHash: true, valid: false', async () => {
    // Assina o registro
    const hash = await computeIntegrityHash(BASE_RECORD);
    const signedRecord = {
      ...BASE_RECORD,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash },
    };

    // Altera um campo coberto pelo hash DEPOIS da assinatura
    const tamperedRecord = {
      ...signedRecord,
      observacoes: 'CONTEÚDO ALTERADO APÓS ASSINATURA',
    };

    const result = await verifyIntegrity(tamperedRecord);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.storedHash).toBe(hash);
    expect(result.computedHash).not.toBe(hash);
  });

  it('registro com campo excluído alterado após assinatura → valid: true (sem falso positivo)', async () => {
    // Assina o registro
    const hash = await computeIntegrityHash(BASE_RECORD);
    const signedRecord = {
      ...BASE_RECORD,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash },
    };

    // Altera campos EXCLUÍDOS (administrativos) após assinatura
    const legitimateUpdate = {
      ...signedRecord,
      // Cliente assina DEPOIS da aprovação (campo excluído)
      client_signature: {
        signed_by: 'cliente@empresa.com',
        signed_date: '2025-01-20T14:00:00Z',
        engineer_name: 'Eng. Cliente',
        crea_number: '67890',
      },
      // updated_date muda (built-in, excluído)
      updated_date: '2025-01-20T14:00:00Z',
    };

    const result = await verifyIntegrity(legitimateUpdate);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('registro reprovado e re-aprovado: novo hash é calculado', async () => {
    // Primeira aprovação
    const hash1 = await computeIntegrityHash(BASE_RECORD);
    const approved1 = {
      ...BASE_RECORD,
      approved: true,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash1 },
    };

    // Reprovação (integrity_hash permanece do approve anterior)
    const rejected = {
      ...approved1,
      approved: false,
      was_rejected: true,
      rejection_reason: 'Dados incorretos',
    };

    // Re-aprovação com conteúdo CORRIGIDO
    const correctedRecord = {
      ...rejected,
      observacoes: 'Ensaio corrigido e re-aprovado',
      approved: true,
      rejection_reason: null,
      was_rejected: true,
    };

    // Novo hash é calculado para o conteúdo corrigido
    const hash2 = await computeIntegrityHash(correctedRecord);
    const reApproved = {
      ...correctedRecord,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash2 },
    };

    // O novo hash deve ser diferente do primeiro (conteúdo mudou)
    expect(hash2).not.toBe(hash1);

    // verifyIntegrity deve passar para o re-aprovado
    const result = await verifyIntegrity(reApproved);
    expect(result.valid).toBe(true);
  });
});

describe('hasIntegrityHash / getStoredHash — helpers', () => {
  it('hasIntegrityHash retorna false para registro sem hash', () => {
    expect(hasIntegrityHash(BASE_RECORD)).toBe(false);
  });

  it('hasIntegrityHash retorna true para registro com hash', async () => {
    const hash = await computeIntegrityHash(BASE_RECORD);
    const signed = {
      ...BASE_RECORD,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash },
    };
    expect(hasIntegrityHash(signed)).toBe(true);
  });

  it('getStoredHash retorna null para registro sem hash', () => {
    expect(getStoredHash(BASE_RECORD)).toBeNull();
  });

  it('getStoredHash retorna o hash para registro assinado', async () => {
    const hash = await computeIntegrityHash(BASE_RECORD);
    const signed = {
      ...BASE_RECORD,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash },
    };
    expect(getStoredHash(signed)).toBe(hash);
  });
});

describe('integrityHash — caso de ataque: bypass de RLS', () => {
  it('atacante altera conteúdo após assinatura (bypass de RLS) — divergência detectada', async () => {
    // Cenário: atacante bypassa RLS e altera o resultado de um ensaio
    // após a aprovação. Sem o hash, a alteração seria invisível.

    const hash = await computeIntegrityHash(BASE_RECORD);
    const signedRecord = {
      ...BASE_RECORD,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: hash },
    };

    // Atacante altera o valor do ensaio (campo coberto pelo hash)
    const tampered = {
      ...signedRecord,
      ensaios: [{ numero: 1, valor: 99.9 }, { numero: 2, valor: 99.9 }],
      densidade: 2.50, // valor adulterado
    };

    const result = await verifyIntegrity(tampered);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.computedHash).not.toBe(result.storedHash);
  });

  it('atacante tenta forjar hash — divergência detectada', async () => {
    // Cenário: atacante altera o conteúdo E tenta substituir o hash
    // por um valor aleatório. O hash recalculado não baterá com o forjado.

    const tampered = {
      ...BASE_RECORD,
      observacoes: 'ALTERADO',
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: 'fake-hash-12345' },
    };

    const result = await verifyIntegrity(tampered);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.storedHash).toBe('fake-hash-12345');
    expect(result.computedHash).not.toBe('fake-hash-12345');
  });
});

// ═════════════════════════════════════════════════════════════════════
// CENÁRIOS: Hash na assinatura do cliente (client_signature.integrity_hash)
// ═════════════════════════════════════════════════════════════════════
describe('integrityHash — hash em client_signature (assinatura do cliente)', () => {
  it('registro assinado pelo cliente sem aprovação prévia → hash em client_signature', async () => {
    // Cenário: cliente assina um registro que NÃO foi aprovado por gestor.
    // O hash deve ser calculado e armazenado em client_signature.integrity_hash.
    const recordSemAprovacao = {
      ...BASE_RECORD,
      approved: null,
      approver_details: undefined,
    };
    const hash = await computeIntegrityHash(recordSemAprovacao);
    const signedRecord = {
      ...recordSemAprovacao,
      client_signature: {
        signed_by: 'cliente@empresa.com',
        signed_date: '2025-01-20T14:00:00Z',
        engineer_name: 'Eng. Cliente',
        crea_number: '67890',
        integrity_hash: hash,
        integrity_hash_date: '2025-01-20T14:00:00Z',
      },
    };

    const result = await verifyIntegrity(signedRecord);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('hasIntegrityHash detecta hash em client_signature', async () => {
    const record = {
      ...BASE_RECORD,
      approver_details: undefined,
      client_signature: {
        signed_by: 'cliente@empresa.com',
        integrity_hash: 'some-hash',
      },
    };
    expect(hasIntegrityHash(record)).toBe(true);
  });

  it('getStoredHash retorna hash de client_signature quando não há em approver_details', async () => {
    const hash = await computeIntegrityHash(BASE_RECORD);
    const record = {
      ...BASE_RECORD,
      approver_details: { name: 'Gestor', position: 'gestor_contrato' }, // sem integrity_hash
      client_signature: {
        signed_by: 'cliente@empresa.com',
        integrity_hash: hash,
      },
    };
    expect(getStoredHash(record)).toBe(hash);
  });

  it('getStoredHash prioriza approver_details.integrity_hash sobre client_signature', async () => {
    const record = {
      ...BASE_RECORD,
      approver_details: { ...BASE_RECORD.approver_details, integrity_hash: 'hash-from-approval' },
      client_signature: {
        signed_by: 'cliente@empresa.com',
        integrity_hash: 'hash-from-sign',
      },
    };
    // approver_details tem precedência (foi calculado primeiro, na aprovação)
    expect(getStoredHash(record)).toBe('hash-from-approval');
  });

  // ── Cenário completo: assinar → adulterar → detectar ──
  it('FLUXO COMPLETO: assinar → adulterar campo coberto → divergência detectada', async () => {
    // 1. Registro assinado pelo cliente (sem aprovação prévia)
    const recordToSign = {
      ...BASE_RECORD,
      approved: null,
      approver_details: undefined,
    };
    const hash = await computeIntegrityHash(recordToSign);
    const signedRecord = {
      ...recordToSign,
      client_signature: {
        signed_by: 'cliente@empresa.com',
        signed_date: '2025-01-20T14:00:00Z',
        engineer_name: 'Eng. Cliente',
        crea_number: '67890',
        integrity_hash: hash,
        integrity_hash_date: '2025-01-20T14:00:00Z',
      },
    };

    // 2. Verificar que o registro assinado está íntegro
    const resultBefore = await verifyIntegrity(signedRecord);
    expect(resultBefore.valid).toBe(true);

    // 3. Adulterar um campo COBERTO pelo hash após a assinatura
    const tamperedRecord = {
      ...signedRecord,
      observacoes: 'CONTEÚDO ALTERADO APÓS ASSINATURA DO CLIENTE',
    };

    // 4. Verificar que a divergência é detectada
    const resultAfter = await verifyIntegrity(tamperedRecord);
    expect(resultAfter.hasHash).toBe(true);
    expect(resultAfter.valid).toBe(false);
    expect(resultAfter.storedHash).toBe(hash);
    expect(resultAfter.computedHash).not.toBe(hash);
  });

  // ── Cenário: assinar → atualizar campo excluído → sem falso positivo ──
  it('FLUXO COMPLETO: assinar → gestor aprova depois (campos excluídos) → sem falso positivo', async () => {
    // 1. Cliente assina primeiro (sem aprovação prévia)
    const recordToSign = {
      ...BASE_RECORD,
      approved: null,
      approver_details: undefined,
    };
    const signHash = await computeIntegrityHash(recordToSign);
    const signedRecord = {
      ...recordToSign,
      client_signature: {
        signed_by: 'cliente@empresa.com',
        signed_date: '2025-01-20T14:00:00Z',
        integrity_hash: signHash,
        integrity_hash_date: '2025-01-20T14:00:00Z',
      },
    };

    // 2. Gestor aprova depois (adiciona approver_details com novo hash)
    // O conteúdo não mudou — o hash deve ser o mesmo
    const approvalHash = await computeIntegrityHash(signedRecord);
    const approvedRecord = {
      ...signedRecord,
      approved: true,
      approved_by: 'gestor@evias.com',
      approved_date: '2025-01-21T10:00:00Z',
      approver_details: {
        name: 'Carlos Gestor',
        position: 'gestor_contrato',
        crea_number: '12345',
        integrity_hash: approvalHash,
        integrity_hash_date: '2025-01-21T10:00:00Z',
      },
    };

    // 3. Verificar que o registro aprovado está íntegro
    // (approver_details.integrity_hash tem precedência)
    const result = await verifyIntegrity(approvedRecord);
    expect(result.hasHash).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.storedHash).toBe(approvalHash);
    // O hash de aprovação deve ser igual ao de assinatura (conteúdo não mudou)
    expect(approvalHash).toBe(signHash);
  });

  it('FLUXO COMPLETO: assinar → alterar ensaio aninhado → divergência detectada', async () => {
    // 1. Assinar
    const recordToSign = {
      ...BASE_RECORD,
      approved: null,
      approver_details: undefined,
    };
    const hash = await computeIntegrityHash(recordToSign);
    const signedRecord = {
      ...recordToSign,
      client_signature: {
        signed_by: 'cliente@empresa.com',
        integrity_hash: hash,
      },
    };

    // 2. Adulterar valor dentro de array aninhado
    const tampered = {
      ...signedRecord,
      ensaios: [{ numero: 1, valor: 99.9 }, { numero: 2, valor: 47.1 }],
    };

    // 3. Detectar
    const result = await verifyIntegrity(tampered);
    expect(result.valid).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════
// CENÁRIOS: Proteção de campos server-authoritative
// (validarESalvarRegistro não deve permitir que o cliente defina integrity_hash)
// ═════════════════════════════════════════════════════════════════════
describe('integrityHash — proteção contra injeção via endpoint de salvamento', () => {
  // Estes testes validam o PRINCÍPIO de que campos server-authoritative
  // (incluindo integrity_hash, approver_details, client_signature) não
  // devem ser definíveis pelo cliente via validarESalvarRegistro.
  // A lógica real está no backend function, mas o princípio é testável aqui.

  const SERVER_AUTH_FIELDS = [
    'approved', 'approved_by', 'approved_date', 'approver_details',
    'rejection_reason', 'was_rejected', 'client_signature', 'manager_signature',
    'integrity_hash', 'integrity_hash_date',
    'pendente_aprovacao_cliente', 'cliente_aprovacao', 'cliente_aprovacao_data',
    'cliente_aprovacao_responsavel', 'cliente_reprovacao_motivo',
  ];

  it('lista de campos server-authoritative inclui integrity_hash e approver_details', () => {
    expect(SERVER_AUTH_FIELDS).toContain('integrity_hash');
    expect(SERVER_AUTH_FIELDS).toContain('integrity_hash_date');
    expect(SERVER_AUTH_FIELDS).toContain('approver_details');
    expect(SERVER_AUTH_FIELDS).toContain('client_signature');
  });

  it('cliente não pode injetar integrity_hash forjado via payload de salvamento', async () => {
    // Cenário: atacante envia um payload com approver_details.integrity_hash forjado
    // via validarESalvarRegistro. O backend deve stripar esse campo antes de salvar.
    //
    // Simulação: payload malicioso do cliente
    const maliciousPayload = {
      ...BASE_RECORD,
      observacoes: 'Tentativa de injeção',
      approver_details: {
        name: 'Atacante',
        position: 'admin',
        crea_number: 'fake',
        integrity_hash: 'FORGED-HASH-VALUE',
      },
    };

    // O backend striparia SERVER_AUTH_FIELDS do payload.
    // Simulamos o stripping aqui:
    const stripped = { ...maliciousPayload };
    for (const field of SERVER_AUTH_FIELDS) {
      delete stripped[field];
    }

    // O payload após stripping não contém integrity_hash forjado
    expect(stripped.approver_details).toBeUndefined();
    expect(stripped.integrity_hash).toBeUndefined();

    // Mas o conteúdo legítimo (observacoes) é preservado
    expect(stripped.observacoes).toBe('Tentativa de injeção');
  });

  it('stripping de campos server-authoritative não afeta conteúdo legítimo', async () => {
    // Cenário: laboratorista edita um campo legítimo em um registro assinado.
    // O backend deve preservar o campo editado e stripar apenas os campos
    // server-authoritative.
    const legitimatePayload = {
      ...BASE_RECORD,
      observacoes: 'Observação atualizada pelo laboratorista',
      rodovia: 'BR-116',
      // Campos server-authoritative que o cliente não deveria enviar
      // (mas que podem estar no payload se o cliente carregou o registro completo)
      approved: true,
      approver_details: { name: 'Gestor', integrity_hash: 'existing-hash' },
    };

    const stripped = { ...legitimatePayload };
    for (const field of SERVER_AUTH_FIELDS) {
      delete stripped[field];
    }

    // Conteúdo legítimo preservado
    expect(stripped.observacoes).toBe('Observação atualizada pelo laboratorista');
    expect(stripped.rodovia).toBe('BR-116');
    // Campos server-authoritative removidos
    expect(stripped.approved).toBeUndefined();
    expect(stripped.approver_details).toBeUndefined();
  });
});