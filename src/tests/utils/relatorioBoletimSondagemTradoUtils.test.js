import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  getLogoUrl,
  calcularUmidade,
  calcularMediaUmidade,
  getFaceTitle,
  chunkArray,
  getOperador,
  getCliente,
} from '@/utils/relatorioBoletimSondagemTradoUtils';

const DEFAULT_LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

describe('relatorioBoletimSondagemTradoUtils', () => {
  describe('formatDate', () => {
    it('deve formatar data ISO para pt-BR (UTC)', () => {
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
    it('deve retornar string válida para data/hora', () => {
      const result = formatDateTime('2026-05-27T10:00:00Z');
      expect(typeof result).toBe('string');
      expect(result).not.toBe('N/A');
    });

    it('deve retornar "N/A" para null', () => {
      expect(formatDateTime(null)).toBe('N/A');
    });

    it('deve retornar "N/A" para string vazia', () => {
      expect(formatDateTime('')).toBe('N/A');
    });
  });

  describe('formatNumber', () => {
    it('deve formatar número com 2 decimais por padrão', () => {
      expect(formatNumber(123.456)).toBe('123.46');
    });

    it('deve formatar número com N decimais', () => {
      expect(formatNumber(1.2345, 3)).toBe('1.235');
    });

    it('deve retornar "-" para null', () => {
      expect(formatNumber(null)).toBe('-');
    });

    it('deve retornar "-" para undefined', () => {
      expect(formatNumber(undefined)).toBe('-');
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

  describe('calcularUmidade', () => {
    it('deve calcular umidade corretamente', () => {
      const result = calcularUmidade(50, 40, 20);
      expect(result).toBe(50);
    });

    it('deve retornar null se solo_seco <= 0', () => {
      const result = calcularUmidade(50, 40, 40);
      expect(result).toBeNull();
    });

    it('deve retornar null se algum parâmetro for null', () => {
      expect(calcularUmidade(null, 40, 20)).toBeNull();
      expect(calcularUmidade(50, null, 20)).toBeNull();
      expect(calcularUmidade(50, 40, null)).toBeNull();
    });
  });

  describe('calcularMediaUmidade', () => {
    it('deve calcular média de duas umidades', () => {
      const result = calcularMediaUmidade(20, 30);
      expect(result).toBe('25.00%');
    });

    it('deve retornar primeira umidade se segunda for null', () => {
      const result = calcularMediaUmidade(20, null);
      expect(result).toBe('20.00%');
    });

    it('deve retornar "-" se ambas forem null', () => {
      expect(calcularMediaUmidade(null, null)).toBe('-');
    });
  });

  describe('getFaceTitle', () => {
    it('deve retornar "Face: X" quando classificação existe', () => {
      expect(getFaceTitle('Areia Fina')).toBe('Face: Areia Fina');
    });

    it('deve retornar "Classificação" quando classificação é null', () => {
      expect(getFaceTitle(null)).toBe('Classificação');
    });
  });

  describe('chunkArray', () => {
    it('deve dividir array em chunks de tamanho especificado', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const result = chunkArray(arr, 3);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('deve retornar array com um chunk se tamanho >= array length', () => {
      const arr = [1, 2];
      const result = chunkArray(arr, 5);
      expect(result).toEqual([[1, 2]]);
    });

    it('deve retornar array vazio para entrada vazia', () => {
      expect(chunkArray([], 3)).toEqual([]);
    });
  });

  describe('getOperador', () => {
    it('deve preferir operador quando disponível', () => {
      expect(getOperador('João', 'Maria')).toBe('João');
    });

    it('deve usar laboratorista se operador for null', () => {
      expect(getOperador(null, 'Maria')).toBe('Maria');
    });

    it('deve retornar "-" se ambos forem null', () => {
      expect(getOperador(null, null)).toBe('-');
    });
  });

  describe('getCliente', () => {
    it('deve preferir boletimCliente quando disponível', () => {
      expect(getCliente('Cliente A', 'Cliente B')).toBe('Cliente A');
    });

    it('deve usar regionalCliente se boletimCliente for null', () => {
      expect(getCliente(null, 'Cliente B')).toBe('Cliente B');
    });

    it('deve retornar "-" se ambos forem null', () => {
      expect(getCliente(null, null)).toBe('-');
    });
  });
});