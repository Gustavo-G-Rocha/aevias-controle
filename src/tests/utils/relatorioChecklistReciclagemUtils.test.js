/**
 * Testes unitários para relatorioChecklistReciclagemUtils.js
 */
import { describe, it, expect } from 'vitest';
import {
  getClimaEmojiRecic,
  getClimaTextRecic,
  formatDateRecic,
  ENSAIOS_EMPREITEIRA_RECICLAGEM,
} from '@/utils/relatorioChecklistReciclagemUtils';

// ── getClimaEmojiRecic ────────────────────────────────────────────────────────
describe('getClimaEmojiRecic', () => {
  it('retorna ☀️ para "bom"', () => {
    expect(getClimaEmojiRecic('bom')).toBe('☀️');
  });
  it('retorna ⛅ para "instavel"', () => {
    expect(getClimaEmojiRecic('instavel')).toBe('⛅');
  });
  it('retorna 🌧️ para "chuva"', () => {
    expect(getClimaEmojiRecic('chuva')).toBe('🌧️');
  });
  it('retorna string vazia para valor desconhecido', () => {
    expect(getClimaEmojiRecic('neve')).toBe('');
  });
  it('retorna string vazia para undefined', () => {
    expect(getClimaEmojiRecic(undefined)).toBe('');
  });
  it('retorna string vazia para null', () => {
    expect(getClimaEmojiRecic(null)).toBe('');
  });
});

// ── getClimaTextRecic ─────────────────────────────────────────────────────────
describe('getClimaTextRecic', () => {
  it('retorna "Bom" para "bom"', () => {
    expect(getClimaTextRecic('bom')).toBe('Bom');
  });
  it('retorna "Instável" para "instavel"', () => {
    expect(getClimaTextRecic('instavel')).toBe('Instável');
  });
  it('retorna "Chuva" para "chuva"', () => {
    expect(getClimaTextRecic('chuva')).toBe('Chuva');
  });
  it('retorna string vazia para valor desconhecido', () => {
    expect(getClimaTextRecic('granizo')).toBe('');
  });
  it('retorna string vazia para undefined', () => {
    expect(getClimaTextRecic(undefined)).toBe('');
  });
  it('retorna string vazia para null', () => {
    expect(getClimaTextRecic(null)).toBe('');
  });
});

// ── formatDateRecic ───────────────────────────────────────────────────────────
describe('formatDateRecic', () => {
  it('retorna string vazia para null', () => {
    expect(formatDateRecic(null)).toBe('');
  });
  it('retorna string vazia para undefined', () => {
    expect(formatDateRecic(undefined)).toBe('');
  });
  it('retorna string vazia para string vazia', () => {
    expect(formatDateRecic('')).toBe('');
  });
  it('formata uma data ISO para pt-BR', () => {
    const result = formatDateRecic('2024-03-15');
    expect(result).toBe('15/03/2024');
  });
  it('formata data no início do ano corretamente', () => {
    const result = formatDateRecic('2024-01-01');
    expect(result).toBe('01/01/2024');
  });
});

// ── ENSAIOS_EMPREITEIRA_RECICLAGEM ────────────────────────────────────────────
describe('ENSAIOS_EMPREITEIRA_RECICLAGEM', () => {
  it('é um array não vazio', () => {
    expect(Array.isArray(ENSAIOS_EMPREITEIRA_RECICLAGEM)).toBe(true);
    expect(ENSAIOS_EMPREITEIRA_RECICLAGEM.length).toBeGreaterThan(0);
  });
  it('cada item tem key e label', () => {
    ENSAIOS_EMPREITEIRA_RECICLAGEM.forEach(item => {
      expect(typeof item.key).toBe('string');
      expect(item.key.length).toBeGreaterThan(0);
      expect(typeof item.label).toBe('string');
      expect(item.label.length).toBeGreaterThan(0);
    });
  });
  it('contém "compactacao_proctor"', () => {
    const keys = ENSAIOS_EMPREITEIRA_RECICLAGEM.map(e => e.key);
    expect(keys).toContain('compactacao_proctor');
  });
  it('contém "viga_benkelman"', () => {
    const keys = ENSAIOS_EMPREITEIRA_RECICLAGEM.map(e => e.key);
    expect(keys).toContain('viga_benkelman');
  });
  it('possui exactamente 10 itens', () => {
    expect(ENSAIOS_EMPREITEIRA_RECICLAGEM.length).toBe(10);
  });
  it('não tem keys duplicadas', () => {
    const keys = ENSAIOS_EMPREITEIRA_RECICLAGEM.map(e => e.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});