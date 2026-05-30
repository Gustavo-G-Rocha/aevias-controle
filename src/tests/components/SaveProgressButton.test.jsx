/**
 * tests/components/SaveProgressButton.test.jsx
 *
 * Testa metadados e contrato de interface do SaveProgressButton
 * sem renderização DOM (ambiente node sem jsdom).
 */
import { describe, it, expect, vi } from 'vitest';
import SaveProgressButton from '@/components/forms/SaveProgressButton';

describe('SaveProgressButton - contrato de interface', () => {
  it('deve ser exportado como função React', () => {
    expect(typeof SaveProgressButton).toBe('function');
  });

  it('deve ter nome correto', () => {
    expect(SaveProgressButton.name).toBe('SaveProgressButton');
  });

  it('deve aceitar chamada com props válidas sem lançar erro de parse', () => {
    // Verifica que o componente é uma função válida com a assinatura esperada
    expect(SaveProgressButton.length).toBeLessThanOrEqual(1); // componente funcional recebe 1 argumento (props)
  });

  it('deve expor defaults via toString para documentação', () => {
    const src = SaveProgressButton.toString();
    expect(src).toContain('saving');
    expect(src).toContain('disabled');
    expect(src).toContain('label');
    expect(src).toContain('onClick');
  });

  it('deve conter lógica de disabled baseada em saving', () => {
    const src = SaveProgressButton.toString();
    expect(src).toContain('saving || disabled');
  });

  it('deve conter referência ao savingLabel e label', () => {
    const src = SaveProgressButton.toString();
    expect(src).toContain('savingLabel');
    expect(src).toContain('label');
  });

  it('deve conter ícone de carregamento (Loader2) para estado saving', () => {
    const src = SaveProgressButton.toString();
    expect(src).toContain('Loader2');
  });

  it('deve conter ícone Save para estado normal', () => {
    const src = SaveProgressButton.toString();
    expect(src).toContain('Save');
  });
});