/**
 * Segurança — Aprovação de registros e supervisão por regional
 * (accessControl.js: canApproveRecord, isSupervisorInRegional)
 *
 * Modela:
 * - Approvers globais (admin, sala_tecnica, gestor_contrato) sempre aprovam
 * - cliente_supervisor só aprova se: (a) em supervisores_responsaveis da regional,
 *   E (b) o registro foi criado por funcionário do cliente
 * - cliente comum e laboratorista nunca aprovam
 */
import { describe, it, expect } from 'vitest';
import {
  canApproveRecord,
  isSupervisorInRegional,
} from '@/utils/accessControl';

const ADMIN = { email: 'admin@evias.com', access_level: 'admin' };
const GESTOR = { email: 'gestor@evias.com', access_level: 'gestor_contrato' };
const SALA = { email: 'sala@evias.com', access_level: 'sala_tecnica_afirmaevias' };
const SUPERVISOR = { email: 'sup@cliente.com', access_level: 'cliente_supervisor' };
const CLIENTE = { email: 'cliente@cliente.com', access_level: 'cliente' };
const LAB = { email: 'lab@evias.com', access_level: 'user' };

const REGIONAL = {
  id: 'r1',
  supervisores_responsaveis: ['sup@cliente.com'],
  clientes_responsaveis: ['cliente@cliente.com', 'funcionario@cliente.com'],
};

const REC_CLIENTE = { created_by: 'funcionario@cliente.com' };
const REC_STAFF = { created_by: 'lab@evias.com' };

// ── isSupervisorInRegional ──────────────────────────────────────────
describe('isSupervisorInRegional — approvers globais', () => {
  it('admin é supervisor em qualquer regional', () => {
    expect(isSupervisorInRegional(ADMIN, REGIONAL)).toBe(true);
    expect(isSupervisorInRegional(ADMIN, {})).toBe(true);
  });
  it('sala_tecnica é supervisor em qualquer regional', () => {
    expect(isSupervisorInRegional(SALA, REGIONAL)).toBe(true);
  });
  it('gestor_contrato é supervisor em qualquer regional', () => {
    expect(isSupervisorInRegional(GESTOR, REGIONAL)).toBe(true);
  });
});

describe('isSupervisorInRegional — cliente_supervisor', () => {
  it('cliente_supervisor listado em supervisores_responsaveis → true', () => {
    expect(isSupervisorInRegional(SUPERVISOR, REGIONAL)).toBe(true);
  });
  it('cliente_supervisor NÃO listado → false', () => {
    expect(isSupervisorInRegional(
      { ...SUPERVISOR, email: 'outro@cliente.com' },
      REGIONAL
    )).toBe(false);
  });
  it('cliente_supervisor com email em maiúsculas → case-insensitive', () => {
    expect(isSupervisorInRegional(
      { ...SUPERVISOR, email: 'SUP@CLIENTE.COM' },
      REGIONAL
    )).toBe(true);
  });
  it('cliente_supervisor sem regional → false', () => {
    expect(isSupervisorInRegional(SUPERVISOR, null)).toBe(false);
  });
  it('cliente_supervisor com regional sem supervisores_responsaveis → false', () => {
    expect(isSupervisorInRegional(SUPERVISOR, { id: 'r2' })).toBe(false);
  });
});

describe('isSupervisorInRegional — não-approvers', () => {
  it('cliente comum NÃO é supervisor', () => {
    expect(isSupervisorInRegional(CLIENTE, REGIONAL)).toBe(false);
  });
  it('laboratorista NÃO é supervisor', () => {
    expect(isSupervisorInRegional(LAB, REGIONAL)).toBe(false);
  });
  it('user null → false', () => {
    expect(isSupervisorInRegional(null, REGIONAL)).toBe(false);
  });
});

// ── canApproveRecord ─────────────────────────────────────────────────
describe('canApproveRecord — approvers globais', () => {
  it('admin aprova qualquer registro', () => {
    expect(canApproveRecord(ADMIN, REC_CLIENTE, REGIONAL)).toBe(true);
    expect(canApproveRecord(ADMIN, REC_STAFF, REGIONAL)).toBe(true);
  });
  it('sala_tecnica aprova qualquer registro', () => {
    expect(canApproveRecord(SALA, REC_CLIENTE, REGIONAL)).toBe(true);
  });
  it('gestor_contrato aprova qualquer registro', () => {
    expect(canApproveRecord(GESTOR, REC_CLIENTE, REGIONAL)).toBe(true);
  });
  it('approvers globais aprovam mesmo sem regional', () => {
    expect(canApproveRecord(ADMIN, REC_CLIENTE, null)).toBe(true);
  });
});

describe('canApproveRecord — cliente_supervisor', () => {
  it('supervisor aprova registro criado por funcionário do cliente', () => {
    expect(canApproveRecord(SUPERVISOR, REC_CLIENTE, REGIONAL)).toBe(true);
  });
  it('supervisor NÃO aprova registro criado por staff Afirma Evias', () => {
    expect(canApproveRecord(SUPERVISOR, REC_STAFF, REGIONAL)).toBe(false);
  });
  it('supervisor NÃO listado em supervisores_responsaveis → false', () => {
    const supervisorNaoListado = { ...SUPERVISOR, email: 'outro@cliente.com' };
    expect(canApproveRecord(supervisorNaoListado, REC_CLIENTE, REGIONAL)).toBe(false);
  });
  it('supervisor com regional null → false', () => {
    expect(canApproveRecord(SUPERVISOR, REC_CLIENTE, null)).toBe(false);
  });
  it('registro sem created_by → false para supervisor', () => {
    expect(canApproveRecord(SUPERVISOR, { created_by: '' }, REGIONAL)).toBe(false);
  });
  it('registro criado por email não listado em clientes_responsaveis → false', () => {
    const recOutroCliente = { created_by: 'outrocliente@outro.com' };
    expect(canApproveRecord(SUPERVISOR, recOutroCliente, REGIONAL)).toBe(false);
  });
  it('case-insensitive: emails com maiúsculas funcionam', () => {
    const supervisorUpper = { ...SUPERVISOR, email: 'SUP@CLIENTE.COM' };
    const recUpper = { created_by: 'FUNCIONARIO@CLIENTE.COM' };
    expect(canApproveRecord(supervisorUpper, recUpper, REGIONAL)).toBe(true);
  });
});

describe('canApproveRecord — não-approvers', () => {
  it('cliente comum NÃO aprova', () => {
    expect(canApproveRecord(CLIENTE, REC_CLIENTE, REGIONAL)).toBe(false);
  });
  it('laboratorista NÃO aprova', () => {
    expect(canApproveRecord(LAB, REC_CLIENTE, REGIONAL)).toBe(false);
  });
  it('user null → false', () => {
    expect(canApproveRecord(null, REC_CLIENTE, REGIONAL)).toBe(false);
  });
});

describe('canApproveRecord — fail-closed edge cases', () => {
  it('regional com supervisores_responsaveis vazio → supervisor não aprova', () => {
    const regVazia = { ...REGIONAL, supervisores_responsaveis: [] };
    expect(canApproveRecord(SUPERVISOR, REC_CLIENTE, regVazia)).toBe(false);
  });
  it('regional com clientes_responsaveis vazio → supervisor não aprova registro de cliente', () => {
    const regSemClientes = { ...REGIONAL, clientes_responsaveis: [] };
    expect(canApproveRecord(SUPERVISOR, REC_CLIENTE, regSemClientes)).toBe(false);
  });
});