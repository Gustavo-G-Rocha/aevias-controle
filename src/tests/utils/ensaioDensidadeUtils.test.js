/**
 * Testes das funções puras do Ensaio de Densidade In Situ.
 */
import { describe, it, expect } from 'vitest';
import {
  getFuroInicial,
  getInitialFormData,
  calcularFuro,
  calcularFuroComProctor,
  filtrarObrasDisponiveis,
} from '@/utils/ensaioDensidadeUtils';

// ─── getFuroInicial ───────────────────────────────────────────────────────────
describe('getFuroInicial', () => {
  it('numero está correto', () => {
    expect(getFuroInicial(3).numero).toBe(3);
  });

  it('campos de texto são strings vazias', () => {
    const f = getFuroInicial(1);
    expect(f.estaca).toBe('');
    expect(f.pista).toBe('');
  });

  it('campos numéricos são null', () => {
    const f = getFuroInicial(1);
    expect(f.peso_areia_garrafa_antes).toBeNull();
    expect(f.densidade_umida_furo).toBeNull();
    expect(f.grau_compactacao).toBeNull();
  });
});

// ─── getInitialFormData ───────────────────────────────────────────────────────
describe('getInitialFormData', () => {
  it('obra_id começa vazio', () => {
    expect(getInitialFormData().obra_id).toBe('');
  });

  it('substituicao_retido_3_4 começa false', () => {
    expect(getInitialFormData().substituicao_retido_3_4).toBe(false);
  });

  it('furos começa com 1 furo', () => {
    expect(getInitialFormData().furos).toHaveLength(1);
    expect(getInitialFormData().furos[0].numero).toBe(1);
  });

  it('fotos começa como array vazio', () => {
    expect(getInitialFormData().fotos).toEqual([]);
  });

  it('data_ensaio é a data de hoje', () => {
    const hoje = new Date().toISOString().split('T')[0];
    expect(getInitialFormData().data_ensaio).toBe(hoje);
  });

  it('dados_proctor começa com nulls', () => {
    const d = getInitialFormData().dados_proctor;
    expect(d.densidade_seca_max).toBeNull();
    expect(d.umidade_otima).toBeNull();
  });
});

// ─── calcularFuro ─────────────────────────────────────────────────────────────
describe('calcularFuro', () => {
  const furoBase = {
    peso_areia_garrafa_antes: 5000,
    peso_areia_garrafa_apos: 3000,
    peso_material_umido_furo: 1800,
    peso_solo_retido_3_4_umido: null,
    tara_frigideira: 100,
    material_umido_frigideira: 600,
    material_seco_frigideira: 550,
    densidade_umida_furo: null,
    densidade_seca_solo: null,
    umidade: null,
  };

  const densidadeAreia = 1.5;
  const pesoAreiaFunil = 500;

  it('calcula volume correto: (5000 - 3000 - 500) / 1.5 = 1000', () => {
    // volume = 1000 cm³, densidade_umida = 1800 / 1000 = 1.800
    const resultado = calcularFuro(furoBase, densidadeAreia, pesoAreiaFunil, false, null);
    expect(resultado.densidade_umida_furo).toBeCloseTo(1.800, 3);
  });

  it('calcula umidade: ((600-100)-(550-100))/(550-100) * 100', () => {
    // agua = 500-450 = 50, seco = 450, umidade = (50/450)*100 = 11.11%
    const resultado = calcularFuro(furoBase, densidadeAreia, pesoAreiaFunil, false, null);
    expect(resultado.umidade).toBeCloseTo(11.11, 1);
  });

  it('calcula densidade_seca_solo = densidade_umida / (1 + umidade/100)', () => {
    const resultado = calcularFuro(furoBase, densidadeAreia, pesoAreiaFunil, false, null);
    const esperado = resultado.densidade_umida_furo / (1 + resultado.umidade / 100);
    expect(resultado.densidade_seca_solo).toBeCloseTo(esperado, 3);
  });

  it('não calcula sem densidadeAreia', () => {
    const resultado = calcularFuro(furoBase, null, pesoAreiaFunil, false, null);
    expect(resultado.densidade_umida_furo).toBeNull();
  });

  it('não calcula umidade quando material_seco_frigideira = tara_frigideira (seco = 0)', () => {
    const furoZeroSeco = { ...furoBase, material_seco_frigideira: 100 };
    const resultado = calcularFuro(furoZeroSeco, densidadeAreia, pesoAreiaFunil, false, null);
    expect(resultado.umidade).toBeNull();
  });

  it('não muta o objeto original', () => {
    const original = JSON.stringify(furoBase);
    calcularFuro(furoBase, densidadeAreia, pesoAreiaFunil, false, null);
    expect(JSON.stringify(furoBase)).toBe(original);
  });

  describe('com substituição 3/4"', () => {
    const furoSub = {
      ...furoBase,
      peso_solo_retido_3_4_umido: 300,
    };
    const densidadeRetida = 2.5;

    it('subtrai volume retido do volume total', () => {
      // volumeTotal = 1000, volumeRetido = 300/2.5 = 120, volumeFuro = 880
      // pesoCorrigido = 1800 - 300 = 1500
      // densidade_umida = 1500 / 880 ≈ 1.705
      const resultado = calcularFuro(furoSub, densidadeAreia, pesoAreiaFunil, true, densidadeRetida);
      expect(resultado.densidade_umida_furo).toBeCloseTo(1500 / 880, 2);
    });

    it('sem substituição, ignora peso_solo_retido_3_4_umido', () => {
      const resultado = calcularFuro(furoSub, densidadeAreia, pesoAreiaFunil, false, densidadeRetida);
      expect(resultado.densidade_umida_furo).toBeCloseTo(1.800, 3);
    });
  });
});

// ─── calcularFuroComProctor ───────────────────────────────────────────────────
describe('calcularFuroComProctor', () => {
  const furo = {
    peso_areia_garrafa_antes: 5000,
    peso_areia_garrafa_apos: 3000,
    peso_material_umido_furo: 1800,
    peso_solo_retido_3_4_umido: null,
    tara_frigideira: 100,
    material_umido_frigideira: 600,
    material_seco_frigideira: 550,
    densidade_umida_furo: null,
    densidade_seca_solo: null,
    umidade: null,
    desvio_umidade: null,
    grau_compactacao: null,
  };

  const dadosProctor = { densidade_seca_max: 1.9, umidade_otima: 10.0 };

  it('calcula desvio_umidade = umidade - umidade_otima', () => {
    const resultado = calcularFuroComProctor(furo, dadosProctor, 1.5, 500, false, null);
    // umidade ≈ 11.11, otima = 10.0 → desvio ≈ 1.11
    expect(resultado.desvio_umidade).toBeCloseTo(11.11 - 10.0, 1);
  });

  it('calcula grau_compactacao = (densidade_seca / densidade_seca_max) * 100', () => {
    const resultado = calcularFuroComProctor(furo, dadosProctor, 1.5, 500, false, null);
    const gc = (resultado.densidade_seca_solo / dadosProctor.densidade_seca_max) * 100;
    expect(resultado.grau_compactacao).toBeCloseTo(gc, 2);
  });

  it('não calcula desvio_umidade quando umidade_otima é null', () => {
    const proctor = { densidade_seca_max: 1.9, umidade_otima: null };
    const resultado = calcularFuroComProctor(furo, proctor, 1.5, 500, false, null);
    expect(resultado.desvio_umidade).toBeNull();
  });

  it('não calcula grau_compactacao quando densidade_seca_max é null', () => {
    const proctor = { densidade_seca_max: null, umidade_otima: 10.0 };
    const resultado = calcularFuroComProctor(furo, proctor, 1.5, 500, false, null);
    expect(resultado.grau_compactacao).toBeNull();
  });

  it('não muta o objeto original', () => {
    const original = JSON.stringify(furo);
    calcularFuroComProctor(furo, dadosProctor, 1.5, 500, false, null);
    expect(JSON.stringify(furo)).toBe(original);
  });
});

// ─── filtrarObrasDisponiveis ──────────────────────────────────────────────────
describe('filtrarObrasDisponiveis', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'implantacao' },
    { id: 'o2', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'conservacao' },
    { id: 'o3', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'supervisao' },
    { id: 'o4', regional_id: 'r2', status: 'em_andamento', tipo_obra: 'implantacao' },
    { id: 'o5', regional_id: 'r1', status: 'concluida', tipo_obra: 'implantacao' },
  ];

  const regionais = [
    { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', laboratoristas_responsaveis: [] },
  ];

  it('admin vê implantacao e conservacao de todas as regionais', () => {
    const user = { role: 'admin', email: 'admin@test.com' };
    const result = filtrarObrasDisponiveis(obras, regionais, user);
    expect(result.map(o => o.id).sort()).toEqual(['o1', 'o2', 'o4', 'o5'].sort());
  });

  it('laboratorista vê apenas obras da sua regional em andamento (implantacao/conservacao)', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const result = filtrarObrasDisponiveis(obras, regionais, user);
    expect(result.map(o => o.id).sort()).toEqual(['o1', 'o2'].sort());
  });

  it('laboratorista sem regional retorna array vazio', () => {
    const user = { role: 'user', email: 'outro@test.com' };
    expect(filtrarObrasDisponiveis(obras, regionais, user)).toEqual([]);
  });

  it('laboratorista não vê obras concluidas (o5)', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const result = filtrarObrasDisponiveis(obras, regionais, user);
    expect(result.find(o => o.id === 'o5')).toBeUndefined();
  });

  it('laboratorista não vê obras de supervisao (o3)', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const result = filtrarObrasDisponiveis(obras, regionais, user);
    expect(result.find(o => o.id === 'o3')).toBeUndefined();
  });

  it('access_level explícito tem precedência sobre role', () => {
    const user = { role: 'admin', access_level: 'user', email: 'lab@test.com' };
    const result = filtrarObrasDisponiveis(obras, regionais, user);
    // Como access_level = 'user', deve seguir a lógica do laboratorista
    expect(result.map(o => o.id).sort()).toEqual(['o1', 'o2'].sort());
  });
});