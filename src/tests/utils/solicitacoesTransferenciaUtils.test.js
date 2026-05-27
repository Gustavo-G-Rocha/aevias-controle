import { describe, it, expect } from 'vitest';
import {
  STATUS_INFO,
  ACTION_COLORS,
  getStatusInfo,
  getUserAccessLevel,
  getRegionalAtual,
  filterSolicitacoesByUserAccess,
  getRegionaisDisponiveis,
  validateNovasolicitacao,
  validateMotivoRejeicao
} from '@/utils/solicitacoesTransferenciaUtils';

describe('solicitacoesTransferenciaUtils', () => {
  describe('Constants', () => {
    it('deve ter STATUS_INFO com 3 status', () => {
      expect(Object.keys(STATUS_INFO)).toHaveLength(3);
      expect(STATUS_INFO.aprovada).toBeDefined();
      expect(STATUS_INFO.rejeitada).toBeDefined();
      expect(STATUS_INFO.pendente).toBeDefined();
    });

    it('deve ter ACTION_COLORS com 2 cores', () => {
      expect(Object.keys(ACTION_COLORS)).toHaveLength(2);
      expect(ACTION_COLORS.approve).toBe('#566E3D');
      expect(ACTION_COLORS.reject).toBe('#800020');
    });
  });

  describe('getStatusInfo', () => {
    it('deve retornar info de status aprovada', () => {
      const info = getStatusInfo('aprovada');
      expect(info.text).toBe('Aprovada');
      expect(info.className).toContain('#566E3D');
    });

    it('deve retornar info de status rejeitada', () => {
      const info = getStatusInfo('rejeitada');
      expect(info.text).toBe('Rejeitada');
      expect(info.className).toContain('#800020');
    });

    it('deve retornar info padrão (pendente) para status inválido', () => {
      const info = getStatusInfo('invalido');
      expect(info.text).toBe('Pendente');
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

  describe('getRegionalAtual', () => {
    const regionais = [
      {
        id: '1',
        nome: 'Regional 1',
        laboratoristas_responsaveis: ['user1@test.com', 'user2@test.com']
      },
      {
        id: '2',
        nome: 'Regional 2',
        laboratoristas_responsaveis: ['user3@test.com']
      }
    ];

    it('deve encontrar regional do usuário', () => {
      const user = { email: 'user1@test.com' };
      const regional = getRegionalAtual(user, regionais);
      expect(regional).toBeDefined();
      expect(regional.id).toBe('1');
    });

    it('deve ser case-insensitive', () => {
      const user = { email: 'USER1@TEST.COM' };
      const regional = getRegionalAtual(user, regionais);
      expect(regional).toBeDefined();
      expect(regional.id).toBe('1');
    });

    it('deve retornar null se usuário não está em nenhuma regional', () => {
      const user = { email: 'invalido@test.com' };
      const regional = getRegionalAtual(user, regionais);
      expect(regional).toBeUndefined();
    });

    it('deve retornar null se user é null', () => {
      const regional = getRegionalAtual(null, regionais);
      expect(regional).toBeNull();
    });
  });

  describe('filterSolicitacoesByUserAccess', () => {
    const solicitacoes = [
      { id: '1', laboratorista_email: 'lab1@test.com', regional_destino_id: 'r1', status: 'pendente' },
      { id: '2', laboratorista_email: 'lab2@test.com', regional_destino_id: 'r2', status: 'pendente' },
      { id: '3', laboratorista_email: 'lab1@test.com', regional_destino_id: 'r2', status: 'pendente' }
    ];

    const regionais = [
      {
        id: 'r1',
        nome: 'Regional 1',
        gestor_contrato_responsavel: 'gestor1@test.com',
        gestores_contrato_responsaveis: [],
        salas_tecnicas_responsaveis: ['sala1@test.com']
      },
      {
        id: 'r2',
        nome: 'Regional 2',
        gestor_contrato_responsavel: '',
        gestores_contrato_responsaveis: ['gestor2@test.com'],
        salas_tecnicas_responsaveis: ['sala2@test.com']
      }
    ];

    it('admin deve ver todas as solicitações', () => {
      const user = { email: 'admin@test.com', role: 'admin' };
      const filtradas = filterSolicitacoesByUserAccess(solicitacoes, user, regionais);
      expect(filtradas).toHaveLength(3);
    });

    it('laboratorista deve ver apenas suas solicitações', () => {
      const user = { email: 'lab1@test.com', access_level: 'user' };
      const filtradas = filterSolicitacoesByUserAccess(solicitacoes, user, regionais);
      expect(filtradas).toHaveLength(2);
      expect(filtradas.every(s => s.laboratorista_email === 'lab1@test.com')).toBe(true);
    });

    it('gestor_contrato deve ver apenas solicitações para suas regionais', () => {
      const user = { email: 'gestor1@test.com', access_level: 'gestor_contrato' };
      const filtradas = filterSolicitacoesByUserAccess(solicitacoes, user, regionais);
      expect(filtradas.length).toBeGreaterThan(0);
      expect(filtradas.every(s => s.regional_destino_id === 'r1')).toBe(true);
    });

    it('sala_tecnica deve ver apenas solicitações para suas regionais', () => {
      const user = { email: 'sala1@test.com', access_level: 'sala_tecnica_afirmaevias' };
      const filtradas = filterSolicitacoesByUserAccess(solicitacoes, user, regionais);
      expect(filtradas.every(s => s.regional_destino_id === 'r1')).toBe(true);
    });

    it('cliente não deve ver nada', () => {
      const user = { email: 'cliente@test.com', access_level: 'cliente' };
      const filtradas = filterSolicitacoesByUserAccess(solicitacoes, user, regionais);
      expect(filtradas).toHaveLength(0);
    });
  });

  describe('getRegionaisDisponiveis', () => {
    const regionais = [
      { id: '1', nome: 'Regional 1', status: 'ativa' },
      { id: '2', nome: 'Regional 2', status: 'ativa' },
      { id: '3', nome: 'Regional 3', status: 'inativa' }
    ];

    it('deve retornar regionais ativas exceto a atual', () => {
      const regionalAtual = regionais[0];
      const disponiveis = getRegionaisDisponiveis(regionais, regionalAtual);
      expect(disponiveis).toHaveLength(1);
      expect(disponiveis[0].id).toBe('2');
    });

    it('deve retornar apenas regionais ativas se não tem regional atual', () => {
      const disponiveis = getRegionaisDisponiveis(regionais, null);
      expect(disponiveis).toHaveLength(2);
      expect(disponiveis.every(r => r.status === 'ativa')).toBe(true);
    });
  });

  describe('validateNovasolicitacao', () => {
    it('deve validar formData correto', () => {
      const formData = { regional_destino_id: 'r1', motivo: 'Motivo válido' };
      const resultado = validateNovasolicitacao(formData);
      expect(resultado.valid).toBe(true);
    });

    it('deve rejeitar regional_destino_id vazio', () => {
      const formData = { regional_destino_id: '', motivo: 'Motivo válido' };
      const resultado = validateNovasolicitacao(formData);
      expect(resultado.valid).toBe(false);
    });

    it('deve rejeitar motivo vazio', () => {
      const formData = { regional_destino_id: 'r1', motivo: '' };
      const resultado = validateNovasolicitacao(formData);
      expect(resultado.valid).toBe(false);
    });

    it('deve rejeitar motivo com apenas espaços', () => {
      const formData = { regional_destino_id: 'r1', motivo: '   ' };
      const resultado = validateNovasolicitacao(formData);
      expect(resultado.valid).toBe(false);
    });
  });

  describe('validateMotivoRejeicao', () => {
    it('deve validar motivo correto', () => {
      const resultado = validateMotivoRejeicao('Motivo válido');
      expect(resultado.valid).toBe(true);
    });

    it('deve rejeitar motivo vazio', () => {
      const resultado = validateMotivoRejeicao('');
      expect(resultado.valid).toBe(false);
    });

    it('deve rejeitar motivo com apenas espaços', () => {
      const resultado = validateMotivoRejeicao('   ');
      expect(resultado.valid).toBe(false);
    });

    it('deve rejeitar null', () => {
      const resultado = validateMotivoRejeicao(null);
      expect(resultado.valid).toBe(false);
    });
  });
});