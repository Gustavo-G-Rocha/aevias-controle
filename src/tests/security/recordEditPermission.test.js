/**
 * Segurança — Permissão de edição de registros (recordEditPermission.js)
 *
 * Espelha as regras server-side de validarESalvarRegistro. Garante que a UI
 * só ofereça "Editar" quando o servidor aceitará o salvamento — evitando
 * que um usuário mal-intencionado (ou bug de UI) submeta edição de registro
 * sobre o qual não tem direito.
 *
 * Cadeia de autorização:
 *   admin → edita qualquer registro
 *   autor (created_by / created_by_id) → edita os próprios
 *   gestor_contrato / sala_tecnica → edita registros de obras cuja regional
 *     os lista em seus arrays de emails responsáveis
 */
import { describe, it, expect } from 'vitest';
import {
  getEffectiveAccessLevel,
  canUserEditRecord,
} from '../../utils/recordEditPermission.js';

const ADMIN = { id: 'u1', email: 'admin@evias.com', access_level: 'admin' };
const GESTOR = { id: 'u2', email: 'gestor@evias.com', access_level: 'gestor_contrato' };
const SALA = { id: 'u3', email: 'sala@evias.com', access_level: 'sala_tecnica_afirmaevias' };
const LAB = { id: 'u4', email: 'lab@evias.com', access_level: 'user' };
const CLIENTE = { id: 'u5', email: 'cliente@cliente.com', access_level: 'cliente' };

const REGIONAL = {
  id: 'r1',
  gestores_contrato_responsaveis: ['gestor@evias.com'],
  gestor_contrato_responsavel: 'legacy@evias.com',
  salas_tecnicas_responsaveis: ['sala@evias.com'],
  clientes_responsaveis: ['cliente@cliente.com'],
};
const OBRA = { id: 'o1', regional_id: 'r1' };

describe('getEffectiveAccessLevel', () => {
  it('retorna "user" para usuário null', () => {
    expect(getEffectiveAccessLevel(null)).toBe('user');
  });
  it('usa access_level quando definido', () => {
    expect(getEffectiveAccessLevel(GESTOR)).toBe('gestor_contrato');
  });
  it('deriva admin de role quando access_level ausente', () => {
    expect(getEffectiveAccessLevel({ role: 'admin' })).toBe('admin');
  });
  it('default é user quando sem access_level e role não-admin', () => {
    expect(getEffectiveAccessLevel({ role: 'user' })).toBe('user');
  });
});

describe('canUserEditRecord — admin', () => {
  it('admin edita qualquer registro', () => {
    const чужой = { created_by: 'outro@evias.com', created_by_id: 'u99' };
    expect(canUserEditRecord(ADMIN, чужой, OBRA, [REGIONAL])).toBe(true);
  });
});

describe('canUserEditRecord — autor', () => {
  it('autor edita registro que criou (por email)', () => {
    const rec = { created_by: 'lab@evias.com', created_by_id: 'u4' };
    expect(canUserEditRecord(LAB, rec, OBRA, [REGIONAL])).toBe(true);
  });
  it('autor edita registro que criou (por id)', () => {
    const rec = { created_by: 'outro@evias.com', created_by_id: 'u4' };
    expect(canUserEditRecord(LAB, rec, OBRA, [REGIONAL])).toBe(true);
  });
  it('laboratorista NÃO edita registro de outro autor', () => {
    const rec = { created_by: 'outro@evias.com', created_by_id: 'u99' };
    expect(canUserEditRecord(LAB, rec, OBRA, [REGIONAL])).toBe(false);
  });
});

describe('canUserEditRecord — tenant-scoped (gestor/sala_tecnica)', () => {
  const recAlheio = { created_by: 'outro@evias.com', created_by_id: 'u99' };

  it('gestor_contrato edita registro de obra cuja regional o lista', () => {
    expect(canUserEditRecord(GESTOR, recAlheio, OBRA, [REGIONAL])).toBe(true);
  });
  it('gestor_contrato NÃO edita se sua regional não está na lista', () => {
    const outra = { ...REGIONAL, id: 'r2', gestores_contrato_responsaveis: ['outro@evias.com'] };
    expect(canUserEditRecord(GESTOR, recAlheio, OBRA, [outra])).toBe(false);
  });
  it('gestor_contrato com email no campo legacy (gestor_contrato_responsavel)', () => {
    const gestorLegacy = { id: 'uL', email: 'legacy@evias.com', access_level: 'gestor_contrato' };
    const regLegacy = { id: 'r1', gestores_contrato_responsaveis: [], gestor_contrato_responsavel: 'legacy@evias.com' };
    expect(canUserEditRecord(gestorLegacy, recAlheio, OBRA, [regLegacy])).toBe(true);
  });
  it('gestor_contrato NÃO edita se regional da obra não está em regionais[]', () => {
    expect(canUserEditRecord(GESTOR, recAlheio, OBRA, [])).toBe(false);
  });
  it('sala_tecnica edita registro de obra cuja regional a lista', () => {
    expect(canUserEditRecord(SALA, recAlheio, OBRA, [REGIONAL])).toBe(true);
  });
  it('sala_tecnica NÃO edita se não está em salas_tecnicas_responsaveis', () => {
    const regSemSala = { ...REGIONAL, salas_tecnicas_responsaveis: [] };
    expect(canUserEditRecord(SALA, recAlheio, OBRA, [regSemSala])).toBe(false);
  });
});

describe('canUserEditRecord — cliente', () => {
  // A checagem de autoria vem ANTES do escopo tenant — então um cliente que
  // criou um registro pode editá-lo (override de autor). Mas um cliente que
  // NÃO é autor não pode editar (canUserEditRecord não concede a cliente
  // via clientes_responsaveis — apenas gestor/sala_tecnica têm escopo regional).
  it('cliente que é autor pode editar (override de autoria)', () => {
    const rec = { created_by: 'cliente@cliente.com', created_by_id: 'u5' };
    expect(canUserEditRecord(CLIENTE, rec, OBRA, [REGIONAL])).toBe(true);
  });

  it('cliente que NÃO é autor não pode editar (sem escopo regional para cliente)', () => {
    const recAlheio = { created_by: 'outro@cliente.com', created_by_id: 'u99' };
    expect(canUserEditRecord(CLIENTE, recAlheio, OBRA, [REGIONAL])).toBe(false);
  });

  it('cliente_supervisor que não é autor não pode editar', () => {
    const recAlheio = { created_by: 'outro@cliente.com', created_by_id: 'u99' };
    expect(canUserEditRecord({ ...CLIENTE, access_level: 'cliente_supervisor' }, recAlheio, OBRA, [REGIONAL])).toBe(false);
  });
});

describe('canUserEditRecord — fail-closed', () => {
  it('user null → false', () => {
    expect(canUserEditRecord(null, { created_by: 'x' }, OBRA, [REGIONAL])).toBe(false);
  });
  it('record null → false', () => {
    expect(canUserEditRecord(GESTOR, null, OBRA, [REGIONAL])).toBe(false);
  });
  it('obra sem regional_id → false para tenant-scoped', () => {
    const recAlheio = { created_by: 'outro@evias.com' };
    expect(canUserEditRecord(GESTOR, recAlheio, { id: 'o1' }, [REGIONAL])).toBe(false);
  });
  it('case-insensitive: email com maiúsculas ainda autoriza', () => {
    const gestorCase = { ...GESTOR, email: 'GESTOR@evias.com' };
    const recAlheio = { created_by: 'outro@evias.com' };
    expect(canUserEditRecord(gestorCase, recAlheio, OBRA, [REGIONAL])).toBe(true);
  });
});