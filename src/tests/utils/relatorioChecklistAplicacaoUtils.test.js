import { describe, it, expect } from 'vitest';
import {
  formatDataChecklist,
  formatConformidade,
  formatNumerico,
  formatTemperatura,
  chunkArray,
  temAcoesCorretivas,
  formatarJornada,
  buildFooterPropsAplicacao,
  formatClimaLabel,
} from '../../utils/relatorioChecklistAplicacaoUtils';

describe('relatorioChecklistAplicacaoUtils', () => {
  describe('formatDataChecklist', () => {
    it('retorna "-" para data nula', () => {
      expect(formatDataChecklist(null)).toBe('-');
      expect(formatDataChecklist(undefined)).toBe('-');
    });

    it('retorna data formatada em pt-BR', () => {
      const resultado = formatDataChecklist('2025-05-27');
      expect(resultado).toBe('27/05/2025');
    });
  });

  describe('formatConformidade', () => {
    it('retorna "Sim" para true', () => {
      expect(formatConformidade(true)).toBe('Sim');
    });

    it('retorna "Não" para false', () => {
      expect(formatConformidade(false)).toBe('Não');
    });

    it('retorna "-" para null/undefined', () => {
      expect(formatConformidade(null)).toBe('-');
      expect(formatConformidade(undefined)).toBe('-');
    });
  });

  describe('formatNumerico', () => {
    it('formata número com 2 casas decimais', () => {
      expect(formatNumerico(1.5)).toBe('1.50');
      expect(formatNumerico(100)).toBe('100.00');
    });

    it('retorna "-" para null ou undefined', () => {
      expect(formatNumerico(null)).toBe('-');
      expect(formatNumerico(undefined)).toBe('-');
    });

    it('respeita número de casas decimais personalizado', () => {
      expect(formatNumerico(1.5678, 1)).toBe('1.6');
    });
  });

  describe('formatTemperatura', () => {
    it('formata temperatura com sufixo °C', () => {
      expect(formatTemperatura(25.5)).toBe('25.5°C');
    });

    it('retorna "-" para null ou undefined', () => {
      expect(formatTemperatura(null)).toBe('-');
      expect(formatTemperatura(undefined)).toBe('-');
    });
  });

  describe('chunkArray', () => {
    it('divide array em chunks iguais', () => {
      expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    });

    it('retorna array vazio para null', () => {
      expect(chunkArray(null, 2)).toEqual([]);
    });

    it('trata último chunk menor que o tamanho', () => {
      expect(chunkArray([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
    });

    it('retorna array único se menor que chunk', () => {
      expect(chunkArray([1], 6)).toEqual([[1]]);
    });
  });

  describe('temAcoesCorretivas', () => {
    it('retorna true quando há ação e descrição', () => {
      const c = { acoes_corretivas_realizado: true, acoes_corretivas_descricao: 'Ação X' };
      expect(temAcoesCorretivas(c)).toBe(true);
    });

    it('retorna false quando descrição vazia', () => {
      const c = { acoes_corretivas_realizado: true, acoes_corretivas_descricao: '' };
      expect(temAcoesCorretivas(c)).toBe(false);
    });

    it('retorna false quando realizado é false', () => {
      const c = { acoes_corretivas_realizado: false, acoes_corretivas_descricao: 'Ação X' };
      expect(temAcoesCorretivas(c)).toBe(false);
    });
  });

  describe('formatarJornada', () => {
    it('formata jornada completa', () => {
      expect(formatarJornada({ horario_inicio: '08:00', horario_fim: '17:00' })).toBe('08:00 - 17:00');
    });

    it('retorna null sem horários', () => {
      expect(formatarJornada({ horario_inicio: '08:00' })).toBeNull();
      expect(formatarJornada(null)).toBeNull();
    });
  });

  describe('buildFooterPropsAplicacao', () => {
    it('constrói props do footer corretamente', () => {
      const checklist = {
        laboratorista_name: 'João',
        created_by: 'joao@test.com',
        created_date: '2025-01-01',
        approved_by: 'eng@test.com',
        approved_date: '2025-01-02',
        approver_details: { name: 'Eng Silva', position: 'Engenheiro', crea_number: '1234' },
        client_signature: {
          engineer_name: 'Cli Eng',
          signed_by: 'cli@test.com',
          crea_number: '5678',
          signed_date: '2025-01-03',
        },
      };
      const props = buildFooterPropsAplicacao(checklist, { position: 'Técnico' });

      expect(props.labName).toBe('João');
      expect(props.labEmail).toBe('joao@test.com');
      expect(props.labPosition).toBe('Técnico');
      expect(props.approverName).toBe('Eng Silva');
      expect(props.clientName).toBe('Cli Eng');
    });

    it('usa "Laboratorista" como posição padrão se não fornecida', () => {
      const checklist = { laboratorista_name: 'Maria' };
      const props = buildFooterPropsAplicacao(checklist, null);
      expect(props.labPosition).toBe('Laboratorista');
    });
  });

  describe('formatClimaLabel', () => {
    it('retorna label com emoji para condições válidas', () => {
      expect(formatClimaLabel('bom')).toBe('☀️ Bom');
      expect(formatClimaLabel('instavel')).toBe('⛅ Instável');
      expect(formatClimaLabel('chuva')).toBe('🌧️ Chuva');
    });

    it('retorna null para condição desconhecida', () => {
      expect(formatClimaLabel('unknown')).toBeNull();
      expect(formatClimaLabel(null)).toBeNull();
    });
  });
});