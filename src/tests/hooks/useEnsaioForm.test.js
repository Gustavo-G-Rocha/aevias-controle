/**
 * tests/hooks/useEnsaioForm.test.js
 *
 * Teste de contrato (source-based) para useEnsaioForm — hook reutilizável
 * de formulários de ensaio. O ambiente de testes é 'node' (sem DOM/RTL),
 * portanto validamos o contrato lendo o source do hook, seguindo o padrão
 * estabelecido por useChecklistFormExtraEdit.test.js.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useEnsaioForm.js'), 'utf-8');

const returnBlock = (() => {
  const blocks = [...src.matchAll(/return\s*{([\s\S]*?)};/g)];
  return blocks[blocks.length - 1]?.[1] ?? '';
})();

describe('useEnsaioForm — contrato', () => {
  it('exporta useEnsaioForm com filtroTipoObra opcional', () => {
    expect(src).toContain(
      'export function useEnsaioForm(getInitialFormData, entityName, storageName, { filtroTipoObra } = {})'
    );
  });

  it('normaliza data_ensaio ao carregar para edição', () => {
    expect(src).toContain('data_ensaio: ensaioToEdit.data_ensaio');
  });

  it('deriva editId da query string de forma estável', () => {
    expect(src).toContain("params.get('editId')");
  });

  it('carrega ensaio via obterEnsaioById', () => {
    expect(src).toContain('obterEnsaioById(entityName, editId)');
  });

  it('preseleciona a primeira obra ao criar novo registro', () => {
    expect(src).toContain('initialNewFormData.obra_id = obras[0].id');
  });

  it('regra de permissão: admin ou (criador com status editável)', () => {
    expect(src).toContain("user.role === 'admin' || (isCreator && canEditStatus)");
    expect(src).toContain('const isCreator = ensaioToEdit.created_by === user.email');
    expect(src).toContain(
      "ensaioToEdit.status === 'rascunho' || ensaioToEdit.status === 'finalizado' || ensaioToEdit.approved === false"
    );
  });

  it('filtra obras para access_level user por regional responsável e em_andamento', () => {
    expect(src).toContain("currentUserAccessLevel === 'user'");
    expect(src).toContain('laboratoristas_responsaveis');
    expect(src).toContain('salas_tecnicas_responsaveis');
    expect(src).toContain("obra.status === 'em_andamento'");
  });

  it('aplica filtroTipoObra quando fornecido', () => {
    expect(src).toContain('filtroTipoObra.includes(obra.tipo_obra)');
  });

  it('trata erro de carregamento com toast + navigate', () => {
    expect(src).toContain('Erro ao carregar os dados.');
    expect(src).toContain("navigate(createPageUrl('MeusEnsaios'))");
  });

  it('expõe contrato de retorno completo', () => {
    for (const k of [
      'obras', 'regionais', 'projects', 'faixas', 'user',
      'editingEnsaio', 'loading', 'formData', 'obraSelecionada',
      'regionalSelecionada', 'projetosDisponiveis', 'isApproved',
      'isEditable', 'clearSavedData', 'navigate',
    ]) {
      expect(returnBlock).toContain(k);
    }
  });
});