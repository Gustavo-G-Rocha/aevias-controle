/**
 * Testes das funções puras do Ensaio Proctor.
 * ABNT NBR 7182:2016
 */
import { describe, it, expect } from 'vitest';
import {
  getUmidadePontoInicial,
  getDensidadePontoInicial,
  getInitialForm,
  GOLPES_POR_ENERGIA,
  calcularTeorUmidade,
  recalcDensidades,
  sanitizeNum,
  sanitizeFormForSave,
  filtrarObrasProctor,
  getEmptyRequiredFields,
  REQUIRED_FIELDS,
} from '@/utils/ensaioProctorUtils';

// ─── getUmidadePontoInicial ───────────────────────────────────────────────────
describe('getUmidadePontoInicial', () => {
  it('teores iniciais são 0', () => {
    const u = getUmidadePontoInicial();
    expect(u.teor_umidade_1).toBe(0);
    expect(u.teor_umidade_2).toBe(0);
    expect(u.teor_umidade_media).toBe(0);
  });
  it('campos de texto são string vazia', () => {
    const u = getUmidadePontoInicial();
    expect(u.capsula_numero_1).toBe('');
    expect(u.capsula_numero_2).toBe('');
  });
});

// ─── getDensidadePontoInicial ─────────────────────────────────────────────────
describe('getDensidadePontoInicial', () => {
  it('densidades iniciais são 0', () => {
    const d = getDensidadePontoInicial();
    expect(d.dens_ap_umida).toBe(0);
    expect(d.dens_ap_seca).toBe(0);
    expect(d.peso_solo_umido).toBe(0);
  });
  it('campos string são vazios', () => {
    const d = getDensidadePontoInicial();
    expect(d.cilindro_numero).toBe('');
    expect(d.cilindro_solo_umido).toBe('');
  });
});

// ─── getInitialForm ───────────────────────────────────────────────────────────
describe('getInitialForm', () => {
  it('retorna 5 pontos de umidade', () => {
    expect(getInitialForm().umidades).toHaveLength(5);
  });
  it('retorna 5 pontos de densidade', () => {
    expect(getInitialForm().densidades).toHaveLength(5);
  });
  it('retorna 5 cilindros CBR', () => {
    expect(getInitialForm().cbr_cilindros).toHaveLength(5);
  });
  it('retorna 5 cilindros de expansão', () => {
    expect(getInitialForm().expansao_cilindros).toHaveLength(5);
  });
  it('obra_id recebe o valor passado', () => {
    expect(getInitialForm('obra-123').obra_id).toBe('obra-123');
  });
  it('energia padrão é Normal', () => {
    expect(getInitialForm().energia_compactacao).toBe('Normal');
  });
  it('num_golpes padrão é 12', () => {
    expect(getInitialForm().num_golpes).toBe(12);
  });
  it('realizar_cbr_expansao é false', () => {
    expect(getInitialForm().realizar_cbr_expansao).toBe(false);
  });
  it('status padrão é rascunho', () => {
    expect(getInitialForm().status).toBe('rascunho');
  });
});

// ─── GOLPES_POR_ENERGIA ───────────────────────────────────────────────────────
describe('GOLPES_POR_ENERGIA', () => {
  it('Normal = 12', () => expect(GOLPES_POR_ENERGIA.Normal).toBe(12));
  it('Intermediária = 26', () => expect(GOLPES_POR_ENERGIA['Intermediária']).toBe(26));
  it('Modificada = 55', () => expect(GOLPES_POR_ENERGIA.Modificada).toBe(55));
});

// ─── calcularTeorUmidade ──────────────────────────────────────────────────────
describe('calcularTeorUmidade', () => {
  const u = {
    capsula_solo_umido_1: '50', capsula_solo_seco_1: '45', peso_capsula_1: '10',
    capsula_solo_umido_2: '55', capsula_solo_seco_2: '48', peso_capsula_2: '12',
  };

  it('calcula teor1 corretamente: (50-45)/(45-10)*100 = 14.29', () => {
    expect(calcularTeorUmidade(u).teor1).toBeCloseTo(14.29, 1);
  });
  it('calcula teor2 corretamente: (55-48)/(48-12)*100 = 19.44', () => {
    expect(calcularTeorUmidade(u).teor2).toBeCloseTo(19.44, 1);
  });
  it('calcula média corretamente', () => {
    const { teor1, teor2, media } = calcularTeorUmidade(u);
    expect(media).toBeCloseTo((teor1 + teor2) / 2, 1);
  });
  it('retorna 0 para campos vazios', () => {
    const resultado = calcularTeorUmidade({});
    expect(resultado.teor1).toBe(0);
    expect(resultado.teor2).toBe(0);
    expect(resultado.media).toBe(0);
  });
  it('teor é 0 quando pss = 0 (sem evitar divisão por zero)', () => {
    const u2 = { capsula_solo_umido_1: '20', capsula_solo_seco_1: '10', peso_capsula_1: '10' };
    expect(calcularTeorUmidade(u2).teor1).toBe(0);
  });
  it('usa apenas amostra 1 quando amostra 2 está vazia', () => {
    const u3 = { capsula_solo_umido_1: '50', capsula_solo_seco_1: '45', peso_capsula_1: '10' };
    const { media, teor2 } = calcularTeorUmidade(u3);
    expect(teor2).toBe(0);
    expect(media).toBeCloseTo(14.29, 1);
  });
});

// ─── recalcDensidades ─────────────────────────────────────────────────────────
describe('recalcDensidades', () => {
  const makeDensidade = (csu, pc, vc, agua = '', pesoAmU = '') => ({
    cilindro_solo_umido: String(csu),
    peso_cilindro: String(pc),
    volume_cilindro: String(vc),
    agua_adicionada_ml: String(agua),
    peso_amostra_umida: String(pesoAmU),
    cilindro_numero: '', peso_solo_umido: 0, peso_seco: 0,
    umidade_calculada: 0, dens_ap_umida: 0, dens_ap_seca: 0,
  });

  const umidades = Array(5).fill(null).map(() => ({ teor_umidade_media: 20 }));

  it('calcula peso_solo_umido = cilindro_solo_umido - peso_cilindro', () => {
    const d = [makeDensidade(5000, 3000, 1000)];
    const res = recalcDensidades(d, '', 'ponto_a_ponto', umidades, 20);
    expect(res[0].peso_solo_umido).toBe(2000);
  });

  it('calcula dens_ap_umida = peso_solo_umido / volume', () => {
    const d = [makeDensidade(5000, 3000, 1000)];
    const res = recalcDensidades(d, '', 'ponto_a_ponto', umidades, 20);
    expect(res[0].dens_ap_umida).toBe(2);
  });

  it('calcula dens_ap_seca = gammaW / (1 + w/100)', () => {
    const d = [makeDensidade(5000, 3000, 1000)];
    const res = recalcDensidades(d, '', 'ponto_a_ponto', umidades, 20);
    // 2 / (1 + 20/100) = 2/1.2 ≈ 1.667
    expect(res[0].dens_ap_seca).toBeCloseTo(1.667, 2);
  });

  it('retorna o ponto sem calcular quando volume = 0', () => {
    const d = [makeDensidade(5000, 3000, 0)];
    const original = JSON.stringify(d[0]);
    const res = recalcDensidades(d, '', 'ponto_a_ponto', umidades, 20);
    expect(JSON.stringify(res[0])).toBe(original);
  });

  it('não muta o array original', () => {
    const d = [makeDensidade(5000, 3000, 1000)];
    const original = JSON.stringify(d);
    recalcDensidades(d, '', 'ponto_a_ponto', umidades, 20);
    expect(JSON.stringify(d)).toBe(original);
  });

  it('modo higroscópico: calcula umidade com agua_adicionada_ml', () => {
    const uhigro = [{ teor_umidade_media: 10 }]; // 10%
    const d = [makeDensidade(5000, 3000, 1000, 100, 900)];
    const res = recalcDensidades(d, '10', 'higroscopica', uhigro, 0);
    // pesoSeco = 900/(100+10)*100 ≈ 818.18
    // umidadeCalc = (100/818.18)*100 + 10 ≈ 22.22
    expect(res[0].umidade_calculada).toBeGreaterThan(0);
  });
});

// ─── sanitizeNum ─────────────────────────────────────────────────────────────
describe('sanitizeNum', () => {
  it('string vazia → null', () => expect(sanitizeNum('')).toBeNull());
  it('null → null', () => expect(sanitizeNum(null)).toBeNull());
  it('undefined → null', () => expect(sanitizeNum(undefined)).toBeNull());
  it('string não numérica → null', () => expect(sanitizeNum('abc')).toBeNull());
  it('número string → Number', () => expect(sanitizeNum('3.14')).toBe(3.14));
  it('número já number → Number', () => expect(sanitizeNum(42)).toBe(42));
  it('zero → 0', () => expect(sanitizeNum(0)).toBe(0));
  it('zero string → 0', () => expect(sanitizeNum('0')).toBe(0));
});

// ─── sanitizeFormForSave ──────────────────────────────────────────────────────
describe('sanitizeFormForSave', () => {
  it('converte umidade_higroscopica vazio para null', () => {
    const form = getInitialForm();
    const result = sanitizeFormForSave(form);
    expect(result.umidade_higroscopica).toBeNull();
  });
  it('preserva num_golpes como número', () => {
    const form = getInitialForm();
    const result = sanitizeFormForSave(form);
    expect(result.num_golpes).toBe(12);
  });
  it('cbr leituras nunca são null (substituídas por 0)', () => {
    const form = getInitialForm();
    const result = sanitizeFormForSave(form);
    result.cbr_cilindros.forEach(c => {
      c.leituras.forEach(l => expect(l).not.toBeNull());
    });
  });
  it('não muta o form original', () => {
    const form = getInitialForm();
    const original = JSON.stringify(form);
    sanitizeFormForSave(form);
    expect(JSON.stringify(form)).toBe(original);
  });
});

// ─── filtrarObrasProctor ──────────────────────────────────────────────────────
describe('filtrarObrasProctor', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1' },
    { id: 'o2', regional_id: 'r2' },
    { id: 'o3', regional_id: 'r1' },
  ];
  const regionais = [
    { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', laboratoristas_responsaveis: [] },
  ];

  it('admin vê todas as obras', () => {
    const user = { role: 'admin', email: 'admin@test.com' };
    expect(filtrarObrasProctor(obras, regionais, user)).toHaveLength(3);
  });

  it('laboratorista vê apenas obras da sua regional', () => {
    const user = { role: 'user', email: 'lab@test.com' };
    const result = filtrarObrasProctor(obras, regionais, user);
    expect(result.map(o => o.id).sort()).toEqual(['o1', 'o3'].sort());
  });

  it('laboratorista sem regional retorna array vazio', () => {
    const user = { role: 'user', email: 'outro@test.com' };
    expect(filtrarObrasProctor(obras, regionais, user)).toEqual([]);
  });

  it('comparação email é case-insensitive', () => {
    const user = { role: 'user', email: 'LAB@TEST.COM' };
    expect(filtrarObrasProctor(obras, regionais, user)).toHaveLength(2);
  });

  it('role=undefined trata como laboratorista', () => {
    const user = { email: 'lab@test.com' };
    expect(filtrarObrasProctor(obras, regionais, user)).toHaveLength(2);
  });
});

// ─── getEmptyRequiredFields ───────────────────────────────────────────────────
describe('getEmptyRequiredFields', () => {
  it('retorna todos os campos quando form está vazio', () => {
    const form = getInitialForm();
    const result = getEmptyRequiredFields(form);
    expect(result.length).toBe(REQUIRED_FIELDS.length);
  });

  it('retorna vazio quando todos os campos obrigatórios estão preenchidos', () => {
    const form = {
      ...getInitialForm('o1'),
      rodovia: 'BR-101', trecho: 'km 10-20', local_coleta: 'Pista', data_ensaio: '2024-01-01',
      camada: 'Sub-base', material: 'Areia', procedencia: 'Pedreira X',
    };
    expect(getEmptyRequiredFields(form)).toHaveLength(0);
  });

  it('retorna apenas os campos ausentes', () => {
    const form = { ...getInitialForm('o1'), rodovia: 'BR-101' };
    const resultado = getEmptyRequiredFields(form);
    expect(resultado.find(f => f.field === 'rodovia')).toBeUndefined();
    expect(resultado.find(f => f.field === 'trecho')).toBeDefined();
  });
});