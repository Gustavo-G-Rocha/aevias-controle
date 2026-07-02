import { describe, it, expect } from 'vitest';
import {
  getLimitesOrgao,
  getClassificacaoHS,
  getClassificacaoVRD,
  avaliarConformidade,
  calcularManchaValores,
  calcularPenduloValores,
  prepareDadosParaSalvar,
  filterObrasPorAcesso,
  getInitialFormData
} from '@/utils/ensaioManchaPenduloUtils';

describe('ensaioManchaPenduloUtils', () => {
  describe('getInitialFormData', () => {
    it('deve incluir empreiteira vazia no formulário inicial', () => {
      const form = getInitialFormData();
      expect(form.empreiteira).toBe('');
    });

    it('deve incluir campos obrigatórios no formulário inicial', () => {
      const form = getInitialFormData();
      expect(form.obra_id).toBe('');
      expect(form.data_ensaio).toBeDefined();
      expect(form.status).toBe('rascunho');
    });
  });

  describe('getLimitesOrgao', () => {
    it('deve retornar limites para DER/PR', () => {
      const limites = getLimitesOrgao('DER/PR');
      expect(limites).toEqual({ hs_min: 0.6, hs_max: 1.2, vrd_min: 50 });
    });

    it('deve retornar limites para DNIT', () => {
      const limites = getLimitesOrgao('DNIT');
      expect(limites).toEqual({ hs_min: 0.6, hs_max: 1.2, vrd_min: 55 });
    });

    it('deve retornar limites padrão para órgão desconhecido', () => {
      const limites = getLimitesOrgao('DESCONHECIDO');
      expect(limites).toEqual({ hs_min: 0.6, hs_max: 1.2, vrd_min: 47 });
    });
  });

  describe('getClassificacaoHS', () => {
    it('deve classificar como Muito Fina para HS < 0.2', () => {
      expect(getClassificacaoHS(0.1)).toBe('Muito Fina');
    });

    it('deve classificar como Fina para 0.2 <= HS < 0.4', () => {
      expect(getClassificacaoHS(0.3)).toBe('Fina');
    });

    it('deve classificar como Média para 0.4 <= HS < 0.8', () => {
      expect(getClassificacaoHS(0.6)).toBe('Média');
    });

    it('deve classificar como Grossa para 0.8 <= HS < 1.2', () => {
      expect(getClassificacaoHS(1.0)).toBe('Grossa');
    });

    it('deve classificar como Muito Grossa para HS >= 1.2', () => {
      expect(getClassificacaoHS(1.5)).toBe('Muito Grossa');
    });

    it('deve retornar string vazia para null', () => {
      expect(getClassificacaoHS(null)).toBe('');
    });
  });

  describe('getClassificacaoVRD', () => {
    it('deve classificar como Perigosa para VRD < 25', () => {
      expect(getClassificacaoVRD(20)).toBe('Perigosa');
    });

    it('deve classificar como Muito Lisa para 25 <= VRD <= 31', () => {
      expect(getClassificacaoVRD(28)).toBe('Muito Lisa');
    });

    it('deve classificar como Lisa para 31 < VRD <= 39', () => {
      expect(getClassificacaoVRD(35)).toBe('Lisa');
    });

    it('deve classificar como Median. Rugosa para 46 < VRD <= 54', () => {
      expect(getClassificacaoVRD(50)).toBe('Median. Rugosa');
    });

    it('deve classificar como Rugosa para 54 < VRD <= 75', () => {
      expect(getClassificacaoVRD(60)).toBe('Rugosa');
    });

    it('deve classificar como Muito Rugosa para VRD > 75', () => {
      expect(getClassificacaoVRD(80)).toBe('Muito Rugosa');
    });
  });

  describe('calcularManchaValores', () => {
    it('deve calcular valores corretamente para mancha válida', () => {
      const ensaio = { d1: 30, d2: 31, d3: 29, d4: 30, volume_areia: 25000 };
      const resultado = calcularManchaValores(ensaio);

      expect(resultado.d_media).toBeDefined();
      expect(resultado.hs_mm).toBeDefined();
      expect(resultado.hs_cm).toBeDefined();
      expect(resultado.area).toBeDefined();
      expect(resultado.tipo_superficie).toBeDefined();
    });

    it('deve retornar ensaio inalterado se faltam diâmetros', () => {
      const ensaio = { d1: 100, d2: 100 };
      const resultado = calcularManchaValores(ensaio);

      expect(resultado).toEqual(ensaio);
    });
  });

  describe('calcularPenduloValores', () => {
    it('deve calcular VRD corretamente', () => {
      const ensaio = {
        leitura_1: 50,
        leitura_2: 52,
        leitura_3: 48,
        leitura_4: 51,
        leitura_5: 49
      };
      const resultado = calcularPenduloValores(ensaio);

      expect(resultado.maxima).toBe(52);
      expect(resultado.minima).toBe(48);
      expect(resultado.vrd).toBeDefined();
      expect(resultado.classe).toBe('I');
    });

    it('deve aplicar correção de temperatura quando temp < 20°C', () => {
      const ensaio = {
        leitura_1: 50,
        leitura_2: 52,
        leitura_3: 48,
        leitura_4: 51,
        leitura_5: 49,
        temp_pavimento: 10
      };
      const resultado = calcularPenduloValores(ensaio);

      expect(resultado.vrd).toBeDefined();
      expect(typeof resultado.vrd).toBe('number');
    });

    it('deve retornar ensaio inalterado se não há leituras', () => {
      const ensaio = { temp_pavimento: 20 };
      const resultado = calcularPenduloValores(ensaio);

      expect(resultado).toEqual(ensaio);
    });
  });

  describe('avaliarConformidade', () => {
    it('deve retornar CONFORME quando médias estão dentro dos limites', () => {
      const ensaios_mancha = [{ hs_mm: 0.8 }, { hs_mm: 0.9 }];
      const ensaios_pendulo = [{ vrd: 50 }, { vrd: 52 }];

      const resultado = avaliarConformidade(ensaios_mancha, ensaios_pendulo, 'DER/PR');
      expect(resultado).toBe('CONFORME');
    });

    it('deve retornar NÃO CONFORME quando VRD está abaixo do mínimo', () => {
      const ensaios_mancha = [{ hs_mm: 0.8 }];
      const ensaios_pendulo = [{ vrd: 45 }];

      const resultado = avaliarConformidade(ensaios_mancha, ensaios_pendulo, 'DER/PR');
      expect(resultado).toBe('NÃO CONFORME');
    });

    it('deve retornar string vazia se não há ensaios válidos', () => {
      const resultado = avaliarConformidade([], [], 'DER/PR');
      expect(resultado).toBe('');
    });
  });

  describe('prepareDadosParaSalvar', () => {
    it('deve preparar dados com médias calculadas', () => {
      const formData = {
        ensaios_mancha: [{ hs_mm: 0.6 }, { hs_mm: 0.7 }],
        ensaios_pendulo: [{ vrd: 50 }],
        data_aplicacao: '2024-01-01'
      };

      const resultado = prepareDadosParaSalvar(formData);

      expect(resultado.media_hs).toBeDefined();
      expect(resultado.classificacao_media_hs).toBe('Média');
      expect(resultado.media_vrd).toBeDefined();
    });
  });

  describe('filterObrasPorAcesso', () => {
    it('deve retornar todas as obras para admin', () => {
      const obras = [
        { id: '1', tipo_obra: 'conservacao' },
        { id: '2', tipo_obra: 'supervisao' }
      ];
      const user = { email: 'user@test.com', role: 'admin' };

      const resultado = filterObrasPorAcesso(obras, user, [], true, 'admin');
      expect(resultado.length).toBe(2);
    });

    it('deve filtrar obras por regional para user comum', () => {
      const obras = [
        { id: '1', tipo_obra: 'conservacao', regional_id: 'r1' },
        { id: '2', tipo_obra: 'supervisao', regional_id: 'r2' }
      ];
      const user = { email: 'lab@test.com', role: 'user' };
      const regionais = [
        { id: 'r1', laboratoristas_responsaveis: ['lab@test.com'] }
      ];

      const resultado = filterObrasPorAcesso(obras, user, regionais, false, 'user');
      expect(resultado.length).toBe(1);
      expect(resultado[0].id).toBe('1');
    });
  });
});