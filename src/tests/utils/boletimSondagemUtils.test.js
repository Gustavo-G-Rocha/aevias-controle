/**
 * Testes das funções puras do Boletim de Sondagem.
 */
import { describe, it, expect } from 'vitest';
import {
  getCamadaInicial,
  CAMADAS_PADRAO,
  getDensidadeInicial,
  getInitialFormData,
  calcularUmidade,
  calcularDensidade,
  calcularUmidadeMedia,
  normalizarDensidades,
  recalcularCamadas,
  removerCamadaDoArray,
} from '@/utils/boletimSondagemUtils';

// ─── getCamadaInicial ─────────────────────────────────────────────────────────
describe('getCamadaInicial', () => {
  it('numero 1 tem prof_de = 0', () => {
    expect(getCamadaInicial(1).prof_de).toBe(0);
  });

  it('numero > 1 tem prof_de = null', () => {
    expect(getCamadaInicial(2).prof_de).toBeNull();
    expect(getCamadaInicial(5).prof_de).toBeNull();
  });

  it('sempre tem prof_ate, espessura, na nulos e classificacao_1 vazio', () => {
    const c = getCamadaInicial(3);
    expect(c.prof_ate).toBeNull();
    expect(c.espessura).toBeNull();
    expect(c.na).toBeNull();
    expect(c.classificacao_1).toBe('');
  });

  it('classificacao_2 é null', () => {
    expect(getCamadaInicial(1).classificacao_2).toBeNull();
  });

  it('numero está correto', () => {
    expect(getCamadaInicial(7).numero).toBe(7);
  });
});

// ─── CAMADAS_PADRAO ───────────────────────────────────────────────────────────
describe('CAMADAS_PADRAO', () => {
  it('tem 5 camadas', () => {
    expect(CAMADAS_PADRAO).toHaveLength(5);
  });

  it('numeradas de 1 a 5', () => {
    expect(CAMADAS_PADRAO.map(c => c.numero)).toEqual([1, 2, 3, 4, 5]);
  });
});

// ─── getDensidadeInicial ──────────────────────────────────────────────────────
describe('getDensidadeInicial', () => {
  it('massa_esp_aparente_areia padrão é 1.2', () => {
    expect(getDensidadeInicial().massa_esp_aparente_areia).toBe(1.2);
  });

  it('todos os campos numéricos são null exceto massa_esp_aparente_areia', () => {
    const d = getDensidadeInicial();
    const numericos = ['peso_frasco_antes', 'peso_frasco_depois', 'volume_buraco', 'densidade_aparente_solo_seco'];
    numericos.forEach(f => expect(d[f]).toBeNull());
  });
});

// ─── getInitialFormData ───────────────────────────────────────────────────────
describe('getInitialFormData', () => {
  it('retorna 5 camadas padrão', () => {
    expect(getInitialFormData().camadas).toHaveLength(5);
  });

  it('ensaio_insitu_realizado é false', () => {
    expect(getInitialFormData().ensaio_insitu_realizado).toBe(false);
  });

  it('densidades_in_situ tem 1 item', () => {
    expect(getInitialFormData().densidades_in_situ).toHaveLength(1);
  });

  it('fotos é array vazio', () => {
    expect(getInitialFormData().fotos).toEqual([]);
  });

  it('umidade_natural_2 é null', () => {
    expect(getInitialFormData().umidade_natural_2).toBeNull();
  });

  it('data é a data de hoje no formato YYYY-MM-DD', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getInitialFormData().data).toBe(today);
  });
});

// ─── calcularUmidade ──────────────────────────────────────────────────────────
describe('calcularUmidade', () => {
  const un = {
    massa_capsula_1: 10, massa_cap_solo_umido_1: 50, massa_cap_solo_seco_1: 45,
    massa_capsula_2: 12, massa_cap_solo_umido_2: 55, massa_cap_solo_seco_2: 48,
  };

  it('calcula agua corretamente para lado 1', () => {
    // 50 - 45 = 5
    expect(calcularUmidade(un, 1).agua).toBe(5);
  });

  it('calcula soloSeco corretamente para lado 1', () => {
    // 45 - 10 = 35
    expect(calcularUmidade(un, 1).soloSeco).toBe(35);
  });

  it('calcula umidade corretamente para lado 1', () => {
    // (5/35)*100 = 14.29
    expect(calcularUmidade(un, 1).umidade).toBeCloseTo(14.29, 1);
  });

  it('retorna nulls quando campos ausentes', () => {
    const resultado = calcularUmidade({}, 1);
    expect(resultado.agua).toBeNull();
    expect(resultado.soloSeco).toBeNull();
    expect(resultado.umidade).toBeNull();
  });

  it('umidade é null quando soloSeco = 0 (evita divisão por zero)', () => {
    const un2 = { massa_capsula_1: 20, massa_cap_solo_umido_1: 25, massa_cap_solo_seco_1: 20 };
    expect(calcularUmidade(un2, 1).umidade).toBeNull();
  });
});

// ─── calcularDensidade ────────────────────────────────────────────────────────
describe('calcularDensidade', () => {
  const d = {
    peso_frasco_antes: 5000, peso_frasco_depois: 3000,
    peso_areia_funil_placa: 400, massa_esp_aparente_areia: 1.5,
    peso_solo_recipiente: 1800, peso_recipiente: 300,
    peso_solo_umido: 1200, peso_solo_seco: 1000,
  };

  it('calcula peso_areia_deslocada = frasco_antes - frasco_depois', () => {
    // 5000 - 3000 = 2000
    expect(calcularDensidade(d).peso_areia_deslocada).toBe(2000);
  });

  it('calcula peso_areia_cavidade = deslocada - funil_placa', () => {
    // 2000 - 400 = 1600
    expect(calcularDensidade(d).peso_areia_cavidade).toBe(1600);
  });

  it('calcula volume_buraco = cavidade / massa_esp', () => {
    // 1600 / 1.5 = 1066.667
    expect(calcularDensidade(d).volume_buraco).toBeCloseTo(1066.667, 2);
  });

  it('calcula peso_solo = solo_recipiente - recipiente', () => {
    // 1800 - 300 = 1500
    expect(calcularDensidade(d).peso_solo).toBe(1500);
  });

  it('calcula peso_agua = solo_umido - solo_seco', () => {
    // 1200 - 1000 = 200
    expect(calcularDensidade(d).peso_agua).toBe(200);
  });

  it('calcula teor_umidade = (agua/solo_seco)*100', () => {
    // (200/1000)*100 = 20
    expect(calcularDensidade(d).teor_umidade).toBe(20);
  });

  it('retorna nulls quando entradas insuficientes', () => {
    const resultado = calcularDensidade({});
    expect(resultado.peso_areia_deslocada).toBeNull();
    expect(resultado.volume_buraco).toBeNull();
    expect(resultado.densidade_aparente_solo_seco).toBeNull();
  });
});

// ─── calcularUmidadeMedia ─────────────────────────────────────────────────────
describe('calcularUmidadeMedia', () => {
  it('retorna a média de dois valores', () => {
    expect(calcularUmidadeMedia(10, 20)).toBe(15);
  });

  it('retorna u1 quando u2 é null', () => {
    expect(calcularUmidadeMedia(14.29, null)).toBe(14.29);
  });

  it('retorna u1 quando u2 é undefined', () => {
    expect(calcularUmidadeMedia(14.29, undefined)).toBe(14.29);
  });

  it('retorna null quando ambos são null', () => {
    expect(calcularUmidadeMedia(null, null)).toBeNull();
  });

  it('arredonda para 2 casas decimais', () => {
    expect(calcularUmidadeMedia(10.123, 10.456)).toBe(10.29);
  });
});

// ─── normalizarDensidades ─────────────────────────────────────────────────────
describe('normalizarDensidades', () => {
  it('retorna densidades_in_situ quando presente e não vazio', () => {
    const d = [{ camada_ensaiada: 'A' }];
    expect(normalizarDensidades({ densidades_in_situ: d })).toBe(d);
  });

  it('converte campo legado densidade_in_situ para array de 1 item', () => {
    const legado = { camada_ensaiada: 'legado' };
    const resultado = normalizarDensidades({ densidade_in_situ: legado });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].camada_ensaiada).toBe('legado');
  });

  it('retorna array com getDensidadeInicial quando nada presente', () => {
    const resultado = normalizarDensidades({});
    expect(resultado).toHaveLength(1);
    expect(resultado[0].massa_esp_aparente_areia).toBe(1.2);
  });

  it('densidades_in_situ vazio cai para fallback', () => {
    const resultado = normalizarDensidades({ densidades_in_situ: [] });
    expect(resultado).toHaveLength(1);
  });
});

// ─── recalcularCamadas ────────────────────────────────────────────────────────
describe('recalcularCamadas', () => {
  const camadas = [
    { numero: 1, prof_de: 0, prof_ate: 1.0, espessura: 1.0, na: null, classificacao_1: '' },
    { numero: 2, prof_de: 1.0, prof_ate: null, espessura: null, na: null, classificacao_1: '' },
    { numero: 3, prof_de: null, prof_ate: null, espessura: null, na: null, classificacao_1: '' },
  ];

  it('não muta o array original', () => {
    const original = JSON.stringify(camadas);
    recalcularCamadas(camadas, 0, 'classificacao_1', 'Areia');
    expect(JSON.stringify(camadas)).toBe(original);
  });

  it('atualiza o campo solicitado', () => {
    const resultado = recalcularCamadas(camadas, 0, 'classificacao_1', 'Areia');
    expect(resultado[0].classificacao_1).toBe('Areia');
  });

  it('recalcula espessura quando prof_ate muda', () => {
    const resultado = recalcularCamadas(camadas, 0, 'prof_ate', 2.0);
    expect(resultado[0].espessura).toBe(2.0);
  });

  it('propaga prof_de para próxima camada quando prof_ate muda', () => {
    const resultado = recalcularCamadas(camadas, 0, 'prof_ate', 2.0);
    expect(resultado[1].prof_de).toBe(2.0);
  });

  it('recalcula espessura da próxima camada quando ela tem prof_ate', () => {
    const c = [
      { numero: 1, prof_de: 0, prof_ate: 1.0, espessura: 1.0 },
      { numero: 2, prof_de: 1.0, prof_ate: 3.0, espessura: 2.0 },
    ];
    const resultado = recalcularCamadas(c, 0, 'prof_ate', 1.5);
    expect(resultado[1].espessura).toBeCloseTo(1.5, 2);
  });

  it('recalcula espessura da camada 0 quando prof_de muda', () => {
    const resultado = recalcularCamadas(camadas, 0, 'prof_de', 0.5);
    // 1.0 - 0.5 = 0.5
    expect(resultado[0].espessura).toBe(0.5);
  });
});

// ─── removerCamadaDoArray ─────────────────────────────────────────────────────
describe('removerCamadaDoArray', () => {
  const camadas = [
    { numero: 1, prof_de: 0, prof_ate: 1.0, espessura: 1.0 },
    { numero: 2, prof_de: 1.0, prof_ate: 2.5, espessura: 1.5 },
    { numero: 3, prof_de: 2.5, prof_ate: 4.0, espessura: 1.5 },
  ];

  it('não remove se só há 1 camada', () => {
    expect(removerCamadaDoArray([camadas[0]], 0)).toHaveLength(1);
  });

  it('reduz o tamanho do array em 1', () => {
    expect(removerCamadaDoArray(camadas, 1)).toHaveLength(2);
  });

  it('renumera as camadas restantes', () => {
    const resultado = removerCamadaDoArray(camadas, 0);
    expect(resultado.map(c => c.numero)).toEqual([1, 2]);
  });

  it('recalcula prof_de da camada subsequente', () => {
    const resultado = removerCamadaDoArray(camadas, 0);
    expect(resultado[0].prof_de).toBe(0);
  });

  it('recalcula espessura das camadas restantes', () => {
    const resultado = removerCamadaDoArray(camadas, 0);
    // camada 1 nova: prof_de=0, prof_ate=2.5 → espessura=2.5
    expect(resultado[0].espessura).toBe(2.5);
  });

  it('não muta o array original', () => {
    const original = JSON.stringify(camadas);
    removerCamadaDoArray(camadas, 1);
    expect(JSON.stringify(camadas)).toBe(original);
  });
});