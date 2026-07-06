import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Faixas Granulométricas
 */
export async function listarFaixas() {
  return withServiceCall(
    () => base44.entities.FaixaGranulometrica.list(),
    'Falha ao carregar faixas granulométricas'
  );
}

export async function listarFaixasPorTipo(tipo) {
  return withServiceCall(
    () => base44.entities.FaixaGranulometrica.filter({ tipo }),
    'Falha ao carregar faixas granulométricas'
  );
}

export async function listarFaixasAtivas() {
  return withServiceCall(
    () => base44.entities.FaixaGranulometrica.filter({ status: 'ativo' }),
    'Falha ao carregar faixas granulométricas ativas'
  );
}

export async function obterFaixaById(id) {
  return withServiceCall(
    () => base44.entities.FaixaGranulometrica.get(id),
    'Falha ao carregar faixa granulométrica'
  );
}

export async function criarFaixa(data) {
  return withServiceCall(
    () => base44.entities.FaixaGranulometrica.create(data),
    'Falha ao criar faixa granulométrica'
  );
}

export async function atualizarFaixa(id, data) {
  return withServiceCall(
    () => base44.entities.FaixaGranulometrica.update(id, data),
    'Falha ao atualizar faixa granulométrica'
  );
}

export async function deletarFaixa(id) {
  return withServiceCall(
    () => base44.entities.FaixaGranulometrica.delete(id),
    'Falha ao excluir faixa granulométrica'
  );
}