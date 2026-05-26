import { describe, it, expect } from 'vitest';
import {
  getEnsaioInicial,
  getInitialForm,
  calcularAreaBandeja,
  calcularEnsaio,
  filtrarObrasDisponiveis,
} from '../../utils/ensaioTaxaPinturaImprimacaoUtils';

// ── getEnsaioInicial ──────────────────────────────────────────────────────────
describe('getEnsaioInicial', () => {
  it('cria ensaio com número correto', () => {
    expect(getEnsaioInicial(1).numero).toBe(1);
    expect(getEnsaioInicial(3).numero).toBe(3);
  });

  it('campos numéricos iniciam como null', () => {
    const e = getEnsaioInicial(1);
    expect(e.temperatura_aplicacao).toBeNull();
    expect(e.peso_bandeja_amostra).toBeNull();
    expect(e.peso_bandeja).toBeNull();
    expect(e.peso_emulsao).toBeNull();
    expect(e.taxa_aplicada).toBeNull();
    expect(e.taxa_emulsao_aplicada).toBeNull();
    expect(e.taxa_residual).toBeNull();
  });

  it('campos de texto iniciam como string vazia', () => {
    const e = getEnsaioInicial(1);
    expect(e.hora).toBe('');
    expect(e.camada).toBe('');
    expect(e.material_camada).toBe('');
    expect(e.estaca).toBe('');
  });

  it('ensaio_residuo tem estrutura correta', () => {
    const r = getEnsaioInicial(1).ensaio_residuo;
    expect(r.data).toBe('');
    expect(r.tara).toBeNull();
    expect(r.peso_inicial).toBeNull();
    expect(r.peso_final).toBeNull();
    expect(r.residuo).toBeNull();
  });

  it('não compartilha referência de ensaio_residuo entre instâncias', () => {
    const a = getEnsaioInicial(1);
    const b = getEnsaioInicial(2);
    a.ensaio_residuo.tara = 99;
    expect(b.ensaio_residuo.tara).toBeNull();
  });
});

// ── getInitialForm ────────────────────────────────────────────────────────────
describe('getInitialForm', () => {
  it('começa com 1 ensaio', () => {
    expect(getInitialForm().ensaios).toHaveLength(1);
  });

  it('tipo_servico padrão é imprimacao', () => {
    expect(getInitialForm().tipo_servico).toBe('imprimacao');
  });

  it('dimensoes_bandeja iniciam como null', () => {
    const d = getInitialForm().dimensoes_bandeja;
    expect(d.lado_1).toBeNull();
    expect(d.lado_2).toBeNull();
    expect(d.area).toBeNull();
  });

  it('ensaio_realizado_por padrão é Afirma Evias', () => {
    expect(getInitialForm().ensaio_realizado_por).toBe('Afirma Evias');
  });
});

// ── calcularAreaBandeja ───────────────────────────────────────────────────────
describe('calcularAreaBandeja', () => {
  it('calcula área corretamente em m²', () => {
    // 50cm × 50cm = 2500cm² = 0.25m²
    expect(calcularAreaBandeja(50, 50)).toBe(0.25);
  });

  it('retorna 4 casas decimais', () => {
    const result = calcularAreaBandeja(33, 33);
    expect(result.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(4);
  });

  it('retorna null quando lado_1 é null', () => {
    expect(calcularAreaBandeja(null, 50)).toBeNull();
  });

  it('retorna null quando lado_2 é null', () => {
    expect(calcularAreaBandeja(50, null)).toBeNull();
  });

  it('retorna null quando ambos são null', () => {
    expect(calcularAreaBandeja(null, null)).toBeNull();
  });

  it('retorna null quando lado_1 é 0 (falsy)', () => {
    expect(calcularAreaBandeja(0, 50)).toBeNull();
  });

  it('área 30x40 = 0.12 m²', () => {
    expect(calcularAreaBandeja(30, 40)).toBeCloseTo(0.12, 4);
  });
});

// ── calcularEnsaio ────────────────────────────────────────────────────────────
describe('calcularEnsaio', () => {
  const ensaioBase = {
    ...getEnsaioInicial(1),
    peso_bandeja_amostra: 300,
    peso_bandeja: 200,
    ensaio_residuo: {
      data: '',
      tara: 50,
      peso_inicial: 150,
      peso_final: 145,
      residuo: null,
    },
  };

  it('calcula peso_emulsao corretamente', () => {
    const result = calcularEnsaio(ensaioBase, 0.25);
    // 300 - 200 = 100
    expect(result.peso_emulsao).toBe(100);
  });

  it('calcula taxa_aplicada corretamente', () => {
    const result = calcularEnsaio(ensaioBase, 0.25);
    // 100 / (1000 × 0.25) = 0.40
    expect(result.taxa_aplicada).toBeCloseTo(0.4, 2);
  });

  it('calcula residuo corretamente', () => {
    const result = calcularEnsaio(ensaioBase, 0.25);
    // ((145 - 50) / (150 - 50)) × 100 = 95%
    expect(result.ensaio_residuo.residuo).toBeCloseTo(95, 2);
  });

  it('calcula taxa_residual = taxa_aplicada × (residuo / 100)', () => {
    const result = calcularEnsaio(ensaioBase, 0.25);
    const esperado = parseFloat((0.4 * 0.95).toFixed(4));
    expect(result.taxa_residual).toBeCloseTo(esperado, 4);
  });

  it('calcula taxa_emulsao_aplicada = taxa_aplicada × (residuo / 100)', () => {
    const result = calcularEnsaio(ensaioBase, 0.25);
    expect(result.taxa_emulsao_aplicada).toBeCloseTo(result.taxa_residual, 4);
  });

  it('não muta o objeto original', () => {
    const original = { ...ensaioBase, ensaio_residuo: { ...ensaioBase.ensaio_residuo } };
    calcularEnsaio(original, 0.25);
    expect(original.peso_emulsao).toBeNull();
  });

  it('areaBandeja null impede cálculo de taxa_aplicada', () => {
    const result = calcularEnsaio(ensaioBase, null);
    expect(result.taxa_aplicada).toBeNull();
  });

  it('sem peso_bandeja impede cálculo de peso_emulsao', () => {
    const sem = { ...ensaioBase, peso_bandeja: null };
    const result = calcularEnsaio(sem, 0.25);
    expect(result.peso_emulsao).toBeNull();
  });

  it('sem tara no residuo impede cálculo de residuo', () => {
    const sem = { ...ensaioBase, ensaio_residuo: { ...ensaioBase.ensaio_residuo, tara: null } };
    const result = calcularEnsaio(sem, 0.25);
    expect(result.ensaio_residuo.residuo).toBeNull();
  });
});

// ── filtrarObrasDisponiveis ───────────────────────────────────────────────────
describe('filtrarObrasDisponiveis', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'conservacao' },
    { id: 'o2', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'implantacao' },
    { id: 'o3', regional_id: 'r2', status: 'em_andamento', tipo_obra: 'conservacao' },
    { id: 'o4', regional_id: 'r1', status: 'pausada',      tipo_obra: 'conservacao' },
    { id: 'o5', regional_id: 'r1', status: 'em_andamento', tipo_obra: 'sondagem'    },
  ];
  const regionais = [
    { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', laboratoristas_responsaveis: ['outro@test.com'] },
  ];

  it('admin vê todas as obras de tipo válido', () => {
    const result = filtrarObrasDisponiveis(obras, regionais, { role: 'admin' });
    // tipos válidos: conservacao, implantacao, supervisao → o1,o2,o3,o4 (pausada não filtra para admin)
    expect(result.map(o => o.id)).toEqual(expect.arrayContaining(['o1', 'o2', 'o3', 'o4']));
    expect(result.map(o => o.id)).not.toContain('o5'); // sondagem inválido
  });

  it('laboratorista vê apenas obras da sua regional, em andamento e tipo válido', () => {
    const result = filtrarObrasDisponiveis(obras, regionais, { role: 'user', email: 'lab@test.com' });
    expect(result.map(o => o.id)).toEqual(expect.arrayContaining(['o1', 'o2']));
    expect(result.map(o => o.id)).not.toContain('o3'); // regional errada
    expect(result.map(o => o.id)).not.toContain('o4'); // pausada
    expect(result.map(o => o.id)).not.toContain('o5'); // tipo inválido
  });

  it('laboratorista sem regional retorna array vazio', () => {
    const result = filtrarObrasDisponiveis(obras, regionais, { role: 'user', email: 'nao@existe.com' });
    expect(result).toHaveLength(0);
  });

  it('access_level=sala_tecnica_afirmaevias vê todas as de tipo válido', () => {
    const result = filtrarObrasDisponiveis(obras, regionais, { access_level: 'sala_tecnica_afirmaevias' });
    expect(result.map(o => o.id)).not.toContain('o5');
    expect(result.length).toBeGreaterThan(0);
  });

  it('email case-insensitive', () => {
    const result = filtrarObrasDisponiveis(obras, regionais, { role: 'user', email: 'LAB@TEST.COM' });
    expect(result).toHaveLength(2);
  });
});