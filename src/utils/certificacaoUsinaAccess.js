/**
 * Regras de acesso específicas da Certificação de Usinas.
 *
 * Contexto de negócio:
 *  - O laboratorista preenche a certificação, mas NÃO preenche a etapa de
 *    "Resultado" — essa etapa é responsabilidade do(s) Gestor(es) de Contrato
 *    alocado(s) na regional da obra.
 *  - O gestor da regional pode reabrir o registro (mesmo criado por outro) para
 *    preencher o resultado.
 *
 * Todas as funções são puras para permitir testes unitários sem DOM.
 */

import { getUserAccessLevel } from '@/utils/accessControl';

const norm = (email) => String(email || '').trim().toLowerCase();

/**
 * Retorna a lista de emails de gestores de contrato responsáveis por uma regional,
 * unificando o campo legado (gestor_contrato_responsavel) com o atual
 * (gestores_contrato_responsaveis).
 */
export function getGestoresDaRegional(regional) {
  if (!regional) return [];
  const lista = Array.isArray(regional.gestores_contrato_responsaveis)
    ? regional.gestores_contrato_responsaveis
    : [];
  const legado = regional.gestor_contrato_responsavel ? [regional.gestor_contrato_responsavel] : [];
  return [...new Set([...lista, ...legado].map(norm).filter(Boolean))];
}

/**
 * Indica se o usuário é gestor de contrato alocado na regional informada.
 */
export function isGestorDaRegional(user, regional) {
  if (!user || !regional) return false;
  if (getUserAccessLevel(user) !== 'gestor_contrato') return false;
  return getGestoresDaRegional(regional).includes(norm(user.email));
}

/**
 * Resolve a regional de uma obra a partir das listas carregadas.
 */
export function resolverRegionalDaObra(obra, regionais = []) {
  if (!obra) return null;
  return regionais.find((r) => r.id === obra.regional_id) || null;
}

/**
 * Indica se o usuário é o gestor de contrato responsável pela regional da obra
 * de um registro de certificação. Usado para liberar edição do resultado.
 */
export function isGestorDaRegionalDaObra(user, obra, regionais = []) {
  const regional = resolverRegionalDaObra(obra, regionais);
  return isGestorDaRegional(user, regional);
}

/**
 * Regra final: o gestor pode reabrir/editar este registro de certificação para
 * preencher o resultado.
 *
 * Só faz sentido para registros já existentes (com id) que não foram aprovados
 * ainda — não altera nem sobrepõe as permissões de admin/owner existentes.
 */
export function canGestorPreencherResultado(user, editingChecklist, obra, regionais = []) {
  if (!editingChecklist?.id) return false;
  if (editingChecklist.approved === true) return false;
  return isGestorDaRegionalDaObra(user, obra, regionais);
}

/**
 * Indica se o usuário é laboratorista puro (não vê a etapa de Resultado).
 * Qualquer perfil não-laboratorista (admin, gestor, sala técnica) enxerga a etapa.
 */
export function laboratoristaDeveOcultarResultado(user) {
  const level = getUserAccessLevel(user);
  return level === 'user' || level === 'funcionarios_cliente';
}