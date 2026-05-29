/**
 * Testes unitários para validateForm do ChecklistTerraplanagem
 */
import { describe, it, expect } from 'vitest';
import { validateForm } from '../../pages/ChecklistTerraplanagem/utils/checklistTerrapalagemMapper';

const baseFormData = {
  obra_id: 'obra-1',
  rodovia: 'BR-101',
  empreiteira: 'Empresa X',
  estaca: '100+00',
  camada: 'Sub-base',
  material: 'Solo',
  jornada: { horario_inicio: '08:00', horario_fim: '17:00' },
  periodos_clima: [
    { periodo: 'manha', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
    { periodo: 'tarde', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
  ],
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: '',
};

describe('validateForm — ChecklistTerraplanagem', () => {
  describe('rascunho', () => {
    it('retorna null quando obra_id está preenchido', () => {
      expect(validateForm({ obra_id: 'obra-1' }, 'rascunho')).toBeNull();
    });

    it('retorna erro quando obra_id está ausente', () => {
      expect(validateForm({}, 'rascunho')).toBeTruthy();
    });
  });

  describe('finalizado — campos obrigatórios', () => {
    it('válido com todos os campos preenchidos', () => {
      expect(validateForm(baseFormData, 'finalizado')).toBeNull();
    });

    it('inválido sem rodovia', () => {
      expect(validateForm({ ...baseFormData, rodovia: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem empreiteira', () => {
      expect(validateForm({ ...baseFormData, empreiteira: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem estaca', () => {
      expect(validateForm({ ...baseFormData, estaca: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem camada', () => {
      expect(validateForm({ ...baseFormData, camada: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem material', () => {
      expect(validateForm({ ...baseFormData, material: '' }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem horario_inicio', () => {
      expect(validateForm({ ...baseFormData, jornada: { horario_inicio: '', horario_fim: '17:00' } }, 'finalizado')).toBeTruthy();
    });

    it('inválido sem horario_fim', () => {
      expect(validateForm({ ...baseFormData, jornada: { horario_inicio: '08:00', horario_fim: '' } }, 'finalizado')).toBeTruthy();
    });
  });

  describe('condição climática — NÃO obrigatória', () => {
    it('válido com temperatura_ambiente null em todos os períodos', () => {
      const data = {
        ...baseFormData,
        periodos_clima: [
          { periodo: 'manha', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
          { periodo: 'tarde', temperatura_ambiente: null, condicoes_climaticas: 'bom' },
        ],
      };
      expect(validateForm(data, 'finalizado')).toBeNull();
    });

    it('válido com temperatura_ambiente string vazia em todos os períodos', () => {
      const data = {
        ...baseFormData,
        periodos_clima: [
          { periodo: 'manha', temperatura_ambiente: '', condicoes_climaticas: 'instavel' },
          { periodo: 'tarde', temperatura_ambiente: '', condicoes_climaticas: 'chuva' },
        ],
      };
      expect(validateForm(data, 'finalizado')).toBeNull();
    });

    it('válido quando periodos_clima está vazio', () => {
      expect(validateForm({ ...baseFormData, periodos_clima: [] }, 'finalizado')).toBeNull();
    });
  });

  describe('ações corretivas', () => {
    it('inválido quando realizado=true mas descrição ausente', () => {
      const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: '' };
      expect(validateForm(data, 'finalizado')).toBeTruthy();
    });

    it('válido quando realizado=true e descrição preenchida', () => {
      const data = { ...baseFormData, acoes_corretivas_realizado: true, acoes_corretivas_descricao: 'Recompactação realizada.' };
      expect(validateForm(data, 'finalizado')).toBeNull();
    });
  });
});