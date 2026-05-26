/**
 * Testes das funções puras do Boletim de Sondagem a Trado.
 */
import { describe, it, expect } from 'vitest';
import {
  getCamadaInicial,
  CAMADAS_PADRAO,
  getDensidadeInicial,
  getInitialFormData,
  calcularUmidade,
  calcularUmidadeMedia,
  calcularDensidade,
  filtrarObrasParaTrado,
} from '@/utils/boletimSondagemTradoUtils';

// ─── getCamadaInicial ─────────────────────────────────────────────────────────
describe('getCamadaInicial', () => {
  it('numero 1 tem prof_de = 0', () => {
    expect(getCamadaInicial(1).prof_de).toBe(0);
  });
  it('numero > 1 tem prof_de = null', () => {
    expect(getCamadaInicial(2).prof_de).toBeNull();
    expect(getCamadaInicial(5).prof_de).toBeNull();
  });
  it('prof_ate, espessura e na são null', () => {
    const c = getCamadaInicial(3);
    expect(c.prof_ate).toBeNull();
    expect(c.espessura).toBeNull();
    expect(c.na).toBeNull();
  });
  it('classificacao_1 é string vazia', () => {
    expect(getCamadaInicial(1).classificacao_1).toBe('');
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
  it('apenas camada 1 tem prof_de = 0', () => {
    expect(CAMADAS_PADRAO[0].prof_de).toBe(0);
    CAMADAS_PADRAO.slice(1).forEach(c => expect(c.prof_de).toBeNull());
  });
});

// ─── getDensidadeInicial ──────────────────────────────────────────────────────
describe('getDensidadeInicial', () => {
  it('massa_esp_aparente_areia padrão é 1.2', () => {
    expect(getDensidadeInicial().massa_esp_aparente_areia).toBe(1.2);
  });
  it('todos campos numéricos (exceto massa_esp_aparente_areia) são null', () => {
    const d = getDensidadeInicial();
    ['peso_frasco_antes', 'peso_frasco_depois', 'volume_buraco', 'densidade_aparente_solo_seco'].forEach(
      f => expect(d[f]).toBeNull()
    );
  });
  it('camada_ensaiada é string vazia', () => {
    expect(getDensidadeInicial().camada_ensaiada).toBe('');
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
    const hoje = new Date().toISOString().split('T')[0];
    expect(getInitialFormData().data).toBe(hoje);
  });
  it('obra_id começa vazio', () => {
    expect(getInitialFormData().obra_id).toBe('');
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
  it('umidade é null quando soloSeco = 0', () => {
    const un2 = { massa_capsula_1: 20, massa_cap_solo_umido_1: 25, massa_cap_solo_seco_1: 20 };
    expect(calcularUmidade(un2, 1).umidade).toBeNull();
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

// ─── calcularDensidade ────────────────────────────────────────────────────────
describe('calcularDensidade', () => {
  const d = {
    peso_frasco_antes: 5000, peso_frasco_depois: 3000,
    peso_areia_funil_placa: 400, massa_esp_aparente_areia: 1.5,
    peso_solo_recipiente: 1800, peso_recipiente: 300,
    peso_solo_umido: 1200, peso_solo_seco: 1000,
  };

  it('calcula peso_areia_deslocada = frasco_antes - frasco_depois', () => {
    expect(calcularDensidade(d).peso_areia_deslocada).toBe(2000);
  });
  it('calcula peso_areia_cavidade = deslocada - funil_placa', () => {
    expect(calcularDensidade(d).peso_areia_cavidade).toBe(1600);
  });
  it('calcula volume_buraco = cavidade / massa_esp', () => {
    expect(calcularDensidade(d).volume_buraco).toBeCloseTo(1066.667, 2);
  });
  it('calcula peso_solo = solo_recipiente - recipiente', () => {
    expect(calcularDensidade(d).peso_solo).toBe(1500);
  });
  it('calcula peso_agua = solo_umido - solo_seco', () => {
    expect(calcularDensidade(d).peso_agua).toBe(200);
  });
  it('calcula teor_umidade = (agua/solo_seco)*100', () => {
    expect(calcularDensidade(d).teor_umidade).toBe(20);
  });
  it('retorna nulls quando entradas insuficientes', () => {
    const resultado = calcularDensidade({});
    expect(resultado.peso_areia_deslocada).toBeNull();
    expect(resultado.volume_buraco).toBeNull();
    expect(resultado.densidade_aparente_solo_seco).toBeNull();
  });
  it('não muta o objeto original', () => {
    const original = JSON.stringify(d);
    calcularDensidade(d);
    expect(JSON.stringify(d)).toBe(original);
  });
});

// ─── filtrarObrasParaTrado ────────────────────────────────────────────────────
describe('filtrarObrasParaTrado', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'sondagem' },
    { id: 'o2', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'implantacao' },
    { id: 'o3', regional_id: 'r2', status: 'em_andamento', tipo_obra: 'sondagem' },
    { id: 'o4', regional_id: 'r1', status: 'concluida', tipo_obra: 'sondagem' },
  ];
  const regionais = [
    { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', laboratoristas_responsaveis: [] },
  ];

  it('admin vê todas as obras do tipo sondagem', () => {
    const user = { role: 'admin', email: 'admin@test.com' };
    const result = filtrarObrasParaTrado(obras, regionais, user);
    expect(result.map(o => o.id).sort()).toEqual(['o1', 'o3', 'o4'].sort());
  });

  it('laboratorista vê apenas sondagem em andamento da sua regional', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const result = filtrarObrasParaTrado(obras, regionais, user);
    expect(result.map(o => o.id)).toEqual(['o1']);
  });

  it('laboratorista não vê obras de implantação', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const result = filtrarObrasParaTrado(obras, regionais, user);
    expect(result.find(o => o.tipo_obra !== 'sondagem')).toBeUndefined();
  });

  it('laboratorista não vê obras concluídas', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const result = filtrarObrasParaTrado(obras, regionais, user);
    expect(result.find(o => o.status !== 'em_andamento')).toBeUndefined();
  });

  it('laboratorista sem regional retorna array vazio', () => {
    const user = { role: 'user', email: 'outro@test.com' };
    expect(filtrarObrasParaTrado(obras, regionais, user)).toEqual([]);
  });

  it('comparação de email é case-insensitive', () => {
    const user = { role: 'user', email: 'LAB@TEST.COM' };
    const result = filtrarObrasParaTrado(obras, regionais, user);
    expect(result.map(o => o.id)).toEqual(['o1']);
  });

  it('access_level explícito tem precedência sobre role', () => {
    const user = { role: 'admin', access_level: 'user', email: 'lab@test.com' };
    const result = filtrarObrasParaTrado(obras, regionais, user);
    expect(result.map(o => o.id)).toEqual(['o1']);
  });
});