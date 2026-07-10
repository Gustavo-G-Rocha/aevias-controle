// Regras de controle de acesso centralizadas
// cliente_supervisor → tem mesmas permissões de registro que cliente
// funcionarios_cliente → tem mesmas permissões de registro que user (laboratorista)

// Níveis que se comportam como "cliente" para fins de acesso a registros
const CLIENTE_LIKE_LEVELS = ['cliente', 'cliente_supervisor'];
// Níveis que se comportam como "user" (laboratorista) para fins de acesso a registros
const USER_LIKE_LEVELS = ['user', 'funcionarios_cliente'];

export function getUserAccessLevel(user) {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

/** Normaliza o nível para o equivalente base (cliente_supervisor→cliente, funcionarios_cliente→user) */
export function getEffectiveAccessLevel(user) {
  const level = getUserAccessLevel(user);
  if (level === 'cliente_supervisor') return 'cliente';
  if (level === 'funcionarios_cliente') return 'user';
  return level;
}

export function isAdmin(user) {
  return getUserAccessLevel(user) === 'admin';
}

export function isCliente(user) {
  return CLIENTE_LIKE_LEVELS.includes(getUserAccessLevel(user));
}

export function isClienteSupervisor(user) {
  return getUserAccessLevel(user) === 'cliente_supervisor';
}

export function isFuncionarioCliente(user) {
  return getUserAccessLevel(user) === 'funcionarios_cliente';
}

export function isGestorContrato(user) {
  return getUserAccessLevel(user) === 'gestor_contrato';
}

export function isSalaTecnica(user) {
  return getUserAccessLevel(user) === 'sala_tecnica_afirmaevias';
}

export function isLaboratorista(user) {
  return USER_LIKE_LEVELS.includes(getUserAccessLevel(user));
}

export function isEngenheiroCliente(user) {
  return isCliente(user) && Boolean(user?.position?.toLowerCase().includes('engenheiro'));
}

export function canSeeFilters(user) {
  return !isLaboratorista(user);
}

export function canSeeObraChart(user) {
  const level = getEffectiveAccessLevel(user);
  return level === 'admin' || level === 'cliente';
}

export function filterRegionaisByUser(regionais, user) {
  const level = getEffectiveAccessLevel(user);
  return regionais.filter(regional => {
    if (regional.status === 'inativa') return false;
    if (level === 'cliente') {
      return (regional.clientes_responsaveis || []).some(
        email => email.toLowerCase() === user.email.toLowerCase()
      );
    }
    if (level === 'sala_tecnica_afirmaevias') {
      return (regional.salas_tecnicas_responsaveis || []).some(
        email => email.toLowerCase() === user.email.toLowerCase()
      );
    }
    if (level === 'gestor_contrato') {
      return (
        regional.gestor_contrato_responsavel?.toLowerCase() === user.email.toLowerCase() ||
        (regional.gestores_contrato_responsaveis || []).some(
          email => email.toLowerCase() === user.email.toLowerCase()
        )
      );
    }
    // user (laboratorista / funcionarios_cliente): pode ver regionais onde está alocado
    if (level === 'user') {
      return (regional.laboratoristas_responsaveis || []).some(
        email => email.toLowerCase() === user.email.toLowerCase()
      );
    }
    return false;
  });
}

/**
 * Retorna o conjunto de IDs de obras acessíveis ao usuário,
 * baseado nas regionais às quais ele pertence.
 *
 * - admin: todas as obras
 * - user (laboratorista / funcionarios_cliente): todas as obras (filtragem de registros é por created_by)
 * - cliente/cliente_supervisor/sala_tecnica_afirmaevias/gestor_contrato: obras das regionais vinculadas
 */
export function getAccessibleObraIds(obras, regionais, user) {
  if (!obras || !user) return new Set();
  const level = getEffectiveAccessLevel(user);

  if (level === 'admin' || level === 'user') {
    return new Set(obras.map(o => o.id));
  }

  const regionaisDoUsuario = filterRegionaisByUser(regionais ?? [], user);
  const regionaisIds = new Set(regionaisDoUsuario.map(r => r.id));
  return new Set(obras.filter(o => regionaisIds.has(o.regional_id)).map(o => o.id));
}