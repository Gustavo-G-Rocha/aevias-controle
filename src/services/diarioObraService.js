import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Diário de Obra
 */
export async function listarDiarios(limit = 500) {
  return withServiceCall(
    () => base44.entities.DiarioObra.list('-created_date', limit),
    'Falha ao carregar diários'
  );
}

export async function listarDiariosPorObra(obraId) {
  return withServiceCall(
    () => base44.entities.DiarioObra.filter({ obra_id: obraId }, '-created_date', 500),
    'Falha ao carregar diários da obra'
  );
}

export async function obterDiarioById(id) {
  return withServiceCall(
    () => base44.entities.DiarioObra.read(id),
    'Falha ao carregar diário'
  );
}

export async function criarDiario(data) {
  return withServiceCall(
    () => base44.entities.DiarioObra.create(data),
    'Falha ao criar diário'
  );
}

export async function atualizarDiario(id, data) {
  return withServiceCall(
    () => base44.entities.DiarioObra.update(id, data),
    'Falha ao atualizar diário'
  );
}

export async function deletarDiario(id) {
  return withServiceCall(
    () => base44.entities.DiarioObra.delete(id),
    'Falha ao excluir diário'
  );
}