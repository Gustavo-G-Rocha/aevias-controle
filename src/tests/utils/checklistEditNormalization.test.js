import { describe, expect, it } from 'vitest';
import { normalizeChecklistEditData } from '@/utils/checklistEditNormalization';

const defaultTest = { realizado: false, resultado: null, limite: '', conforme: null };

const normalizeCargas = (cargas, defaults) => Array.isArray(cargas) && cargas.length
  ? cargas.map((carga) => ({
      ...carga,
      slump_test: { ...defaultTest, ...(carga.slump_test || {}) },
      flow_test: { ...defaultTest, ...(carga.flow_test || {}) },
      espessura_camada: { ...defaultTest, ...(carga.espessura_camada || {}) },
      corpos_prova: Array.isArray(carga.corpos_prova) ? carga.corpos_prova : [],
    }))
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
});