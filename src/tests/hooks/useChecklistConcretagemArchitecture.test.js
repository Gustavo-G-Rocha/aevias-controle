import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useChecklistConcretagem.js'), 'utf-8');

describe('useChecklistConcretagem — aderência arquitetural', () => {
  it('delega carregamento, permissões e persistência ao useChecklistForm', () => {
    expect(src).toContain('useChecklistForm(');
    expect(src).not.toContain('useCurrentUser');
    expect(src).not.toContain('useAuxData');
    expect(src).not.toContain('useFormPersistence');
    expect(src).not.toContain('obterChecklistById');
  });

  it('preserva filtro, permissão do owner e inicialização específicos', () => {
    expect(src).toContain('filtroTipoObra: ["supervisao"]');
    expect(src).toContain('obra.status === "em_andamento"');
    expect(src).toContain('checklist.status === "rascunho" || checklist.approved === false');
    expect(src).toContain('checklist?.created_by === user?.email');
    expect(src).toContain('laboratorista_name: user.laboratorista_name || user.full_name');
  });

  it('mantém normalização específica de cargas no helper compartilhado', () => {
    expect(src).toContain('normalizeChecklistEditData(');
    expect(src).toContain('slump_test: { ...DEFAULT_TEST');
    expect(src).toContain('flow_test: { ...DEFAULT_TEST');
    expect(src).toContain('espessura_camada: { ...DEFAULT_TEST');
    expect(src).toContain('corpos_prova: Array.isArray');
  });
});