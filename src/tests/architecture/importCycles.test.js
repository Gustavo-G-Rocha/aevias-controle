/**
 * tests/architecture/importCycles.test.js
 *
 * Verifica que dependências circulares conhecidas foram resolvidas.
 * Detectado via análise estática do grafo de imports (943 arquivos).
 *
 * Resultado da verificação:
 * - pages.config.js ↔ Layout.jsx: RESOLVIDO (REPORT_PAGES movido para
 *   src/lib/reportPages.js, quebrando o ciclo).
 * - components/relatorios/shared/index.jsx → index.jsx: falso positivo
 *   do detector (barrel file; nenhum sibling importa de volta).
 */
import { describe, it, expect } from 'vitest';
import { REPORT_PAGES } from '@/lib/reportPages';
import * as pagesConfigModule from '@/pages.config';

describe('Import cycle verification', () => {
  it('REPORT_PAGES é importável de src/lib/reportPages (sem ciclo com Layout)', () => {
    expect(REPORT_PAGES).toBeInstanceOf(Set);
    expect(REPORT_PAGES.size).toBeGreaterThan(0);
  });

  it('pages.config não exporta mais REPORT_PAGES (movido para lib/reportPages)', () => {
    // Se pages.config re-exportasse REPORT_PAGES, haveria ciclo com Layout.
    // Verificamos que o módulo não tem essa exportação.
    expect(pagesConfigModule.REPORT_PAGES).toBeUndefined();
  });

  it('páginas de relatório conhecidas estão no conjunto', () => {
    expect(REPORT_PAGES.has('RelatorioNC')).toBe(true);
    expect(REPORT_PAGES.has('RelatorioDiario')).toBe(true);
    expect(REPORT_PAGES.has('RelatorioChecklist')).toBe(true);
  });

  it('páginas não-relatório não estão no conjunto', () => {
    expect(REPORT_PAGES.has('Dashboard')).toBe(false);
    expect(REPORT_PAGES.has('MeusEnsaios')).toBe(false);
    expect(REPORT_PAGES.has('Home')).toBe(false);
  });
});