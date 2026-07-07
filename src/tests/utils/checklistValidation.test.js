import { describe, it, expect } from 'vitest';
import { validateChecklistUsinaForm } from '@/utils/checklistValidation';

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