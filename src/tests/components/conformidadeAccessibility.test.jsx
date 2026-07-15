import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf-8');

describe('indicadores acessíveis de conformidade', () => {
  it('nomeia os estados do checklist de concretagem', () => {
    const source = read('pages/ChecklistConcretagem/components/CargaConcretoCard.jsx');
    expect(source).toContain('aria-label="Conforme"');
    expect(source).toContain('aria-label="Não conforme"');
    expect(source).toContain('aria-label="Flow Test conforme"');
    expect(source).toContain('aria-label="Espessura da camada não conforme"');
  });

  it('nomeia indicadores reutilizados nos relatórios', () => {
    [
      'components/relatorios/shared/ReportCheckmark.jsx',
      'components/relatorio-checklist-aplicacao/CheckmarkColumn.jsx',
      'components/relatorio-checklist-terraplanagem/CheckboxDisplay.jsx',
    ].forEach((path) => {
      const source = read(path);
      expect(source).toContain('role="img"');
      expect(source).toContain('aria-label=');
      expect(source).toContain('Não conforme');
    });
  });
});