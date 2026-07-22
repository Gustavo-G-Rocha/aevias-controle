import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { carregarObrasFuncionarioCliente } from '@/functions/carregarObrasFuncionarioCliente';

/**
 * Busca regionais e obras via backend function para funcionarios_cliente
 * (inspetor do cliente), contornando limitações de RLS no frontend.
 * O escopo é aplicado server-side (regionais do próprio email ou do supervisor).
 * @returns {Promise<{ regionais: object[], obras: object[] }>}
 */
export async function carregarObrasFuncionarioClienteService() {
  const response = await carregarObrasFuncionarioCliente({});
  return {
    regionais: response.data?.regionais ?? [],
    obras: response.data?.obras ?? [],
  };
}

/**
 * Service centralizado para operações com Obras
 */
export async function listarObrasRecentes(limit = 500) {
  return withServiceCall(
    () => base44.entities.Obra.list('-created_date', limit),
    'Falha ao carregar obras'
  );
}

export async function listarObrasPorRegional(regionalId) {
  return withServiceCall(
    () => base44.entities.Obra.filter({ regional_id: regionalId }, '-created_date', 500),
    'Falha ao carregar obras da regional'
  );
}

export async function listarObrasAtivas() {
  return withServiceCall(
    () => base44.entities.Obra.filter({ status: 'em_andamento' }, '-created_date', 500),
    'Falha ao carregar obras ativas'
  );
}

export async function obterObraById(id) {
  return withServiceCall(
    () => base44.entities.Obra.get(id),
    'Falha ao carregar obra'
  );
}

export async function criarObra(data) {
  return withServiceCall(
    () => base44.entities.Obra.create(data),
    'Falha ao criar obra'
  );
}

export async function atualizarObra(id, data) {
  return withServiceCall(
    () => base44.entities.Obra.update(id, data),
    'Falha ao atualizar obra'
  );
}

export async function deletarObra(id) {
  return withServiceCall(
    () => base44.entities.Obra.delete(id),
    'Falha ao excluir obra'
  );
}