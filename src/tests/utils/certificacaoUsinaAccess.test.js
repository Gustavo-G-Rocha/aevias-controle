import { describe, it, expect } from 'vitest';
import {
  getGestoresDaRegional,
  isGestorDaRegional,
  resolverRegionalDaObra,
  isGestorDaRegionalDaObra,
  canGestorPreencherResultado,
  laboratoristaDeveOcultarResultado,
} from '@/utils/certificacaoUsinaAccess';

const gestor = { email: 'gestor@test.com', access_level: 'gestor_contrato' };
const lab = { email: 'lab@test.com', role: 'user' };
const admin = { email: 'admin@test.com', role: 'admin' };

const regionalComGestor = {
  id: 'r1',
  gestores_contrato_responsaveis: ['gestor@test.com'],
  gestor_contrato_responsavel: null,
};
const regionalLegado = {
  id: 'r2',
  gestores_contrato_responsaveis: [],
  gestor_contrato_responsavel: 'legado@test.com',
};
const obra = { id: 'o1', regional_id: 'r1' };
const regionais = [regionalComGestor, regionalLegado, { id: 'r3', gestores_contrato_responsaveis: [] }];

describe('getGestoresDaRegional', () => {
  it('unifica lista atual e campo legado, normalizando e deduplicando', () => {
    const r = { gestores_contrato_responsaveis: ['A@Test.com', 'a@test.com'], gestor_contrato_responsavel: 'B@Test.com' };
    expect(getGestoresDaRegional(r)).toEqual(['a@test.com', 'b@test.com']);
  });
  it('retorna vazio para regional nula', () => {
    expect(getGestoresDaRegional(null)).toEqual([]);
  });
});

describe('isGestorDaRegional', () => {
  it('retorna true para gestor alocado (case-insensitive)', () => {
    expect(isGestorDaRegional({ email: 'GESTOR@test.com', access_level: 'gestor_contrato' }, regionalComGestor)).toBe(true);
  });
  it('reconhece o campo legado', () => {
    expect(isGestorDaRegional({ email: 'legado@test.com', access_level: 'gestor_contrato' }, regionalLegado)).toBe(true);
  });
  it('retorna false para gestor não alocado na regional', () => {
    expect(isGestorDaRegional({ email: 'outro@test.com', access_level: 'gestor_contrato' }, regionalComGestor)).toBe(false);
  });
  it('retorna false quando o usuário não é gestor de contrato', () => {
    expect(isGestorDaRegional({ email: 'gestor@test.com', access_level: 'cliente' }, regionalComGestor)).toBe(false);
  });
});

describe('resolverRegionalDaObra', () => {
  it('encontra a regional da obra', () => {
    expect(resolverRegionalDaObra(obra, regionais)).toBe(regionalComGestor);
  });
  it('retorna null quando obra não tem regional correspondente', () => {
    expect(resolverRegionalDaObra({ id: 'x', regional_id: 'z' }, regionais)).toBeNull();
  });
});

describe('isGestorDaRegionalDaObra', () => {
  it('true quando gestor é responsável pela regional da obra', () => {
    expect(isGestorDaRegionalDaObra(gestor, obra, regionais)).toBe(true);
  });
  it('false para laboratorista', () => {
    expect(isGestorDaRegionalDaObra(lab, obra, regionais)).toBe(false);
  });
});

describe('canGestorPreencherResultado', () => {
  const editing = { id: 'c1', approved: null };
  it('permite gestor da regional editar registro existente não aprovado', () => {
    expect(canGestorPreencherResultado(gestor, editing, obra, regionais)).toBe(true);
  });
  it('bloqueia registro já aprovado', () => {
    expect(canGestorPreencherResultado(gestor, { id: 'c1', approved: true }, obra, regionais)).toBe(false);
  });
  it('bloqueia quando não há registro existente (criação)', () => {
    expect(canGestorPreencherResultado(gestor, null, obra, regionais)).toBe(false);
  });
  it('bloqueia laboratorista', () => {
    expect(canGestorPreencherResultado(lab, editing, obra, regionais)).toBe(false);
  });
});

describe('laboratoristaDeveOcultarResultado', () => {
  it('true para laboratorista puro', () => {
    expect(laboratoristaDeveOcultarResultado(lab)).toBe(true);
  });
  it('false para admin', () => {
    expect(laboratoristaDeveOcultarResultado(admin)).toBe(false);
  });
  it('false para gestor de contrato', () => {
    expect(laboratoristaDeveOcultarResultado(gestor)).toBe(false);
  });
});