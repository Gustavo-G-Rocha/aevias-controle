/**
 * Testes de conformidade ao contrato comum dos mappers de checklist.
 * Garante que todos os mappers (MRAF, Reciclagem, Terraplanagem) exponham
 * os mesmos métodos, com as mesmas assinaturas, sem alterar o resultado
 * final específico de cada um.
 */
import { describe, it, expect } from 'vitest';
import {
  CHECKLIST_MAPPER_METHODS,
  CHECKLIST_MAPPER_ARITY,
} from '@/utils/checklistMapperContract';
import * as mraf from '../../pages/ChecklistMRAF/utils/checklistMRAFMapper';
import * as reciclagem from '../../pages/ChecklistReciclagem/utils/checklistReciclagemMapper';
import * as terraplanagem from '../../pages/ChecklistTerraplanagem/utils/checklistTerrapalagemMapper';

const mappers = {
  ChecklistMRAF: mraf,
  ChecklistReciclagem: reciclagem,
  ChecklistTerraplanagem: terraplanagem,
};

describe('Contrato comum dos mappers de checklist', () => {
  it('lista de métodos do contrato está completa', () => {
    expect(CHECKLIST_MAPPER_METHODS).toEqual(['validateForm', 'buildDataToSave']);
  });

  for (const [name, mapper] of Object.entries(mappers)) {
    describe(name, () => {
      it('expõe exatamente os métodos do contrato', () => {
        expect(typeof mapper.validateForm).toBe('function');
        expect(typeof mapper.buildDataToSave).toBe('function');
      });

      it('respeita a aridade do contrato', () => {
        expect(mapper.validateForm.length).toBe(CHECKLIST_MAPPER_ARITY.validateForm);
        expect(mapper.buildDataToSave.length).toBe(CHECKLIST_MAPPER_ARITY.buildDataToSave);
      });

      it('valida obra_id ausente no rascunho (comportamento compartilhado)', () => {
        expect(mapper.validateForm({}, 'rascunho')).toBeTruthy();
      });

      it('aceita rascunho com obra_id preenchido (comportamento compartilhado)', () => {
        expect(mapper.validateForm({ obra_id: 'obra-1' }, 'rascunho')).toBeNull();
      });
    });
  }
});