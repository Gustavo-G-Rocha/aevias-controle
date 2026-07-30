import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { listarRegistros } from "@/services/recordsService";
import { filterRegionaisByAccessLevel } from "@/utils/regionalFilter";

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

  // Obras visíveis na Gestão de NCs: apenas as obras das regionais em que o
  // usuário está efetivamente vinculado ao seu nível de acesso. Admin vê tudo.
  const obras = useMemo(() => {
    if (!user) return [];
    const accessLevel =
      user.access_level || (user.role === "admin" ? "admin" : "user");
    if (accessLevel === "admin") return obrasRaw;

    const regionaisIds = new Set(
      filterRegionaisByAccessLevel(regionais, user).map((r) => r.id)
    );
    if (regionaisIds.size === 0) return [];
    return obrasRaw.filter((o) => regionaisIds.has(o.regional_id));
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