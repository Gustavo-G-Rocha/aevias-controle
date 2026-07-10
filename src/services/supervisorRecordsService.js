import { base44 } from '@/api/base44Client';

/**
 * Busca registros via backend function para cliente_supervisor,
 * contornando limitações de RLS que impedem o supervisor de ver
 * registros criados por subordinados.
 * Retorna array normalizado com entityType, já filtrado por obras/subordinados.
 */
export async function carregarRegistrosSupervisor() {
  const response = await base44.functions.invoke('carregarRegistrosSupervisor', {});
  return response.data?.records ?? [];
}