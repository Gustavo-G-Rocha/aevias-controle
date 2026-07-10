import { carregarRegistrosSupervisor } from '@/functions/carregarRegistrosSupervisor';

/**
 * Busca registros via backend function para cliente_supervisor,
 * contornando limitações de RLS que impedem o supervisor de ver
 * registros criados por subordinados.
 * Retorna array normalizado com entityType, já filtrado por obras/subordinados.
 */
export async function carregarRegistrosSupervisorService() {
  const response = await carregarRegistrosSupervisor({});
  return response.data?.records ?? [];
}