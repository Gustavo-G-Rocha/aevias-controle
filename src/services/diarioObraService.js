import { base44 } from '@/api/base44Client';

/**
 * Service centralizado para operações com Diário de Obra
 */
export async function listarDiarios(limit = 500) {
  return base44.entities.DiarioObra.list('-created_date', limit);
}

export async function listarDiariosPorObra(obraId) {
  return base44.entities.DiarioObra.filter({ obra_id: obraId }, '-created_date', 500);
}

export async function obterDiarioById(id) {
  return base44.entities.DiarioObra.read(id);
}

export async function criarDiario(data) {
  return base44.entities.DiarioObra.create(data);
}

export async function atualizarDiario(id, data) {
  return base44.entities.DiarioObra.update(id, data);
}

export async function deletarDiario(id) {
  return base44.entities.DiarioObra.delete(id);
}