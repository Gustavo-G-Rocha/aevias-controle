import { base44 } from '@/api/base44Client';

export async function listarCertificacoes(limit = 200) {
  return base44.entities.CertificacaoUsina.list('-created_date', limit);
}

export async function listarCertificacoesPorObra(obraId) {
  return base44.entities.CertificacaoUsina.filter({ obra_id: obraId }, '-created_date', 200);
}

export async function obterCertificacaoById(id) {
  return base44.entities.CertificacaoUsina.get(id);
}

export async function criarCertificacao(data) {
  return base44.entities.CertificacaoUsina.create(data);
}

export async function atualizarCertificacao(id, data) {
  return base44.entities.CertificacaoUsina.update(id, data);
}

export async function deletarCertificacao(id) {
  return base44.entities.CertificacaoUsina.delete(id);
}