/**
 * tests/hooks/useEnsaioForm.test.js
 *
 * Teste de contrato (source-based) para useEnsaioForm — hook reutilizável
 * de formulários de ensaio. O ambiente de testes é 'node' (sem DOM/RTL),
 * portanto validamos o contrato lendo o source do hook.
 *
 * Após AR4: a lógica comum de carregamento de dados (user, obras, regionais,
 * projetos, faixas, filtragem por acesso, editId, valores derivados) foi
 * extraída para useFormDataLoader. Este teste verifica a delegação e mantém
 * as asserções específicas que permanecem no useEnsaioForm.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useEnsaioForm.js'), 'utf-8');
const loaderSrc = readFileSync(resolve(__dirname, '../../hooks/useFormDataLoader.js'), 'utf-8');

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

  it('delega carregamento de dados ao useFormDataLoader com useAccessLevel', () => {
    expect(src).toContain('useFormDataLoader');
    expect(src).toContain('useAccessLevel: true');
    expect(src).toContain('filtroTipoObra');
  });

  it('filtragem de obras por acesso está no hook base (useFormDataLoader)', () => {
    expect(loaderSrc).toContain("obra.status === 'em_andamento'");
    expect(loaderSrc).toContain('laboratoristas_responsaveis');
    expect(loaderSrc).toContain('salas_tecnicas_responsaveis');
    expect(loaderSrc).toContain('filtroTipoObra.includes(obra.tipo_obra)');
  });

  it('editId é derivado no hook base', () => {
    expect(loaderSrc).toContain("params.get('editId')");
  });

  it('normaliza data_ensaio ao carregar para edição', () => {
    expect(src).toContain('data_ensaio: ensaioToEdit.data_ensaio');
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