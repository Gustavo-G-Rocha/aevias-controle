import { describe, it, expect } from 'vitest';
import { todayISO } from '@/utils/formInitialData';

describe('todayISO', () => {
  it('retorna a data de hoje no formato YYYY-MM-DD', () => {
    const hoje = new Date().toISOString().split('T')[0];
    expect(todayISO()).toBe(hoje);
  });

  it('tem o formato YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});