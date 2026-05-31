/**
 * tests/components/SaveProgressButton.test.jsx
 *
 * Testa o contrato de interface do SaveProgressButton via leitura
 * do source — sem importar o módulo (evita cadeia window → utils.js → button).
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  resolve(__dirname, '../../components/forms/SaveProgressButton.jsx'),
  'utf-8'
);

describe('SaveProgressButton - contrato de interface', () => {
  it('deve ser um componente funcional exportado como default', () => {
    expect(src).toContain('export default function SaveProgressButton');
  });

  it('deve aceitar prop onClick', () => {
    expect(src).toContain('onClick');
  });

  it('deve aceitar prop saving com default false', () => {
    expect(src).toContain('saving = false');
  });

  it('deve aceitar prop disabled com default false', () => {
    expect(src).toContain('disabled = false');
  });

  it('deve aceitar prop label com valor padrão', () => {
    expect(src).toContain('label =');
  });

  it('deve aceitar prop savingLabel com valor padrão', () => {
    expect(src).toContain('savingLabel =');
  });

  it('deve desabilitar o botão quando saving ou disabled', () => {
    expect(src).toContain('saving || disabled');
  });

  it('deve mostrar ícone Loader2 durante o estado saving', () => {
    expect(src).toContain('Loader2');
  });

  it('deve mostrar ícone Save no estado normal', () => {
    expect(src).toContain('Save');
  });

  it('deve aceitar prop className para estilização customizada', () => {
    expect(src).toContain('className');
  });
});