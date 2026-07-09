/**
 * Validação de tenant (defense-in-depth) — camada de aplicação.
 *
 * Espelha a lógica inlinada nos backend functions (gerenciarAprovacao,
 * validarESalvarRegistro). Mantida como módulo puro para testes unitários.
 *
 * A cadeia de tenancy é:
 *   Registro → obra_id → Obra → regional_id → Regional → arrays de emails
 *
 * Regras:
 *   - admin: acesso irrestrito
 *   - user (laboratorista): apenas registros que criou (created_by / created_by_id)
 *   - cliente: registros cuja obra pertence a uma regional com seu email em clientes_responsaveis
 *   - sala_tecnica_afirmaevias: mesmo critério, em salas_tecnicas_responsaveis
 *   - gestor_contrato: mesmo critério, em gestores_contrato_responsaveis (ou gestor_contrato_responsavel)
 */

const APPROVER_LEVELS = ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato'];

export function getUserAccessLevel(user) {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

export function isApproverLevel(user) {
  const level = getUserAccessLevel(user);
  return APPROVER_LEVELS.includes(level) || user.role === 'admin';
}

/**
 * Verifica se o usuário tem acesso ao registro (tenant check).
 *
 * @param {object} user     — usuário autenticado (com email, id, access_level, role)
 * @param {object} record   — registro alvo (com obra_id, created_by, created_by_id)
 * @param {object|null} obra — obra vinculada ao registro (com regional_id) ou null
 * @param {object|null} regional — regional vinculada à obra (com arrays de emails) ou null
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function hasTenantAccess(user, record, obra, regional) {
  if (!user || !record) {
    return { allowed: false, reason: 'Registro não encontrado' };
  }

  const level = getUserAccessLevel(user);

  // admin: acesso irrestrito
  if (level === 'admin' || user.role === 'admin') {
    return { allowed: true };
  }

  // laboratorista: apenas registros que criou
  if (level === 'user') {
    if (record.created_by === user.email || record.created_by_id === user.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Sem permissão sobre este registro' };
  }

  // tenant-scoped users (cliente, sala_tecnica, gestor_contrato):
  // precisam da cadeia registro → obra → regional
  if (!record.obra_id) {
    return { allowed: false, reason: 'Registro sem obra vinculada' };
  }
  if (!obra || !obra.regional_id) {
    return { allowed: false, reason: 'Obra sem regional vinculada' };
  }
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada' };
  }

  const userEmail = (user.email || '').toLowerCase();

  if (level === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre este registro (tenant)' };
}

/**
 * Verifica se o usuário pode criar/editar um registro vinculado a uma obra.
 * Usado na validação de create/update para garantir que o obra_id informado
 * pertence a um tenant acessível ao usuário.
 *
 * @param {object} user
 * @param {string} obraId   — obra_id do registro sendo criado/editado
 * @param {object|null} obra — obra correspondente (com regional_id) ou null
 * @param {object|null} regional — regional correspondente ou null
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canAccessObra(user, obraId, obra, regional) {
  if (!user) {
    return { allowed: false, reason: 'Usuário não autenticado' };
  }

  const level = getUserAccessLevel(user);

  // admin e laboratorista: irrestrito na criação
  // (laboratorista cria livremente; a filtragem de leitura é por created_by)
  if (level === 'admin' || user.role === 'admin' || level === 'user') {
    return { allowed: true };
  }

  if (!obraId) {
    return { allowed: false, reason: 'Obra é obrigatória' };
  }
  if (!obra || !obra.regional_id) {
    return { allowed: false, reason: 'Obra sem regional vinculada' };
  }
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada' };
  }

  const userEmail = (user.email || '').toLowerCase();

  if (level === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (level === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre a obra (tenant)' };
}

// ── ASYNC TENANT VALIDATION (testable reference for backend functions) ──
// Backend functions (gerenciarAprovacao, validarESalvarRegistro) inline
// equivalent logic because they can't import local modules (Deno deploy).
// These async versions accept injectable deps for unit testing, and serve
// as the single source of truth that inlined copies must mirror.

/**
 * Fetches obra → regional via injectable deps and validates tenant access.
 * Mirrors verifyTenantAccess in gerenciarAprovacao/entry.ts.
 *
 * Defense-in-depth: even if RLS is absent/misconfigured, this function
 * independently verifies the user's right over the record by traversing
 * the chain: record → obra_id → Obra → regional_id → Regional → email arrays.
 *
 * @param {object} user   — authenticated user
 * @param {object} record — target record (with obra_id, created_by, created_by_id)
 * @param {{ getObra: (id: string) => Promise<object|null>, getRegional: (id: string) => Promise<object|null> }} deps
 * @returns {Promise<{ allowed: boolean, reason?: string, status?: number }>}
 */
export async function verifyTenantAccessAsync(user, record, deps) {
  const level = getUserAccessLevel(user);

  // admin: acesso irrestrito (não precisa verificar tenant)
  if (level === 'admin' || user.role === 'admin') {
    return { allowed: true };
  }

  if (!record) {
    return { allowed: false, reason: 'Registro não encontrado', status: 404 };
  }

  // laboratorista: apenas registros que criou
  if (level === 'user') {
    if (record.created_by === user.email || record.created_by_id === user.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Sem permissão sobre este registro', status: 403 };
  }

  // tenant-scoped users (cliente, sala_tecnica, gestor_contrato):
  // precisam da cadeia registro → obra → regional
  if (!record.obra_id) {
    return { allowed: false, reason: 'Registro sem obra vinculada', status: 403 };
  }

  let obra;
  try {
    obra = await deps.getObra(record.obra_id);
  } catch {
    return { allowed: false, reason: 'Obra não encontrada', status: 404 };
  }
  if (!obra || !obra.regional_id) {
    return { allowed: false, reason: 'Obra sem regional vinculada', status: 403 };
  }

  let regional;
  try {
    regional = await deps.getRegional(obra.regional_id);
  } catch {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }

  // Delega a verificação de email para a função síncrona já testada
  const result = hasTenantAccess(user, record, obra, regional);
  if (!result.allowed && !result.status) {
    result.status = 403;
  }
  return result;
}

/**
 * Validates that a user can create/update a record linked to a given obra_id.
 * Mirrors verifyObraTenantAccess in validarESalvarRegistro/entry.ts.
 *
 * @param {object} user
 * @param {string} obraId — obra_id from the record being created/updated
 * @param {{ getObra: (id: string) => Promise<object|null>, getRegional: (id: string) => Promise<object|null> }} deps
 * @returns {Promise<{ allowed: boolean, reason?: string, status?: number }>}
 */
export async function verifyObraTenantAccessAsync(user, obraId, deps) {
  const level = getUserAccessLevel(user);

  // admin e laboratorista: irrestrito na criação
  if (level === 'admin' || user.role === 'admin' || level === 'user') {
    return { allowed: true };
  }

  if (!obraId) {
    return { allowed: false, reason: 'Obra é obrigatória', status: 403 };
  }

  let obra;
  try {
    obra = await deps.getObra(obraId);
  } catch {
    return { allowed: false, reason: 'Obra não encontrada', status: 404 };
  }
  if (!obra || !obra.regional_id) {
    return { allowed: false, reason: 'Obra sem regional vinculada', status: 403 };
  }

  let regional;
  try {
    regional = await deps.getRegional(obra.regional_id);
  } catch {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }

  // Delega a verificação de email para a função síncrona já testada
  const result = canAccessObra(user, obraId, obra, regional);
  if (!result.allowed && !result.status) {
    result.status = 403;
  }
  return result;
}