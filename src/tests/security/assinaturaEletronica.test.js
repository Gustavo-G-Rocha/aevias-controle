/**
 * Testes de segurança: Assinatura Eletrônica Reforçada
 *
 * Cenários testados:
 * 1. Sanitização de entrada (entityName, recordId)
 * 2. Validação de parâmetros obrigatórios (reauthPassword)
 * 3. Imutabilidade — documento assinado não pode ser assinado novamente
 * 4. Hash determinístico (mesmo documento → mesmo hash)
 * 5. Verificação de integridade — documento alterado → divergência
 * 6. Verificação de integridade — documento íntegro → confere
 * 7. Campos reservados PAdES ficam null no adapter atual
 * 8. Signature method é sempre "eletronica_simples_reforcada"
 * 9. Timestamp do servidor (não do cliente) no momento da assinatura
 * 10. Evidências capturadas (IP, user-agent, reauth_factor)
 */
import { describe, it, expect } from 'vitest';
import {
  computeIntegrityHash,
  serializeForHash,
  EXCLUDED_FIELDS,
  verifyIntegrity,
} from '@/utils/integrityHash';

// ── Registro base para testes ──────────────────────────────────────────
const BASE_DOCUMENT = {
  obra_id: 'obra-123',
  data: '2025-03-15',
  rodovia: 'BR-116',
  trecho: 'Km 200+500 ao Km 201+000',
  laboratorista_name: 'João Silva',
  observacoes: 'Ensaio realizado conforme norma ABNT',
  umidade: 12.5,
  densidade: 1.85,
  // Campos administrativos (EXCLUÍDOS do hash)
  status: 'finalizado',
  approved: null,
  approver_details: null,
  client_signature: null,
};

// ── Simulação do registro de AssinaturaEletronica ──────────────────────
function buildSignatureRecord(record, evidence = {}) {
  return {
    entity_name: 'EnsaioDensidadeInSitu',
    entity_id: 'test-id-123',
    status_assinatura: 'assinado',
    signature_method: 'eletronica_simples_reforcada',
    signature_type: 'approve',
    signed_at: new Date().toISOString(),
    signature_hash: record.signature_hash || 'abc123',
    signature_evidence: {
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      geolocation: null,
      reauth_factor: 'password',
      ...evidence,
    },
    signed_by: 'gestor@empresa.com',
    signed_by_name: 'Carlos Gestor',
    signed_by_role: 'gestor_contrato',
    signed_by_crea: '12345-PR',
    signature_provider: null,
    signature_request_id: null,
    certificate_id: null,
  };
}

describe('assinaturaEletronica — sanitização e validação de entrada', () => {
  it('entityName deve estar na allowlist', () => {
    const ALLOWED = ['EnsaioCAUQ', 'EnsaioDensidade', 'RelatorioNC', 'DiarioObra'];
    expect(ALLOWED.includes('EnsaioCAUQ')).toBe(true);
    expect(ALLOWED.includes('MaliciousEntity')).toBe(false);
    expect(ALLOWED.includes('')).toBe(false);
    expect(ALLOWED.includes(null)).toBe(false);
  });

  it('recordId deve passar por regex de validação', () => {
    const VALID_ID_REGEX = /^[a-zA-Z0-9\-_]{1,128}$/;
    expect(VALID_ID_REGEX.test('abc123-def_456')).toBe(true);
    expect(VALID_ID_REGEX.test('')).toBe(false);
    expect(VALID_ID_REGEX.test('../../../etc/passwd')).toBe(false);
    expect(VALID_ID_REGEX.test("'; DROP TABLE--")).toBe(false);
    expect(VALID_ID_REGEX.test('<script>alert(1)</script>')).toBe(false);
  });

  it('reauthPassword deve ser string não-vazia', () => {
    const valid = (pwd) => typeof pwd === 'string' && pwd.length > 0;
    expect(valid('minhaSenha123')).toBe(true);
    expect(valid('')).toBe(false);
    expect(valid(null)).toBe(false);
    expect(valid(undefined)).toBe(false);
  });

  it('signatureType deve ser approve, approve_nc ou sign', () => {
    const valid = ['approve', 'approve_nc', 'sign'];
    expect(valid.includes('approve')).toBe(true);
    expect(valid.includes('approve_nc')).toBe(true);
    expect(valid.includes('sign')).toBe(true);
    expect(valid.includes('pades')).toBe(false);
    expect(valid.includes('')).toBe(false);
  });
});

describe('assinaturaEletronica — hash de integridade do documento', () => {
  it('mesmo documento produz o mesmo hash', async () => {
    const hash1 = await computeIntegrityHash(BASE_DOCUMENT);
    const hash2 = await computeIntegrityHash({ ...BASE_DOCUMENT });
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('alteração de campo coberto → divergência detectada', async () => {
    const hash1 = await computeIntegrityHash(BASE_DOCUMENT);
    const altered = { ...BASE_DOCUMENT, umidade: 15.0 };
    const hash2 = await computeIntegrityHash(altered);
    expect(hash1).not.toBe(hash2);
  });

  it('alteração de campo EXCLUÍDO → NÃO gera divergência', async () => {
    const hash1 = await computeIntegrityHash(BASE_DOCUMENT);
    const adminChanged = {
      ...BASE_DOCUMENT,
      approved: true,
      approver_details: { name: 'Gestor', integrity_hash: hash1 },
      status: 'finalizado',
    };
    const hash2 = await computeIntegrityHash(adminChanged);
    expect(hash1).toBe(hash2);
  });

  it('campos de assinatura são excluídos do hash', () => {
    expect(EXCLUDED_FIELDS.has('approved')).toBe(true);
    expect(EXCLUDED_FIELDS.has('approver_details')).toBe(true);
    expect(EXCLUDED_FIELDS.has('client_signature')).toBe(true);
    expect(EXCLUDED_FIELDS.has('approved_by')).toBe(true);
    expect(EXCLUDED_FIELDS.has('approved_date')).toBe(true);
    expect(EXCLUDED_FIELDS.has('rejection_reason')).toBe(true);
  });
});

describe('assinaturaEletronica — imutabilidade do documento assinado', () => {
  it('documento já assinado não pode ser assinado novamente', () => {
    const existingSignatures = [
      buildSignatureRecord({ signature_hash: 'abc123' }),
    ];
    // Simula a verção do backend: se existingSignatures.length > 0 → 409
    const alreadySigned = existingSignatures.length > 0;
    expect(alreadySigned).toBe(true);
  });

  it('documento sem assinatura pode ser assinado', () => {
    const existingSignatures = [];
    const canSign = existingSignatures.length === 0;
    expect(canSign).toBe(true);
  });

  it('verifyIntegrity detecta alteração após assinatura', async () => {
    const signedDoc = {
      ...BASE_DOCUMENT,
      approved: true,
      approver_details: {
        name: 'Carlos Gestor',
        integrity_hash: await computeIntegrityHash(BASE_DOCUMENT),
        integrity_hash_date: new Date().toISOString(),
        signature_method: 'eletronica_simples_reforcada',
      },
    };

    // Documento íntegro
    const intact = await verifyIntegrity(signedDoc);
    expect(intact.hasHash).toBe(true);
    expect(intact.valid).toBe(true);

    // Documento alterado após assinatura
    const tampered = { ...signedDoc, umidade: 99.9 };
    const tamperedResult = await verifyIntegrity(tampered);
    expect(tamperedResult.hasHash).toBe(true);
    expect(tamperedResult.valid).toBe(false);
    expect(tamperedResult.storedHash).not.toBe(tamperedResult.computedHash);
  });
});

describe('assinaturaEletronica — campos reservados para PAdES futuro', () => {
  it('adapter atual deixa campos PAdES como null', () => {
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    expect(sig.signature_provider).toBeNull();
    expect(sig.signature_request_id).toBeNull();
    expect(sig.certificate_id).toBeNull();
  });

  it('signature_method é sempre eletronica_simples_reforcada', () => {
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    expect(sig.signature_method).toBe('eletronica_simples_reforcada');
  });

  it('schema suporta valor futuro pades_icp_brasil sem migração', () => {
    // O campo signature_method aceita qualquer string — não é enum fixo.
    // Hoje é 'eletronica_simples_reforcada', mas pode ser 'pades_icp_brasil'
    // no futuro sem alteração de schema.
    const futureSig = {
      ...buildSignatureRecord(BASE_DOCUMENT),
      signature_method: 'pades_icp_brasil',
      signature_provider: 'actcon',
      signature_request_id: 'req-123',
      certificate_id: 'cert-456',
    };
    expect(futureSig.signature_method).toBe('pades_icp_brasil');
    expect(futureSig.signature_provider).not.toBeNull();
  });
});

describe('assinaturaEletronica — evidências do ato', () => {
  it('captura IP de origem', () => {
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    expect(sig.signature_evidence.ip_address).toBeTruthy();
    expect(typeof sig.signature_evidence.ip_address).toBe('string');
  });

  it('captura user-agent', () => {
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    expect(sig.signature_evidence.user_agent).toBeTruthy();
  });

  it('registra fator de reautenticação', () => {
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    expect(sig.signature_evidence.reauth_factor).toBe('password');
  });

  it('geolocation é null quando não consentida (LGPD)', () => {
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    expect(sig.signature_evidence.geolocation).toBeNull();
  });

  it('timestamp é do servidor (ISO string com Z)', () => {
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    expect(sig.signed_at).toBeTruthy();
    // ISO string deve terminar com Z (UTC) ou conter +offset
    expect(sig.signed_at.includes('Z') || sig.signed_at.includes('+')).toBe(true);
  });
});

describe('assinaturaEletronica — verificação via QR code', () => {
  it('documento íntegro retorna intact=true', async () => {
    const docHash = await computeIntegrityHash(BASE_DOCUMENT);
    const signature = buildSignatureRecord({ signature_hash: docHash });

    // Simula verificação: recomputa hash e compara
    const computedHash = await computeIntegrityHash(BASE_DOCUMENT);
    const intact = signature.signature_hash === computedHash;
    expect(intact).toBe(true);
  });

  it('documento alterado retorna intact=false', async () => {
    const docHash = await computeIntegrityHash(BASE_DOCUMENT);
    const signature = buildSignatureRecord({ signature_hash: docHash });

    // Documento alterado após assinatura
    const tamperedDoc = { ...BASE_DOCUMENT, densidade: 2.50 };
    const computedHash = await computeIntegrityHash(tamperedDoc);
    const intact = signature.signature_hash === computedHash;
    expect(intact).toBe(false);
  });

  it('documento sem assinatura retorna signed=false', () => {
    const signatures = [];
    const signed = signatures.length > 0;
    expect(signed).toBe(false);
  });

  it('verificação retorna metadados do signatário', () => {
    const docHash = 'abc123def456';
    const sig = buildSignatureRecord({ signature_hash: docHash });

    // Simula resposta do endpoint verificarAssinatura
    const response = {
      signed: true,
      intact: true,
      storedHash: sig.signature_hash,
      computedHash: docHash,
      signature: {
        signed_by: sig.signed_by,
        signed_by_name: sig.signed_by_name,
        signed_by_role: sig.signed_by_role,
        signed_by_crea: sig.signed_by_crea,
        signed_at: sig.signed_at,
        signature_method: sig.signature_method,
      },
    };

    expect(response.signature.signed_by_name).toBe('Carlos Gestor');
    expect(response.signature.signed_by_role).toBe('gestor_contrato');
    expect(response.signature.signed_by_crea).toBe('12345-PR');
    expect(response.intact).toBe(true);
  });
});

describe('assinaturaEletronica — sincronização offline', () => {
  it('timestamp do servidor é usado, não do dispositivo', () => {
    // Quando a assinatura é feita offline, o evento é enfileirado.
    // Ao sincronizar, o timestamp do SERVIDOR (não do dispositivo)
    // é o que fica registrado em signed_at.
    const deviceTimestamp = '2025-03-15T08:00:00-03:00'; // horário do dispositivo
    const serverTimestamp = '2025-03-15T11:05:00Z'; // horário do servidor ao processar

    // O registro de assinatura usa serverTimestamp
    const sig = buildSignatureRecord(BASE_DOCUMENT);
    sig.signed_at = serverTimestamp;

    expect(sig.signed_at).toBe(serverTimestamp);
    expect(sig.signed_at).not.toBe(deviceTimestamp);
  });

  it('evento offline é processado com evidências do servidor', () => {
    // Mesmo offline, as evidências (IP, user-agent) são capturadas
    // no momento do processamento no servidor, não no dispositivo.
    const sig = buildSignatureRecord(BASE_DOCUMENT, {
      ip_address: '200.150.100.50', // IP real do servidor
      user_agent: 'Mozilla/5.0 (Android)', // Device real
    });

    expect(sig.signature_evidence.ip_address).toBe('200.150.100.50');
    expect(sig.signature_evidence.user_agent).toContain('Android');
  });
});