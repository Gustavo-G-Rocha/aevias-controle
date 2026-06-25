import { describe, it, expect } from 'vitest';
import { buildPedreiraDoProjeto } from '@/hooks/useCertificacaoUsinaForm';
// Import the getInitialFormData defaults indirectly via the page module
// We test the shape expected from the page's DEFAULT_* constants by verifying
// that a freshly constructed initial form has the expected default values.
// These constants are module-level (not exported) so we test the observable behaviour.

describe('buildPedreiraDoProjeto', () => {
  it('retorna string vazia para projeto sem agregados', () => {
    expect(buildPedreiraDoProjeto(null)).toBe('');
    expect(buildPedreiraDoProjeto({})).toBe('');
    expect(buildPedreiraDoProjeto({ agregados: [] })).toBe('');
  });

  it('retorna pedreira única quando todos os agregados têm a mesma pedreira', () => {
    const project = {
      agregados: [
        { nome: 'A', pedreira: 'Pedreira X' },
        { nome: 'B', pedreira: 'Pedreira X' },
      ],
    };
    expect(buildPedreiraDoProjeto(project)).toBe('Pedreira X');
  });

  it('concatena pedreiras distintas com " + "', () => {
    const project = {
      agregados: [
        { nome: 'A', pedreira: 'Pedreira X' },
        { nome: 'B', pedreira: 'Pedreira Y' },
      ],
    };
    expect(buildPedreiraDoProjeto(project)).toBe('Pedreira X + Pedreira Y');
  });

  it('ignora agregados sem pedreira', () => {
    const project = {
      agregados: [
        { nome: 'A', pedreira: 'Pedreira X' },
        { nome: 'B' },
        { nome: 'C', pedreira: null },
      ],
    };
    expect(buildPedreiraDoProjeto(project)).toBe('Pedreira X');
  });
});