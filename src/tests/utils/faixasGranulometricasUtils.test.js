import { describe, it, expect } from 'vitest';
import {
  PENEIRAS_ASTM,
  TIPO_CORES,
  STATUS_CORES,
  getAberturaMm,
  getPeneiraDescricao,
  getInitialFaixaData,
  validatePeneiras,
  filterFaixas,
  getUserAccessLevel,
  canUserManage
} from '@/utils/faixasGranulometricasUtils';

describe('faixasGranulometricasUtils', () => {
  describe('Constants', () => {
    it('deve ter PENEIRAS_ASTM com 21 peneiras', () => {
      expect(PENEIRAS_ASTM).toHaveLength(21);
    });

    it('deve ter TIPO_CORES com 4 tipos', () => {
      expect(Object.keys(TIPO_CORES)).toHaveLength(4);
      expect(TIPO_CORES.CAUQ).toBeDefined();
      expect(TIPO_CORES.MRAF).toBeDefined();
      expect(TIPO_CORES.BGS).toBeDefined();
      expect(TIPO_CORES.CAMADAS_GRANULARES).toBeDefined();
    });

    it('deve ter STATUS_CORES com 2 status', () => {
      expect(Object.keys(STATUS_CORES)).toHaveLength(2);
      expect(STATUS_CORES.ativo).toBeDefined();
      expect(STATUS_CORES.inativo).toBeDefined();
    });
  });

  describe('getAberturaMm', () => {
    it('deve retornar abertura correta para peneira válida', () => {
      expect(getAberturaMm('3"')).toBe(75.0);
      expect(getAberturaMm('Nº 4')).toBe(4.75);
      expect(getAberturaMm('Fundo')).toBe(0.0);
    });

    it('deve retornar null para peneira inválida', () => {
      expect(getAberturaMm('INVALIDA')).toBeNull();
    });
  });

  describe('getPeneiraDescricao', () => {
    it('deve retornar descrição correta', () => {
      expect(getPeneiraDescricao('3"')).toBe('3" (75.0 mm)');
      expect(getPeneiraDescricao('Nº 4')).toBe('Nº 4 (4.75 mm)');
    });

    it('deve retornar astm se peneira não encontrada', () => {
      expect(getPeneiraDescricao('INVALIDA')).toBe('INVALIDA');
    });
  });

  describe('getInitialFaixaData', () => {
    it('deve retornar estado inicial correto', () => {
      const initial = getInitialFaixaData();

      expect(initial.tipo).toBe('CAUQ');
      expect(initial.nome).toBe('');
      expect(initial.especificacao).toBe('');
      expect(initial.orgao).toBe('');
      expect(initial.status).toBe('ativo');
      expect(initial.peneiras).toHaveLength(1);
      expect(initial.peneiras[0]).toEqual({ astm: "", min: "", max: "" });
    });
  });

  describe('validatePeneiras', () => {
    it('deve validar e adicionar abertura em peneiras válidas', () => {
      const peneiras = [
        { astm: '3"', min: '0', max: '100' },
        { astm: 'Nº 4', min: '10', max: '50' }
      ];

      const resultado = validatePeneiras(peneiras);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].abertura).toBe('75 mm');
      expect(resultado[1].abertura).toBe('4.75 mm');
    });

    it('deve filtrar peneiras incompletas', () => {
      const peneiras = [
        { astm: '3"', min: '0', max: '100' },
        { astm: '3"', min: '0', max: '' },
        { astm: '', min: '10', max: '50' }
      ];

      const resultado = validatePeneiras(peneiras);

      expect(resultado).toHaveLength(1);
    });

    it('deve retornar array vazio para peneiras vazias', () => {
      const peneiras = [];
      const resultado = validatePeneiras(peneiras);

      expect(resultado).toHaveLength(0);
    });
  });

  describe('filterFaixas', () => {
    const mockFaixas = [
      {
        id: '1',
        tipo: 'CAUQ',
        nome: 'Faixa III',
        especificacao: 'ES-P 14/05',
        orgao: 'DER/PR',
        status: 'ativo'
      },
      {
        id: '2',
        tipo: 'MRAF',
        nome: 'Faixa A',
        especificacao: 'DNIT 031/2006',
        orgao: 'DNIT',
        status: 'ativo'
      },
      {
        id: '3',
        tipo: 'BGS',
        nome: 'Faixa B',
        especificacao: 'NBR 15115',
        orgao: 'ABNT',
        status: 'inativo'
      }
    ];

    it('deve retornar todas as faixas quando searchTerm vazio e tipoFilter all', () => {
      const resultado = filterFaixas(mockFaixas, '', 'all');

      expect(resultado).toHaveLength(3);
    });

    it('deve filtrar por searchTerm', () => {
      const resultado = filterFaixas(mockFaixas, 'DNIT', 'all');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('2');
    });

    it('deve filtrar por tipo', () => {
      const resultado = filterFaixas(mockFaixas, '', 'CAUQ');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipo).toBe('CAUQ');
    });

    it('deve filtrar por searchTerm e tipo combinado', () => {
      const resultado = filterFaixas(mockFaixas, 'Faixa', 'MRAF');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('2');
    });

    it('deve ser case-insensitive', () => {
      const resultado = filterFaixas(mockFaixas, 'faixa iii', 'all');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('1');
    });
  });

  describe('getUserAccessLevel', () => {
    it('deve retornar access_level se presente', () => {
      const user = { access_level: 'sala_tecnica_afirmaevias' };
      expect(getUserAccessLevel(user)).toBe('sala_tecnica_afirmaevias');
    });

    it('deve retornar admin se role é admin', () => {
      const user = { role: 'admin' };
      expect(getUserAccessLevel(user)).toBe('admin');
    });

    it('deve retornar user como padrão', () => {
      const user = { role: 'user' };
      expect(getUserAccessLevel(user)).toBe('user');
    });

    it('deve retornar user se user é null', () => {
      expect(getUserAccessLevel(null)).toBe('user');
    });
  });

  describe('canUserManage', () => {
    it('deve retornar true para admin', () => {
      const user = { role: 'admin' };
      expect(canUserManage(user)).toBe(true);
    });

    it('deve retornar true para sala_tecnica_afirmaevias', () => {
      const user = { access_level: 'sala_tecnica_afirmaevias' };
      expect(canUserManage(user)).toBe(true);
    });

    it('deve retornar true para gestor_contrato', () => {
      const user = { access_level: 'gestor_contrato' };
      expect(canUserManage(user)).toBe(true);
    });

    it('deve retornar false para user comum', () => {
      const user = { role: 'user' };
      expect(canUserManage(user)).toBe(false);
    });

    it('deve retornar false se user é null', () => {
      expect(canUserManage(null)).toBe(false);
    });
  });
});