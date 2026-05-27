import { describe, it, expect } from 'vitest';
import {
  buildRelatorioDiarioData,
  isValidRelatorioDiarioData,
} from '@/utils/relatorioDiarioUtils';

describe('relatorioDiarioUtils', () => {
  describe('buildRelatorioDiarioData', () => {
    it('deve construir dados consolidados corretamente', () => {
      const diario = { id: '123' };
      const obra = { id: '456' };
      const project = { id: '789' };
      const user = { id: 'user1', email: 'test@test.com' };
      const regional = { id: 'reg1' };
      const creatorUser = { id: 'creator1' };

      const result = buildRelatorioDiarioData(
        diario,
        obra,
        project,
        user,
        regional,
        creatorUser
      );

      expect(result).toEqual({
        diario,
        obra,
        project,
        user,
        regional,
        creatorUser,
      });
    });

    it('deve construir com valores null', () => {
      const diario = { id: '123' };

      const result = buildRelatorioDiarioData(diario, null, null, null, null, null);

      expect(result.diario).toBe(diario);
      expect(result.obra).toBeNull();
      expect(result.regional).toBeNull();
    });
  });

  describe('isValidRelatorioDiarioData', () => {
    it('deve retornar true para diário válido', () => {
      const diario = { id: '123', data: '2024-05-01' };
      expect(isValidRelatorioDiarioData(diario)).toBe(true);
    });

    it('deve retornar false para null', () => {
      expect(isValidRelatorioDiarioData(null)).toBe(false);
    });

    it('deve retornar false para objeto sem id', () => {
      const diario = { data: '2024-05-01' };
      expect(isValidRelatorioDiarioData(diario)).toBe(false);
    });

    it('deve retornar false para id vazio', () => {
      const diario = { id: '' };
      expect(isValidRelatorioDiarioData(diario)).toBe(false);
    });
  });
});