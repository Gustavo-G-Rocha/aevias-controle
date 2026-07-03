import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Produtividade Diária
 */
export async function listarProdutividade(limit = 500) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.list('-created_date', limit),
    'Falha ao carregar produtividade'
  );
}

export async function listarProdutividadePorObra(obraId) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.filter({ obra_id: obraId }, '-created_date', 500),
    'Falha ao carregar produtividade da obra'
  );
}

export async function listarProdutividadePorLaboratorista(laboratoristaName) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.filter({ laboratorista_name: laboratoristaName }, '-created_date', 500),
    'Falha ao carregar produtividade do laboratorista'
  );
}

export async function obterProdutividadeById(id) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.read(id),
    'Falha ao carregar produtividade'
  );
}

export async function criarProdutividade(data) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.create(data),
    'Falha ao registrar produtividade'
  );
}

export async function atualizarProdutividade(id, data) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.update(id, data),
    'Falha ao atualizar produtividade'
  );
}

export async function deletarProdutividade(id) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.delete(id),
    'Falha ao excluir produtividade'
  );
}

/**
 * Filtra registros de ProdutividadeDiaria por critério server-side.
 * @param {object} filtro
 * @param {string} sort
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function filtrarProdutividade(filtro, sort = '-created_date', limit = 500) {
  return withServiceCall(
    () => base44.entities.ProdutividadeDiaria.filter(filtro, sort, limit),
    'Falha ao filtrar produtividade'
  );
}