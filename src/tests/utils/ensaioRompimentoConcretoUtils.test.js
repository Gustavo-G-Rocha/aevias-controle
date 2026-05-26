import { describe, it, expect } from 'vitest';
import {
  DIMENSOES_CP,
  IDADES_CP,
  calcularDataRuptura,
  calcularAreaCP,
  calcularResistencia,
  calcularResistenciaFlexaoCp,
  filtrarObras,
  novaSerie,
  novaSerieFlexao,
  seriesToCompressaoAxial,
  compressaoAxialToSeries,
  seriesToTracaoFlexao,
  tracaoFlexaoToSeries,
} from '../../utils/ensaioRompimentoConcretoUtils';

// ── calcularDataRuptura ───────────────────────────────────────────────────────
describe('calcularDataRuptura', () => {
  it('soma dias corretamente', () => {
    expect(calcularDataRuptura('2024-01-01', 7)).toBe('2024-01-08');
  });

  it('atravessa meses corretamente', () => {
    expect(calcularDataRuptura('2024-01-28', 7)).toBe('2024-02-04');
  });

  it('retorna string vazia se dataMoldagem nula', () => {
    expect(calcularDataRuptura(null, 7)).toBe('');
  });

  it('retorna string vazia se dias nulo', () => {
    expect(calcularDataRuptura('2024-01-01', null)).toBe('');
  });

  it('aceita dias como string numérica', () => {
    expect(calcularDataRuptura('2024-01-01', '28')).toBe('2024-01-29');
  });
});

// ── calcularAreaCP ────────────────────────────────────────────────────────────
describe('calcularAreaCP', () => {
  it('5x10 → π×(5/2)² ≈ 19.63', () => {
    expect(parseFloat(calcularAreaCP('5x10'))).toBeCloseTo(19.63, 1);
  });

  it('15x30 → π×(15/2)² ≈ 176.71', () => {
    expect(parseFloat(calcularAreaCP('15x30'))).toBeCloseTo(176.71, 1);
  });

  it('10x20 → π×(10/2)² ≈ 78.54', () => {
    expect(parseFloat(calcularAreaCP('10x20'))).toBeCloseTo(78.54, 1);
  });

  it('dimensão inválida retorna string vazia', () => {
    expect(calcularAreaCP('999x999')).toBe('');
  });

  it('dimensão undefined retorna string vazia', () => {
    expect(calcularAreaCP(undefined)).toBe('');
  });
});

// ── calcularResistencia ───────────────────────────────────────────────────────
describe('calcularResistencia', () => {
  it('calcula R = (carga / área) × 980.665', () => {
    const area = calcularAreaCP('5x10');  // ~19.63
    const result = parseFloat(calcularResistencia(10, area));
    expect(result).toBeCloseTo((10 / parseFloat(area)) * 980.665, 1);
  });

  it('retorna string vazia para carga zero', () => {
    expect(calcularResistencia(0, 19.63)).toBe('');
  });

  it('retorna string vazia para área zero', () => {
    expect(calcularResistencia(10, 0)).toBe('');
  });

  it('retorna string vazia para carga negativa', () => {
    expect(calcularResistencia(-5, 19.63)).toBe('');
  });

  it('retorna string vazia para valores inválidos', () => {
    expect(calcularResistencia('', '')).toBe('');
  });
});

// ── calcularResistenciaFlexaoCp ───────────────────────────────────────────────
describe('calcularResistenciaFlexaoCp', () => {
  const serie = { vao_central: '450', altura_cp: '150', largura_cp: '150' };

  it('terço médio: (carga × 9.80665 × vão) / (altura × largura²)', () => {
    const cp = { carga_ruptura: '100', ponto_ruptura: 'No terço médio' };
    const result = parseFloat(calcularResistenciaFlexaoCp(cp, serie));
    const expected = (100 * 9.80665 * 450) / (150 * 150 ** 2);
    expect(result).toBeCloseTo(expected, 2);
  });

  it('fora do terço médio: 3 × (carga × 9.80665 × vão) / (altura × largura²)', () => {
    const cp = { carga_ruptura: '100', ponto_ruptura: 'Fora do terço médio' };
    const result = parseFloat(calcularResistenciaFlexaoCp(cp, serie));
    const expected = (3 * 100 * 9.80665 * 450) / (150 * 150 ** 2);
    expect(result).toBeCloseTo(expected, 2);
  });

  it('ponto_ruptura vazio retorna string vazia', () => {
    const cp = { carga_ruptura: '100', ponto_ruptura: '' };
    expect(calcularResistenciaFlexaoCp(cp, serie)).toBe('');
  });

  it('carga vazia retorna string vazia', () => {
    const cp = { carga_ruptura: '', ponto_ruptura: 'No terço médio' };
    expect(calcularResistenciaFlexaoCp(cp, serie)).toBe('');
  });

  it('largura zero retorna string vazia', () => {
    const cp = { carga_ruptura: '100', ponto_ruptura: 'No terço médio' };
    expect(calcularResistenciaFlexaoCp(cp, { ...serie, largura_cp: '0' })).toBe('');
  });
});

// ── filtrarObras ──────────────────────────────────────────────────────────────
describe('filtrarObras', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1', tipo_obra: 'conservacao' },
    { id: 'o2', regional_id: 'r1', tipo_obra: 'implantacao' },
    { id: 'o3', regional_id: 'r2', tipo_obra: 'conservacao' },
    { id: 'o4', regional_id: 'r1', tipo_obra: 'sondagem' },
  ];
  const regionais = [
    { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', laboratoristas_responsaveis: ['outro@test.com'] },
  ];

  it('admin vê todas as obras de tipo válido', () => {
    const result = filtrarObras(obras, { role: 'admin' }, regionais);
    expect(result.map(o => o.id)).toEqual(expect.arrayContaining(['o1', 'o2', 'o3']));
    expect(result.map(o => o.id)).not.toContain('o4');
  });

  it('laboratorista vê apenas obras da sua regional e tipo válido', () => {
    const result = filtrarObras(obras, { role: 'user', email: 'lab@test.com' }, regionais);
    expect(result.map(o => o.id)).toEqual(expect.arrayContaining(['o1', 'o2']));
    expect(result.map(o => o.id)).not.toContain('o3');
    expect(result.map(o => o.id)).not.toContain('o4');
  });

  it('laboratorista sem regional retorna array vazio', () => {
    const result = filtrarObras(obras, { role: 'user', email: 'nao@existe.com' }, regionais);
    expect(result).toHaveLength(0);
  });

  it('email é case-insensitive', () => {
    const result = filtrarObras(obras, { role: 'user', email: 'LAB@TEST.COM' }, regionais);
    expect(result).toHaveLength(2);
  });
});

// ── Factories ─────────────────────────────────────────────────────────────────
describe('novaSerie', () => {
  it('cria série com 2 CPs', () => {
    expect(novaSerie().cps).toHaveLength(2);
  });

  it('dimensão padrão é 5x10', () => {
    expect(novaSerie().dimensao).toBe('5x10');
  });

  it('area_cp calculada para 5x10', () => {
    expect(parseFloat(novaSerie().area_cp)).toBeCloseTo(19.63, 1);
  });
});

describe('novaSerieFlexao', () => {
  it('cria série com 2 CPs', () => {
    expect(novaSerieFlexao().cps).toHaveLength(2);
  });

  it('campos dimensionais iniciam como string vazia', () => {
    const s = novaSerieFlexao();
    expect(s.vao_central).toBe('');
    expect(s.altura_cp).toBe('');
    expect(s.largura_cp).toBe('');
  });
});

// ── Conversores série ↔ flat ──────────────────────────────────────────────────
describe('seriesToCompressaoAxial / compressaoAxialToSeries', () => {
  const series = [
    { idade: '7', dimensao: '5x10', data_ruptura: '2024-01-08', area_cp: '19.63',
      cps: [
        { numero_cp: 'A1', carga_ruptura: '10', resistencia: '500' },
        { numero_cp: 'A2', carga_ruptura: '11', resistencia: '550' },
      ],
    },
  ];

  it('flat array tem 2 entradas para 1 série com 2 CPs', () => {
    expect(seriesToCompressaoAxial(series)).toHaveLength(2);
  });

  it('ida e volta mantém estrutura', () => {
    const flat = seriesToCompressaoAxial(series);
    const back = compressaoAxialToSeries(flat);
    expect(back[0].cps[0].numero_cp).toBe('A1');
    expect(back[0].cps[1].numero_cp).toBe('A2');
    expect(back[0].idade).toBe('7');
  });

  it('array vazio retorna array vazio', () => {
    expect(seriesToCompressaoAxial([])).toHaveLength(0);
    expect(compressaoAxialToSeries([])).toHaveLength(0);
  });
});

describe('seriesToTracaoFlexao / tracaoFlexaoToSeries', () => {
  const series = [
    { idade: '28', data_ruptura: '2024-01-29', vao_central: '450', altura_cp: '150', largura_cp: '150',
      cps: [
        { numero_cp: 'F1', ponto_ruptura: 'No terço médio', carga_ruptura: '100', resistencia: '2.94' },
        { numero_cp: 'F2', ponto_ruptura: 'Fora do terço médio', carga_ruptura: '90', resistencia: '7.94' },
      ],
    },
  ];

  it('flat array tem 2 entradas', () => {
    expect(seriesToTracaoFlexao(series)).toHaveLength(2);
  });

  it('ida e volta mantém ponto_ruptura', () => {
    const flat = seriesToTracaoFlexao(series);
    const back = tracaoFlexaoToSeries(flat);
    expect(back[0].cps[0].ponto_ruptura).toBe('No terço médio');
    expect(back[0].cps[1].ponto_ruptura).toBe('Fora do terço médio');
  });

  it('array vazio retorna array vazio', () => {
    expect(seriesToTracaoFlexao([])).toHaveLength(0);
    expect(tracaoFlexaoToSeries([])).toHaveLength(0);
  });
});

// ── Constantes ────────────────────────────────────────────────────────────────
describe('constantes', () => {
  it('DIMENSOES_CP tem 3 valores', () => {
    expect(DIMENSOES_CP).toHaveLength(3);
  });

  it('IDADES_CP tem 4 valores', () => {
    expect(IDADES_CP).toHaveLength(4);
    expect(IDADES_CP).toContain(28);
  });
});