/**
 * tests/utils/formValidationSchemas.test.js
 *
 * Testes para os schemas zod de validação base de formulários.
 * Cobre validateEnsaioForm e validateChecklistForm.
 */
import { describe, it, expect } from 'vitest';
import { validateEnsaioForm, validateChecklistForm } from '@/utils/formValidationSchemas';

describe('validateEnsaioForm', () => {
  it('retorna válido quando obra_id está preenchido (rascunho)', () => {
    const result = validateEnsaioForm({ obra_id: 'obra-1' }, 'rascunho');
    expect(result.valid).toBe(true);
  });

  it('retorna inválido quando obra_id está vazio', () => {
    const result = validateEnsaioForm({ obra_id: '' }, 'rascunho');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obra');
  });

  it('exige data_ensaio ao finalizar', () => {
    const result = validateEnsaioForm({ obra_id: 'obra-1' }, 'finalizado');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('data');
  });

  it('passa ao finalizar com obra_id e data_ensaio', () => {
    const result = validateEnsaioForm({ obra_id: 'obra-1', data_ensaio: '2025-01-01' }, 'finalizado');
    expect(result.valid).toBe(true);
  });
});

describe('validateChecklistForm', () => {
  it('retorna válido quando obra_id está preenchido (rascunho)', () => {
    const result = validateChecklistForm({ obra_id: 'obra-1' }, 'rascunho');
    expect(result.valid).toBe(true);
  });

  it('retorna inválido quando obra_id está vazio', () => {
    const result = validateChecklistForm({ obra_id: '' }, 'rascunho');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obra');
  });

  it('exige data ao finalizar', () => {
    const result = validateChecklistForm({ obra_id: 'obra-1' }, 'finalizado');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('data');
  });

  it('passa ao finalizar com obra_id e data', () => {
    const result = validateChecklistForm({ obra_id: 'obra-1', data: '2025-01-01' }, 'finalizado');
    expect(result.valid).toBe(true);
  });
});