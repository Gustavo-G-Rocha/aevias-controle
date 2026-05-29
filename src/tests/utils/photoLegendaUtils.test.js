import { describe, it, expect } from 'vitest';
import {
  normalizarFoto,
  extrairUrl,
  extrairLegenda,
  extrairUrls,
  ehFotoComEstrutura,
  criarFoto,
} from '@/utils/photoLegendaUtils';

describe('photoLegendaUtils', () => {
  describe('normalizarFoto', () => {
    it('normaliza foto string para estrutura', () => {
      const result = normalizarFoto('https://example.com/foto.jpg');
      expect(result).toEqual({
        url: 'https://example.com/foto.jpg',
        legenda: '',
      });
    });

    it('normaliza foto com estrutura { url, legenda }', () => {
      const foto = { url: 'https://example.com/foto.jpg', legenda: 'Minha foto' };
      const result = normalizarFoto(foto);
      expect(result).toEqual(foto);
    });

    it('normaliza foto com estrutura sem legenda', () => {
      const foto = { url: 'https://example.com/foto.jpg' };
      const result = normalizarFoto(foto);
      expect(result).toEqual({
        url: 'https://example.com/foto.jpg',
        legenda: '',
      });
    });

    it('retorna { url: "", legenda: "" } para null/undefined', () => {
      expect(normalizarFoto(null)).toEqual({ url: '', legenda: '' });
      expect(normalizarFoto(undefined)).toEqual({ url: '', legenda: '' });
    });
  });

  describe('extrairUrl', () => {
    it('extrai URL de foto string', () => {
      expect(extrairUrl('https://example.com/foto.jpg')).toBe(
        'https://example.com/foto.jpg'
      );
    });

    it('extrai URL de foto com estrutura', () => {
      const foto = { url: 'https://example.com/foto.jpg', legenda: 'Legenda' };
      expect(extrairUrl(foto)).toBe('https://example.com/foto.jpg');
    });

    it('retorna string vazia para null/undefined', () => {
      expect(extrairUrl(null)).toBe('');
      expect(extrairUrl(undefined)).toBe('');
    });
  });

  describe('extrairLegenda', () => {
    it('extrai legenda personalizada', () => {
      const foto = { url: 'https://example.com/foto.jpg', legenda: 'Compactação concluída' };
      expect(extrairLegenda(foto, 0)).toBe('Compactação concluída');
    });

    it('usa fallback "Foto N" quando sem legenda', () => {
      expect(extrairLegenda('https://example.com/foto.jpg', 0)).toBe('Foto 1');
      expect(extrairLegenda({ url: 'https://example.com/foto.jpg' }, 5)).toBe('Foto 6');
    });

    it('usa fallback para legenda vazia/whitespace', () => {
      expect(extrairLegenda({ url: 'url', legenda: '' }, 2)).toBe('Foto 3');
      expect(extrairLegenda({ url: 'url', legenda: '   ' }, 2)).toBe('Foto 3');
    });

    it('incrementa índice corretamente', () => {
      const foto = 'https://example.com/foto.jpg';
      expect(extrairLegenda(foto, 0)).toBe('Foto 1');
      expect(extrairLegenda(foto, 1)).toBe('Foto 2');
      expect(extrairLegenda(foto, 9)).toBe('Foto 10');
    });
  });

  describe('extrairUrls', () => {
    it('extrai URLs de array misto (strings e estruturas)', () => {
      const fotos = [
        'https://example.com/1.jpg',
        { url: 'https://example.com/2.jpg', legenda: 'Foto 2' },
        'https://example.com/3.jpg',
      ];
      const result = extrairUrls(fotos);
      expect(result).toEqual([
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
      ]);
    });

    it('retorna array vazio para null/undefined', () => {
      expect(extrairUrls(null)).toEqual([]);
      expect(extrairUrls(undefined)).toEqual([]);
    });

    it('filtra URLs vazias', () => {
      const fotos = [
        'https://example.com/1.jpg',
        { url: '', legenda: 'Vazia' },
        'https://example.com/2.jpg',
      ];
      const result = extrairUrls(fotos);
      expect(result).toEqual([
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
      ]);
    });
  });

  describe('ehFotoComEstrutura', () => {
    it('retorna true para { url: string }', () => {
      expect(ehFotoComEstrutura({ url: 'https://example.com/foto.jpg' })).toBe(true);
      expect(ehFotoComEstrutura({ url: 'https://example.com/foto.jpg', legenda: 'Legenda' })).toBe(true);
    });

    it('retorna false para string', () => {
      expect(ehFotoComEstrutura('https://example.com/foto.jpg')).toBe(false);
    });

    it('retorna false para null/undefined/outros tipos', () => {
      expect(ehFotoComEstrutura(null)).toBe(false);
      expect(ehFotoComEstrutura(undefined)).toBe(false);
      expect(ehFotoComEstrutura({})).toBe(false);
      expect(ehFotoComEstrutura({ legenda: 'Sem URL' })).toBe(false);
    });
  });

  describe('criarFoto', () => {
    it('cria foto com URL e legenda', () => {
      const result = criarFoto('https://example.com/foto.jpg', 'Minha foto');
      expect(result).toEqual({
        url: 'https://example.com/foto.jpg',
        legenda: 'Minha foto',
      });
    });

    it('cria foto com URL sem legenda', () => {
      const result = criarFoto('https://example.com/foto.jpg');
      expect(result).toEqual({
        url: 'https://example.com/foto.jpg',
        legenda: '',
      });
    });

    it('usa string vazia para URL vazia', () => {
      const result = criarFoto('', 'Legenda');
      expect(result).toEqual({
        url: '',
        legenda: 'Legenda',
      });
    });
  });
});