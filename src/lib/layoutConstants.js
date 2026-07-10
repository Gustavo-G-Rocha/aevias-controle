// Centralized constants for the Layout module
// Separating configuration from component logic (SRP)

export const SESSION_KEYS = {
  LAST_LOGIN: 'session_login_flag',
  TAB_STACK_PREFIX: 'tab_stack_',
};

export const TAB_ZONES = {
  home: ['/'],
  regionais: ['/Regionais', '/Obra', '/Regional'],
  projects: ['/Projects', '/Project'],
  registros: ['/MeusEnsaios', '/Ensaio', '/Checklist', '/Diario', '/Acompanhamento', '/Boletim'],
};

export const ACCESS_LEVELS = {
  ADMIN: 'admin',
  SALA_TECNICA: 'sala_tecnica_afirmaevias',
  GESTOR_CONTRATO: 'gestor_contrato',
  CLIENTE: 'cliente',
  CLIENTE_SUPERVISOR: 'cliente_supervisor',
  FUNCIONARIOS_CLIENTE: 'funcionarios_cliente',
  USER: 'user',
};

/** Returns the tab zone key for a given pathname, or null */
export function getTabZone(pathname) {
  for (const [zone, prefixes] of Object.entries(TAB_ZONES)) {
    if (prefixes.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'))) {
      return zone;
    }
  }
  return null;
}

/** Derives the effective access level from a user object */
export function getUserAccessLevel(user) {
  return user?.access_level || (user?.role === ACCESS_LEVELS.ADMIN ? ACCESS_LEVELS.ADMIN : ACCESS_LEVELS.USER);
}

/** Returns all synthetic "obra" stubs for non-laboratorist users (so all categories appear) */
export const ALL_OBRA_TYPE_STUBS = [
  { tipo_obra: 'supervisao' },
  { tipo_obra: 'implantacao' },
  { tipo_obra: 'conservacao' },
  { tipo_obra: 'sondagem' },
  { tipo_obra: 'levantamentos' },
  { tipo_obra: 'homologacao_usinas' },
];

/** Níveis que se comportam como "cliente" para exibição de obras/stubs */
export const CLIENTE_LIKE_LEVELS = ['cliente', 'cliente_supervisor'];
/** Níveis que se comportam como "user" (laboratorista) para carregar obras reais */
export const USER_LIKE_LEVELS = ['user', 'funcionarios_cliente'];