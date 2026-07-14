import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { sanitizeTextFields } from '@/utils/dataSanitization';
import { salvarRegistroOfflineAware } from '@/services/offlineSaveService';
import { obterRegistroOfflineAware } from '@/services/offlineRecordLoader';

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
  return obterRegistroOfflineAware('GranuMistura', id);
}

export async function criarGranuMistura(data) {
  return salvarRegistroOfflineAware({ entityName: 'GranuMistura', data: sanitizeTextFields(data), operation: 'create' });
}

export async function atualizarGranuMistura(id, data) {
  return salvarRegistroOfflineAware({ entityName: 'GranuMistura', data: sanitizeTextFields(data), operation: 'update', recordId: id });
}

export async function deletarGranuMistura(id) {
  return withServiceCall(
    () => base44.entities.GranuMistura.delete(id),
    'Falha ao excluir ensaio de granulometria'
  );
}