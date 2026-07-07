import { useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useAuxData } from '@/hooks/useQueryData';
import { listarRegistros } from '@/services/recordsService';
import { filterSolicitacoesByUserAccess } from '@/utils/solicitacoesTransferenciaUtils';

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

const SOLICITACOES_KEY = ['solicitacoesTransferencia'];

export function useSolicitacoesTransferenciaData() {
  const queryClient = useQueryClient();
  const userQuery = useCurrentUser();
  const auxData = useAuxData({ needsRegionais: true });

  const solicitacoesQuery = useQuery({
    queryKey: SOLICITACOES_KEY,
    queryFn: () => listarRegistros('SolicitacaoTransferenciaRegional', '-created_date'),
    staleTime: 5 * 60 * 1000,
  });

  // Preserva o toast de erro do hook original
  useEffect(() => {
    if (solicitacoesQuery.isError) {
      logger.error("[SolicitacoesTransferencia] Erro ao carregar dados:", solicitacoesQuery.error?.message || solicitacoesQuery.error);
      toast({ title: "Erro ao carregar solicitações.", variant: "destructive" });
    }
  }, [solicitacoesQuery.isError, solicitacoesQuery.error]);

  const user = userQuery.data ?? null;
  const regionais = auxData.data?.regionais ?? [];
  const solicitacoesRaw = solicitacoesQuery.data ?? [];

  const solicitacoes = useMemo(() => {
    if (!user) return [];
    return filterSolicitacoesByUserAccess(solicitacoesRaw, user, regionais);
  }, [solicitacoesRaw, user, regionais]);

  const loading = userQuery.isLoading || auxData.isLoading || solicitacoesQuery.isLoading;

  // Wrapper compatível com useSolicitacoesTransferenciaActions(loadData)
  const loadData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SOLICITACOES_KEY });
  }, [queryClient]);

  return { solicitacoes, regionais, user, loading, loadData };
}