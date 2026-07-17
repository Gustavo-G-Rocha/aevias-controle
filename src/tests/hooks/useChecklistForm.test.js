/**
 * tests/hooks/useChecklistForm.test.js
 *
 * Teste de contrato (source-based) para useChecklistForm — hook reutilizável
 * de formulários de checklist. Complementa useChecklistFormExtraEdit.test.js
 * (que foca no canEditExtra) cobrindo o contrato geral: delegação ao hook base,
 * permissões, deep-merge de campos e formato de retorno.
 * Ambiente 'node' sem DOM/RTL — validação via leitura do source.
 *
 * Após AR4: a lógica comum de carregamento de dados (user, obras, regionais,
 * projetos, faixas, filtragem por acesso, editId, valores derivados) foi
 * extraída para useFormDataLoader. Este teste verifica a delegação e mantém
 * as asserções específicas que permanecem no useChecklistForm.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useChecklistForm.js'), 'utf-8');
const loaderSrc = readFileSync(resolve(__dirname, '../../hooks/useFormDataLoader.js'), 'utf-8');
const normalizationSrc = readFileSync(resolve(__dirname, '../../utils/checklistEditNormalization.js'), 'utf-8');

const returnBlock = (() => {
  const blocks = [...src.matchAll(/return\s*{([\s\S]*?)};/g)];
  return blocks[blocks.length - 1]?.[1] ?? '';
})();

describe('useChecklistForm — contrato', () => {
  it('exporta useChecklistForm com canEditExtra opcional', () => {
    expect(src).toContain(
      'export function useChecklistForm(getInitialFormData, entityName, storageName, canEditExtra = null, options = {})'
    );
  });

  it('delega carregamento de dados ao useFormDataLoader sem useAccessLevel', () => {
    expect(src).toContain('useFormDataLoader');
    expect(src).toContain('needsUsers: true');
    expect(src).toContain('useAccessLevel: false');
  });

  it('allUsers: admin recebe todos; demais perfis recebem apenas o próprio usuário', () => {
    expect(src).toContain("const allUsers = isAdmin ? (auxData?.users ?? []) : (user ? [user] : [])");
  });

  it('filtragem de obras por acesso está no hook base (useFormDataLoader)', () => {
    expect(loaderSrc).toContain("user.role !== 'admin'");
    expect(loaderSrc).toContain("obra.status === 'em_andamento'");
    expect(loaderSrc).toContain('regionaisSet.has(obra.regional_id)');
    expect(loaderSrc).toContain('return auxData.obras;');
  });

  it('delega a normalização de edição ao helper compartilhado', () => {
    expect(src).toContain('normalizeLoadedData = normalizeChecklistEditData');
    expect(src).toContain('normalizeLoadedData(initialForm, checklistToEdit)');
  });

  it('permite particularidades por opções sem duplicar o fluxo base', () => {
    expect(src).toContain('filtroTipoObra = null');
    expect(src).toContain('initializeNewData = null');
    expect(src).toContain('canOwnerEditStatus = defaultCanOwnerEditStatus');
    expect(src).toContain('isOwner = defaultIsOwner');
  });

  it('helper faz deep-merge de objetos, normaliza data e garante fotos como array', () => {
    expect(normalizationSrc).toContain('isPlainObject(initialForm[key])');
    expect(normalizationSrc).toContain('...initialForm[key]');
    expect(normalizationSrc).toContain('isPlainObject(savedData[key])');
    expect(normalizationSrc).toContain('? savedData[key]');
    expect(normalizationSrc).toContain("new Date(savedData.data).toISOString().split('T')[0]");
    expect(normalizationSrc).toContain('Array.isArray(savedData.fotos) ? savedData.fotos : []');
  });

  it('isApproved considera approved true e status diferente de rascunho', () => {
    expect(src).toContain("formData.approved === true && formData.status !== 'rascunho'");
  });

  it('novo registro preenche inspetor_campo e preseleciona obra_id', () => {
    expect(src).toContain('inspetor_campo: user.laboratorista_name || user.full_name');
    expect(src).toContain("obra_id: obras[0]?.id || initialNewFormData.obra_id");
  });

  it('carrega checklist via obterChecklistById', () => {
    expect(src).toContain('obterChecklistById(entityName, editId)');
  });

  it('owner check considera created_by (email) e created_by_id', () => {
    expect(src).toContain('isOwnerCheck');
    expect(src).toContain('const defaultIsOwner');
    expect(src).toContain("checklist?.created_by?.toLowerCase() === user?.email?.toLowerCase()");
    expect(src).toContain('checklist?.created_by_id === user?.id');
    expect(src).toContain('const isOwnerCheck = isOwner(user, checklistToEdit)');
  });

  it('expõe contrato de retorno completo', () => {
    for (const k of [
      'obras', 'regionais', 'projects', 'faixas', 'user', 'allUsers',
      'editingChecklist', 'loading', 'formData', 'obraSelecionada',
      'regionalSelecionada', 'projetosDisponiveis', 'isApproved',
      'userCanEdit', 'isEditable', 'validateForm', 'extraCanEdit', 'clearSavedData', 'navigate',
    ]) {
      expect(returnBlock).toContain(k);
    }
  });
});