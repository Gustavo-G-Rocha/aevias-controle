import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { Obra } from "@/entities/Obra";
import { Regional } from "@/entities/Regional";

export const useGestaoNCData = () => {
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [ncs, setNcs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const [obrasData, regionaisData, ncsData] = await Promise.all([
        Obra.list(),
        Regional.list(),
        base44.entities.RelatorioNC.list("-created_date", 200),
      ]);

      setRegionais(regionaisData);
      setObras(obrasData);
      setNcs(ncsData);
    } catch (error) {
      console.error("[GestaoNC] Erro ao carregar dados:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { user, obras, regionais, ncs, setNcs, loading };
};