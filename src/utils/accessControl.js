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

/**
 * Verifica se um cliente_supervisor é supervisor (tem poder de aprovação)
 * em uma regional específica.
 *
 * - Usuários que NÃO são cliente_supervisor: retorna true se já são approver
 *   (admin, sala_tecnica, gestor_contrato) — esses têm poder global.
 * - cliente_supervisor: só pode aprovar se seu email estiver em
 *   supervisores_responsaveis da regional.
 * - cliente comum: nunca pode aprovar (apenas assinar).
 */
export function isSupervisorInRegional(user, regional) {
  if (!user) return false;
  const level = getUserAccessLevel(user);

  // Approvers globais: admin, sala_tecnica, gestor_contrato
  if (level === 'admin' || level === 'sala_tecnica_afirmaevias' || level === 'gestor_contrato') {
    return true;
  }

  // cliente_supervisor: verifica supervisores_responsaveis da regional
  if (level === 'cliente_supervisor') {
    const userEmail = (user.email || '').toLowerCase();
    const supervisores = (regional?.supervisores_responsaveis || []).map(e => e.toLowerCase());
    return supervisores.includes(userEmail);
  }

  // cliente comum, user, funcionarios_cliente: não podem aprovar
  return false;
}

// Níveis de acesso do staff da Afirma Evias (não-cliente)
const AFIRMAEVIAS_STAFF_LEVELS = new Set([
  'user', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'admin',
]);

/**
 * Verifica se o criador de um registro é staff do cliente (não Afirma Evias).
 *
 * Prioridade:
 * 1. Se allUsers disponível → checa access_level do criador (mais preciso)
 * 2. Fallback → checa se email está em clientes_responsaveis da regional
 */
function isCreatorClienteSide(createdByEmail, allUsers, clientesEmails, staffEmails) {
  if (!createdByEmail) return false;
  const email = createdByEmail.toLowerCase();
  // Se temos allUsers, checamos o access_level do criador
  if (allUsers && allUsers.length > 0) {
    const creator = allUsers.find(u => (u.email || '').toLowerCase() === email);
    if (creator) {
      const creatorLevel = creator.access_level || (creator.role === 'admin' ? 'admin' : 'user');
      return !AFIRMAEVIAS_STAFF_LEVELS.has(creatorLevel);
    }
  }
  // Fallback: checa se email está em clientes_responsaveis (comportamento original)
  if (clientesEmails && clientesEmails.includes(email)) return true;
  // Fallback final: o RLS impede o supervisor de ler o access_level dos criadores.
  // Se o criador não é staff da Afirma Evias vinculado à regional, tratamos como
  // pessoal do cliente (o backend revalida a permissão na assinatura).
  if (staffEmails) return !staffEmails.includes(email);
  return false;
}

/**
 * Verifica se um usuário pode aprovar/reprovar um registro ESPECÍFICO.
 *
 * - Approvers globais (admin, sala_tecnica, gestor_contrato): podem aprovar
 *   qualquer registro finalizado, independente de quem o criou.
 * - cliente_supervisor: só pode aprovar se:
 *   (a) seu email estiver em supervisores_responsaveis da regional do registro; E
 *   (b) o registro foi criado por um funcionário do cliente (não staff Afirma Evias).
 * - Outros níveis: não podem aprovar.
 */
export function canApproveRecord(user, record, regional, allUsers) {
  if (!user) return false;
  const level = getUserAccessLevel(user);

  // Approvers globais
  if (level === 'admin' || level === 'sala_tecnica_afirmaevias' || level === 'gestor_contrato') {
    return true;
  }

  // cliente_supervisor: pode aprovar/reprovar qualquer registro finalizado
  // das regionais onde é supervisor (todos os lotes sob sua supervisão)
  if (level === 'cliente_supervisor') {
    const userEmail = (user.email || '').toLowerCase();
    const supervisores = (regional?.supervisores_responsaveis || []).map(e => e.toLowerCase());
    return supervisores.includes(userEmail);
  }

  return false;
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
  const rawLevel = getUserAccessLevel(user);
  const emailLower = (user.email || '').toLowerCase();
  const supervisorEmailLower = (user.supervisor_email || '').toLowerCase();
  return regionais.filter(regional => {
    if (regional.status === 'inativa') return false;
    if (level === 'cliente') {
      // cliente e cliente_supervisor: checa clientes_responsaveis e supervisores_responsaveis
      const clientes = (regional.clientes_responsaveis || []).map(e => e.toLowerCase());
      const supervisores = (regional.supervisores_responsaveis || []).map(e => e.toLowerCase());
      return clientes.includes(emailLower) || supervisores.includes(emailLower);
    }
    if (level === 'sala_tecnica_afirmaevias') {
      return (regional.salas_tecnicas_responsaveis || []).some(
        email => email.toLowerCase() === emailLower
      );
    }
    if (level === 'gestor_contrato') {
      return (
        regional.gestor_contrato_responsavel?.toLowerCase() === emailLower ||
        (regional.gestores_contrato_responsaveis || []).some(
          email => email.toLowerCase() === emailLower
        )
      );
    }
    // funcionarios_cliente: checa clientes_responsaveis via supervisor ou próprio email
    if (rawLevel === 'funcionarios_cliente') {
      const clientes = (regional.clientes_responsaveis || []).map(e => e.toLowerCase());
      return clientes.includes(emailLower) ||
        (supervisorEmailLower && clientes.includes(supervisorEmailLower));
    }
    // user (laboratorista): pode ver regionais onde está alocado
    if (level === 'user') {
      return (regional.laboratoristas_responsaveis || []).some(
        email => email.toLowerCase() === emailLower
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