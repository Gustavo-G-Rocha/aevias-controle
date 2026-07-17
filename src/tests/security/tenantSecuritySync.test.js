/**
 * Segurança — Tenant access (funções síncronas de tenantSecurity.js)
 *
 * Cobre hasTenantAccess() e canAccessObra() — as versões síncronas que
 * validam acesso quando a cadeia registro→obra→regional já está em memória.
 * Complementa defenseInDepth.test.js (que testa as versões async com deps
 * injetáveis simulando bypass de RLS).
 *
 * Foco em edge cases de segurança:
 *   - fail-closed (nulls, cadeia quebrada)
 *   - case-insensitivity de email
 *   - campo legacy gestor_contrato_responsavel
 *   - mapeamento cliente_supervisor / funcionarios_cliente
 *   - isApproverLevel (níveis que podem aprovar)
 */
import { describe, it, expect } from 'vitest';
import {
  hasTenantAccess,
  canAccessObra,
  getUserAccessLevel,
  isApproverLevel,
} from '../../utils/tenantSecurity.js';

const ADMIN = { id: 'u1', email: 'admin@evias.com', role: 'admin', access_level: 'admin' };
const GESTOR = { id: 'u2', email: 'gestor@evias.com', access_level: 'gestor_contrato' };
const SALA = { id: 'u3', email: 'sala@evias.com', access_level: 'sala_tecnica_afirmaevias' };
const CLIENTE = { id: 'u4', email: 'cliente@cliente.com', access_level: 'cliente' };
const CLIENTE_SUP = { id: 'u5', email: 'sup@cliente.com', access_level: 'cliente_supervisor' };
const LAB = { id: 'u6', email: 'lab@evias.com', access_level: 'user' };
const FUNC_CLIENTE = { id: 'u7', email: 'func@cliente.com', access_level: 'funcionarios_cliente' };

const REGIONAL = {
  id: 'r1',
  gestores_contrato_responsaveis: ['gestor@evias.com'],
  gestor_contrato_responsavel: 'legacy@evias.com',
  clientes_responsaveis: ['cliente@cliente.com', 'sup@cliente.com'],
  salas_tecnicas_responsaveis: ['sala@evias.com'],
};
const OBRA = { id: 'o1', regional_id: 'r1' };
const recAlheio = { id: 'rec1', obra_id: 'o1', created_by: 'outro@evias.com', created_by_id: 'u99' };

describe('getUserAccessLevel', () => {
  it('null user → user', () => {
    expect(getUserAccessLevel(null)).toBe('user');
  });
  it('usa access_level quando definido', () => {
    expect(getUserAccessLevel(GESTOR)).toBe('gestor_contrato');
  });
  it('deriva admin de role quando access_level ausente', () => {
    expect(getUserAccessLevel({ role: 'admin' })).toBe('admin');
  });
});

describe('isApproverLevel', () => {
  it('admin é approver', () => {
    expect(isApproverLevel(ADMIN)).toBe(true);
  });
  it('gestor_contrato é approver', () => {
    expect(isApproverLevel(GESTOR)).toBe(true);
  });
  it('sala_tecnica é approver', () => {
    expect(isApproverLevel(SALA)).toBe(true);
  });
  it('cliente NÃO é approver', () => {
    expect(isApproverLevel(CLIENTE)).toBe(false);
  });
  it('cliente_supervisor NÃO é approver (global)', () => {
    expect(isApproverLevel(CLIENTE_SUP)).toBe(false);
  });
  it('laboratorista NÃO é approver', () => {
    expect(isApproverLevel(LAB)).toBe(false);
  });
  it('user com role admin mas sem access_level é approver', () => {
    expect(isApproverLevel({ role: 'admin' })).toBe(true);
  });
});

describe('hasTenantAccess — admin', () => {
  it('admin acessa qualquer registro', () => {
    expect(hasTenantAccess(ADMIN, recAlheio, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('user com role=admin (sem access_level) acessa qualquer registro', () => {
    const roleAdmin = { id: 'u1', email: 'admin@evias.com', role: 'admin' };
    expect(hasTenantAccess(roleAdmin, recAlheio, OBRA, REGIONAL).allowed).toBe(true);
  });
});

describe('hasTenantAccess — laboratorista / funcionarios_cliente (só autor)', () => {
  it('laboratorista acessa registro que criou', () => {
    const own = { ...recAlheio, created_by: 'lab@evias.com', created_by_id: 'u6' };
    expect(hasTenantAccess(LAB, own, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('laboratorista NÃO acessa registro alheio', () => {
    const r = hasTenantAccess(LAB, recAlheio, OBRA, REGIONAL);
    expect(r.allowed).toBe(false);
  });
  it('funcionarios_cliente acessa registro que criou', () => {
    const own = { ...recAlheio, created_by: 'func@cliente.com', created_by_id: 'u7' };
    expect(hasTenantAccess(FUNC_CLIENTE, own, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('funcionarios_cliente NÃO acessa registro alheio', () => {
    expect(hasTenantAccess(FUNC_CLIENTE, recAlheio, OBRA, REGIONAL).allowed).toBe(false);
  });
});

describe('hasTenantAccess — tenant-scoped (cliente/sala/gestor)', () => {
  it('gestor acessa registro de obra de sua regional', () => {
    expect(hasTenantAccess(GESTOR, recAlheio, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('gestor NÃO acessa registro de obra de outra regional', () => {
    const outra = { ...REGIONAL, id: 'r2', gestores_contrato_responsaveis: ['outro@evias.com'] };
    expect(hasTenantAccess(GESTOR, recAlheio, OBRA, outra).allowed).toBe(false);
  });
  it('gestor via campo legacy (gestor_contrato_responsavel)', () => {
    const gestorLegacy = { id: 'uL', email: 'legacy@evias.com', access_level: 'gestor_contrato' };
    const regLegacy = { id: 'r1', gestores_contrato_responsaveis: [], gestor_contrato_responsavel: 'legacy@evias.com' };
    expect(hasTenantAccess(gestorLegacy, recAlheio, OBRA, regLegacy).allowed).toBe(true);
  });
  it('cliente acessa registro de obra de sua regional', () => {
    expect(hasTenantAccess(CLIENTE, recAlheio, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('cliente_supervisor acessa (mesma checagem de clientes_responsaveis)', () => {
    expect(hasTenantAccess(CLIENTE_SUP, recAlheio, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('sala_tecnica acessa registro de obra de sua regional', () => {
    expect(hasTenantAccess(SALA, recAlheio, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('sala_tecnica NÃO acessa se não está em salas_tecnicas_responsaveis', () => {
    const regSemSala = { ...REGIONAL, salas_tecnicas_responsaveis: [] };
    expect(hasTenantAccess(SALA, recAlheio, OBRA, regSemSala).allowed).toBe(false);
  });
});

describe('hasTenantAccess — case-insensitivity', () => {
  it('email com maiúsculas ainda autoriza gestor', () => {
    const gestorCase = { ...GESTOR, email: 'GESTOR@evias.com' };
    expect(hasTenantAccess(gestorCase, recAlheio, OBRA, REGIONAL).allowed).toBe(true);
  });
  it('email na regional com maiúsculas ainda autoriza', () => {
    const regCase = { ...REGIONAL, gestores_contrato_responsaveis: ['GESTOR@evias.com'] };
    expect(hasTenantAccess(GESTOR, recAlheio, OBRA, regCase).allowed).toBe(true);
  });
});

describe('hasTenantAccess — fail-closed (cadeia quebrada)', () => {
  it('user null → denied', () => {
    expect(hasTenantAccess(null, recAlheio, OBRA, REGIONAL).allowed).toBe(false);
  });
  it('record null → denied', () => {
    expect(hasTenantAccess(GESTOR, null, OBRA, REGIONAL).allowed).toBe(false);
  });
  it('tenant-scoped sem obra_id no registro → denied', () => {
    const semObra = { created_by: 'x' };
    const r = hasTenantAccess(GESTOR, semObra, OBRA, REGIONAL);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('obra');
  });
  it('tenant-scoped com obra sem regional_id → denied', () => {
    const r = hasTenantAccess(GESTOR, recAlheio, { id: 'o1' }, REGIONAL);
    expect(r.allowed).toBe(false);
  });
  it('tenant-scoped com regional null → denied', () => {
    const r = hasTenantAccess(GESTOR, recAlheio, OBRA, null);
    expect(r.allowed).toBe(false);
  });
});

describe('canAccessObra — criação/vínculo de obra', () => {
  it('admin cria em qualquer obra', () => {
    expect(canAccessObra(ADMIN, 'o1', OBRA, REGIONAL).allowed).toBe(true);
  });
  it('laboratorista cria em qualquer obra (filtragem de leitura é por created_by)', () => {
    expect(canAccessObra(LAB, 'o1', OBRA, REGIONAL).allowed).toBe(true);
  });
  it('funcionarios_cliente cria em qualquer obra', () => {
    expect(canAccessObra(FUNC_CLIENTE, 'o1', OBRA, REGIONAL).allowed).toBe(true);
  });
  it('gestor cria em obra de sua regional', () => {
    expect(canAccessObra(GESTOR, 'o1', OBRA, REGIONAL).allowed).toBe(true);
  });
  it('gestor NÃO cria em obra de outra regional', () => {
    const outra = { ...REGIONAL, id: 'r2', gestores_contrato_responsaveis: ['outro@evias.com'] };
    expect(canAccessObra(GESTOR, 'o1', OBRA, outra).allowed).toBe(false);
  });
  it('cliente cria em obra de sua regional', () => {
    expect(canAccessObra(CLIENTE, 'o1', OBRA, REGIONAL).allowed).toBe(true);
  });
  it('user null → denied', () => {
    expect(canAccessObra(null, 'o1', OBRA, REGIONAL).allowed).toBe(false);
  });
  it('tenant-scoped sem obraId → denied', () => {
    expect(canAccessObra(GESTOR, null, OBRA, REGIONAL).allowed).toBe(false);
  });
  it('tenant-scoped com obra null → denied', () => {
    expect(canAccessObra(GESTOR, 'o1', null, REGIONAL).allowed).toBe(false);
  });
  it('case-insensitive: gestor com email em maiúsculas', () => {
    const gestorCase = { ...GESTOR, email: 'GESTOR@evias.com' };
    expect(canAccessObra(gestorCase, 'o1', OBRA, REGIONAL).allowed).toBe(true);
  });
});