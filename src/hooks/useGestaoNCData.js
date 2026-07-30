import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { listarRegistros } from "@/services/recordsService";
import { filterObrasByUserAccess } from "@/utils/relatoriosUnificadosUtils";

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
  const obrasRaw = auxData.data?.obras ?? [];
  const regionais = auxData.data?.regionais ?? [];
  const loading = userQuery.isLoading || auxData.isLoading || ncsQuery.isLoading;

  const obras = useMemo(() => {
    if (!user) return [];
    const userAccessLevel =
      user.access_level || (user.role === "admin" ? "admin" : "user");
    return filterObrasByUserAccess(obrasRaw, regionais, user, userAccessLevel);
  }, [user, obrasRaw, regionais]);

  const ncs = useMemo(() => {
    const all = ncsQuery.data ?? [];
    const obrasIds = new Set(obras.map((o) => o.id));
    return all.filter((nc) => nc.obra_id && obrasIds.has(nc.obra_id));
  }, [ncsQuery.data, obras]);

  // Wrapper compatível com useGestaoNCActions(setNcs) — atualiza o cache do React Query
  const setNcs = useCallback((updater) => {
    queryClient.setQueryData(NCS_QUERY_KEY, (prev) => {
      const current = prev ?? [];
      return typeof updater === "function" ? updater(current) : updater;
    });
  }, [queryClient]);

  return { user, obras, regionais, ncs, setNcs, loading };
};