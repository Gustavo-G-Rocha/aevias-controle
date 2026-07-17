/**
 * tests/utils/reportScope.test.js
 *
 * Garante o requisito de negócio: relatórios permanecem com fundo branco
 * fixo mesmo com dark mode ativo. Validado por contrato de source
 * (Layout aplica .report-scope; index.css reseta os tokens para claro).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const layoutSrc = readFileSync(resolve(__dirname, '../../Layout.jsx'), 'utf-8');
const cssSrc = readFileSync(resolve(__dirname, '../../index.css'), 'utf-8');

describe('Exceção de relatórios (report-scope)', () => {
  it('Layout envolve páginas de relatório com a classe report-scope', () => {
    expect(layoutSrc).toContain('REPORT_PAGES.has(currentPageName)');
    expect(layoutSrc).toContain('className="report-scope"');
  });

  it('CSS define um token de superfície de relatório branco', () => {
    expect(cssSrc).toContain('--color-report-surface');
    expect(cssSrc).toMatch(/--color-report-surface:\s*#FFFFFF/i);
  });

  it('report-scope mantém fundo branco fixo', () => {
    expect(cssSrc).toContain('.report-scope');
    expect(cssSrc).toMatch(/\.report-scope[\s\S]*background-color:\s*#FFFFFF/i);
  });

  it('report-scope reseta o texto para o tom escuro legível sobre branco', () => {
    expect(cssSrc).toMatch(/\.report-scope[\s\S]*--color-text:\s*#0D2137/i);
  });

  it('dark mode redefine o background global (mas não o do relatório)', () => {
    expect(cssSrc).toMatch(/\.dark\s*\{[\s\S]*--color-background:/);
  });
});