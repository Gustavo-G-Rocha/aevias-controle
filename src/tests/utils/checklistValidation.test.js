import { describe, it, expect } from 'vitest';
import { validateChecklistUsinaForm, validateDecimalInput } from '@/utils/checklistValidation';

describe('validateChecklistUsinaForm', () => {
  describe('ao salvar progresso (rascunho)', () => {
    it('válido quando obra_id está preenchido', () => {
      const result = validateChecklistUsinaForm({ obra_id: 'obra-1' }, 'rascunho');
      expect(result.valid).toBe(true);
    });

    it('inválido quando obra_id está ausente', () => {
      const result = validateChecklistUsinaForm({}, 'rascunho');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('obra');
    });
  });

  describe('ao finalizar', () => {
    const baseData = {
      obra_id: 'obra-1',
      project_id: 'proj-1',
      usina: 'Usina X',
      pedreira: 'Pedreira Y',
      faixa_especificada: 'Faixa C',
      ligante: 'CAP 50/70',
    };

    it('válido quando todos os campos obrigatórios estão preenchidos', () => {
      const result = validateChecklistUsinaForm(baseData, 'finalizado');
      expect(result.valid).toBe(true);
    });

    it('inválido quando project_id está ausente', () => {
      const result = validateChecklistUsinaForm({ ...baseData, project_id: '' }, 'finalizado');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Projeto');
    });

    it('inválido quando usina está ausente', () => {
      const result = validateChecklistUsinaForm({ ...baseData, usina: '' }, 'finalizado');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Usina');
    });

    it('inválido quando pedreira está ausente', () => {
      const result = validateChecklistUsinaForm({ ...baseData, pedreira: null }, 'finalizado');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Pedreira');
    });

    it('inválido quando faixa_especificada está ausente', () => {
      const result = validateChecklistUsinaForm({ ...baseData, faixa_especificada: undefined }, 'finalizado');
      expect(result.valid).toBe(false);
    });

    it('inválido quando ligante está ausente', () => {
      const result = validateChecklistUsinaForm({ ...baseData, ligante: '' }, 'finalizado');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Ligante');
    });
  });
});

describe('validateDecimalInput', () => {
  it('permite string vazia', () => {
    expect(validateDecimalInput('', 2)).toBe(true);
  });

  it('0 decimais — aceita apenas inteiros', () => {
    expect(validateDecimalInput('123', 0)).toBe(true);
    expect(validateDecimalInput('12.3', 0)).toBe(false);
  });

  it('1 decimal — aceita até 1 casa', () => {
    expect(validateDecimalInput('12.3', 1)).toBe(true);
    expect(validateDecimalInput('12.34', 1)).toBe(false);
  });

  it('2 decimais — aceita até 2 casas', () => {
    expect(validateDecimalInput('1.23', 2)).toBe(true);
    expect(validateDecimalInput('1.234', 2)).toBe(false);
  });

  it('3 decimais — aceita até 3 casas', () => {
    expect(validateDecimalInput('0.075', 3)).toBe(true);
    expect(validateDecimalInput('0.0751', 3)).toBe(false);
  });

  it('sem limite (default) — aceita qualquer número', () => {
    expect(validateDecimalInput('123456.789012', 99)).toBe(true);
  });

  it('rejeita letras', () => {
    expect(validateDecimalInput('abc', 2)).toBe(false);
  });
});