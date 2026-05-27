import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTimeSpBr,
  TIPO_LABELS,
  getTipoLabel,
  hasClassificacao,
  getLogoUrl,
  findObra,
  findRegional,
  findProject,
  findCreatorUser,
} from '@/utils/relatorioNCUtils';

const DEFAULT_LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

describe('relatorioNCUtils', () => {
  describe('formatDate', () => {
    it('deve formatar data ISO no padrão pt-BR', () => {
      const result = formatDate('2026-05-27');
      expect(result).toBe('27/05/2026');
    });

    it('deve retornar "—" para null', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('deve retornar "—" para undefined', () => {
      expect(formatDate(undefined)).toBe('—');
    });

    it('deve retornar "—" para string vazia', () => {
      expect(formatDate('')).toBe('—');
    });
  });

  describe('formatDateTimeSpBr', () => {
    it('deve retornar string não vazia para data válida', () => {
      const result = formatDateTimeSpBr('2026-05-27T10:00:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve retornar string vazia para null', () => {
      expect(formatDateTimeSpBr(null)).toBe('');
    });

    it('deve retornar string vazia para undefined', () => {
      expect(formatDateTimeSpBr(undefined)).toBe('');
    });
  });

  describe('TIPO_LABELS', () => {
    it('deve conter os tipos esperados', () => {
      expect(TIPO_LABELS.DiarioObra).toBe('Diário de Obra');
      expect(TIPO_LABELS.ChecklistUsina).toBe('Checklist de Usina');
      expect(TIPO_LABELS.ChecklistAplicacao).toBe('Checklist de Aplicação');
      expect(TIPO_LABELS.ChecklistMRAF).toBe('Checklist MRAF');
      expect(TIPO_LABELS.ChecklistConcretagem).toBe('Checklist de Concretagem');
      expect(TIPO_LABELS.ChecklistTerraplanagem).toBe('Checklist de Terraplanagem');
      expect(TIPO_LABELS.ChecklistReciclagem).toBe('Checklist de Reciclagem');
    });
  });

  describe('getTipoLabel', () => {
    it('deve retornar label mapeado', () => {
      expect(getTipoLabel('DiarioObra')).toBe('Diário de Obra');
    });

    it('deve retornar o valor original quando não mapeado', () => {
      expect(getTipoLabel('TipoDesconhecido')).toBe('TipoDesconhecido');
    });
  });

  describe('hasClassificacao', () => {
    it('deve retornar true quando local_nc existe', () => {
      expect(hasClassificacao({ local_nc: 'CAMPO' })).toBe(true);
    });

    it('deve retornar true quando categoria_nc existe', () => {
      expect(hasClassificacao({ categoria_nc: 'Granulometria' })).toBe(true);
    });

    it('deve retornar true quando parametro_nc existe', () => {
      expect(hasClassificacao({ parametro_nc: '% passante' })).toBe(true);
    });

    it('deve retornar false quando nenhum campo de classificação existe', () => {
      expect(hasClassificacao({})).toBe(false);
      expect(hasClassificacao({ local_nc: '', categoria_nc: '', parametro_nc: '' })).toBe(false);
    });

    it('deve retornar false para nc null/undefined', () => {
      expect(hasClassificacao(null)).toBe(false);
      expect(hasClassificacao(undefined)).toBe(false);
    });
  });

  describe('getLogoUrl', () => {
    it('deve retornar logo_url quando regional a tem', () => {
      const regional = { logo_url: 'https://example.com/logo.png' };
      expect(getLogoUrl(regional)).toBe('https://example.com/logo.png');
    });

    it('deve retornar logo padrão quando regional é null', () => {
      expect(getLogoUrl(null)).toBe(DEFAULT_LOGO);
    });

    it('deve retornar logo padrão quando regional não tem logo_url', () => {
      expect(getLogoUrl({})).toBe(DEFAULT_LOGO);
    });
  });

  describe('findObra', () => {
    const obras = [
      { id: '1', name: 'Obra A' },
      { id: '2', name: 'Obra B' },
    ];

    it('deve encontrar a obra correta pelo obra_id', () => {
      const nc = { obra_id: '2' };
      expect(findObra(nc, obras)).toEqual({ id: '2', name: 'Obra B' });
    });

    it('deve retornar null quando obra_id não existe na lista', () => {
      const nc = { obra_id: '99' };
      expect(findObra(nc, obras)).toBeNull();
    });

    it('deve retornar null quando obras é undefined', () => {
      expect(findObra({ obra_id: '1' }, undefined)).toBeNull();
    });
  });

  describe('findRegional', () => {
    const regionais = [
      { id: 'r1', nome: 'Regional Sul' },
      { id: 'r2', nome: 'Regional Norte' },
    ];

    it('deve encontrar a regional correta pelo regional_id da obra', () => {
      const obra = { regional_id: 'r1' };
      expect(findRegional(obra, regionais)).toEqual({ id: 'r1', nome: 'Regional Sul' });
    });

    it('deve retornar null quando obra é null', () => {
      expect(findRegional(null, regionais)).toBeNull();
    });

    it('deve retornar null quando regional_id não existe', () => {
      const obra = { regional_id: 'r99' };
      expect(findRegional(obra, regionais)).toBeNull();
    });
  });

  describe('findProject', () => {
    const projects = [
      { id: 'p1', name: 'Projeto A' },
      { id: 'p2', name: 'Projeto B' },
    ];

    it('deve encontrar o projeto pelo project_id do registro', () => {
      const registro = { project_id: 'p2' };
      expect(findProject(registro, projects)).toEqual({ id: 'p2', name: 'Projeto B' });
    });

    it('deve retornar null quando registro não tem project_id', () => {
      expect(findProject({}, projects)).toBeNull();
    });

    it('deve retornar null quando registro é null', () => {
      expect(findProject(null, projects)).toBeNull();
    });
  });

  describe('findCreatorUser', () => {
    const users = [
      { email: 'joao@empresa.com', full_name: 'João' },
      { email: 'maria@empresa.com', full_name: 'Maria' },
    ];

    it('deve encontrar usuário pelo email (case insensitive)', () => {
      const registro = { created_by: 'JOAO@empresa.com' };
      expect(findCreatorUser(registro, users)).toEqual({
        email: 'joao@empresa.com',
        full_name: 'João',
      });
    });

    it('deve retornar null quando email não encontrado', () => {
      const registro = { created_by: 'desconhecido@empresa.com' };
      expect(findCreatorUser(registro, users)).toBeNull();
    });

    it('deve retornar null quando registro não tem created_by', () => {
      expect(findCreatorUser({}, users)).toBeNull();
    });
  });
});