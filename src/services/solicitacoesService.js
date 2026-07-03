import { base44 } from '@/api/base44Client';

/**
 * Service centralizado para operações com Solicitações de Transferência
 * (Obra e Regional)
 */
export async function listarSolicitacoesTransferenciaObra() {
  return base44.entities.SolicitacaoTransferenciaObra.list();
}

export async function listarSolicitacoesTransferenciaRegional() {
  return base44.entities.SolicitacaoTransferenciaRegional.list();
}

export async function listarSolicitacoesTransferenciaObraPorStatus(status) {
  return base44.entities.SolicitacaoTransferenciaObra.filter({ status });
}

export async function listarSolicitacoesTransferenciaRegionalPorStatus(status) {
  return base44.entities.SolicitacaoTransferenciaRegional.filter({ status });
}

export async function obterSolicitacaoTransferenciaObraById(id) {
  return base44.entities.SolicitacaoTransferenciaObra.read(id);
}

export async function obterSolicitacaoTransferenciaRegionalById(id) {
  return base44.entities.SolicitacaoTransferenciaRegional.read(id);
}

export async function atualizarSolicitacaoTransferenciaObra(id, data) {
  return base44.entities.SolicitacaoTransferenciaObra.update(id, data);
}

export async function atualizarSolicitacaoTransferenciaRegional(id, data) {
  return base44.entities.SolicitacaoTransferenciaRegional.update(id, data);
}