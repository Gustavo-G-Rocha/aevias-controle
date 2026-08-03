/**
 * Segurança — Permissão de edição para entidades restritas
 * (BoletimSondagem, BoletimSondagemTrado, ChecklistUsina, CertificacaoUsina)
 *
 * Regras:
 * - Admin: só edita se a obra vinculada estiver em_andamento
 * - Criador: edita até o registro ser aprovado (approved !== true)
 * - Outros: nunca editam
 */
import { describe, it, expect } from 'vitest';
import {
  canEditRestrictedRecord,
  RESTRICTED_EDIT_ENTITIES,
} from '@/utils/recordEditPermission';

const ADMIN = { id: 'u1', email: 'admin@evias.com', access_level: 'admin' };
const LAB = { id: 'u2', email: 'lab@evias.com', access_level: 'user' };
const GESTOR = { id: 'u3', email: 'gestor@evias.com', access_level: 'gestor_contrato' };
const SALA = { id: 'u4', email: 'sala@evias.com', access_level: 'sala_tecnica_afirmaevias' };
const OUTRO_LAB = { id: 'u5', email: 'outro@evias.com', access_level: 'user' };

const OBRA_ATIVA = { id: 'o1', status: 'em_andamento' };
const OBRA_CONCLUIDA = { id: 'o2', status: 'concluida' };
const OBRA_PAUSADA = { id: 'o3', status: 'pausada' };
const OBRA_PLANEJAMENTO = { id: 'o4', status: 'planejamento' };

const REC_RASCUNHO = { id: 'rec1', created_by: 'lab@evias.com', created_by_id: 'u2', approved: null };
const REC_APROVADO = { id: 'rec2', created_by: 'lab@evias.com', created_by_id: 'u2', approved: true };
const REC_REPROVADO = { id: 'rec3', created_by: 'lab@evias.com', created_by_id: 'u2', approved: false };

describe('RESTRICTED_EDIT_ENTITIES', () => {
  it('inclui BoletimSondagem', () => {
    expect(RESTRICTED_EDIT_ENTITIES.has('BoletimSondagem')).toBe(true);
  });
  it('inclui BoletimSondagemTrado', () => {
    expect(RESTRICTED_EDIT_ENTITIES.has('BoletimSondagemTrado')).toBe(true);
  });
  it('inclui ChecklistUsina', () => {
    expect(RESTRICTED_EDIT_ENTITIES.has('ChecklistUsina')).toBe(true);
  });
  it('inclui CertificacaoUsina', () => {
    expect(RESTRICTED_EDIT_ENTITIES.has('CertificacaoUsina')).toBe(true);
  });
  it('NÃO inclui EnsaioCAUQ (entidade não restrita)', () => {
    expect(RESTRICTED_EDIT_ENTITIES.has('EnsaioCAUQ')).toBe(false);
  });
  it('NÃO inclui DiarioObra', () => {
    expect(RESTRICTED_EDIT_ENTITIES.has('DiarioObra')).toBe(false);
  });
});

describe('canEditRestrictedRecord — admin', () => {
  it('admin edita registro quando obra está em_andamento', () => {
    expect(canEditRestrictedRecord(ADMIN, REC_RASCUNHO, OBRA_ATIVA)).toBe(true);
  });
  it('admin NÃO edita quando obra está concluída', () => {
    expect(canEditRestrictedRecord(ADMIN, REC_RASCUNHO, OBRA_CONCLUIDA)).toBe(false);
  });
  it('admin NÃO edita quando obra está pausada', () => {
    expect(canEditRestrictedRecord(ADMIN, REC_RASCUNHO, OBRA_PAUSADA)).toBe(false);
  });
  it('admin NÃO edita quando obra está em planejamento', () => {
    expect(canEditRestrictedRecord(ADMIN, REC_RASCUNHO, OBRA_PLANEJAMENTO)).toBe(false);
  });
  it('admin edita registro já aprovado se obra em_andamento', () => {
    expect(canEditRestrictedRecord(ADMIN, REC_APROVADO, OBRA_ATIVA)).toBe(true);
  });
  it('admin edita mesmo registro de outro autor', () => {
    const recAlheio = { created_by: 'outro@evias.com', created_by_id: 'u99', approved: null };
    expect(canEditRestrictedRecord(ADMIN, recAlheio, OBRA_ATIVA)).toBe(true);
  });
});

describe('canEditRestrictedRecord — criador (autor)', () => {
  it('criador edita seu rascunho (approved=null)', () => {
    expect(canEditRestrictedRecord(LAB, REC_RASCUNHO, OBRA_ATIVA)).toBe(true);
  });
  it('criador edita seu registro reprovado (approved=false)', () => {
    expect(canEditRestrictedRecord(LAB, REC_REPROVADO, OBRA_ATIVA)).toBe(true);
  });
  it('criador NÃO edita após aprovação (approved=true)', () => {
    expect(canEditRestrictedRecord(LAB, REC_APROVADO, OBRA_ATIVA)).toBe(false);
  });
  it('criador edita independente do status da obra (só importa approved)', () => {
    expect(canEditRestrictedRecord(LAB, REC_RASCUNHO, OBRA_CONCLUIDA)).toBe(true);
  });
  it('criador edita por created_by_id matching user.id', () => {
    const rec = { created_by: 'diferente@evias.com', created_by_id: 'u2', approved: null };
    expect(canEditRestrictedRecord(LAB, rec, OBRA_ATIVA)).toBe(true);
  });
  it('criador edita por created_by matching user.email (case-insensitive)', () => {
    const labUpper = { ...LAB, email: 'LAB@evias.com' };
    const rec = { created_by: 'lab@evias.com', created_by_id: 'u999', approved: null };
    expect(canEditRestrictedRecord(labUpper, rec, OBRA_ATIVA)).toBe(true);
  });
});

describe('canEditRestrictedRecord — não-autor, não-admin', () => {
  it('outro laboratorista NÃO edita registro alheio', () => {
    expect(canEditRestrictedRecord(OUTRO_LAB, REC_RASCUNHO, OBRA_ATIVA)).toBe(false);
  });
  it('gestor_contrato NÃO edita registro restrito alheio', () => {
    expect(canEditRestrictedRecord(GESTOR, REC_RASCUNHO, OBRA_ATIVA)).toBe(false);
  });
  it('sala_tecnica NÃO edita registro restrito alheio', () => {
    expect(canEditRestrictedRecord(SALA, REC_RASCUNHO, OBRA_ATIVA)).toBe(false);
  });
  it('gestor NÃO edita mesmo se obra em_andamento', () => {
    expect(canEditRestrictedRecord(GESTOR, REC_RASCUNHO, OBRA_ATIVA)).toBe(false);
  });
});

describe('canEditRestrictedRecord — fail-closed', () => {
  it('user null → false', () => {
    expect(canEditRestrictedRecord(null, REC_RASCUNHO, OBRA_ATIVA)).toBe(false);
  });
  it('record null → false', () => {
    expect(canEditRestrictedRecord(LAB, null, OBRA_ATIVA)).toBe(false);
  });
  it('obra null → admin não edita (status undefined)', () => {
    expect(canEditRestrictedRecord(ADMIN, REC_RASCUNHO, null)).toBe(false);
  });
  it('obra undefined → admin não edita', () => {
    expect(canEditRestrictedRecord(ADMIN, REC_RASCUNHO, undefined)).toBe(false);
  });
  it('record sem created_by e sem created_by_id → não-autor não edita', () => {
    const rec = { approved: null };
    expect(canEditRestrictedRecord(LAB, rec, OBRA_ATIVA)).toBe(false);
  });
});