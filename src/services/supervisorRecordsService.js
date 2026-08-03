import { carregarRegistrosSupervisor } from '@/functions/carregarRegistrosSupervisor';

/**
 * Busca registros via backend function para cliente_supervisor,
 * contornando limitações de RLS que impedem o supervisor de ver
 * registros criados por subordinados.
 * Retorna { records, subordinateEmails } — os emails dos subordinados
 * vêm do backend (asServiceRole) porque um cliente_supervisor não
 * consegue listar usuários no frontend (RLS do User), o que fazia o
 * filtro de subordinados falhar e esconder registros pendentes.
 */
export async function carregarRegistrosSupervisorService() {
  const response = await carregarRegistrosSupervisor({});
  return {
    records: response.data?.records ?? [],
    subordinateEmails: response.data?.subordinateEmails ?? [],
    truncated: response.data?.truncated ?? false,
  };
}