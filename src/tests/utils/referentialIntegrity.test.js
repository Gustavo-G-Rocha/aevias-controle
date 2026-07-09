import { describe, it, expect } from 'vitest';
import { validateReferentialIntegrity } from '@/utils/referentialIntegrity';

describe('validateReferentialIntegrity', () => {
  const localCache = {
    obras: [
      { id: 'obra-1', nome: 'Obra Alpha' },
      { id: 'obra-2', nome: 'Obra Beta' },
    ],
    projects: [
      { id: 'proj-1', nome: 'Projeto X' },
      { id: 'proj-2', nome: 'Projeto Y' },
    ],
  };

  it('passa quando obra_id existe no cache local', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-1', data: '2026-07-09' },
      localCache
    );
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.errorMessage).toBeNull();
  });

  it('passa quando obra_id e project_id existem no cache local', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-2', project_id: 'proj-1', data: '2026-07-09' },
      localCache
    );
    expect(result.valid).toBe(true);
  });

  it('FALHA quando obra_id não existe no cache local (registro órfão potencial)', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-inexistente', data: '2026-07-09' },
      localCache
    );
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(1);
    expect(result.missing[0].field).toBe('obra_id');
    expect(result.missing[0].parentEntity).toBe('Obra');
    expect(result.missing[0].parentId).toBe('obra-inexistente');
    expect(result.errorMessage).toContain('obra');
    expect(result.errorMessage).toContain('cache local');
  });

  it('FALHA quando project_id não existe no cache local', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-1', project_id: 'proj-fantasma', data: '2026-07-09' },
      localCache
    );
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(1);
    expect(result.missing[0].field).toBe('project_id');
    expect(result.missing[0].parentEntity).toBe('Project');
  });

  it('FALHA quando tanto obra_id quanto project_id não existem', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-fantasma', project_id: 'proj-fantasma' },
      localCache
    );
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(2);
  });

  it('passa quando project_id está ausente (opcional)', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-1', project_id: '' },
      localCache
    );
    expect(result.valid).toBe(true);
  });

  it('passa quando project_id é null (opcional)', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-1', project_id: null },
      localCache
    );
    expect(result.valid).toBe(true);
  });

  it('passa com cache vazio mas sem referências obrigatórias preenchidas', () => {
    const result = validateReferentialIntegrity(
      { obra_id: '', data: '2026-07-09' },
      { obras: [], projects: [] }
    );
    expect(result.valid).toBe(true);
  });

  it('FALHA quando cache local está vazio mas obra_id tem valor', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-1', data: '2026-07-09' },
      { obras: [], projects: [] }
    );
    expect(result.valid).toBe(false);
    expect(result.missing[0].reason).toBe('not_found_locally');
  });

  it('passa com localCache indefinido quando não há referências', () => {
    const result = validateReferentialIntegrity(
      { obra_id: '', data: '2026-07-09' },
      undefined
    );
    expect(result.valid).toBe(true);
  });

  it('mensagem de erro menciona conexão com internet', () => {
    const result = validateReferentialIntegrity(
      { obra_id: 'obra-fantasma' },
      localCache
    );
    expect(result.errorMessage).toContain('internet');
  });
});