import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Usuários
 */
export async function obterUsuarioAtual() {
  return withServiceCall(
    () => base44.auth.me(),
    'Falha ao obter usuário atual'
  );
}

export async function listarUsuarios() {
  return withServiceCall(
    () => base44.entities.User.list(),
    'Falha ao carregar usuários'
  );
}

export async function obterUsuarioById(id) {
  return withServiceCall(
    () => base44.entities.User.read(id),
    'Falha ao carregar usuário'
  );
}

export async function atualizarUsuarioAtual(data) {
  return withServiceCall(
    () => base44.auth.updateMe(data),
    'Falha ao atualizar perfil'
  );
}

export async function atualizarUsuario(id, data) {
  return withServiceCall(
    () => base44.entities.User.update(id, data),
    'Falha ao atualizar usuário'
  );
}

export async function logout() {
  return withServiceCall(
    () => base44.auth.logout(),
    'Falha ao sair do sistema'
  );
}

export async function redirectToLogin(nextUrl) {
  return withServiceCall(
    () => base44.auth.redirectToLogin(nextUrl),
    'Falha ao redirecionar para login'
  );
}

// isAuthenticated é uma guarda booleana (Promise<boolean>); lança raramente e
// não deve ser re-empacotada, pois callers tratam o booleano diretamente.
export async function isAuthenticated() {
  return base44.auth.isAuthenticated();
}

export async function inviteUser(email, role) {
  return withServiceCall(
    () => base44.users.inviteUser(email, role),
    'Falha ao convidar usuário'
  );
}

/**
 * Filtra usuários por critério server-side (ex.: { email: "x@y.com" }).
 * @param {object} filtro
 * @returns {Promise<object[]>}
 */
export async function filtrarUsuarios(filtro) {
  return withServiceCall(
    () => base44.entities.User.filter(filtro),
    'Falha ao buscar usuários'
  );
}