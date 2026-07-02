import { useState, useEffect, useMemo, useCallback } from "react";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";

export function useNovaNCData() {
  const [loading, setLoading] = useState(true);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const regionais = auxData?.regionais ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    const userAccessLevel = user?.access_level || (user?.role === "admin" ? "admin" : "user");
    if (userAccessLevel === "gestor_contrato") {
      const regionaisDoGestor = regionais.filter(r =>
        r.gestor_contrato_responsavel?.toLowerCase() === user.email.toLowerCase() ||
        (r.gestores_contrato_responsaveis || []).some(e => e.toLowerCase() === user.email.toLowerCase())
      );
      const ids = new Set(regionaisDoGestor.flatMap(r => auxData.obras.filter(o => o.regional_id === r.id).map(o => o.id)));
      return auxData.obras.filter(o => ids.has(o.id));
    }
    return auxData.obras;
  }, [auxData?.obras, regionais, user]);

  useEffect(() => {
    if (!loadingUser && !loadingAux) setLoading(false);
  }, [loadingUser, loadingAux]);

  return { user, obras, regionais, loading };
}