import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com GranuMistura
 */
export async function listarGranuMistura(limit = 500) {
  return withServiceCall(
    () => base44.entities.GranuMistura.list('-created_date', limit),
    'Falha ao carregar ensaios de granulometria'
  );
}

export async function listarGranuMisturaPorObra(obraId) {
  return withServiceCall(
    () => base44.entities.GranuMistura.filter({ obra_id: obraId }, '-created_date', 500),
    'Falha ao carregar ensaios de granulometria da obra'
  );
}

export async function obterGranuMisturaById(id) {
  return withServiceCall(
    () => base44.entities.GranuMistura.read(id),
    'Falha ao carregar ensaio de granulometria'
  );
}

export async function criarGranuMistura(data) {
  return withServiceCall(
    () => base44.entities.GranuMistura.create(data),
    'Falha ao criar ensaio de granulometria'
  );
}

export async function atualizarGranuMistura(id, data) {
  return withServiceCall(
    () => base44.entities.GranuMistura.update(id, data),
    'Falha ao atualizar ensaio de granulometria'
  );
}

export async function deletarGranuMistura(id) {
  return withServiceCall(
    () => base44.entities.GranuMistura.delete(id),
    'Falha ao excluir ensaio de granulometria'
  );
}