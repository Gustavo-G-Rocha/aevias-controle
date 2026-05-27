import { describe, it, expect } from 'vitest';
import {
  isChecklistValid,
  isRegionalValid,
  hasCreator,
  getErrorMessage,
} from '@/utils/relatorioChecklistAplicacaoUtils';

describe('relatorioChecklistAplicacaoUtils', () => {
  describe('isChecklistValid', () => {
    it('deve retornar true quando checklist e obra estão definidos', () => {
      const checklist = { id: '1', nome: 'Test' };
      const obra = { id: '2', name: 'Obra Test' };
      expect(isChecklistValid(checklist, obra)).toBe(true);
    });

    it('deve retornar false quando checklist é null', () => {
      expect(isChecklistValid(null, { id: '2' })).toBe(false);
    });

    it('deve retornar false quando obra é null', () => {
      expect(isChecklistValid({ id: '1' }, null)).toBe(false);
    });

    it('deve retornar false quando ambos são null', () => {
      expect(isChecklistValid(null, null)).toBe(false);
    });
  });

  describe('isRegionalValid', () => {
    it('deve retornar true quando regional está definido', () => {
      expect(isRegionalValid({ id: '1', name: 'Regional' })).toBe(true);
    });

    it('deve retornar false quando regional é null', () => {
      expect(isRegionalValid(null)).toBe(false);
    });

    it('deve retornar false quando regional é undefined', () => {
      expect(isRegionalValid(undefined)).toBe(false);
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