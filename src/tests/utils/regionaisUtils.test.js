/**
 * Testes das funções puras do módulo regionaisUtils.
 */
import { describe, it, expect } from 'vitest';
import {
  getUserAccessLevel,
  calcularPermissoes,
  filtrarRegionaisPorAcesso,
  filtrarRegionaisPorBusca,
  filtrarObrasPorStatus,
  getProjetosNaRegional,
} from '@/utils/regionaisUtils';

// ─── getUserAccessLevel ───────────────────────────────────────────────────────
describe('getUserAccessLevel', () => {
  it('retorna "admin" para user com role admin', () => {
    expect(getUserAccessLevel({ role: 'admin' })).toBe('admin');
  });

  it('retorna access_level quando definido', () => {
    expect(getUserAccessLevel({ role: 'user', access_level: 'sala_tecnica_afirmaevias' })).toBe('sala_tecnica_afirmaevias');
  });

  it('retorna "user" quando nenhum nível está definido', () => {
    expect(getUserAccessLevel({ role: 'user' })).toBe('user');
  });

  it('retorna "user" quando user é null', () => {
    expect(getUserAccessLevel(null)).toBe('user');
  });

  it('access_level tem precedência sobre role admin', () => {
    // um usuário com role admin mas access_level explícito deve usar o access_level
    expect(getUserAccessLevel({ role: 'admin', access_level: 'gestor_contrato' })).toBe('gestor_contrato');
  });
});

// ─── calcularPermissoes ───────────────────────────────────────────────────────
describe('calcularPermissoes', () => {
  it('admin tem isAdmin=true e canManage=true', () => {
    const p = calcularPermissoes('admin');
    expect(p.isAdmin).toBe(true);
    expect(p.canManage).toBe(true);
    expect(p.isLaboratorista).toBe(false);
  });

  it('sala_tecnica tem canManage=true e isAdmin=false', () => {
    const p = calcularPermissoes('sala_tecnica_afirmaevias');
    expect(p.isSalaTecnica).toBe(true);
    expect(p.canManage).toBe(true);
    expect(p.isAdmin).toBe(false);
  });

  it('gestor_contrato tem canManage=true', () => {
    const p = calcularPermissoes('gestor_contrato');
    expect(p.isGestorContrato).toBe(true);
    expect(p.canManage).toBe(true);
  });

  it('user/laboratorista tem canManage=false e isLaboratorista=true', () => {
    const p = calcularPermissoes('user');
    expect(p.isLaboratorista).toBe(true);
    expect(p.canManage).toBe(false);
    expect(p.isAdmin).toBe(false);
  });
});

// ─── filtrarRegionaisPorAcesso ────────────────────────────────────────────────
describe('filtrarRegionaisPorAcesso', () => {
  const regionais = [
    { id: 'r1', gestores_contrato_responsaveis: ['gestor@test.com'], salas_tecnicas_responsaveis: [], laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', gestores_contrato_responsaveis: [], salas_tecnicas_responsaveis: ['sala@test.com'], laboratoristas_responsaveis: [] },
    { id: 'r3', gestores_contrato_responsaveis: [], salas_tecnicas_responsaveis: [], laboratoristas_responsaveis: [] },
  ];

  it('admin vê todas as regionais', () => {
    const user = { email: 'admin@test.com' };
    expect(filtrarRegionaisPorAcesso(regionais, user, 'admin')).toHaveLength(3);
  });

  it('gestor_contrato vê apenas suas regionais', () => {
    const user = { email: 'gestor@test.com' };
    const result = filtrarRegionaisPorAcesso(regionais, user, 'gestor_contrato');
    expect(result.map(r => r.id)).toEqual(['r1']);
  });

  it('sala_tecnica vê apenas regionais onde está vinculada', () => {
    const user = { email: 'sala@test.com' };
    const result = filtrarRegionaisPorAcesso(regionais, user, 'sala_tecnica_afirmaevias');
    expect(result.map(r => r.id)).toEqual(['r2']);
  });

  it('laboratorista vê apenas sua regional', () => {
    const user = { email: 'lab@test.com' };
    const result = filtrarRegionaisPorAcesso(regionais, user, 'user');
    expect(result.map(r => r.id)).toEqual(['r1']);
  });

  it('laboratorista sem regional retorna array vazio', () => {
    const user = { email: 'outro@test.com' };
    expect(filtrarRegionaisPorAcesso(regionais, user, 'user')).toEqual([]);
  });

  it('gestor_contrato — compatível com campo legado gestor_contrato_responsavel', () => {
    const regionaisLegado = [{ id: 'r4', gestor_contrato_responsavel: 'gestor_legado@test.com', laboratoristas_responsaveis: [] }];
    const user = { email: 'gestor_legado@test.com' };
    const result = filtrarRegionaisPorAcesso(regionaisLegado, user, 'gestor_contrato');
    expect(result.map(r => r.id)).toEqual(['r4']);
  });

  it('retorna [] quando regionaisData é null', () => {
    expect(filtrarRegionaisPorAcesso(null, { email: 'x@test.com' }, 'admin')).toEqual([]);
  });

  it('retorna [] quando userData é null', () => {
    expect(filtrarRegionaisPorAcesso(regionais, null, 'user')).toEqual([]);
  });

  it('comparação de email é case-insensitive', () => {
    const user = { email: 'LAB@TEST.COM' };
    const result = filtrarRegionaisPorAcesso(regionais, user, 'user');
    expect(result.map(r => r.id)).toEqual(['r1']);
  });
});

// ─── filtrarRegionaisPorBusca ─────────────────────────────────────────────────
describe('filtrarRegionaisPorBusca', () => {
  const regionais = [
    { id: 'r1', nome: 'Regional Norte', codigo: 'RN-001' },
    { id: 'r2', nome: 'Regional Sul', codigo: 'RS-002' },
    { id: 'r3', nome: 'Divisão Centro', codigo: 'DC-003' },
  ];

  it('retorna todas quando searchTerm vazio', () => {
    expect(filtrarRegionaisPorBusca(regionais, '')).toHaveLength(3);
  });

  it('filtra por nome (case-insensitive)', () => {
    const result = filtrarRegionaisPorBusca(regionais, 'norte');
    expect(result.map(r => r.id)).toEqual(['r1']);
  });

  it('filtra por código', () => {
    const result = filtrarRegionaisPorBusca(regionais, 'RS-');
    expect(result.map(r => r.id)).toEqual(['r2']);
  });

  it('retorna múltiplos resultados quando termo é genérico', () => {
    const result = filtrarRegionaisPorBusca(regionais, 'regional');
    expect(result).toHaveLength(2);
  });

  it('retorna array vazio quando nenhum bate', () => {
    expect(filtrarRegionaisPorBusca(regionais, 'XYZ-999')).toHaveLength(0);
  });
});

// ─── filtrarObrasPorStatus ────────────────────────────────────────────────────
describe('filtrarObrasPorStatus', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1', status: 'em_andamento' },
    { id: 'o2', regional_id: 'r1', status: 'concluida' },
    { id: 'o3', regional_id: 'r1', status: 'planejamento' },
    { id: 'o4', regional_id: 'r2', status: 'em_andamento' },
  ];

  it('retorna todas as obras da regional quando statusFilter = "all"', () => {
    expect(filtrarObrasPorStatus(obras, 'r1', 'all')).toHaveLength(3);
  });

  it('filtra por status específico', () => {
    const result = filtrarObrasPorStatus(obras, 'r1', 'em_andamento');
    expect(result.map(o => o.id)).toEqual(['o1']);
  });

  it('não inclui obras de outras regionais', () => {
    const result = filtrarObrasPorStatus(obras, 'r1', 'all');
    expect(result.every(o => o.regional_id === 'r1')).toBe(true);
  });

  it('retorna vazio quando nenhuma obra bate o status', () => {
    expect(filtrarObrasPorStatus(obras, 'r1', 'pausada')).toHaveLength(0);
  });

  it('retorna vazio para regional sem obras', () => {
    expect(filtrarObrasPorStatus(obras, 'r999', 'all')).toHaveLength(0);
  });
});

// ─── getProjetosNaRegional ────────────────────────────────────────────────────
describe('getProjetosNaRegional', () => {
  const projects = [
    { id: 'p1', nome: 'Projeto A' },
    { id: 'p2', nome: 'Projeto B' },
    { id: 'p3', nome: 'Projeto C' },
  ];

  it('retorna projetos listados em project_ids', () => {
    const regional = { project_ids: ['p1', 'p3'] };
    const result = getProjetosNaRegional(projects, regional);
    expect(result.map(p => p.id)).toEqual(['p1', 'p3']);
  });

  it('retorna array vazio quando project_ids não definido', () => {
    expect(getProjetosNaRegional(projects, {})).toHaveLength(0);
  });

  it('retorna array vazio quando project_ids vazio', () => {
    expect(getProjetosNaRegional(projects, { project_ids: [] })).toHaveLength(0);
  });

  it('ignora IDs que não existem nos projetos', () => {
    const regional = { project_ids: ['p1', 'p999'] };
    const result = getProjetosNaRegional(projects, regional);
    expect(result.map(p => p.id)).toEqual(['p1']);
  });
});