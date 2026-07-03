import { base44 } from '@/api/base44Client';

/**
 * Service centralizado para operações com GranuMistura
 */
export async function listarGranuMistura(limit = 500) {
  return base44.entities.GranuMistura.list('-created_date', limit);
}

export async function listarGranuMisturaPorObra(obraId) {
  return base44.entities.GranuMistura.filter({ obra_id: obraId }, '-created_date', 500);
}

export async function obterGranuMisturaById(id) {
  return base44.entities.GranuMistura.read(id);
}

export async function criarGranuMistura(data) {
  return base44.entities.GranuMistura.create(data);
}

export async function atualizarGranuMistura(id, data) {
  return base44.entities.GranuMistura.update(id, data);
}

export async function deletarGranuMistura(id) {
  return base44.entities.GranuMistura.delete(id);
}