import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { sanitizeTextFields } from '@/utils/dataSanitization';

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
  return withServiceCall(
    () => base44.entities.CertificacaoUsina.get(id),
    'Falha ao carregar certificação'
  );
}

export async function criarCertificacao(data) {
  return withServiceCall(
    () => base44.entities.CertificacaoUsina.create(sanitizeTextFields(data)),
    'Falha ao criar certificação'
  );
}

export async function atualizarCertificacao(id, data) {
  return withServiceCall(
    () => base44.entities.CertificacaoUsina.update(id, sanitizeTextFields(data)),
    'Falha ao atualizar certificação'
  );
}

export async function deletarCertificacao(id) {
  return withServiceCall(
    () => base44.entities.CertificacaoUsina.delete(id),
    'Falha ao excluir certificação'
  );
}