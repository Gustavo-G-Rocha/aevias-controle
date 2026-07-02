/**
 * Testes de contrato (source-based) para o suporte a edição extra no
 * useChecklistForm — o 4º parâmetro `canEditExtra` que libera perfis
 * autorizados (ex.: Gestor de Contrato da regional) a editar um registro.
 *
 * O ambiente de testes é 'node' (sem DOM/RTL), então validamos o contrato
 * lendo o source do hook.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../hooks/useChecklistForm.js'), 'utf-8');

describe('useChecklistForm — suporte a canEditExtra', () => {
  it('aceita o parâmetro opcional canEditExtra', () => {
    expect(src).toContain('canEditExtra = null');
  });

  it('usa o predicado durante o carregamento para liberar edição', () => {
    expect(src).toContain('extraCanEdit');
    expect(src).toContain("typeof canEditExtra === 'function'");
  });

  it('mantém o bypass de admin e a checagem de owner existentes', () => {
    expect(src).toContain("user.role === 'admin'");
    expect(src).toContain('isOwnerCheck');
  });

  it('resolve a obra do registro a partir das obras carregadas', () => {
    expect(src).toContain('obraRegistroAtual');
    expect(src).toContain('checklistToEdit.obra_id');
  });

  it('inclui extraCanEdit no cálculo de userCanEdit', () => {
    expect(src).toContain('extraCanEdit ||');
  });

  it('expõe extraCanEdit no retorno do hook', () => {
    expect(src).toMatch(/return\s*{[\s\S]*extraCanEdit[\s\S]*}/);
  });
});