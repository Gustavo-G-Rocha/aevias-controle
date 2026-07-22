/**
 * Permissão de edição de registros — espelha as regras server-side de
 * validarESalvarRegistro (getUserAccessLevel + verifyTenantAccessForRecord).
 * Garante que a UI só ofereça "Editar" quando o servidor aceitará o salvamento.
 */

export function getEffectiveAccessLevel(user) {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

/**
 * Verifica se o usuário pode editar/salvar um registro, considerando
 * nível de acesso efetivo, autoria e escopo de tenant (regional).
 *
 * @param {object} user - usuário atual
 * @param {object} record - registro (precisa de created_by / created_by_id)
 * @param {object|null} obra - obra vinculada ao registro (para regional_id)
 * @param {object[]} regionais - lista de regionais para checagem de tenant
 */
export function canUserEditRecord(user, record, obra, regionais = []) {
  if (!user || !record) return false;

  const level = getEffectiveAccessLevel(user);
  if (level === 'admin') return true;

  if (record.created_by === user.email || (user.id && record.created_by_id === user.id)) {
    return true;
  }

  // Níveis tenant-scoped: precisam pertencer à regional da obra do registro
  const regional = obra?.regional_id
    ? regionais.find(r => r.id === obra.regional_id)
    : null;
  if (!regional) return false;

  const email = (user.email || '').toLowerCase();

  if (level === 'gestor_contrato') {
    return (
      (regional.gestores_contrato_responsaveis || []).some(e => e.toLowerCase() === email) ||
      (regional.gestor_contrato_responsavel || '').toLowerCase() === email
    );
  }
  if (level === 'sala_tecnica_afirmaevias') {
    return (regional.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === email);
  }

  return false;
}

/**
 * Entidades com regra restrita de edição: Boletins (Sondagem/Trado) e
 * Usina (Checklist/Certificação). Para estas, somente o criador do
 * registro e o admin podem editar — ninguém mais (sem sala técnica/gestor).
 * O admin só pode editar quando a obra vinculada está em andamento.
 */
export const RESTRICTED_EDIT_ENTITIES = new Set([
  'BoletimSondagem',
  'BoletimSondagemTrado',
  'ChecklistUsina',
  'CertificacaoUsina',
]);

/**
 * Permissão de edição para registros de entidades restritas.
 * - Admin: só edita se a obra vinculada estiver em andamento.
 * - Criador: edita até o registro ser aprovado (approved !== true).
 */
export function canEditRestrictedRecord(user, record, obra) {
  if (!user || !record) return false;
  const isAdmin = getEffectiveAccessLevel(user) === 'admin';
  if (isAdmin) return obra?.status === 'em_andamento';
  const isOwner =
    (record.created_by || '').toLowerCase() === (user.email || '').toLowerCase() ||
    (user.id && record.created_by_id === user.id);
  return isOwner && record.approved !== true;
}