import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { sanitizeTextFields } from '@/utils/dataSanitization';
import { salvarRegistroOfflineAware } from '@/services/offlineSaveService';
import { obterRegistroOfflineAware } from '@/services/offlineRecordLoader';

export async function listarCertificacoes(limit = 200) {
  return withServiceCall(
    () => base44.entities.CertificacaoUsina.list('-created_date', limit),
    'Falha ao carregar certificações'
  );
}

export async function listarCertificacoesPorObra(obraId) {
  return withServiceCall(
    () => base44.entities.CertificacaoUsina.filter({ obra_id: obraId }, '-created_date', 200),
    'Falha ao carregar certificações da obra'
  );
}

export async function obterCertificacaoById(id) {
  return obterRegistroOfflineAware('CertificacaoUsina', id);
}

export async function criarCertificacao(data) {
  return salvarRegistroOfflineAware({ entityName: 'CertificacaoUsina', data: sanitizeTextFields(data), operation: 'create' });
}

export async function atualizarCertificacao(id, data) {
  return salvarRegistroOfflineAware({ entityName: 'CertificacaoUsina', data: sanitizeTextFields(data), operation: 'update', recordId: id });
}

export async function deletarCertificacao(id) {
  return withServiceCall(
    () => base44.entities.CertificacaoUsina.delete(id),
    'Falha ao excluir certificação'
  );
}