import { describe, it, expect } from 'vitest';
import {
  processarArquivoColeta,
  processarArquivoUmidade,
  calcularPaginasColeta,
  calcularPaginasUmidade,
  getEtiquetasPageColeta,
  getEtiquetasPageUmidade,
  getDescricaoColunas,
} from '../../utils/impressionEtiquetasUtils';

describe('impressionEtiquetasUtils', () => {
  describe('processarArquivoColeta', () => {
    it('processa dados coleta corretamente', () => {
      const data = [{
        FURO: 'F1',
        RODOVIA: 'BR-101',
        KM: '100',
        PISTA: 'D',
        AMOSTRA: 'A1',
        'PROFUNDIDADE(M)': '2.5',
        MATERIAL: 'Solo',
        ENSAIOS: 'Granulometria; Limite de Atterberg',
      }];
      const result = processarArquivoColeta(data);
      expect(result).toHaveLength(1);
      expect(result[0].furo).toBe('F1');
      expect(result[0].ensaios).toEqual(['Granulometria', 'Limite de Atterberg']);
    });

    it('limpa espaços em branco dos ensaios', () => {
      const data = [{ ENSAIOS: ' Granulometria ; ; Limite ' }];
      const result = processarArquivoColeta(data);
      expect(result[0].ensaios).toEqual(['Granulometria', 'Limite']);
    });

    it('trata campos vazios com strings vazias', () => {
      const data = [{ FURO: '' }];
      const result = processarArquivoColeta(data);
      expect(result[0].furo).toBe('');
    });
  });

  describe('processarArquivoUmidade', () => {
    it('processa dados umidade corretamente', () => {
      const data = [{
        FURO: 'F1',
        RODOVIA: 'BR-101',
        KM: '100',
        PISTA: 'D',
        'TIPO UMIDADE': 'Higroscópica',
      }];
      const result = processarArquivoUmidade(data);
      expect(result).toHaveLength(1);
      expect(result[0].tipo_umidade).toBe('Higroscópica');
    });

    it('aceita TIPO_UMIDADE alternativo', () => {
      const data = [{ TIPO_UMIDADE: 'Natural' }];
      const result = processarArquivoUmidade(data);
      expect(result[0].tipo_umidade).toBe('Natural');
    });
  });

  describe('calcularPaginasColeta', () => {
    it('calcula 1 página para 6 etiquetas', () => {
      expect(calcularPaginasColeta(6)).toBe(1);
    });

    it('calcula 2 páginas para 7 etiquetas', () => {
      expect(calcularPaginasColeta(7)).toBe(2);
    });

    it('calcula páginas para múltiplos', () => {
      expect(calcularPaginasColeta(12)).toBe(2);
      expect(calcularPaginasColeta(13)).toBe(3);
    });
  });

  describe('calcularPaginasUmidade', () => {
    it('calcula 1 página para 21 etiquetas', () => {
      expect(calcularPaginasUmidade(21)).toBe(1);
    });

    it('calcula 2 páginas para 22 etiquetas', () => {
      expect(calcularPaginasUmidade(22)).toBe(2);
    });

    it('calcula páginas para múltiplos', () => {
      expect(calcularPaginasUmidade(42)).toBe(2);
      expect(calcularPaginasUmidade(43)).toBe(3);
    });
  });

  describe('getEtiquetasPageColeta', () => {
    it('retorna 6 etiquetas da primeira página', () => {
      const etiquetas = Array(12).fill(null).map((_, i) => ({ id: i }));
      const result = getEtiquetasPageColeta(etiquetas, 0);
      expect(result).toHaveLength(6);
      expect(result[0].id).toBe(0);
    });

    it('retorna etiquetas da segunda página', () => {
      const etiquetas = Array(12).fill(null).map((_, i) => ({ id: i }));
      const result = getEtiquetasPageColeta(etiquetas, 1);
      expect(result).toHaveLength(6);
      expect(result[0].id).toBe(6);
    });
  });

  describe('getEtiquetasPageUmidade', () => {
    it('retorna 21 etiquetas da primeira página', () => {
      const etiquetas = Array(42).fill(null).map((_, i) => ({ id: i }));
      const result = getEtiquetasPageUmidade(etiquetas, 0);
      expect(result).toHaveLength(21);
      expect(result[0].id).toBe(0);
    });

    it('retorna etiquetas da segunda página', () => {
      const etiquetas = Array(42).fill(null).map((_, i) => ({ id: i }));
      const result = getEtiquetasPageUmidade(etiquetas, 1);
      expect(result).toHaveLength(21);
      expect(result[0].id).toBe(21);
    });
  });

  describe('getDescricaoColunas', () => {
    it('retorna descrição para coleta', () => {
      const desc = getDescricaoColunas('coleta');
      expect(desc).toContain('FURO');
      expect(desc).toContain('ENSAIOS');
    });

    it('retorna descrição para umidade', () => {
      const desc = getDescricaoColunas('umidade');
      expect(desc).toContain('TIPO UMIDADE');
      expect(desc).not.toContain('ENSAIOS');
    });
  });
});