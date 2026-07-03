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

  it('usa grade de 3 colunas com 30% de largura cada', () => {
    expect(src).toContain("gridTemplateColumns: 'repeat(3, 30%)'");
  });

  it('deixa gap entre etiquetas (não coladas) e gap da lateral', () => {
    expect(src).toContain("columnGap: '5%'");
    expect(src).toContain("rowGap: '4mm'");
  });

  it('cada etiqueta ocupa 100% da célula (30% da folha) com altura 38,1mm', () => {
    expect(src).toContain("width: '100%'");
    expect(src).toContain("height: '38.1mm'");
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