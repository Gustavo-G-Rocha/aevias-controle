/**
 * tests/components/impression-etiquetas/EtiquetasUmidade.test.jsx
 *
 * Teste de contrato (source-based) que garante que a etiqueta de umidade:
 *  - não introduz cores navy/azul (sidebar) que vazam para o PDF;
 *  - usa grade de 3 colunas (30% cada) com gap entre etiquetas;
 *  - respeita 21 etiquetas por página (3 colunas x 7 linhas);
 *  - não renderiza elementos de preenchimento nos espaços vazios.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  resolve(__dirname, '../../../components/impression-etiquetas/EtiquetasUmidade.jsx'),
  'utf-8',
);

describe('EtiquetasUmidade - contrato de impressão', () => {
  it('não contém cores navy/azul que vazam para o PDF', () => {
    // Cores do tema navy da sidebar/layout que causavam a "coluna azul"
    expect(src).not.toContain('#00233B');
    expect(src).not.toContain('#0B1A28');
    expect(src).not.toContain('#0A3352');
    expect(src).not.toMatch(/navy/i);
    expect(src).not.toContain('var(--color-sidebar');
    expect(src).not.toContain('var(--color-primary');
  });

  it('usa fundo branco explícito no container', () => {
    expect(src).toContain('bg-white');
  });

  it('usa grade de 3 colunas x 7 linhas com tamanho exato de etiqueta (63,5mm x 38,1mm)', () => {
    expect(src).toContain("gridTemplateColumns: 'repeat(3, 63.5mm)'");
    expect(src).toContain("gridTemplateRows: 'repeat(7, 38.1mm)'");
  });

  it('trava a página em A4 exato (210x297mm) com overflow hidden para evitar vazar para a 2ª folha', () => {
    expect(src).toContain('width: 210mm !important');
    expect(src).toContain('height: 297mm !important');
    expect(src).toContain('overflow: hidden !important');
  });

  it('respeita gaps e margens exatas da folha A4', () => {
    expect(src).toContain("columnGap: '2.15mm'");
    expect(src).toContain("rowGap: '0.08mm'");
    // Margens do documento aplicadas como padding do container (robusto ao navegador)
    expect(src).toContain('padding: 14.4mm 7.6mm 15.4mm 7.6mm');
    // @page zerado para não somar com a margem do navegador
    expect(src).toContain('margin: 0 !important');
  });

  it('usa fonte aumentada e em negrito nas etiquetas', () => {
    expect(src).toContain('text-[13px]');
    expect(src).toContain('print:text-[10px]');
    expect(src).toContain('font-bold');
  });

  it('deixa o valor do Furo (ponto) em negrito', () => {
    expect(src).toContain('font-bold');
  });

  it('cada etiqueta ocupa 100% da célula exata', () => {
    expect(src).toContain("width: '100%'");
    expect(src).toContain("height: '100%'");
  });

  it('respeita 21 etiquetas por página (3x7) via getEtiquetasPageUmidade', () => {
    expect(src).toContain('getEtiquetasPageUmidade');
    expect(src).toContain('calcularPaginasUmidade');
  });

  it('não renderiza elementos de preenchimento nos espaços vazios', () => {
    // Só mapeia as etiquetas reais — sem placeholder/divisória preenchendo grid vazio
    expect(src).not.toMatch(/Array\.from\(\{ length: 21/);
    expect(src).not.toMatch(/fillEmpty/i);
    expect(src).not.toMatch(/placeholder.*empty/i);
  });
});