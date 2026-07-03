import { base44 } from '@/api/base44Client';

/**
 * Service centralizado para operações com Produtividade Diária
 */
export async function listarProdutividade(limit = 500) {
  return base44.entities.ProdutividadeDiaria.list('-created_date', limit);
}

export async function listarProdutividadePorObra(obraId) {
  return base44.entities.ProdutividadeDiaria.filter({ obra_id: obraId }, '-created_date', 500);
}

export async function listarProdutividadePorLaboratorista(laboratoristaName) {
  return base44.entities.ProdutividadeDiaria.filter({ laboratorista_name: laboratoristaName }, '-created_date', 500);
}

export async function obterProdutividadeById(id) {
  return base44.entities.ProdutividadeDiaria.read(id);
}

export async function criarProdutividade(data) {
  return base44.entities.ProdutividadeDiaria.create(data);
}

export async function atualizarProdutividade(id, data) {
  return base44.entities.ProdutividadeDiaria.update(id, data);
}

export async function deletarProdutividade(id) {
  return base44.entities.ProdutividadeDiaria.delete(id);
}