import { describe, it, expect } from 'vitest';
import { filterRegionaisByAccessLevel } from '@/utils/regionalFilter';

const makeRegional = (overrides = {}) => ({
  id: 'r1',
  status: 'ativa',
  laboratoristas_responsaveis: [],
  gestores_contrato_responsaveis: [],
  gestor_contrato_responsavel: null,
  salas_tecnicas_responsaveis: [],
  clientes_responsaveis: [],
  ...overrides,
});

const makeUser = (overrides = {}) => ({
  email: 'user@test.com',
  role: 'user',
  ...overrides,
});

describe('filterRegionaisByAccessLevel', () => {
  it('retorna [] quando regionais é nulo', () => {
    expect(filterRegionaisByAccessLevel(null, makeUser())).toEqual([]);
  });

  it('retorna [] quando user é nulo', () => {
    expect(filterRegionaisByAccessLevel([makeRegional()], null)).toEqual([]);
  });

  it('admin — retorna apenas regionais ativas', () => {
    const regionais = [
      makeRegional({ id: 'r1', status: 'ativa' }),
      makeRegional({ id: 'r2', status: 'inativa' }),
    ];
    const user = makeUser({ role: 'admin' });
    const result = filterRegionaisByAccessLevel(regionais, user);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('r1');
  });

  it('gestor_contrato — retorna regional pelo campo novo', () => {
    const regional = makeRegional({ gestores_contrato_responsaveis: ['gestor@test.com'] });
    const user = makeUser({ access_level: 'gestor_contrato', email: 'gestor@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(1);
  });

  it('gestor_contrato — retorna regional pelo campo legado', () => {
    const regional = makeRegional({ gestor_contrato_responsavel: 'gestor@test.com' });
    const user = makeUser({ access_level: 'gestor_contrato', email: 'gestor@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(1);
  });

  it('gestor_contrato — não retorna regional inativa', () => {
    const regional = makeRegional({
      status: 'inativa',
      gestores_contrato_responsaveis: ['gestor@test.com'],
    });
    const user = makeUser({ access_level: 'gestor_contrato', email: 'gestor@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(0);
  });

  it('sala_tecnica — retorna regional correspondente', () => {
    const regional = makeRegional({ salas_tecnicas_responsaveis: ['sala@test.com'] });
    const user = makeUser({ access_level: 'sala_tecnica_afirmaevias', email: 'sala@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(1);
  });

  it('cliente — retorna regional correspondente', () => {
    const regional = makeRegional({ clientes_responsaveis: ['cliente@test.com'] });
    const user = makeUser({ access_level: 'cliente', email: 'cliente@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(1);
  });

  it('laboratorista — retorna regional correspondente', () => {
    const regional = makeRegional({ laboratoristas_responsaveis: ['lab@test.com'] });
    const user = makeUser({ email: 'lab@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(1);
  });

  it('laboratorista — não retorna regional de outro lab', () => {
    const regional = makeRegional({ laboratoristas_responsaveis: ['outro@test.com'] });
    const user = makeUser({ email: 'lab@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(0);
  });

  it('comparação de email é case-insensitive', () => {
    const regional = makeRegional({ laboratoristas_responsaveis: ['LAB@TEST.COM'] });
    const user = makeUser({ email: 'lab@test.com' });
    const result = filterRegionaisByAccessLevel([regional], user);
    expect(result.length).toBe(1);
  });
});