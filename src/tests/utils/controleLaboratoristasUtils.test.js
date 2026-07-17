/**
 * Robustez — Estatísticas de laboratoristas (controleLaboratoristasUtils.js)
 *
 * Agregação usada na página de Controle de Laboratoristas. Testa
 * agrupamento, contagem de aprovação, fallbacks de nome e divisão por zero.
 */
import { describe, it, expect } from 'vitest';
import {
  calcularEstatisticasLaboratoristas,
  CONTROLE_LAB_ENTITIES,
} from '../../utils/controleLaboratoristasUtils.js';

describe('calcularEstatisticasLaboratoristas — agregação', () => {
  it('lista vazia → sem estatísticas (não crasha)', () => {
    expect(calcularEstatisticasLaboratoristas([])).toEqual([]);
  });

  it('agrupa registros por laboratorista e conta totais', () => {
    const regs = [
      { laboratorista_name: 'Ana', obra_id: 'o1' },
      { laboratorista_name: 'Ana', obra_id: 'o2' },
      { laboratorista_name: 'Bruno', obra_id: 'o1' },
    ];
    const stats = calcularEstatisticasLaboratoristas(regs);
    const ana = stats.find((s) => s.nome === 'Ana');
    expect(ana.total).toBe(2);
    expect(ana.registrosPorObra).toEqual({ o1: 1, o2: 1 });
    expect(stats.find((s) => s.nome === 'Bruno').total).toBe(1);
  });

  it('conta aprovados/reprovados; pendentes (null) não contam em nenhum', () => {
    const regs = [
      { laboratorista_name: 'Ana', approved: true },
      { laboratorista_name: 'Ana', approved: false },
      { laboratorista_name: 'Ana', approved: null },
      { laboratorista_name: 'Ana' }, // undefined
    ];
    const [ana] = calcularEstatisticasLaboratoristas(regs);
    expect(ana.total).toBe(4);
    expect(ana.aprovados).toBe(1);
    expect(ana.reprovados).toBe(1);
  });

  it('percentualReprovacao calculado só sobre avaliados', () => {
    const regs = [
      { laboratorista_name: 'Ana', approved: true },
      { laboratorista_name: 'Ana', approved: false },
      { laboratorista_name: 'Ana', approved: false },
      { laboratorista_name: 'Ana', approved: null }, // pendente não entra no denominador
    ];
    const [ana] = calcularEstatisticasLaboratoristas(regs);
    expect(ana.percentualReprovacao).toBe('66.7');
  });

  it('divisão por zero: nenhum avaliado → percentual "0.0"', () => {
    const regs = [{ laboratorista_name: 'Ana', approved: null }];
    const [ana] = calcularEstatisticasLaboratoristas(regs);
    expect(ana.percentualReprovacao).toBe('0.0');
  });

  it('ordena por total decrescente', () => {
    const regs = [
      { laboratorista_name: 'Bruno' },
      { laboratorista_name: 'Ana' },
      { laboratorista_name: 'Ana' },
      { laboratorista_name: 'Ana' },
      { laboratorista_name: 'Bruno' },
    ];
    const stats = calcularEstatisticasLaboratoristas(regs);
    expect(stats.map((s) => s.nome)).toEqual(['Ana', 'Bruno']);
  });
});

describe('calcularEstatisticasLaboratoristas — fallbacks de nome', () => {
  it('sem laboratorista_name usa prefixo do email do criador', () => {
    const regs = [{ created_by: 'joao.silva@evias.com' }];
    const [s] = calcularEstatisticasLaboratoristas(regs);
    expect(s.nome).toBe('joao.silva');
  });

  it('sem nome nem email → "Sem nome" (não crasha)', () => {
    const regs = [{}, { created_by: null }];
    const [s] = calcularEstatisticasLaboratoristas(regs);
    expect(s.nome).toBe('Sem nome');
    expect(s.total).toBe(2);
  });

  it('registro sem obra_id não polui registrosPorObra', () => {
    const regs = [{ laboratorista_name: 'Ana' }, { laboratorista_name: 'Ana', obra_id: 'o1' }];
    const [ana] = calcularEstatisticasLaboratoristas(regs);
    expect(Object.keys(ana.registrosPorObra)).toEqual(['o1']);
  });
});

describe('CONTROLE_LAB_ENTITIES — cobertura de entidades', () => {
  it('inclui as 24 entidades de registro de campo', () => {
    expect(CONTROLE_LAB_ENTITIES).toHaveLength(24);
  });
  it('sem duplicatas', () => {
    expect(new Set(CONTROLE_LAB_ENTITIES).size).toBe(CONTROLE_LAB_ENTITIES.length);
  });
  it('inclui as principais entidades', () => {
    for (const e of ['DiarioObra', 'EnsaioCAUQ', 'EnsaioProctor', 'ChecklistTerraplanagem', 'BoletimSondagem']) {
      expect(CONTROLE_LAB_ENTITIES).toContain(e);
    }
  });
});