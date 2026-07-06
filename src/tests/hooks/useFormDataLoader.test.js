/**
 * tests/hooks/useFormDataLoader.test.js
 *
 * Teste de contrato (source-based) para useFormDataLoader — hook base
 * compartilhado que encapsula a lógica comum de carregamento de dados
 * para formulários de ensaio e checklist (AR4).
 *
 * O ambiente de testes é 'node' (sem DOM/RTL), portanto validamos o
 * contrato lendo o source do hook.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useFormDataLoader.js'), 'utf-8');

const returnBlock = (() => {
  const blocks = [...src.matchAll(/return\s*{([\s\S]*?)};/g)];
  return blocks[blocks.length - 1]?.[1] ?? '';
})();

describe('useFormDataLoader — contrato', () => {
  it('exporta useFormDataLoader com options formData/needsUsers/filtroTipoObra/useAccessLevel', () => {
    expect(src).toContain('export function useFormDataLoader');
    expect(src).toContain('formData');
    expect(src).toContain('needsUsers');
    expect(src).toContain('filtroTipoObra');
    expect(src).toContain('useAccessLevel');
  });

  it('usa useCurrentUser e useAuxData para carregar dados', () => {
    expect(src).toContain('useCurrentUser');
    expect(src).toContain('useAuxData');
  });

  it('carrega faixas granulométricas com cache próprio', () => {
    expect(src).toContain("['faixasGranulometricas']");
    expect(src).toContain('listarFaixas');
  });

  it('deriva regionais e projects de auxData', () => {
    expect(src).toContain("auxData?.regionais ?? []");
    expect(src).toContain("auxData?.projects ?? []");
  });

  it('filtra obras para laboratorista por regionais responsáveis e em_andamento', () => {
    expect(src).toContain('laboratoristas_responsaveis');
    expect(src).toContain('salas_tecnicas_responsaveis');
    expect(src).toContain("obra.status === 'em_andamento'");
    expect(src).toContain('regionaisSet.has(obra.regional_id)');
  });

  it('determina laboratorista via access_level quando useAccessLevel=true', () => {
    expect(src).toContain('user.access_level');
    expect(src).toContain("user.role === 'admin'");
  });

  it('determina laboratorista via role !== admin quando useAccessLevel=false', () => {
    expect(src).toContain("user.role !== 'admin'");
  });

  it('aplica filtroTipoObra quando fornecido', () => {
    expect(src).toContain('filtroTipoObra.includes(obra.tipo_obra)');
  });

  it('retorna todas as obras para não-laboratorista sem filtroTipoObra', () => {
    expect(src).toContain('return auxData.obras;');
  });

  it('deriva editId da query string de forma estável', () => {
    expect(src).toContain("params.get('editId')");
  });

  it('calcula obraSelecionada, regionalSelecionada e projetosDisponiveis', () => {
    expect(src).toContain('obraSelecionada');
    expect(src).toContain('regionalSelecionada');
    expect(src).toContain('projetosDisponiveis');
    expect(src).toContain("p.status === 'ativo'");
  });

  it('expõe contrato de retorno completo', () => {
    for (const k of [
      'user', 'loadingUser', 'loadingAux', 'auxData',
      'regionais', 'projects', 'faixas', 'obras', 'editId',
      'loading', 'obraSelecionada', 'regionalSelecionada', 'projetosDisponiveis',
    ]) {
      expect(returnBlock).toContain(k);
    }
  });
});