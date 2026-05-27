import { describe, it, expect } from 'vitest';
import {
  buildRelatorioChecklistData,
  isValidRelatorioChecklistData,
  getChecklistEntityName,
} from '@/utils/relatorioChecklistUtils';

describe('relatorioChecklistUtils', () => {
  describe('buildRelatorioChecklistData', () => {
    it('deve construir dados consolidados corretamente', () => {
      const checklist = { id: '123' };
      const obra = { id: '456' };
      const regional = { id: '789' };
      const project = { id: 'proj1' };
      const user = { id: 'user1', email: 'test@test.com' };
      const creatorUser = { id: 'creator1' };

      const result = buildRelatorioChecklistData(
        checklist,
        obra,
        regional,
        project,
        user,
        creatorUser
      );

      expect(result).toEqual({
        checklist,
        obra,
        regional,
        project,
        user,
        creatorUser,
      });
    });

    it('deve construir com valores null', () => {
      const checklist = { id: '123' };

      const result = buildRelatorioChecklistData(checklist, null, null, null, null, null);

      expect(result.checklist).toBe(checklist);
      expect(result.obra).toBeNull();
      expect(result.regional).toBeNull();
      expect(result.project).toBeNull();
    });
  });

  describe('isValidRelatorioChecklistData', () => {
    it('deve retornar true para checklist válido', () => {
      const checklist = { id: '123', data: '2024-05-01' };
      expect(isValidRelatorioChecklistData(checklist)).toBe(true);
    });

    it('deve retornar false para null', () => {
      expect(isValidRelatorioChecklistData(null)).toBe(false);
    });

    it('deve retornar false para objeto sem id', () => {
      const checklist = { data: '2024-05-01' };
      expect(isValidRelatorioChecklistData(checklist)).toBe(false);
    });

    it('deve retornar false para id vazio', () => {
      const checklist = { id: '' };
      expect(isValidRelatorioChecklistData(checklist)).toBe(false);
    });
  });

  describe('getChecklistEntityName', () => {
    it('deve retornar o nome da entidade correto', () => {
      const entityName = getChecklistEntityName();
      expect(entityName).toBe('ChecklistUsina');
    });
  });
});