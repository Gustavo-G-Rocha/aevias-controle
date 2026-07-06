/**
 * Testes das funções puras extraídas de GerenciarSolicitacoesModal.
 */
import { describe, it, expect } from 'vitest';
import { validarLaboratoristaTransferivel } from '@/utils/gerenciarSolicitacoesUtils';

describe('validarLaboratoristaTransferivel', () => {
  it('retorna valido=true quando usuário é null (não encontrado)', () => {
    const result = validarLaboratoristaTransferivel(null);
    expect(result.valido).toBe(true);
    expect(result.mensagem).toBeUndefined();
  });

  it('retorna valido=true para access_level "user"', () => {
    const result = validarLaboratoristaTransferivel({ access_level: 'user' });
    expect(result.valido).toBe(true);
  });

  it('retorna valido=true para access_level "admin"', () => {
    const result = validarLaboratoristaTransferivel({ access_level: 'admin' });
    expect(result.valido).toBe(true);
  });

  it('retorna valido=false para access_level "manager"', () => {
    const result = validarLaboratoristaTransferivel({ access_level: 'manager' });
    expect(result.valido).toBe(false);
    expect(result.mensagem).toContain('manager');
  });

  it('retorna valido=false para access_level "client"', () => {
    const result = validarLaboratoristaTransferivel({ access_level: 'client' });
    expect(result.valido).toBe(false);
    expect(result.mensagem).toContain('client');
  });
});