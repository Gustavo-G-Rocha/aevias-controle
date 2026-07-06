import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Solicitações de Transferência
 * (Obra e Regional)
 */
export async function listarSolicitacoesTransferenciaObra() {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaObra.list(),
    'Falha ao carregar solicitações de transferência'
  );
}

export async function listarSolicitacoesTransferenciaRegional(sort = '-created_date') {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaRegional.list(sort),
    'Falha ao carregar solicitações de transferência'
  );
}

export async function listarSolicitacoesTransferenciaObraPorStatus(status) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaObra.filter({ status }),
    'Falha ao carregar solicitações de transferência'
  );
}

export async function listarSolicitacoesTransferenciaRegionalPorStatus(status) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaRegional.filter({ status }),
    'Falha ao carregar solicitações de transferência'
  );
}

export async function obterSolicitacaoTransferenciaObraById(id) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaObra.get(id),
    'Falha ao carregar solicitação de transferência'
  );
}

export async function obterSolicitacaoTransferenciaRegionalById(id) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaRegional.get(id),
    'Falha ao carregar solicitação de transferência'
  );
}

export async function criarSolicitacaoTransferenciaObra(data) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaObra.create(data),
    'Falha ao criar solicitação de transferência'
  );
}

export async function criarSolicitacaoTransferenciaRegional(data) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaRegional.create(data),
    'Falha ao criar solicitação de transferência'
  );
}

export async function atualizarSolicitacaoTransferenciaObra(id, data) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaObra.update(id, data),
    'Falha ao atualizar solicitação de transferência'
  );
}

export async function atualizarSolicitacaoTransferenciaRegional(id, data) {
  return withServiceCall(
    () => base44.entities.SolicitacaoTransferenciaRegional.update(id, data),
    'Falha ao atualizar solicitação de transferência'
  );
}