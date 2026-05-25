import { describe, it, expect } from 'vitest';
import {
  validateGranulometriaIndividual,
  validateEnsaioCAUQ,
  validateEnsaioRascunho,
} from '@/utils/ensaioValidation';

describe('validateGranulometriaIndividual', () => {
  describe('rascunho', () => {
    it('válido quando obra_id está preenchido', () => {
      const result = validateGranulometriaIndividual(
        { obra_id: 'o1', tipo_material: '', data_ensaio: '' },
        'rascunho'
      );
      expect(result.valid).toBe(true);
    });

    it('inválido quando obra_id está ausente', () => {
      const result = validateGranulometriaIndividual({}, 'rascunho');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('obra');
    });
  });

  describe('finalizado', () => {
    const base = {
      obra_id: 'o1',
      tipo_material: 'CAUQ',
      data_ensaio: '2026-01-01',
    };

    it('válido com todos os campos obrigatórios', () => {
      expect(validateGranulometriaIndividual(base, 'finalizado').valid).toBe(true);
    });

    it('inválido sem tipo_material', () => {
      const result = validateGranulometriaIndividual({ ...base, tipo_material: '' }, 'finalizado');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('material');
    });

    it('inválido sem data_ensaio', () => {
      const result = validateGranulometriaIndividual({ ...base, data_ensaio: '' }, 'finalizado');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('data');
    });

    it('inválido sem obra_id mesmo ao finalizar', () => {
      const result = validateGranulometriaIndividual(
        { obra_id: '', tipo_material: 'CAUQ', data_ensaio: '2026-01-01' },
        'finalizado'
      );
      expect(result.valid).toBe(false);
    });
  });
});

describe('validateEnsaioCAUQ', () => {
  it('válido com obra e data', () => {
    expect(validateEnsaioCAUQ({ obra_id: 'o1', data_ensaio: '2026-01-01' }).valid).toBe(true);
  });

  it('inválido sem obra_id', () => {
    const result = validateEnsaioCAUQ({ obra_id: '', data_ensaio: '2026-01-01' });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obra');
  });

  it('inválido sem data_ensaio', () => {
    const result = validateEnsaioCAUQ({ obra_id: 'o1', data_ensaio: '' });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('data');
  });
});

describe('validateEnsaioRascunho', () => {
  it('válido quando obra_id está preenchido', () => {
    expect(validateEnsaioRascunho({ obra_id: 'o1' }).valid).toBe(true);
  });

  it('inválido quando obra_id está ausente', () => {
    const result = validateEnsaioRascunho({});
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obra');
  });
});