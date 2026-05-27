import { describe, it, expect } from 'vitest';
import {
  isChecklistValid,
  hasCreator,
  getErrorMessage,
} from '@/utils/relatorioChecklistConcretagemUtils';

describe('relatorioChecklistConcretagemUtils', () => {
  describe('isChecklistValid', () => {
    it('deve retornar true quando checklist está definido', () => {
      const checklist = { id: '1', nome: 'Test' };
      expect(isChecklistValid(checklist)).toBe(true);
    });

    it('deve retornar false quando checklist é null', () => {
      expect(isChecklistValid(null)).toBe(false);
    });

    it('deve retornar false quando checklist é undefined', () => {
      expect(isChecklistValid(undefined)).toBe(false);
    });
  });

  describe('hasCreator', () => {
    it('deve retornar true quando creatorUser está definido', () => {
      expect(hasCreator({ id: '1', name: 'João' })).toBe(true);
    });

    it('deve retornar false quando creatorUser é null', () => {
      expect(hasCreator(null)).toBe(false);
    });

    it('deve retornar false quando creatorUser é undefined', () => {
      expect(hasCreator(undefined)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('deve retornar a mensagem de erro quando error está definido', () => {
      const message = 'Erro específico';
      expect(getErrorMessage(message, { id: '1' })).toBe(message);
    });

    it('deve retornar mensagem padrão quando checklist é null', () => {
      expect(getErrorMessage(null, null)).toBe('Checklist não encontrado');
    });

    it('deve retornar mensagem genérica quando nenhuma condição específica', () => {
      expect(getErrorMessage(null, { id: '1' })).toBe('Erro ao carregar relatório');
    });

    it('deve priorizar a mensagem de erro sobre outras condições', () => {
      const message = 'Erro específico';
      expect(getErrorMessage(message, null)).toBe(message);
    });
  });
});