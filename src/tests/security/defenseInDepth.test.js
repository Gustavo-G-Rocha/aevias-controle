/**
 * Testes de Defense-in-Depth — Segurança em Camada de Aplicação.
 *
 * Modela o cenário de ameaça: assumir que o RLS pode falhar ou estar mal
 * configurado, e validar que a camada de aplicação (verifyTenantAccessAsync)
 * ainda bloqueia acesso cross-tenant entre clientes/regionais.
 *
 * "RLS failure" é simulado por mocks que retornam QUALQUER registro solicitado
 * (ignorando tenant), exatamente como asServiceRole faria — provando que a
 * validação funcional NÃO depende do RLS para impedir acesso indevido.
 */
import { describe, it, expect } from 'vitest';
import {
  verifyTenantAccessAsync,
  verifyObraTenantAccessAsync,
  getUserAccessLevel,
} from '@/utils/tenantSecurity';

// ── Fixtures (espelhadas de tenantSecurity.test.js) ──────────────────
const ADMIN = { id: 'u1', email: 'admin@evias.com', role: 'admin', access_level: 'admin' };

const GESTOR_A = { id: 'u2', email: 'gestor.a@evias.com', role: 'user', access_level: 'gestor_contrato' };
const GESTOR_B = { id: 'u3', email: 'gestor.b@evias.com', role: 'user', access_level: 'gestor_contrato' };
const CLIENTE_A = { id: 'u4', email: 'cliente.a@cliente.com', role: 'user', access_level: 'cliente' };
const CLIENTE_B = { id: 'u9', email: 'cliente.b@cliente.com', role: 'user', access_level: 'cliente' };
const SALA_TECNICA_A = { id: 'u5', email: 'sala.a@evias.com', role: 'user', access_level: 'sala_tecnica_afirmaevias' };
const SALA_TECNICA_B = { id: 'u10', email: 'sala.b@evias.com', role: 'user', access_level: 'sala_tecnica_afirmaevias' };
const LABORATORISTA = { id: 'u6', email: 'lab@evias.com', role: 'user', access_level: 'user' };
const LABORATORISTA_OUTRO = { id: 'u99', email: 'other.lab@evias.com', role: 'user', access_level: 'user' };

const REGIONAL_A = {
  id: 'r1', nome: 'Regional A',
  gestores_contrato_responsaveis: ['gestor.a@evias.com'],
  clientes_responsaveis: ['cliente.a@cliente.com'],
  salas_tecnicas_responsaveis: ['sala.a@evias.com'],
};
const REGIONAL_B = {
  id: 'r2', nome: 'Regional B',
  gestores_contrato_responsaveis: ['gestor.b@evias.com'],
  clientes_responsaveis: ['cliente.b@cliente.com'],
  salas_tecnicas_responsaveis: ['sala.b@evias.com'],
};
const OBRA_A = { id: 'o1', name: 'Obra A', regional_id: 'r1' };
const OBRA_B = { id: 'o2', name: 'Obra B', regional_id: 'r2' };

// Registro na Regional A (criado pelo laboratorista)
const RECORD_A = { id: 'rec1', obra_id: 'o1', created_by: 'lab@evias.com', created_by_id: 'u6' };
// Registro na Regional B (criado por outro laboratorista)
const RECORD_B = { id: 'rec2', obra_id: 'o2', created_by: 'other.lab@evias.com', created_by_id: 'u99' };

// ── Mock deps: simula asServiceRole (bypass de RLS) ──────────────────
// Retorna QUALQUER obra/regional solicitada — não filtra por tenant.
// Isso simula um cenário onde o RLS está ausente ou mal configurado.
// A validação funcional deve bloquear cross-tenant mesmo assim.
const OBRAS = { o1: OBRA_A, o2: OBRA_B };
const REGIONAIS = { r1: REGIONAL_A, r2: REGIONAL_B };

const rlsBypassDeps = {
  getObra: async (id) => OBRAS[id] || null,
  getRegional: async (id) => REGIONAIS[id] || null,
};

// Mock que simula falha total de RLS + dados corrompidos (obra sem regional)
const rlsFailureDeps = {
  getObra: async (id) => ({ id, regional_id: null }), // obra sem regional
  getRegional: async (id) => null, // regional não encontrada
};

// Mock que simula RLS ausente + obra deletada
const rlsMissingObraDeps = {
  getObra: async () => null,
  getRegional: async () => null,
};

// ═════════════════════════════════════════════════════════════════════
// verifyTenantAccessAsync — CENÁRIOS DE ATAQUE CROSS-TENANT
// (devem ser bloqueados MESMO com RLS ausente/mal configurado)
// ═════════════════════════════════════════════════════════════════════
describe('verifyTenantAccessAsync — ataques cross-tenant (RLS ausente)', () => {
  it('gestor_contrato da Regional A NÃO aprova registro da Regional B', async () => {
    // RLS bypass: o mock retorna RECORD_B sem verificar tenant
    const result = await verifyTenantAccessAsync(GESTOR_A, RECORD_B, rlsBypassDeps);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('cliente da Regional A NÃO assina registro da Regional B', async () => {
    const result = await verifyTenantAccessAsync(CLIENTE_A, RECORD_B, rlsBypassDeps);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('sala_tecnica da Regional A NÃO acessa registro da Regional B', async () => {
    const result = await verifyTenantAccessAsync(SALA_TECNICA_A, RECORD_B, rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('gestor_contrato da Regional B NÃO acessa registro da Regional A', async () => {
    const result = await verifyTenantAccessAsync(GESTOR_B, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('cliente da Regional B NÃO acessa registro da Regional A', async () => {
    const result = await verifyTenantAccessAsync(CLIENTE_B, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('sala_tecnica da Regional B NÃO acessa registro da Regional A', async () => {
    const result = await verifyTenantAccessAsync(SALA_TECNICA_B, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('laboratorista NÃO acessa registro criado por outro laboratorista', async () => {
    const result = await verifyTenantAccessAsync(LABORATORISTA, RECORD_B, rlsBypassDeps);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('laboratorista outro NÃO acessa registro do laboratorista A', async () => {
    const result = await verifyTenantAccessAsync(LABORATORISTA_OUTRO, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('bloqueia quando obra não tem regional_id (dados corrompidos)', async () => {
    const result = await verifyTenantAccessAsync(GESTOR_A, RECORD_A, rlsFailureDeps);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('regional');
  });

  it('bloqueia quando obra não existe (obra deletada)', async () => {
    const result = await verifyTenantAccessAsync(GESTOR_A, RECORD_A, rlsMissingObraDeps);
    expect(result.allowed).toBe(false);
    // Mock retorna null → cai no check !obra → 403 "Obra sem regional vinculada"
    expect(result.status).toBe(403);
  });

  it('bloqueia quando registro não tem obra_id (tenant-scoped user)', async () => {
    const recordSemObra = { id: 'rec3', created_by: 'other@evias.com' };
    const result = await verifyTenantAccessAsync(GESTOR_A, recordSemObra, rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('bloqueia quando registro é null', async () => {
    const result = await verifyTenantAccessAsync(GESTOR_A, null, rlsBypassDeps);
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════════
// verifyTenantAccessAsync — CENÁRIOS DE ACESSO LEGÍTIMO
// (não devem regredir — nenhum usuário permitido pode ser bloqueado)
// ═════════════════════════════════════════════════════════════════════
describe('verifyTenantAccessAsync — acesso legítimo (sem regressão)', () => {
  it('admin aprova registro de qualquer regional', async () => {
    const resultA = await verifyTenantAccessAsync(ADMIN, RECORD_A, rlsBypassDeps);
    const resultB = await verifyTenantAccessAsync(ADMIN, RECORD_B, rlsBypassDeps);
    expect(resultA.allowed).toBe(true);
    expect(resultB.allowed).toBe(true);
  });

  it('gestor_contrato da Regional A aprova registro da Regional A', async () => {
    const result = await verifyTenantAccessAsync(GESTOR_A, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(true);
  });

  it('cliente da Regional A assina registro da Regional A', async () => {
    const result = await verifyTenantAccessAsync(CLIENTE_A, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(true);
  });

  it('sala_tecnica da Regional A acessa registro da Regional A', async () => {
    const result = await verifyTenantAccessAsync(SALA_TECNICA_A, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(true);
  });

  it('laboratorista acessa registro que ele mesmo criou', async () => {
    const result = await verifyTenantAccessAsync(LABORATORISTA, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(true);
  });

  it('gestor_contrato com email no campo legacy (gestor_contrato_responsavel)', async () => {
    const regionalLegacy = {
      id: 'r3',
      gestor_contrato_responsavel: 'gestor.a@evias.com',
      gestores_contrato_responsaveis: [],
    };
    const depsLegacy = {
      getObra: async () => ({ id: 'o3', regional_id: 'r3' }),
      getRegional: async () => regionalLegacy,
    };
    const result = await verifyTenantAccessAsync(GESTOR_A, { id: 'rec', obra_id: 'o3', created_by: 'someone@evias.com' }, depsLegacy);
    expect(result.allowed).toBe(true);
  });

  it('case-insensitive: email com maiúsculas/minúsculas diferentes', async () => {
    const gestorCase = { ...GESTOR_A, email: 'GESTOR.A@evias.com' };
    const result = await verifyTenantAccessAsync(gestorCase, RECORD_A, rlsBypassDeps);
    expect(result.allowed).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════
// verifyObraTenantAccessAsync — CENÁRIOS DE ATAQUE (create/update)
// ═════════════════════════════════════════════════════════════════════
describe('verifyObraTenantAccessAsync — ataques cross-tenant (create/update)', () => {
  it('gestor_contrato da Regional A NÃO cria registro em obra da Regional B', async () => {
    const result = await verifyObraTenantAccessAsync(GESTOR_A, 'o2', rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('cliente da Regional A NÃO cria registro em obra da Regional B', async () => {
    const result = await verifyObraTenantAccessAsync(CLIENTE_A, 'o2', rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('sala_tecnica da Regional A NÃO cria registro em obra da Regional B', async () => {
    const result = await verifyObraTenantAccessAsync(SALA_TECNICA_A, 'o2', rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('gestor_contrato NÃO pode mudar obra_id para obra de outra regional (update)', async () => {
    // Cenário: gestor A edita um registro e muda obra_id para obra da Regional B
    const result = await verifyObraTenantAccessAsync(GESTOR_A, 'o2', rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('bloqueia quando obra_id é null (tenant-scoped user)', async () => {
    const result = await verifyObraTenantAccessAsync(GESTOR_A, null, rlsBypassDeps);
    expect(result.allowed).toBe(false);
  });

  it('bloqueia quando obra não existe (obra deletada)', async () => {
    const result = await verifyObraTenantAccessAsync(GESTOR_A, 'o-inexistente', rlsBypassDeps);
    expect(result.allowed).toBe(false);
    // Mock retorna null → cai no check !obra → 403 "Obra sem regional vinculada"
    expect(result.status).toBe(403);
  });
});

// ═════════════════════════════════════════════════════════════════════
// verifyObraTenantAccessAsync — ACESSO LEGÍTIMO (create/update)
// ═════════════════════════════════════════════════════════════════════
describe('verifyObraTenantAccessAsync — acesso legítimo (sem regressão)', () => {
  it('admin cria em qualquer obra', async () => {
    expect((await verifyObraTenantAccessAsync(ADMIN, 'o1', rlsBypassDeps)).allowed).toBe(true);
    expect((await verifyObraTenantAccessAsync(ADMIN, 'o2', rlsBypassDeps)).allowed).toBe(true);
  });

  it('laboratorista cria em qualquer obra', async () => {
    expect((await verifyObraTenantAccessAsync(LABORATORISTA, 'o1', rlsBypassDeps)).allowed).toBe(true);
    expect((await verifyObraTenantAccessAsync(LABORATORISTA, 'o2', rlsBypassDeps)).allowed).toBe(true);
  });

  it('gestor_contrato cria em obra de sua regional', async () => {
    expect((await verifyObraTenantAccessAsync(GESTOR_A, 'o1', rlsBypassDeps)).allowed).toBe(true);
  });

  it('cliente cria em obra de sua regional', async () => {
    expect((await verifyObraTenantAccessAsync(CLIENTE_A, 'o1', rlsBypassDeps)).allowed).toBe(true);
  });

  it('sala_tecnica cria em obra de sua regional', async () => {
    expect((await verifyObraTenantAccessAsync(SALA_TECNICA_A, 'o1', rlsBypassDeps)).allowed).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════
// DEFENSE-IN-DEPTH: prova que a camada de aplicação é independente do RLS
// ═════════════════════════════════════════════════════════════════════
describe('defense-in-depth: independência da camada de aplicação', () => {
  it('bloqueia cross-tenant mesmo quando o mock NÃO filtra por tenant (simula RLS ausente)', async () => {
    // O mock rlsBypassDeps retorna QUALQUER obra/regional solicitada,
    // sem verificar se o usuário tem direito sobre elas.
    // Isso é exatamente o que asServiceRole faz — bypass de RLS.
    // A validação funcional deve bloquear mesmo assim.
    const gestorATentandoAcessarRegionalB = await verifyTenantAccessAsync(GESTOR_A, RECORD_B, rlsBypassDeps);
    const clienteATentandoAcessarRegionalB = await verifyTenantAccessAsync(CLIENTE_A, RECORD_B, rlsBypassDeps);
    const salaATentandoAcessarRegionalB = await verifyTenantAccessAsync(SALA_TECNICA_A, RECORD_B, rlsBypassDeps);

    expect(gestorATentandoAcessarRegionalB.allowed).toBe(false);
    expect(clienteATentandoAcessarRegionalB.allowed).toBe(false);
    expect(salaATentandoAcessarRegionalB.allowed).toBe(false);
  });

  it('permite acesso legítimo mesmo quando o mock NÃO filtra por tenant', async () => {
    // A validação funcional também não deve bloquear usuários legítimos
    const gestorAEmSuaRegional = await verifyTenantAccessAsync(GESTOR_A, RECORD_A, rlsBypassDeps);
    const clienteAEmSuaRegional = await verifyTenantAccessAsync(CLIENTE_A, RECORD_A, rlsBypassDeps);

    expect(gestorAEmSuaRegional.allowed).toBe(true);
    expect(clienteAEmSuaRegional.allowed).toBe(true);
  });

  it('fail-closed: dados corrompidos (obra sem regional) bloqueiam mesmo admin-scoped', async () => {
    // Mesmo que asServiceRole retorne a obra, se regional_id está ausente,
    // a validação funcional falha fechada (deny by default).
    const result = await verifyTenantAccessAsync(GESTOR_A, RECORD_A, rlsFailureDeps);
    expect(result.allowed).toBe(false);
  });
});