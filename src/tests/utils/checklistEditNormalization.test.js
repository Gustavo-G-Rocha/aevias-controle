import { describe, expect, it, vi } from 'vitest';
import { normalizeChecklistEditData } from '@/utils/checklistEditNormalization';

const defaultTest = { realizado: false, resultado: null, limite: '', conforme: null };
const defaultPeriodo = { periodo: 'manha', temperatura_ambiente: null, condicoes_climaticas: 'bom' };
const defaultCorpoProva = { dias_ruptura: null, tipo_ruptura: 'compressao_axial' };

const normalizeCorposProva = (items) => Array.isArray(items)
  ? items.map((item) => ({ ...defaultCorpoProva, ...item }))
  : [];

const normalizeCargas = (cargas, defaults) => Array.isArray(cargas) && cargas.length
  ? cargas.map((carga) => ({
      ...carga,
      slump_test: { ...defaultTest, ...(carga.slump_test || {}) },
      flow_test: { ...defaultTest, ...(carga.flow_test || {}) },
      espessura_camada: { ...defaultTest, ...(carga.espessura_camada || {}) },
      corpos_prova: normalizeCorposProva(carga.corpos_prova),
    }))
  : defaults;

const normalizePeriodos = (periodos, defaults) => Array.isArray(periodos) && periodos.length
  ? periodos.map((periodo) => ({ ...defaultPeriodo, ...periodo }))
  : defaults;

describe('normalizeChecklistEditData', () => {
  it('preserva chaves padrão de objetos de primeiro nível', () => {
    const result = normalizeChecklistEditData(
      { data: '2026-07-15', jornada: { horario_inicio: '', horario_fim: '' }, fotos: [] },
      { data: '2026-07-14', jornada: { horario_inicio: '08:00' }, fotos: null }
    );

    expect(result.jornada).toEqual({ horario_inicio: '08:00', horario_fim: '' });
    expect(result.fotos).toEqual([]);
    expect(result.data).toBe('2026-07-14');
  });

  it('normaliza cargas antigas sem objetos aninhados obrigatórios', () => {
    const defaults = [{ numero_carga: 1, slump_test: defaultTest }];
    const result = normalizeChecklistEditData(
      { data: '2026-07-15', fotos: [], cargas_concreto: defaults },
      { data: '2026-07-14', cargas_concreto: [{ numero_carga: 1 }] },
      { cargas_concreto: normalizeCargas }
    );

    expect(result.cargas_concreto[0]).toMatchObject({
      slump_test: defaultTest,
      flow_test: defaultTest,
      espessura_camada: defaultTest,
      corpos_prova: [],
    });
  });

  it('delega a normalização de cada objeto do array periodos_clima', () => {
    const defaults = [defaultPeriodo];
    const result = normalizeChecklistEditData(
      { data: '2026-07-15', fotos: [], periodos_clima: defaults },
      { data: '2026-07-14', periodos_clima: [{ periodo: 'tarde', temperatura_ambiente: 31 }] },
      { periodos_clima: normalizePeriodos }
    );

    expect(result.periodos_clima).toEqual([{
      periodo: 'tarde',
      temperatura_ambiente: 31,
      condicoes_climaticas: 'bom',
    }]);
  });

  it('normaliza objetos e arrays aninhados dentro de cada carga', () => {
    const result = normalizeChecklistEditData(
      { data: '2026-07-15', fotos: [], cargas_concreto: [] },
      {
        data: '2026-07-14',
        cargas_concreto: [{
          numero_carga: 3,
          slump_test: { realizado: true, resultado: 11 },
          corpos_prova: [{ dias_ruptura: 28 }],
        }],
      },
      { cargas_concreto: normalizeCargas }
    );

    expect(result.cargas_concreto[0].slump_test).toEqual({
      realizado: true,
      resultado: 11,
      limite: '',
      conforme: null,
    });
    expect(result.cargas_concreto[0].corpos_prova).toEqual([{
      dias_ruptura: 28,
      tipo_ruptura: 'compressao_axial',
    }]);
  });

  it('repassa ao normalizador o array salvo e os defaults do formulário', () => {
    const saved = [{ periodo: 'noite' }];
    const defaults = [{ periodo: 'manha' }, { periodo: 'tarde' }];
    const normalizer = vi.fn(() => saved);

    normalizeChecklistEditData(
      { data: '2026-07-15', fotos: [], periodos_clima: defaults },
      { data: '2026-07-14', periodos_clima: saved },
      { periodos_clima: normalizer }
    );

    expect(normalizer).toHaveBeenCalledOnce();
    expect(normalizer).toHaveBeenCalledWith(saved, defaults);
  });
});