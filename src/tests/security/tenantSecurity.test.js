import { describe, it, expect } from 'vitest';
import {
  getUserAccessLevel,
  isApproverLevel,
  hasTenantAccess,
  canAccessObra,
} from '@/utils/tenantSecurity';

// ── Fixtures ──────────────────────────────────────────────────────────
const ADMIN = { id: 'u1', email: 'admin@evias.com', role: 'admin', access_level: 'admin' };

const GESTOR_A = {
  id: 'u2',
  email: 'gestor.a@evias.com',
  role: 'user',
  access_level: 'gestor_contrato',
};

const GESTOR_B = {
  id: 'u3',
  email: 'gestor.b@evias.com',
  role: 'user',
  access_level: 'gestor_contrato',
};

const CLIENTE_A = {
  id: 'u4',
  email: 'cliente.a@cliente.com',
  role: 'user',
  access_level: 'cliente',
};

const SALA_TECNICA_A = {
  id: 'u5',
  email: 'sala.a@evias.com',
  role: 'user',
  access_level: 'sala_tecnica_afirmaevias',
};

const LABORATORISTA = {
  id: 'u6',
  email: 'lab@evias.com',
  role: 'user',
  access_level: 'user',
};

const REGIONAL_A = {
  id: 'r1',
  nome: 'Regional A',
  gestores_contrato_responsaveis: ['gestor.a@evias.com'],
  clientes_responsaveis: ['cliente.a@cliente.com'],
  salas_tecnicas_responsaveis: ['sala.a@evias.com'],
};

const REGIONAL_B = {
  id: 'r2',
  nome: 'Regional B',
  gestores_contrato_responsaveis: ['gestor.b@evias.com'],
  clientes_responsaveis: ['cliente.b@cliente.com'],
  salas_tecnicas_responsaveis: ['sala.b@evias.com'],
};

const OBRA_A = { id: 'o1', name: 'Obra A', regional_id: 'r1' };
const OBRA_B = { id: 'o2', name: 'Obra B', regional_id: 'r2' };

// Registro na Regional A
const RECORD_A = {
  id: 'rec1',
  obra_id: 'o1',
  created_by: 'lab@evias.com',
  created_by_id: 'u6',
};

// Registro na Regional B
const RECORD_B = {
  id: 'rec2',
  obra_id: 'o2',
  created_by: 'other.lab@evias.com',
  created_by_id: 'u99',
};

describe('getUserAccessLevel', () => {
  it('retorna access_level quando definido', () => {
    expect(getUserAccessLevel(GESTOR_A)).toBe('gestor_contrato');
  });

  it('fallback para admin quando role=admin sem access_level', () => {
    expect(getUserAccessLevel({ role: 'admin' })).toBe('admin');
  });

  it('fallback para user quando sem access_level e role!=admin', () => {
    expect(getUserAccessLevel({ role: 'user' })).toBe('user');
  });

  it('retorna user quando usuário é null', () => {
    expect(getUserAccessLevel(null)).toBe('user');
  });
});

describe('isApproverLevel', () => {
  it('true para admin, sala_tecnica, gestor_contrato', () => {
    expect(isApproverLevel(ADMIN)).toBe(true);
    expect(isApproverLevel(SALA_TECNICA_A)).toBe(true);
    expect(isApproverLevel(GESTOR_A)).toBe(true);
  });

  it('false para laboratorista e cliente', () => {
    expect(isApproverLevel(LABORATORISTA)).toBe(false);
    expect(isApproverLevel(CLIENTE_A)).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════
// CENÁRIOS DE ATAQUE CROSS-TENANT (devem ser bloqueados)
// ═════════════════════════════════════════════════════════════════════
describe('hasTenantAccess — cenários de ataque cross-tenant', () => {
  it('gestor_contrato da Regional A NÃO pode acessar registro da Regional B', () => {
    const result = hasTenantAccess(GESTOR_A, RECORD_B, OBRA_B, REGIONAL_B);
    expect(result.allowed).toBe(false);
  });

  it('cliente da Regional A NÃO pode acessar registro da Regional B', () => {
    const result = hasTenantAccess(CLIENTE_A, RECORD_B, OBRA_B, REGIONAL_B);
    expect(result.allowed).toBe(false);
  });

  it('sala_tecnica da Regional A NÃO pode acessar registro da Regional B', () => {
    const result = hasTenantAccess(SALA_TECNICA_A, RECORD_B, OBRA_B, REGIONAL_B);
    expect(result.allowed).toBe(false);
  });

  it('gestor_contrato da Regional B NÃO pode acessar registro da Regional A', () => {
    const result = hasTenantAccess(GESTOR_B, RECORD_A, OBRA_A, REGIONAL_A);
    expect(result.allowed).toBe(false);
  });

  it('laboratorista NÃO pode acessar registro criado por outro laboratorista', () => {
    const result = hasTenantAccess(LABORATORISTA, RECORD_B, OBRA_B, REGIONAL_B);
    expect(result.allowed).toBe(false);
  });

  it('bloqueia mesmo se obra/regional forenull (defense-in-depth sem RLS)', () => {
    // Simula RLS ausente — a validação funcional ainda bloqueia
    const result = hasTenantAccess(GESTOR_A, RECORD_B, null, null);
    expect(result.allowed).toBe(false);
  });

  it('bloqueia quando registro não tem obra_id (tenant-scoped user)', () => {
    const recordSemObra = { id: 'rec3', created_by: 'other@evias.com' };
    const result = hasTenantAccess(GESTOR_A, recordSemObra, null, null);
    expect(result.allowed).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════
// CENÁRIOS DE ACESSO LEGÍTIMO (não devem regredir)
// ═════════════════════════════════════════════════════════════════════
describe('hasTenantAccess — cenários de acesso legítimo', () => {
  it('admin tem acesso a qualquer registro', () => {
    expect(hasTenantAccess(ADMIN, RECORD_A, OBRA_A, REGIONAL_A).allowed).toBe(true);
    expect(hasTenantAccess(ADMIN, RECORD_B, OBRA_B, REGIONAL_B).allowed).toBe(true);
  });

  it('gestor_contrato da Regional A pode acessar registro da Regional A', () => {
    const result = hasTenantAccess(GESTOR_A, RECORD_A, OBRA_A, REGIONAL_A);
    expect(result.allowed).toBe(true);
  });

  it('cliente da Regional A pode acessar registro da Regional A', () => {
    const result = hasTenantAccess(CLIENTE_A, RECORD_A, OBRA_A, REGIONAL_A);
    expect(result.allowed).toBe(true);
  });

  it('sala_tecnica da Regional A pode acessar registro da Regional A', () => {
    const result = hasTenantAccess(SALA_TECNICA_A, RECORD_A, OBRA_A, REGIONAL_A);
    expect(result.allowed).toBe(true);
  });

  it('laboratorista pode acessar registro que ele mesmo criou', () => {
    const result = hasTenantAccess(LABORATORISTA, RECORD_A, OBRA_A, REGIONAL_A);
    expect(result.allowed).toBe(true);
  });

  it('gestor_contrato com email no campo legacy gestor_contrato_responsavel', () => {
    const regionalLegacy = {
      id: 'r3',
      gestor_contrato_responsavel: 'gestor.a@evias.com',
      gestores_contrato_responsaveis: [],
    };
    const result = hasTenantAccess(GESTOR_A, RECORD_A, OBRA_A, regionalLegacy);
    expect(result.allowed).toBe(true);
  });

  it('case-insensitive: email com maiúsculas/minúsculas diferentes', () => {
    const gestorCase = { ...GESTOR_A, email: 'GESTOR.A@evias.com' };
    const result = hasTenantAccess(gestorCase, RECORD_A, OBRA_A, REGIONAL_A);
    expect(result.allowed).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════
// canAccessObra — validação na criação/edição
// ═════════════════════════════════════════════════════════════════════
describe('canAccessObra — validação de obra na criação', () => {
  it('admin pode criar em qualquer obra', () => {
    expect(canAccessObra(ADMIN, 'o1', OBRA_A, REGIONAL_A).allowed).toBe(true);
    expect(canAccessObra(ADMIN, 'o2', OBRA_B, REGIONAL_B).allowed).toBe(true);
  });

  it('laboratorista pode criar em qualquer obra', () => {
    expect(canAccessObra(LABORATORISTA, 'o1', OBRA_A, REGIONAL_A).allowed).toBe(true);
  });

  it('gestor_contrato pode criar em obra de sua regional', () => {
    expect(canAccessObra(GESTOR_A, 'o1', OBRA_A, REGIONAL_A).allowed).toBe(true);
  });

  it('gestor_contrato NÃO pode criar em obra de outra regional', () => {
    expect(canAccessObra(GESTOR_A, 'o2', OBRA_B, REGIONAL_B).allowed).toBe(false);
  });

  it('cliente NÃO pode criar em obra de outra regional', () => {
    expect(canAccessObra(CLIENTE_A, 'o2', OBRA_B, REGIONAL_B).allowed).toBe(false);
  });

  it('cliente pode criar em obra de sua regional', () => {
    expect(canAccessObra(CLIENTE_A, 'o1', OBRA_A, REGIONAL_A).allowed).toBe(true);
  });

  it('bloqueia quando obra_id é null (tenant-scoped user)', () => {
    expect(canAccessObra(GESTOR_A, null, null, null).allowed).toBe(false);
  });
});