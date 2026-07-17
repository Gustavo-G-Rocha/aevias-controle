/**
 * tests/services/usuariosProdutividadeService.test.js
 * Cobre os services de Usuários e Produtividade Diária:
 * delegação correta ao SDK e tradução de erros técnicos em mensagens amigáveis.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { sdk } = vi.hoisted(() => ({
  sdk: {
    auth: {
      me: vi.fn(), updateMe: vi.fn(), logout: vi.fn(),
      redirectToLogin: vi.fn(), isAuthenticated: vi.fn(),
    },
    users: { inviteUser: vi.fn() },
    entities: {
      User: { list: vi.fn(), get: vi.fn(), update: vi.fn(), filter: vi.fn() },
      ProdutividadeDiaria: {
        list: vi.fn(), filter: vi.fn(), get: vi.fn(),
        create: vi.fn(), update: vi.fn(), delete: vi.fn(),
      },
    },
  },
}));

vi.mock('@/api/base44Client', () => ({ base44: sdk }));
vi.mock('@/functions/excluirMinhaConta', () => ({ excluirMinhaConta: vi.fn(async () => ({ data: { success: true } })) }));

import * as usuarios from '@/services/usuariosService';
import * as produtividade from '@/services/produtividadeService';
import { excluirMinhaConta } from '@/functions/excluirMinhaConta';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usuariosService — delegação', () => {
  it('obterUsuarioAtual retorna o usuário logado', async () => {
    sdk.auth.me.mockResolvedValue({ id: 'u1', email: 'a@x.com' });
    expect(await usuarios.obterUsuarioAtual()).toEqual({ id: 'u1', email: 'a@x.com' });
  });

  it('atualizarUsuarioAtual chama auth.updateMe com os dados', async () => {
    sdk.auth.updateMe.mockResolvedValue({ id: 'u1', nickname: 'Zé' });
    await usuarios.atualizarUsuarioAtual({ nickname: 'Zé' });
    expect(sdk.auth.updateMe).toHaveBeenCalledWith({ nickname: 'Zé' });
  });

  it('atualizarUsuario delega para User.update', async () => {
    sdk.entities.User.update.mockResolvedValue({ id: 'u2' });
    await usuarios.atualizarUsuario('u2', { access_level: 'gestor_contrato' });
    expect(sdk.entities.User.update).toHaveBeenCalledWith('u2', { access_level: 'gestor_contrato' });
  });

  it('deletarUsuario usa a função backend excluirMinhaConta', async () => {
    await usuarios.deletarUsuario();
    expect(excluirMinhaConta).toHaveBeenCalledWith({});
  });

  it('inviteUser delega para users.inviteUser', async () => {
    sdk.users.inviteUser.mockResolvedValue({ ok: true });
    await usuarios.inviteUser('novo@x.com', 'user');
    expect(sdk.users.inviteUser).toHaveBeenCalledWith('novo@x.com', 'user');
  });

  it('filtrarUsuarios repassa o filtro server-side', async () => {
    sdk.entities.User.filter.mockResolvedValue([{ id: 'u1' }]);
    const r = await usuarios.filtrarUsuarios({ email: 'a@x.com' });
    expect(sdk.entities.User.filter).toHaveBeenCalledWith({ email: 'a@x.com' });
    expect(r).toEqual([{ id: 'u1' }]);
  });

  it('isAuthenticated repassa o booleano sem re-empacotar', async () => {
    sdk.auth.isAuthenticated.mockResolvedValue(false);
    expect(await usuarios.isAuthenticated()).toBe(false);
  });
});

describe('usuariosService — tradução de erros', () => {
  it('listarUsuarios lança mensagem amigável preservando a causa', async () => {
    const original = new Error('Request failed with status code 500');
    sdk.entities.User.list.mockRejectedValue(original);

    await expect(usuarios.listarUsuarios()).rejects.toMatchObject({
      message: 'Falha ao carregar usuários',
      cause: original,
    });
  });

  it('logout falho lança mensagem amigável', async () => {
    sdk.auth.logout.mockRejectedValue(new Error('boom'));
    await expect(usuarios.logout()).rejects.toThrow('Falha ao sair do sistema');
  });
});

describe('produtividadeService — delegação e erros', () => {
  it('listarProdutividade usa ordenação e limite padrão', async () => {
    sdk.entities.ProdutividadeDiaria.list.mockResolvedValue([]);
    await produtividade.listarProdutividade();
    expect(sdk.entities.ProdutividadeDiaria.list).toHaveBeenCalledWith('-created_date', 500);
  });

  it('criarProdutividade delega o payload', async () => {
    sdk.entities.ProdutividadeDiaria.create.mockResolvedValue({ id: 'p1' });
    const r = await produtividade.criarProdutividade({ laboratorista_email: 'lab@x.com', data: '2026-01-01', status: 'OK' });
    expect(r).toEqual({ id: 'p1' });
  });

  it('atualizarProdutividade e deletarProdutividade delegam por id', async () => {
    sdk.entities.ProdutividadeDiaria.update.mockResolvedValue({ id: 'p1' });
    sdk.entities.ProdutividadeDiaria.delete.mockResolvedValue({});
    await produtividade.atualizarProdutividade('p1', { status: 'N/A' });
    await produtividade.deletarProdutividade('p1');
    expect(sdk.entities.ProdutividadeDiaria.update).toHaveBeenCalledWith('p1', { status: 'N/A' });
    expect(sdk.entities.ProdutividadeDiaria.delete).toHaveBeenCalledWith('p1');
  });

  it('filtrarProdutividade repassa filtro, sort e limite', async () => {
    sdk.entities.ProdutividadeDiaria.filter.mockResolvedValue([]);
    await produtividade.filtrarProdutividade({ laboratorista_email: 'lab@x.com' }, 'data', 100);
    expect(sdk.entities.ProdutividadeDiaria.filter).toHaveBeenCalledWith({ laboratorista_email: 'lab@x.com' }, 'data', 100);
  });

  it('falha na API vira mensagem amigável', async () => {
    sdk.entities.ProdutividadeDiaria.list.mockRejectedValue(new Error('500'));
    await expect(produtividade.listarProdutividade()).rejects.toThrow('Falha ao carregar produtividade');
  });
});