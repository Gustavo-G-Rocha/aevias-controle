import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { listarRegistros } from "@/services/recordsService";

const NCS_QUERY_KEY = ["relatorioNC", "gestao"];

export const useGestaoNCData = () => {
  const queryClient = useQueryClient();
  const userQuery = useCurrentUser();
  const auxData = useAuxData({ needsRegionais: true });

  const ncsQuery = useQuery({
    queryKey: NCS_QUERY_KEY,
    queryFn: () => listarRegistros("RelatorioNC", "-created_date", 200),
    staleTime: 5 * 60 * 1000,
  });

  const user = userQuery.data ?? null;
  const obras = auxData.data?.obras ?? [];
  const regionais = auxData.data?.regionais ?? [];
  const ncs = ncsQuery.data ?? [];
  const loading = userQuery.isLoading || auxData.isLoading || ncsQuery.isLoading;

  // Wrapper compatível com useGestaoNCActions(setNcs) — atualiza o cache do React Query
  const setNcs = useCallback((updater) => {
    queryClient.setQueryData(NCS_QUERY_KEY, (prev) => {
      const current = prev ?? [];
      return typeof updater === "function" ? updater(current) : updater;
    });
  }, [queryClient]);

  return { user, obras, regionais, ncs, setNcs, loading };
};