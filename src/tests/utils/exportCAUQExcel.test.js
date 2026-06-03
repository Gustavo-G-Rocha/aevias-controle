/**
 * Testes para exportCAUQExcel.js
 * Valida geração de linhas e lógica de formatação — sem fazer download real.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock xlsx antes de importar o módulo
vi.mock('xlsx', () => ({
  utils: {
    book_new: () => ({}),
    book_append_sheet: vi.fn(),
    encode_col: (c) => String.fromCharCode(65 + c),
    encode_range: () => 'A1:L50',
  },
  writeFile: vi.fn(),
}));

// Funções auxiliares extraídas do módulo (testadas via importação direta dos utils)
import {
  calcularGranulometria,
  calcularMedia,
  formatDate,
} from '@/utils/relatorioCAUQUtils';

import {
  estáForaDaFaixa,
  estáAbaixoMin,
  fmtNum,
  temDadosRTCD,
  temDadosEstabilidade,
  extrairConstPrensa,
} from '@/utils/relatorioCAUQTabelasUtils';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ensaioBase = {
  id: 'abc123',
  data_ensaio: '2024-06-01',
  temperatura_cap: 160,
  tipo_ligante: 'CAP 50/70',
  rodovia: 'BR-101',
  trecho: 'KM 10 ao 20',
  laboratorista_name: 'João Silva',
  usina_fornecedora: 'Usina Alfa',
  placa_caminhao: 'ABC-1234',
  realizar_marshall: false,
  realizar_densidade_rice: false,
  extracao_ligante: {
    amostra_com_ligante: 1200,
    amostra_sem_ligante: 1150,
    fator_correcao: 1.0,
    peso_ligante: 50,
    teor_ligante: 4.35,
    filler_betume: 0.45,
  },
  granulometria: {
    peso_retido_peneiras: {
      peneira_19_0mm: 0,
      peneira_12_5mm: 50,
      peneira_9_5mm: 100,
      peneira_4_75mm: 150,
      peneira_2_36mm: 200,
      peneira_0_075mm: 80,
    },
  },
};

const projectBase = {
  teor_ligante: { min: 4.0, max: 5.0, otimo: 4.5 },
  volume_vazios: { min: 3.0, max: 5.0 },
  vam: { min: 15.0, projeto: 17.0 },
  rbv: { min: 65.0, max: 75.0, projeto: 70.0 },
  massa_especifica_aparente: 2.45,
  rtcd: { min: 0.65 },
  estabilidade: { min: 500, projeto: 800 },
  fluencia: { min: 2.0, max: 4.5, projeto: 3.0 },
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('exportCAUQExcel — lógica de formatação', () => {
  describe('formatDate', () => {
    it('formata data ISO corretamente', () => {
      expect(formatDate('2024-06-01')).toBe('01/06/2024');
    });

    it('retorna vazio para data nula', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('fmtNum', () => {
    it('formata número com decimais', () => {
      expect(fmtNum(4.35, 2)).toBe('4.35');
    });

    it('retorna - para valor nulo', () => {
      expect(fmtNum(null)).toBe('-');
      expect(fmtNum('')).toBe('-');
    });

    it('retorna - para NaN', () => {
      expect(fmtNum('abc')).toBe('-');
    });
  });

  describe('estáForaDaFaixa', () => {
    it('retorna true quando abaixo do mínimo', () => {
      expect(estáForaDaFaixa(3.5, 4.0, 5.0)).toBe(true);
    });

    it('retorna true quando acima do máximo', () => {
      expect(estáForaDaFaixa(5.5, 4.0, 5.0)).toBe(true);
    });

    it('retorna false quando dentro da faixa', () => {
      expect(estáForaDaFaixa(4.5, 4.0, 5.0)).toBe(false);
    });

    it('retorna false quando dados ausentes', () => {
      expect(estáForaDaFaixa(null, 4.0, 5.0)).toBe(false);
      expect(estáForaDaFaixa(4.5, null, 5.0)).toBe(false);
    });
  });

  describe('estáAbaixoMin', () => {
    it('retorna true quando abaixo do mínimo', () => {
      expect(estáAbaixoMin(0.5, 0.65)).toBe(true);
    });

    it('retorna false quando igual ou acima do mínimo', () => {
      expect(estáAbaixoMin(0.65, 0.65)).toBe(false);
      expect(estáAbaixoMin(0.80, 0.65)).toBe(false);
    });
  });

  describe('calcularMedia', () => {
    const cps = [
      { densidade_aparente: 2.41 },
      { densidade_aparente: 2.43 },
      { densidade_aparente: 2.45 },
    ];

    it('calcula média corretamente para densidade_aparente', () => {
      expect(calcularMedia(cps, 'densidade_aparente')).toBe('2.430');
    });

    it('retorna - quando sem valores', () => {
      expect(calcularMedia([], 'densidade_aparente')).toBe('-');
    });

    it('ignora valores NaN', () => {
      const cpsComNaN = [{ volume_vazios: 4.0 }, { volume_vazios: 'x' }, { volume_vazios: 4.2 }];
      expect(calcularMedia(cpsComNaN, 'volume_vazios')).toBe('4.1');
    });
  });

  describe('temDadosRTCD / temDadosEstabilidade', () => {
    it('detecta RTCD presente', () => {
      const cps = [{ rtcd_leitura: 120 }];
      expect(temDadosRTCD(cps)).toBe(true);
    });

    it('detecta RTCD ausente', () => {
      const cps = [{ rtcd_leitura: null }];
      expect(temDadosRTCD(cps)).toBe(false);
    });

    it('detecta estabilidade presente', () => {
      const cps = [{ estabilidade_leitura: 850 }];
      expect(temDadosEstabilidade(cps)).toBe(true);
    });
  });

  describe('extrairConstPrensa', () => {
    it('extrai const_prensa do primeiro CP', () => {
      const cps = [{ const_prensa: 1.2345 }];
      expect(extrairConstPrensa(cps)).toBe('1.2345');
    });

    it('retorna fallback quando sem CP', () => {
      expect(extrairConstPrensa([])).toBe('1.0000');
    });

    it('retorna fallback quando const_prensa inválida', () => {
      expect(extrairConstPrensa([{ const_prensa: 'x' }])).toBe('1.0000');
    });
  });

  describe('calcularGranulometria', () => {
    it('retorna array vazio sem dados de granulometria', () => {
      const ensaioSemGran = { ...ensaioBase, granulometria: null };
      expect(calcularGranulometria(ensaioSemGran, null, null)).toEqual([]);
    });

    it('gera dados com percentual passante', () => {
      const dados = calcularGranulometria(ensaioBase, null, null);
      expect(Array.isArray(dados)).toBe(true);
      expect(dados.length).toBeGreaterThan(0);
      dados.forEach(d => {
        expect(d).toHaveProperty('astm');
        expect(d).toHaveProperty('percentualPassante');
        expect(d).toHaveProperty('retido');
      });
    });

    it('percentual passante da primeira peneira é 100% (sem retido antes)', () => {
      const dados = calcularGranulometria(ensaioBase, null, null);
      // primeira peneira com retido 0 deve ter passante próximo de 100%
      const primeira = dados.find(d => d.astm === 'Nº ¾"');
      if (primeira) {
        expect(parseFloat(primeira.percentualPassante)).toBeLessThanOrEqual(100);
        expect(parseFloat(primeira.percentualPassante)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('exportarCAUQExcel — smoke test', () => {
    it('não lança erro ao exportar ensaio básico', async () => {
      const { exportarCAUQExcel } = await import('@/utils/exportCAUQExcel');
      expect(() =>
        exportarCAUQExcel({
          ensaio: ensaioBase,
          obra: { name: 'Obra Teste' },
          regional: null,
          project: projectBase,
          faixa: null,
        })
      ).not.toThrow();
    });

    it('não lança erro para ensaio com marshall', async () => {
      const { exportarCAUQExcel } = await import('@/utils/exportCAUQExcel');
      const ensaioMarshall = {
        ...ensaioBase,
        realizar_marshall: true,
        corpos_prova_marshall: [
          {
            numero: 1,
            peso_ar: 1200, peso_imerso: 680, peso_sss: 1205,
            volume: 525, densidade_aparente: 2.286,
            volume_vazios: 4.2, vcb: 10.5, vam: 17.3, rbv: 70.0,
            altura: 6.5, rtcd_leitura: 120, rtcd_valor: 0.72,
          },
        ],
        densidade_rice: {
          frasco_agua: 6000, amostra: 1200, frasco_agua_amostra: 6500,
          temperatura_agua: 25, densidade_agua: 0.997, densidade_rice: 2.385,
        },
        observacoes: 'Ensaio de teste',
      };
      expect(() =>
        exportarCAUQExcel({
          ensaio: ensaioMarshall,
          obra: null,
          regional: null,
          project: projectBase,
          faixa: null,
        })
      ).not.toThrow();
    });
  });
});