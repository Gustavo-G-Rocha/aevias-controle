/**
 * Shared: validação de tenant (defense-in-depth, anti-IDOR).
 *
 * Verifica explicitamente o direito do usuário sobre um registro,
 * percorrendo a cadeia: registro → obra → regional → emails do usuário.
 * Não depende do RLS — mesmo com RLS mal configurado, impede acesso
 * cross-tenant entre clientes/regionais diferentes.
 */

export function getUserAccessLevel(user: any): string {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

/** Normaliza para nível efetivo (cliente_supervisor→cliente, funcionarios_cliente→user) */
export function getEffectiveAccessLevel(user: any): string {
  const level = getUserAccessLevel(user);
  if (level === 'cliente_supervisor') return 'cliente';
  if (level === 'funcionarios_cliente') return 'user';
  return level;
}

export interface TenantCheckResult {
  allowed: boolean;
  isSupervisor?: boolean;
  reason?: string;
  status?: number;
}

export interface TenantCaches {
  obra: Map<string, any>;
  regional: Map<string, any>;
}

export async function verifyTenantAccess(
  base44: any,
  user: any,
  entityName: string,
  record: any,
  caches?: TenantCaches,
): Promise<TenantCheckResult> {
  const level = getUserAccessLevel(user);
  const effectiveLevel = getEffectiveAccessLevel(user);

  // admin: acesso irrestrito (não precisa verificar tenant)
  if (level === 'admin') {
    return { allowed: true };
  }

  if (!record) {
    return { allowed: false, reason: 'Registro não encontrado', status: 404 };
  }

  // laboratorista / funcionarios_cliente: apenas registros que criou
  if (effectiveLevel === 'user') {
    if (record.created_by === user.email || record.created_by_id === user.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Sem permissão sobre este registro', status: 403 };
  }

  // tenant-scoped users (cliente/cliente_supervisor, sala_tecnica, gestor_contrato):
  // precisam da cadeia registro → obra → regional
  if (!record.obra_id) {
    return { allowed: false, reason: 'Registro sem obra vinculada', status: 403 };
  }

  let obra = caches?.obra.get(record.obra_id);
  if (obra === undefined) {
    try {
      obra = await base44.asServiceRole.entities.Obra.get(record.obra_id);
    } catch {
      obra = null;
    }
    caches?.obra.set(record.obra_id, obra);
  }
  if (!obra) {
    return { allowed: false, reason: 'Obra não encontrada', status: 404 };
  }
  if (!obra.regional_id) {
    return { allowed: false, reason: 'Obra sem regional vinculada', status: 403 };
  }

  let regional = caches?.regional.get(obra.regional_id);
  if (regional === undefined) {
    try {
      regional = await base44.asServiceRole.entities.Regional.get(obra.regional_id);
    } catch {
      regional = null;
    }
    caches?.regional.set(obra.regional_id, regional);
  }
  if (!regional) {
    return { allowed: false, reason: 'Regional não encontrada', status: 404 };
  }

  const userEmail = (user.email || '').toLowerCase();

  // cliente e cliente_supervisor: mesmas regionais (clientes_responsaveis)
  if (effectiveLevel === 'cliente') {
    const emails = (regional.clientes_responsaveis || []).map((e: string) => e.toLowerCase());
    const supervisores = (regional.supervisores_responsaveis || []).map((e: string) => e.toLowerCase());
    // Estar em supervisores_responsaveis também conta como membro do tenant
    if (emails.includes(userEmail) || supervisores.includes(userEmail)) {
      let isSupervisor = level === 'cliente_supervisor' && supervisores.includes(userEmail);
      // Defense-in-depth: cliente_supervisor só pode APROVAR registros criados
      // por funcionários do cliente (em clientes_responsaveis), NÃO por staff
      // da Afirma Evias. Espelha canApproveRecord do frontend (accessControl.js).
      // Se o registro foi criado por staff Afirma Evias, isSupervisor=false →
      // gerenciarAprovacao bloqueia a aprovação.
      if (isSupervisor) {
        const createdBy = (record.created_by || '').toLowerCase();
        if (!createdBy) {
          isSupervisor = false;
        } else {
          const clientesEmails = new Set(emails);
          if (!clientesEmails.has(createdBy)) {
            isSupervisor = false;
          }
        }
      }
      return { allowed: true, isSupervisor };
    }
  } else if (effectiveLevel === 'sala_tecnica_afirmaevias') {
    const emails = (regional.salas_tecnicas_responsaveis || []).map((e: string) => e.toLowerCase());
    if (emails.includes(userEmail)) return { allowed: true };
  } else if (effectiveLevel === 'gestor_contrato') {
    const emails = (regional.gestores_contrato_responsaveis || []).map((e: string) => e.toLowerCase());
    const legacy = (regional.gestor_contrato_responsavel || '').toLowerCase();
    if (emails.includes(userEmail) || legacy === userEmail) return { allowed: true };
  }

  return { allowed: false, reason: 'Sem permissão sobre este registro (tenant)', status: 403 };
}