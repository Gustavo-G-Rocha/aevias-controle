import { describe, it, expect } from 'vitest';
import {
  isChecklistValid,
  hasCreator,
  getErrorMessage,
  formatDateConcr,
  getClimaEmoji,
  getClimaTexto,
  getPeriodoNome,
  getTipoRupturaTexto,
  chunkArray,
  buildFooterProps,
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

  describe('formatDateConcr', () => {
    it('deve formatar data ISO para pt-BR', () => {
      expect(formatDateConcr('2024-05-15')).toBe('15/05/2024');
    });
    it('deve retornar string vazia para valor falsy', () => {
      expect(formatDateConcr(null)).toBe('');
      expect(formatDateConcr('')).toBe('');
      expect(formatDateConcr(undefined)).toBe('');
    });
  });

  describe('getClimaEmoji', () => {
    it('deve retornar emoji correto para cada condição', () => {
      expect(getClimaEmoji('bom')).toBe('☀️');
      expect(getClimaEmoji('instavel')).toBe('⛅');
      expect(getClimaEmoji('chuva')).toBe('🌧️');
    });
    it('deve retornar string vazia para condição desconhecida', () => {
      expect(getClimaEmoji('neve')).toBe('');
      expect(getClimaEmoji(undefined)).toBe('');
    });
  });

  describe('getClimaTexto', () => {
    it('deve retornar texto correto para cada condição', () => {
      expect(getClimaTexto('bom')).toBe('Bom');
      expect(getClimaTexto('instavel')).toBe('Instável');
      expect(getClimaTexto('chuva')).toBe('Chuva');
    });
    it('deve retornar "-" para condição desconhecida', () => {
      expect(getClimaTexto('neve')).toBe('-');
      expect(getClimaTexto(undefined)).toBe('-');
    });
  });

  describe('getPeriodoNome', () => {
    it('deve retornar nome correto para cada período', () => {
      expect(getPeriodoNome('manha')).toBe('MANHÃ');
      expect(getPeriodoNome('tarde')).toBe('TARDE');
      expect(getPeriodoNome('noite')).toBe('NOITE');
    });
    it('deve retornar período em maiúsculas para valor desconhecido', () => {
      expect(getPeriodoNome('outro')).toBe('OUTRO');
    });
    it('deve retornar string vazia para valor falsy', () => {
      expect(getPeriodoNome(undefined)).toBe('');
    });
  });

  describe('getTipoRupturaTexto', () => {
    it('deve retornar texto correto para cada tipo', () => {
      expect(getTipoRupturaTexto('compressao_axial')).toBe('Compressão Axial');
      expect(getTipoRupturaTexto('comp_diametral')).toBe('Compressão Diametral');
      expect(getTipoRupturaTexto('tracao_flexao')).toBe('Tração na Flexão');
    });
    it('deve retornar N/A para tipo desconhecido', () => {
      expect(getTipoRupturaTexto('outro')).toBe('N/A');
      expect(getTipoRupturaTexto(undefined)).toBe('N/A');
    });
  });

  describe('chunkArray', () => {
    it('deve dividir array em chunks do tamanho correto', () => {
      expect(chunkArray([1,2,3,4,5,6], 2)).toEqual([[1,2],[3,4],[5,6]]);
      expect(chunkArray([1,2,3,4,5], 2)).toEqual([[1,2],[3,4],[5]]);
      expect(chunkArray([1,2,3], 6)).toEqual([[1,2,3]]);
    });
    it('deve retornar array vazio para entrada falsy', () => {
      expect(chunkArray(null, 3)).toEqual([]);
      expect(chunkArray(undefined, 3)).toEqual([]);
      expect(chunkArray([], 3)).toEqual([]);
    });
  });

  describe('buildFooterProps', () => {
    it('deve montar props corretamente com dados completos', () => {
      const checklist = {
        laboratorista_name: 'João',
        created_by: 'joao@test.com',
        created_date: '2024-01-01',
        approved_by: 'maria@test.com',
        approved_date: '2024-01-02',
        approver_details: { name: 'Maria', position: 'Engenheira', crea_number: '12345' },
        client_signature: { engineer_name: 'Pedro', signed_by: 'pedro@test.com', position: 'Fiscal', crea_number: '99999', signed_date: '2024-01-03' },
      };
      const creatorUser = { position: 'Laboratorista Sênior' };
      const props = buildFooterProps(checklist, creatorUser);
      expect(props.labName).toBe('João');
      expect(props.labEmail).toBe('joao@test.com');
      expect(props.labPosition).toBe('Laboratorista Sênior');
      expect(props.approverName).toBe('Maria');
      expect(props.approverCREA).toBe('12345');
      expect(props.clientName).toBe('Pedro');
    });
    it('deve usar posição padrão quando creatorUser não tem position', () => {
      const checklist = { laboratorista_name: 'Ana' };
      const props = buildFooterProps(checklist, null);
      expect(props.labPosition).toBe('Laboratorista');
    });
  });
});