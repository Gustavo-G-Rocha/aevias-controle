import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAccessLevelLabel,
  getAccessLevelBadgeVariant,
  getLoginStatus,
  getRegionalForUser,
  filterUsers,
  resolveAccessLevel,
  deriveRoleFromAccessLevel,
  getEmailsPermitidosPorRegional,
  getRegionaisDoUsuario,
  validateEmailDomain,
  ALLOWED_DOMAINS_GENERAL,
  sanitizeUserFormData,
} from '../../utils/usersUtils';

// ── getAccessLevelLabel ───────────────────────────────────────────────────────
describe('getAccessLevelLabel', () => {
  it('admin → Administrador',              () => expect(getAccessLevelLabel('admin')).toBe('Administrador'));
  it('sala_tecnica → Sala Técnica',         () => expect(getAccessLevelLabel('sala_tecnica_afirmaevias')).toBe('Sala Técnica'));
  it('gestor_contrato → Gestor Contrato',   () => expect(getAccessLevelLabel('gestor_contrato')).toBe('Gestor Contrato'));
  it('user → Laboratorista',               () => expect(getAccessLevelLabel('user')).toBe('Laboratorista'));
  it('cliente → Cliente',                  () => expect(getAccessLevelLabel('cliente')).toBe('Cliente'));
  it('desconhecido → Desconhecido',         () => expect(getAccessLevelLabel('other')).toBe('Desconhecido'));
});

// ── getAccessLevelBadgeVariant ────────────────────────────────────────────────
describe('getAccessLevelBadgeVariant', () => {
  it('admin → default',   () => expect(getAccessLevelBadgeVariant('admin')).toBe('default'));
  it('user → secondary',  () => expect(getAccessLevelBadgeVariant('user')).toBe('secondary'));
  it('cliente → outline', () => expect(getAccessLevelBadgeVariant('cliente')).toBe('outline'));
  it('unknown → secondary', () => expect(getAccessLevelBadgeVariant('xyz')).toBe('secondary'));
});

// ── getLoginStatus ────────────────────────────────────────────────────────────
describe('getLoginStatus', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2024-06-01T10:00:00Z')); });
  afterEach(() => { vi.useRealTimers(); });

  it('retorna offline quando sem datas', () => {
    expect(getLoginStatus({}).status).toBe('offline');
  });
  it('retorna online quando last_login há menos de 5 minutos', () => {
    const user = { last_login: new Date('2024-06-01T09:57:00Z').toISOString() };
    expect(getLoginStatus(user).status).toBe('online');
  });
  it('retorna offline quando last_login há mais de 5 minutos', () => {
    const user = { last_login: new Date('2024-06-01T09:54:00Z').toISOString() };
    const result = getLoginStatus(user);
    expect(result.status).toBe('offline');
    expect(result.text).toContain('Último acesso');
  });
  it('usa updated_date como fallback quando sem last_login', () => {
    const user = { updated_date: new Date('2024-05-30T10:00:00Z').toISOString() };
    const result = getLoginStatus(user);
    expect(result.text).toContain('Última atividade');
  });
  it('retorna offline para data inválida', () => {
    expect(getLoginStatus({ last_login: 'not-a-date' }).status).toBe('offline');
  });
});

// ── getRegionalForUser ────────────────────────────────────────────────────────
describe('getRegionalForUser', () => {
  const regionais = [
    { nome: 'R1', laboratoristas_responsaveis: ['lab@a.com'], salas_tecnicas_responsaveis: [], clientes_responsaveis: [] },
    { nome: 'R2', gestor_contrato_responsavel: 'gestor@a.com', laboratoristas_responsaveis: [], clientes_responsaveis: [] },
  ];

  it('encontra regional pelo laboratorista', () =>
    expect(getRegionalForUser('lab@a.com', regionais).nome).toBe('R1'));
  it('encontra regional pelo gestor', () =>
    expect(getRegionalForUser('gestor@a.com', regionais).nome).toBe('R2'));
  it('retorna null quando email não encontrado', () =>
    expect(getRegionalForUser('unknown@x.com', regionais)).toBeNull());
  it('retorna null quando email ausente', () =>
    expect(getRegionalForUser(null, regionais)).toBeNull());
  it('é case-insensitive', () =>
    expect(getRegionalForUser('LAB@A.COM', regionais).nome).toBe('R1'));
});

// ── filterUsers ───────────────────────────────────────────────────────────────
describe('filterUsers', () => {
  const users = [
    { laboratorista_name: 'João Silva', email: 'joao@a.com', company: 'EVIAS', position: 'Eng' },
    { laboratorista_name: 'Maria Costa', email: 'maria@b.com', company: 'LAB', position: 'Tec' },
  ];

  it('retorna todos quando searchTerm vazio', () => expect(filterUsers(users, '').length).toBe(2));
  it('filtra por nome',    () => expect(filterUsers(users, 'joão')).toHaveLength(1));
  it('filtra por email',   () => expect(filterUsers(users, 'maria@b')).toHaveLength(1));
  it('filtra por empresa', () => expect(filterUsers(users, 'evias')).toHaveLength(1));
  it('filtra por cargo',   () => expect(filterUsers(users, 'tec')).toHaveLength(1));
  it('retorna [] quando sem match', () => expect(filterUsers(users, 'zzz')).toHaveLength(0));
});

// ── resolveAccessLevel ────────────────────────────────────────────────────────
describe('resolveAccessLevel', () => {
  it('usa access_level quando presente', () =>
    expect(resolveAccessLevel({ access_level: 'cliente' })).toBe('cliente'));
  it('usa role=admin como fallback', () =>
    expect(resolveAccessLevel({ role: 'admin' })).toBe('admin'));
  it('retorna user como padrão', () =>
    expect(resolveAccessLevel({ role: 'user' })).toBe('user'));
  it('retorna user para null', () =>
    expect(resolveAccessLevel(null)).toBe('user'));
});

// ── deriveRoleFromAccessLevel ─────────────────────────────────────────────────
describe('deriveRoleFromAccessLevel', () => {
  it('admin → admin',                     () => expect(deriveRoleFromAccessLevel('admin')).toBe('admin'));
  it('sala_tecnica → admin',              () => expect(deriveRoleFromAccessLevel('sala_tecnica_afirmaevias')).toBe('admin'));
  it('gestor_contrato → admin',           () => expect(deriveRoleFromAccessLevel('gestor_contrato')).toBe('admin'));
  it('user → user',                       () => expect(deriveRoleFromAccessLevel('user')).toBe('user'));
  it('cliente → user',                    () => expect(deriveRoleFromAccessLevel('cliente')).toBe('user'));
});

// ── getEmailsPermitidosPorRegional ────────────────────────────────────────────
describe('getEmailsPermitidosPorRegional', () => {
  it('coleta todos os emails da regional', () => {
    const regionais = [{
      laboratoristas_responsaveis: ['lab@a.com'],
      gestor_contrato_responsavel: 'gestor@a.com',
      salas_tecnicas_responsaveis: ['sala@a.com'],
      clientes_responsaveis: ['cliente@b.com'],
    }];
    const set = getEmailsPermitidosPorRegional(regionais);
    expect(set.has('lab@a.com')).toBe(true);
    expect(set.has('gestor@a.com')).toBe(true);
    expect(set.has('sala@a.com')).toBe(true);
    expect(set.has('cliente@b.com')).toBe(true);
  });
  it('retorna Set vazio para array vazio', () =>
    expect(getEmailsPermitidosPorRegional([]).size).toBe(0));
});

// ── getRegionaisDoUsuario ─────────────────────────────────────────────────────
describe('getRegionaisDoUsuario', () => {
  const regionais = [
    { nome: 'R1', salas_tecnicas_responsaveis: ['sala@a.com'], gestor_contrato_responsavel: null, clientes_responsaveis: [] },
    { nome: 'R2', gestor_contrato_responsavel: 'gestor@a.com', salas_tecnicas_responsaveis: [], clientes_responsaveis: [] },
    { nome: 'R3', clientes_responsaveis: ['cli@b.com'], salas_tecnicas_responsaveis: [], gestor_contrato_responsavel: null },
  ];

  it('filtra por sala_tecnica', () =>
    expect(getRegionaisDoUsuario('sala_tecnica_afirmaevias', 'sala@a.com', regionais).map(r => r.nome)).toEqual(['R1']));
  it('filtra por gestor_contrato', () =>
    expect(getRegionaisDoUsuario('gestor_contrato', 'gestor@a.com', regionais).map(r => r.nome)).toEqual(['R2']));
  it('filtra por cliente', () =>
    expect(getRegionaisDoUsuario('cliente', 'cli@b.com', regionais).map(r => r.nome)).toEqual(['R3']));
  it('retorna [] para role desconhecido', () =>
    expect(getRegionaisDoUsuario('admin', 'x@x.com', regionais)).toEqual([]));
});

// ── validateEmailDomain ───────────────────────────────────────────────────────
describe('validateEmailDomain', () => {
  it('aceita @afirmaevias.com.br para sala_tecnica', () =>
    expect(validateEmailDomain('user@afirmaevias.com.br', 'sala_tecnica_afirmaevias')).toBeNull());
  it('rejeita outro domínio para sala_tecnica', () =>
    expect(validateEmailDomain('user@gmail.com', 'sala_tecnica_afirmaevias')).toBeTruthy());
  it('aceita domínio geral para user', () =>
    expect(validateEmailDomain('user@gmail.com', 'user')).toBeNull());
  it('rejeita domínio não autorizado para user', () =>
    expect(validateEmailDomain('user@desconhecido.com', 'user')).toBeTruthy());
  it('ALLOWED_DOMAINS_GENERAL inclui afirmaevias.com.br', () =>
    expect(ALLOWED_DOMAINS_GENERAL).toContain('afirmaevias.com.br'));
});

// ── sanitizeUserFormData ──────────────────────────────────────────────────────
describe('sanitizeUserFormData', () => {
  it('remove phone placeholder', () => {
    const result = sanitizeUserFormData({ phone: '(XX) XXXXX-XXXX', access_level: 'user' });
    expect(result.phone).toBeUndefined();
  });
  it('remove crea_number placeholder', () => {
    const result = sanitizeUserFormData({ crea_number: 'Ex: CREA-PR 12345/D', access_level: 'user' });
    expect(result.crea_number).toBeUndefined();
  });
  it('remove position vazio', () => {
    const result = sanitizeUserFormData({ position: '  ', access_level: 'user' });
    expect(result.position).toBeUndefined();
  });
  it('define role=admin para admin', () => {
    expect(sanitizeUserFormData({ access_level: 'admin' }).role).toBe('admin');
  });
  it('define role=user para user', () => {
    expect(sanitizeUserFormData({ access_level: 'user' }).role).toBe('user');
  });
  it('mantém phone válido', () => {
    const result = sanitizeUserFormData({ phone: '(41) 99999-9999', access_level: 'user' });
    expect(result.phone).toBe('(41) 99999-9999');
  });
});