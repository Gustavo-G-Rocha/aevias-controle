/**
 * Funções puras para a página Users.
 * Sem dependências de React ou Base44.
 */
import { format, isAfter, subMinutes } from "date-fns";

// ── Labels e badges ───────────────────────────────────────────────────────────

export function getAccessLevelLabel(accessLevel) {
  switch (accessLevel) {
    case 'admin':                    return 'Administrador';
    case 'sala_tecnica_afirmaevias': return 'Sala Técnica';
    case 'gestor_contrato':          return 'Gestor Contrato';
    case 'user':                     return 'Laboratorista';
    case 'cliente':                  return 'Cliente';
    case 'cliente_supervisor':       return 'Cliente Supervisor';
    case 'funcionarios_cliente':     return 'Funcionário Cliente';
    default:                         return 'Desconhecido';
  }
}

export function getAccessLevelBadgeVariant(accessLevel) {
  switch (accessLevel) {
    case 'admin':                    return 'default';
    case 'sala_tecnica_afirmaevias': return 'outline';
    case 'gestor_contrato':          return 'secondary';
    case 'user':                     return 'secondary';
    case 'cliente':                  return 'outline';
    case 'cliente_supervisor':       return 'outline';
    case 'funcionarios_cliente':     return 'secondary';
    default:                         return 'secondary';
  }
}

// ── Status de login ───────────────────────────────────────────────────────────

export function getLoginStatus(user) {
  const activityDate = user.last_login || user.updated_date;

  if (!activityDate) {
    return { status: 'offline', text: 'Sem atividade registrada', variant: 'secondary' };
  }

  try {
    const date = new Date(activityDate);
    const fiveMinutesAgo = subMinutes(new Date(), 5);

    if (isAfter(date, fiveMinutesAgo)) {
      return { status: 'online', text: 'Online', variant: 'default' };
    }

    const formatted = format(date, "dd/MM/yyyy 'às' HH:mm");
    const label = user.last_login ? 'Último acesso' : 'Última atividade';
    return { status: 'offline', text: `${label}: ${formatted}`, variant: 'secondary' };
  } catch {
    return { status: 'offline', text: 'Sem atividade registrada', variant: 'secondary' };
  }
}

// ── Regional do usuário ───────────────────────────────────────────────────────

export function getRegionalForUser(userEmail, regionais) {
  if (!userEmail || !regionais) return null;
  const emailLower = userEmail.toLowerCase();
  return regionais.find(r => {
    if (r.laboratoristas_responsaveis?.some(e => e.toLowerCase() === emailLower)) return true;
    if (r.gestor_contrato_responsavel?.toLowerCase() === emailLower) return true;
    if (r.gestores_contrato_responsaveis?.some(e => e.toLowerCase() === emailLower)) return true;
    if (r.salas_tecnicas_responsaveis?.some(e => e.toLowerCase() === emailLower)) return true;
    if (r.clientes_responsaveis?.some(e => e.toLowerCase() === emailLower)) return true;
    return false;
  }) || null;
}

// ── Filtro de busca ───────────────────────────────────────────────────────────

export function filterUsers(users, searchTerm) {
  if (!searchTerm) return users;
  const term = searchTerm.toLowerCase();
  return users.filter(u =>
    u.laboratorista_name?.toLowerCase().includes(term) ||
    u.email?.toLowerCase().includes(term) ||
    (u.company  && u.company.toLowerCase().includes(term)) ||
    (u.position && u.position.toLowerCase().includes(term))
  );
}

// ── Permissões ────────────────────────────────────────────────────────────────

export function resolveAccessLevel(user) {
  return user?.access_level || (user?.role === 'admin' ? 'admin' : 'user');
}

export function deriveRoleFromAccessLevel(accessLevel) {
  return ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'].includes(accessLevel) ? 'admin' : 'user';
}

// ── Filtro de usuários por regional (para não-admins) ─────────────────────────

export function getEmailsPermitidosPorRegional(regionaisDoUsuario) {
  const emailsPermitidos = new Set();
  regionaisDoUsuario.forEach(regional => {
    regional.laboratoristas_responsaveis?.forEach(e => emailsPermitidos.add(e.toLowerCase()));
    if (regional.gestor_contrato_responsavel) {
      emailsPermitidos.add(regional.gestor_contrato_responsavel.toLowerCase());
    }
    regional.salas_tecnicas_responsaveis?.forEach(e => emailsPermitidos.add(e.toLowerCase()));
    regional.clientes_responsaveis?.forEach(e => emailsPermitidos.add(e.toLowerCase()));
  });
  return emailsPermitidos;
}

export function getRegionaisDoUsuario(accessLevel, userEmail, regionais) {
  const effectiveLevel = accessLevel === 'cliente_supervisor' ? 'cliente'
    : accessLevel === 'funcionarios_cliente' ? 'user'
    : accessLevel;
  return regionais.filter(regional => {
    if (effectiveLevel === 'sala_tecnica_afirmaevias') {
      const salas = regional.salas_tecnicas_responsaveis || [];
      return salas.some(e => e.toLowerCase() === userEmail.toLowerCase());
    }
    if (effectiveLevel === 'gestor_contrato') {
      return regional.gestor_contrato_responsavel?.toLowerCase() === userEmail.toLowerCase();
    }
    if (effectiveLevel === 'cliente') {
      const clientes = regional.clientes_responsaveis || [];
      return clientes.some(e => e.toLowerCase() === userEmail.toLowerCase());
    }
    if (effectiveLevel === 'user') {
      const labs = regional.laboratoristas_responsaveis || [];
      return labs.some(e => e.toLowerCase() === userEmail.toLowerCase());
    }
    return false;
  });
}

// ── Validação de domínio de email ─────────────────────────────────────────────

export const ALLOWED_DOMAINS_GENERAL = [
  'afirmaevias.com.br', 'gmail.com', 'grupoepr.com.br', 'eprlpioneiro.com.br',
  'epriguacu.com.br', 'ecovias.com.br', 'ecorodovias.com.br', 'eco050.com.br',
];

export function validateEmailDomain(email, accessLevel) {
  const domain = email.toLowerCase().split('@')[1];
  if (accessLevel === 'sala_tecnica_afirmaevias' || accessLevel === 'gestor_contrato') {
    if (domain !== 'afirmaevias.com.br') {
      return 'Para os níveis de acesso "Sala Técnica" e "Gestor de Contrato", apenas o domínio @afirmaevias.com.br é permitido.';
    }
    return null;
  }
  // cliente_supervisor e funcionarios_cliente usam os mesmos domínios gerais do cliente/user
  if (!ALLOWED_DOMAINS_GENERAL.includes(domain)) {
    return 'Apenas emails dos domínios autorizados são permitidos: ' + ALLOWED_DOMAINS_GENERAL.join(', ');
  }
  return null;
}

// ── Sanitização dos campos do formulário antes de salvar ──────────────────────

export function sanitizeUserFormData(formData) {
  const cleaned = { ...formData };
  if (!cleaned.phone    || cleaned.phone.trim()    === '' || cleaned.phone    === '(XX) XXXXX-XXXX')  delete cleaned.phone;
  if (!cleaned.crea_number || cleaned.crea_number.trim() === '' || cleaned.crea_number === 'Ex: CREA-PR 12345/D') delete cleaned.crea_number;
  if (!cleaned.position || cleaned.position.trim() === '') delete cleaned.position;
  cleaned.role = deriveRoleFromAccessLevel(cleaned.access_level);
  return cleaned;
}