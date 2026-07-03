/**
 * tests/hooks/useChecklistForm.test.js
 *
 * Teste de contrato (source-based) para useChecklistForm — hook reutilizável
 * de formulários de checklist. Complementa useChecklistFormExtraEdit.test.js
 * (que foca no canEditExtra) cobrindo o contrato geral: filtragem de obras,
 * permissões, deep-merge de campos e formato de retorno.
 * Ambiente 'node' sem DOM/RTL — validação via leitura do source.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useChecklistForm.js'), 'utf-8');

const returnBlock = (() => {
  const blocks = [...src.matchAll(/return\s*{([\s\S]*?)};/g)];
  return blocks[blocks.length - 1]?.[1] ?? '';
})();

describe('useChecklistForm — contrato', () => {
  it('exporta useChecklistForm com canEditExtra opcional', () => {
    expect(src).toContain(
      'export function useChecklistForm(getInitialFormData, entityName, storageName, canEditExtra = null)'
    );
  });

  it('allUsers: admin recebe todos; demais perfis recebem apenas o próprio usuário', () => {
    expect(src).toContain("const allUsers = isAdmin ? (auxData?.users ?? []) : (user ? [user] : [])");
  });

  it('obras: não-admin filtra por regionais responsáveis e status em_andamento', () => {
    expect(src).toContain('if (!isAdmin)');
    expect(src).toContain("obra.status === 'em_andamento'");
    expect(src).toContain('regionaisSet.has(obra.regional_id)');
  });

  it('obras: admin recebe todas as obras', () => {
    expect(src).toContain('return auxData.obras;');
  });

  it('faz deep-merge de campos objeto ao editar (preserva chaves adicionadas depois)', () => {
    expect(src).toContain('mergedObjectFields');
    expect(src).toContain("typeof initialForm[key] === 'object' && !Array.isArray(initialForm[key])");
    expect(src).toContain('{ ...initialForm[key], ...(checklistToEdit[key] || {}) }');
  });

  it('normaliza data e garante fotos como array', () => {
    expect(src).toContain('checklistToEdit.data ? new Date(checklistToEdit.data)');
    expect(src).toContain('Array.isArray(checklistToEdit.fotos) ? checklistToEdit.fotos : []');
  });

  it('isApproved considera approved true e status diferente de rascunho', () => {
    expect(src).toContain("formData.approved === true && formData.status !== 'rascunho'");
  });

  it('novo registro preenche inspetor_campo e preseleciona obra_id', () => {
    expect(src).toContain('initialNewFormData.inspetor_campo = user.laboratorista_name || user.full_name');
    expect(src).toContain('initialNewFormData.obra_id = obras[0].id');
  });

  it('carrega checklist via obterChecklistById', () => {
    expect(src).toContain('obterChecklistById(entityName, editId)');
  });

  it('owner check considera created_by (email) e created_by_id', () => {
    expect(src).toContain('isOwnerCheck');
    expect(src).toContain("checklistToEdit.created_by?.toLowerCase() === user.email?.toLowerCase()");
    expect(src).toContain('checklistToEdit.created_by_id === user.id');
  });

  it('expõe contrato de retorno completo', () => {
    for (const k of [
      'obras', 'regionais', 'projects', 'faixas', 'user', 'allUsers',
      'editingChecklist', 'loading', 'formData', 'obraSelecionada',
      'regionalSelecionada', 'projetosDisponiveis', 'isApproved',
      'userCanEdit', 'isEditable', 'extraCanEdit', 'clearSavedData', 'navigate',
    ]) {
      expect(returnBlock).toContain(k);
    }
  });
});