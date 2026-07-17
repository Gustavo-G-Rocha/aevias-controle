/**
 * tests/services/dashboardService.test.js
 * Cobre o filtro de dados do Dashboard por nível de acesso:
 * admin vê tudo; user só o que criou; gestor/sala técnica só suas regionais;
 * cliente só registros aprovados/assinados das obras das suas regionais.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/api/base44Client', () => ({ base44: {} }));
vi.mock('@/services/recordsService', () => ({
  loadAllRecords: vi.fn(),
  loadAuxData: vi.fn(),
}));
vi.mock('@/utils/accessControl', () => ({
  getEffectiveAccessLevel: vi.fn(),
  filterRegionaisByUser: vi.fn(),
  isCliente: vi.fn(() => false),
}));

import { loadAllRecords, loadAuxData } from '@/services/recordsService';
import { getEffectiveAccessLevel, filterRegionaisByUser, isCliente } from '@/utils/accessControl';
import { loadDashboardData } from '@/services/dashboardService';

const REGIONAIS = [
  { id: 'reg-1', project_ids: ['p1'] },
  { id: 'reg-2', project_ids: ['p2'] },
];
const OBRAS = [
  { id: 'obra-1', regional_id: 'reg-1' },
  { id: 'obra-2', regional_id: 'reg-2' },
];
const PROJECTS = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }];
const ENSAIOS = [
  { id: 'e1', obra_id: 'obra-1', created_by: 'lab@x.com', approved: true },
  { id: 'e2', obra_id: 'obra-1', created_by: 'outro@x.com', approved: null },
  { id: 'e3', obra_id: 'obra-2', created_by: 'lab@x.com', approved: false, client_signature: { signed_by: 'cli@x.com' } },
  { id: 'e4', obra_id: 'obra-2', created_by: 'outro@x.com', approved: null },
];

beforeEach(() => {
  vi.clearAllMocks();
  loadAllRecords.mockResolvedValue(ENSAIOS);
  loadAuxData.mockResolvedValue({ obras: OBRAS, projects: PROJECTS, regionais: REGIONAIS });
  isCliente.mockReturnValue(false);
});

describe('loadDashboardData — níveis de acesso', () => {
  it('admin vê todos os registros, obras e projetos', async () => {
    getEffectiveAccessLevel.mockReturnValue('admin');

    const r = await loadDashboardData({ email: 'admin@x.com' });

    expect(r.ensaios).toHaveLength(4);
    expect(r.obras).toHaveLength(2);
    expect(r.projects).toHaveLength(3);
    expect(loadAllRecords).toHaveBeenCalledWith('dashboard');
    expect(loadAuxData).toHaveBeenCalledWith({ needsRegionais: false });
  });

  it('laboratorista (user) vê apenas registros criados por ele', async () => {
    getEffectiveAccessLevel.mockReturnValue('user');

    const r = await loadDashboardData({ email: 'lab@x.com' });

    expect(r.ensaios.map(e => e.id)).toEqual(['e1', 'e3']);
  });

  it('gestor de contrato vê apenas obras/registros das suas regionais', async () => {
    getEffectiveAccessLevel.mockReturnValue('gestor_contrato');
    filterRegionaisByUser.mockReturnValue([REGIONAIS[0]]); // só reg-1

    const r = await loadDashboardData({ email: 'gestor@x.com' });

    expect(r.obras.map(o => o.id)).toEqual(['obra-1']);
    expect(r.projects.map(p => p.id)).toEqual(['p1']);
    expect(r.ensaios.map(e => e.id)).toEqual(['e1', 'e2']);
    expect(loadAuxData).toHaveBeenCalledWith({ needsRegionais: true });
  });

  it('cliente vê apenas registros APROVADOS ou ASSINADOS das suas regionais', async () => {
    getEffectiveAccessLevel.mockReturnValue('cliente');
    isCliente.mockReturnValue(true);
    filterRegionaisByUser.mockReturnValue(REGIONAIS); // ambas as regionais

    const r = await loadDashboardData({ email: 'cli@x.com' });

    // e1 aprovado, e3 assinado; e2/e4 pendentes ficam de fora
    expect(r.ensaios.map(e => e.id)).toEqual(['e1', 'e3']);
  });

  it('cliente sem regionais não vê nenhum registro', async () => {
    getEffectiveAccessLevel.mockReturnValue('cliente');
    isCliente.mockReturnValue(true);
    filterRegionaisByUser.mockReturnValue([]);

    const r = await loadDashboardData({ email: 'cli@x.com' });

    expect(r.ensaios).toHaveLength(0);
    expect(r.obras).toHaveLength(0);
    expect(r.projects).toHaveLength(0);
  });
});