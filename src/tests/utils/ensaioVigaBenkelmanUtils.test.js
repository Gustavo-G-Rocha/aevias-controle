import { describe, it, expect } from 'vitest';
import {
  getInitialForm,
  getLevantamentoInicial,
  getFaixaInicial,
  calcularLado,
  reconstruirFaixas,
  faixaTemDados,
  serializarFaixas,
  filtrarObrasVigaBenkelman,
  LADOS_PERMITIDOS,
  CAMPOS_LEITURA_PERMITIDOS,
} from '../../utils/ensaioVigaBenkelmanUtils';

// ─── getInitialForm ───────────────────────────────────────────────────────────
describe('getInitialForm', () => {
  it('retorna estrutura com 1 faixa padrão', () => {
    const form = getInitialForm();
    expect(form.faixas).toHaveLength(1);
    expect(form.faixas[0].levantamentos).toHaveLength(20);
  });

  it('retorna nextFaixaId = 2', () => {
    expect(getInitialForm().nextFaixaId).toBe(2);
  });

  it('cte_viga padrão é 0.01', () => {
    expect(getInitialForm().cte_viga).toBe(0.01);
  });

  it('status padrão é rascunho', () => {
    expect(getInitialForm().status).toBe('rascunho');
  });

  it('obra_id começa vazio', () => {
    expect(getInitialForm().obra_id).toBe('');
  });
});

// ─── getLevantamentoInicial ───────────────────────────────────────────────────
describe('getLevantamentoInicial', () => {
  it('sem leitura global: leitura_inicial vazia em todos os lados', () => {
    const lev = getLevantamentoInicial();
    expect(lev.bordo_esquerdo.leitura_inicial).toBe('');
    expect(lev.eixo.leitura_inicial).toBe('');
    expect(lev.bordo_direito.leitura_inicial).toBe('');
  });

  it('com leitura global: propaga para todos os lados', () => {
    const lev = getLevantamentoInicial('5.00');
    expect(lev.bordo_esquerdo.leitura_inicial).toBe('5.00');
    expect(lev.eixo.leitura_inicial).toBe('5.00');
    expect(lev.bordo_direito.leitura_inicial).toBe('5.00');
  });

  it('deflexão e diferença iniciam em 0', () => {
    const lev = getLevantamentoInicial();
    expect(lev.eixo.deflexao).toBe(0);
    expect(lev.eixo.diferenca).toBe(0);
  });
});

// ─── calcularLado ─────────────────────────────────────────────────────────────
describe('calcularLado', () => {
  const ladoBase = { leitura_inicial: 5, leitura_final: 0, diferenca: 0, deflexao: 0 };

  it('calcula diferença e deflexão ao alterar leitura_final', () => {
    const result = calcularLado(ladoBase, 'leitura_final', 3, 0.01);
    expect(result.diferenca).toBe(2);      // 5 - 3
    expect(result.deflexao).toBeCloseTo(0.02); // 2 * 0.01
  });

  it('calcula corretamente ao alterar leitura_inicial', () => {
    const result = calcularLado({ leitura_inicial: 0, leitura_final: 3, diferenca: 0, deflexao: 0 }, 'leitura_inicial', 8, 0.01);
    expect(result.diferenca).toBe(5);
    expect(result.deflexao).toBeCloseTo(0.05);
  });

  it('campo não permitido retorna lado sem mudança', () => {
    const result = calcularLado(ladoBase, 'deflexao', 99, 0.01);
    expect(result).toEqual(ladoBase);
  });

  it('cte_viga inválido usa 0.01 como fallback', () => {
    const result = calcularLado(ladoBase, 'leitura_final', 3, 'abc');
    expect(result.deflexao).toBeCloseTo(0.02);
  });

  it('não muta o objeto original', () => {
    const original = { leitura_inicial: 5, leitura_final: 0, diferenca: 0, deflexao: 0 };
    calcularLado(original, 'leitura_final', 2, 0.01);
    expect(original.diferenca).toBe(0);
  });

  it('cte_viga zero usa fallback 0.01', () => {
    const result = calcularLado(ladoBase, 'leitura_final', 3, 0);
    expect(result.deflexao).toBeCloseTo(0.02); // diferença=2, fallback cte=0.01
  });
});

// ─── reconstruirFaixas ────────────────────────────────────────────────────────
describe('reconstruirFaixas', () => {
  it('array vazio retorna 1 faixa padrão', () => {
    expect(reconstruirFaixas([], '')).toHaveLength(1);
    expect(reconstruirFaixas([], '')[0].levantamentos).toHaveLength(20);
  });

  it('null retorna 1 faixa padrão', () => {
    expect(reconstruirFaixas(null, '')).toHaveLength(1);
  });

  it('agrupa levantamentos por faixa_nome', () => {
    const flat = [
      { faixa_nome: 'FX1', estaca_km: 'km1', bordo_esquerdo: {}, eixo: {}, bordo_direito: {} },
      { faixa_nome: 'FX2', estaca_km: 'km2', bordo_esquerdo: {}, eixo: {}, bordo_direito: {} },
    ];
    const result = reconstruirFaixas(flat, '');
    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe('FX1');
    expect(result[1].nome).toBe('FX2');
  });

  it('completa faixas com menos de 20 levantamentos', () => {
    const flat = [{ faixa_nome: 'FX1', estaca_km: 'k1', bordo_esquerdo: {}, eixo: {}, bordo_direito: {} }];
    const result = reconstruirFaixas(flat, '');
    expect(result[0].levantamentos).toHaveLength(20);
  });

  it('propaga leitura_inicial_global nos levantamentos adicionados', () => {
    const flat = [{ faixa_nome: 'FX1', estaca_km: 'k1', bordo_esquerdo: {}, eixo: {}, bordo_direito: {} }];
    const result = reconstruirFaixas(flat, '7.5');
    // levantamentos[1] foi adicionado (padding)
    expect(result[0].levantamentos[1].eixo.leitura_inicial).toBe('7.5');
  });
});

// ─── faixaTemDados ────────────────────────────────────────────────────────────
describe('faixaTemDados', () => {
  const faixaVazia = getFaixaInicial(1);

  it('faixa vazia retorna false', () => {
    expect(faixaTemDados(faixaVazia)).toBe(false);
  });

  it('faixa com nome retorna true', () => {
    expect(faixaTemDados({ ...faixaVazia, nome: 'Pista 1' })).toBe(true);
  });

  it('faixa com estaca preenchida retorna true', () => {
    const faixa = { ...faixaVazia };
    faixa.levantamentos = faixa.levantamentos.map((l, i) =>
      i === 0 ? { ...l, estaca_km: 'km10' } : l
    );
    expect(faixaTemDados(faixa)).toBe(true);
  });

  it('faixa com leitura_final no eixo retorna true', () => {
    const faixa = { ...faixaVazia };
    faixa.levantamentos = faixa.levantamentos.map((l, i) =>
      i === 0 ? { ...l, eixo: { ...l.eixo, leitura_final: '3.2' } } : l
    );
    expect(faixaTemDados(faixa)).toBe(true);
  });
});

// ─── serializarFaixas ─────────────────────────────────────────────────────────
describe('serializarFaixas', () => {
  const faixaSimples = [
    {
      id: 1,
      nome: 'Faixa 1',
      levantamentos: [
        {
          estaca_km: 'km5',
          bordo_esquerdo: { leitura_inicial: 5, leitura_final: 3, diferenca: 2, deflexao: 0.02 },
          eixo:           { leitura_inicial: 5, leitura_final: 2, diferenca: 3, deflexao: 0.03 },
          bordo_direito:  { leitura_inicial: 5, leitura_final: 4, diferenca: 1, deflexao: 0.01 },
        },
      ],
    },
  ];

  it('gera array flat com faixa_nome', () => {
    const { levantamentos } = serializarFaixas(faixaSimples, '');
    expect(levantamentos[0].faixa_nome).toBe('Faixa 1');
  });

  it('temDeflexaoExcessiva false quando sem limite', () => {
    const { temDeflexaoExcessiva } = serializarFaixas(faixaSimples, '');
    expect(temDeflexaoExcessiva).toBe(false);
  });

  it('temDeflexaoExcessiva true quando deflexão ultrapassa limite', () => {
    const { temDeflexaoExcessiva } = serializarFaixas(faixaSimples, '0.02'); // eixo=0.03 > 0.02
    expect(temDeflexaoExcessiva).toBe(true);
  });

  it('temDeflexaoExcessiva false quando todas deflexões abaixo do limite', () => {
    const { temDeflexaoExcessiva } = serializarFaixas(faixaSimples, '100');
    expect(temDeflexaoExcessiva).toBe(false);
  });

  it('converte valores numéricos corretamente', () => {
    const { levantamentos } = serializarFaixas(faixaSimples, '');
    expect(typeof levantamentos[0].eixo.deflexao).toBe('number');
  });

  it('faixa sem nome usa Faixa {id}', () => {
    const faixaSemNome = [{ ...faixaSimples[0], nome: '' }];
    const { levantamentos } = serializarFaixas(faixaSemNome, '');
    expect(levantamentos[0].faixa_nome).toBe('Faixa 1');
  });
});

// ─── filtrarObrasVigaBenkelman ────────────────────────────────────────────────
describe('filtrarObrasVigaBenkelman', () => {
  const obras = [
    { id: 'o1', regional_id: 'r1', name: 'Obra A' },
    { id: 'o2', regional_id: 'r2', name: 'Obra B' },
    { id: 'o3', regional_id: 'r1', name: 'Obra C' },
  ];
  const regionais = [
    { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] },
    { id: 'r2', laboratoristas_responsaveis: ['outro@test.com'] },
  ];

  it('admin vê todas as obras', () => {
    expect(filtrarObrasVigaBenkelman(obras, regionais, { role: 'admin' })).toHaveLength(3);
  });

  it('laboratorista só vê obras da sua regional', () => {
    const result = filtrarObrasVigaBenkelman(obras, regionais, { role: 'user', email: 'lab@test.com' });
    expect(result).toHaveLength(2);
    expect(result.map(o => o.id)).toEqual(['o1', 'o3']);
  });

  it('laboratorista sem regional retorna array vazio', () => {
    const result = filtrarObrasVigaBenkelman(obras, regionais, { role: 'user', email: 'nao@existe.com' });
    expect(result).toHaveLength(0);
  });

  it('access_level=sala_tecnica_afirmaevias vê todas', () => {
    const result = filtrarObrasVigaBenkelman(obras, regionais, { access_level: 'sala_tecnica_afirmaevias' });
    expect(result).toHaveLength(3);
  });

  it('email case-insensitive', () => {
    const result = filtrarObrasVigaBenkelman(obras, regionais, { role: 'user', email: 'LAB@TEST.COM' });
    expect(result).toHaveLength(2);
  });
});

// ─── Constantes ───────────────────────────────────────────────────────────────
describe('constantes', () => {
  it('LADOS_PERMITIDOS tem 3 entradas', () => {
    expect(LADOS_PERMITIDOS).toHaveLength(3);
    expect(LADOS_PERMITIDOS).toContain('eixo');
  });

  it('CAMPOS_LEITURA_PERMITIDOS tem 2 entradas', () => {
    expect(CAMPOS_LEITURA_PERMITIDOS).toHaveLength(2);
    expect(CAMPOS_LEITURA_PERMITIDOS).toContain('leitura_inicial');
    expect(CAMPOS_LEITURA_PERMITIDOS).toContain('leitura_final');
  });
});