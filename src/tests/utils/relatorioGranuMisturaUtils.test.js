import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  getLogoUrl,
  montarPeneirasParaMostrar,
  montarChartData,
  temEspecificacao,
  getNomeMaterial,
  getNomeProjetoExibir,
  getNomeFaixa,
} from '@/utils/relatorioGranuMisturaUtils';

const DEFAULT_LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

describe('relatorioGranuMisturaUtils', () => {
  describe('formatDate', () => {
    it('deve formatar data ISO de 10 caracteres', () => {
      const result = formatDate('2026-05-27');
      expect(result).toBe('27/05/2026');
    });

    it('deve retornar "-" para null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('deve retornar "-" para string vazia', () => {
      expect(formatDate('')).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    it('deve retornar string não vazia para data válida', () => {
      const result = formatDateTime('2026-05-27T10:00:00Z');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('-');
    });

    it('deve retornar "-" para null', () => {
      expect(formatDateTime(null)).toBe('-');
    });
  });

  describe('getLogoUrl', () => {
    it('deve retornar logo customizada quando regional a tem', () => {
      const regional = { logo_url: 'https://example.com/logo.png' };
      expect(getLogoUrl(regional)).toBe('https://example.com/logo.png');
    });

    it('deve retornar logo padrão quando regional é null', () => {
      expect(getLogoUrl(null)).toBe(DEFAULT_LOGO);
    });

    it('deve retornar logo padrão quando regional não tem logo_url', () => {
      expect(getLogoUrl({})).toBe(DEFAULT_LOGO);
    });
  });

  describe('montarPeneirasParaMostrar', () => {
    const peneirasDoRegistro = [
      { abertura_mm: 4.75, astm: 'N°4', passante_pct: 95 },
      { abertura_mm: 2.36, astm: 'N°8', passante_pct: 85 },
    ];

    it('deve combinar peneiras da faixa com dados do registro', () => {
      const faixa = {
        peneiras: [
          { abertura: '4.75', min: 90, max: 100 },
          { abertura: '2.36', min: 80, max: 95 },
        ],
      };

      const result = montarPeneirasParaMostrar(faixa, peneirasDoRegistro);
      expect(result.length).toBe(2);
      expect(result[0].especMin).toBe(90);
      expect(result[0].especMax).toBe(100);
    });

    it('deve retornar peneiras do registro quando faixa é null', () => {
      const result = montarPeneirasParaMostrar(null, peneirasDoRegistro);
      expect(result).toEqual(peneirasDoRegistro);
    });

    it('deve retornar peneiras do registro quando faixa não tem peneiras', () => {
      const faixa = { peneiras: [] };
      const result = montarPeneirasParaMostrar(faixa, peneirasDoRegistro);
      expect(result).toEqual(peneirasDoRegistro);
    });
  });

  describe('montarChartData', () => {
    const peneirasParaMostrar = [
      { abertura_mm: 4.75, passante_pct: '95', especMin: 90, especMax: 100 },
      { abertura_mm: 2.36, passante_pct: '85', especMin: 80, especMax: 95 },
    ];

    it('deve montar dados do gráfico corretamente', () => {
      const result = montarChartData(peneirasParaMostrar);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        abertura: 4.75,
        passante: 95,
        min: 90,
        max: 100,
      });
    });

    it('deve tratar valores numéricos faltantes como 0 ou undefined', () => {
      const peneiras = [
        { abertura_mm: 1.0, passante_pct: '', especMin: null },
      ];
      const result = montarChartData(peneiras);
      expect(result[0].passante).toBe(0);
      expect(result[0].min).toBeUndefined();
    });
  });

  describe('temEspecificacao', () => {
    it('deve retornar true quando há especMin', () => {
      const peneiras = [{ especMin: 90 }];
      expect(temEspecificacao(peneiras)).toBe(true);
    });

    it('deve retornar false quando não há especMin', () => {
      const peneiras = [{ especMin: null }, { especMin: null }];
      expect(temEspecificacao(peneiras)).toBe(false);
    });

    it('deve retornar false para array vazio', () => {
      expect(temEspecificacao([])).toBe(false);
    });
  });

  describe('getNomeMaterial', () => {
    it('deve retornar material_outro quando material é OUTRO', () => {
      const record = { material: 'OUTRO', material_outro: 'Areia Fina' };
      expect(getNomeMaterial(record)).toBe('Areia Fina');
    });

    it('deve retornar material quando não é OUTRO', () => {
      const record = { material: 'BGS', material_outro: 'ignorado' };
      expect(getNomeMaterial(record)).toBe('BGS');
    });

    it('deve retornar OUTRO quando material_outro não existe', () => {
      const record = { material: 'OUTRO' };
      expect(getNomeMaterial(record)).toBe('OUTRO');
    });
  });

  describe('getNomeProjetoExibir', () => {
    it('deve retornar N/A quando material é OUTRO', () => {
      const record = { material: 'OUTRO' };
      const project = { name: 'Projeto A' };
      expect(getNomeProjetoExibir(record, project)).toBe('N/A');
    });

    it('deve retornar nome do project quando material não é OUTRO', () => {
      const record = { material: 'BGS' };
      const project = { name: 'Projeto A' };
      expect(getNomeProjetoExibir(record, project)).toBe('Projeto A');
    });

    it('deve retornar — quando project é null', () => {
      const record = { material: 'BGS' };
      expect(getNomeProjetoExibir(record, null)).toBe('—');
    });
  });

  describe('getNomeFaixa', () => {
    it('deve preferir nome da faixa quando disponível', () => {
      const faixa = { nome: 'Faixa C' };
      expect(getNomeFaixa(faixa, 'ID_faixa')).toBe('Faixa C');
    });

    it('deve retornar ID da faixa quando faixa objeto é null', () => {
      expect(getNomeFaixa(null, 'ID_faixa')).toBe('ID_faixa');
    });

    it('deve retornar — quando ambas não existem', () => {
      expect(getNomeFaixa(null, null)).toBe('—');
    });
  });
});