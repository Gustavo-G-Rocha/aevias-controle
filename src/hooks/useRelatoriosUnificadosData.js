import { useMemo } from "react";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { filterObrasByUserAccess } from "@/utils/relatoriosUnificadosUtils";

export const useRelatoriosUnificadosData = () => {
  const userQuery = useCurrentUser();
  const auxData = useAuxData({ needsRegionais: true });

  const user = userQuery.data ?? null;
  const obrasRaw = auxData.data?.obras ?? [];
  const regionais = auxData.data?.regionais ?? [];

  const obras = useMemo(() => {
    if (!user) return [];
    const userAccessLevel =
      user.access_level || (user.role === "admin" ? "admin" : "user");
    return filterObrasByUserAccess(obrasRaw, regionais, user, userAccessLevel);
  }, [user, obrasRaw, regionais]);

  const loading = userQuery.isLoading || auxData.isLoading;

  return { loading, user, obras, regionais };
};