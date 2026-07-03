import { base44 } from '@/api/base44Client';

/**
 * Service centralizado para operações com Faixas Granulométricas
 */
export async function listarFaixas() {
  return base44.entities.FaixaGranulometrica.list();
}

export async function listarFaixasPorTipo(tipo) {
  return base44.entities.FaixaGranulometrica.filter({ tipo });
}

export async function listarFaixasAtivas() {
  return base44.entities.FaixaGranulometrica.filter({ status: 'ativo' });
}

export async function obterFaixaById(id) {
  return base44.entities.FaixaGranulometrica.read(id);
}

export async function criarFaixa(data) {
  return base44.entities.FaixaGranulometrica.create(data);
}

export async function atualizarFaixa(id, data) {
  return base44.entities.FaixaGranulometrica.update(id, data);
}

export async function deletarFaixa(id) {
  return base44.entities.FaixaGranulometrica.delete(id);
}