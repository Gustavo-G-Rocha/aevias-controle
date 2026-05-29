import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useNovaNCData() {
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const [obrasData, regionaisData] = await Promise.all([base44.entities.Obra.list(), base44.entities.Regional.list()]);
      setRegionais(regionaisData);

      const userAccessLevel = userData?.access_level || (userData?.role === "admin" ? "admin" : "user");

      let availableObras = obrasData;
      if (userAccessLevel === "gestor_contrato") {
        const regionaisDoGestor = regionaisData.filter(r =>
          r.gestor_contrato_responsavel?.toLowerCase() === userData.email.toLowerCase() ||
          (r.gestores_contrato_responsaveis || []).some(e => e.toLowerCase() === userData.email.toLowerCase())
        );
        const ids = new Set(regionaisDoGestor.flatMap(r => obrasData.filter(o => o.regional_id === r.id).map(o => o.id)));
        availableObras = obrasData.filter(o => ids.has(o.id));
      }

      setObras(availableObras);
    } catch (error) {
      console.error("[NovaNC] Erro ao carregar dados iniciais:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return { user, obras, regionais, loading };
}