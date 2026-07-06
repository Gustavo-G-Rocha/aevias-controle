import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Regionais
 */
export async function listarRegionais() {
  return withServiceCall(
    () => base44.entities.Regional.list(),
    'Falha ao carregar regionais'
  );
}

export async function listarRegionaisAtivas() {
  return withServiceCall(
    () => base44.entities.Regional.filter({ status: 'ativa' }),
    'Falha ao carregar regionais ativas'
  );
}

export async function obterRegionalById(id) {
  return withServiceCall(
    () => base44.entities.Regional.get(id),
    'Falha ao carregar regional'
  );
}

export async function criarRegional(data) {
  return withServiceCall(
    () => base44.entities.Regional.create(data),
    'Falha ao criar regional'
  );
}

export async function atualizarRegional(id, data) {
  return withServiceCall(
    () => base44.entities.Regional.update(id, data),
    'Falha ao atualizar regional'
  );
}

export async function deletarRegional(id) {
  return withServiceCall(
    () => base44.entities.Regional.delete(id),
    'Falha ao excluir regional'
  );
}

export async function obterRegionaisPorGestor(gestorEmail) {
  const regionais = await listarRegionais();
  return regionais.filter(r =>
    r.gestor_contrato_responsavel?.toLowerCase() === gestorEmail?.toLowerCase() ||
    (r.gestores_contrato_responsaveis || []).some(email => email.toLowerCase() === gestorEmail?.toLowerCase()) ||
    (r.salas_tecnicas_responsaveis || []).some(email => email.toLowerCase() === gestorEmail?.toLowerCase())
  );
}