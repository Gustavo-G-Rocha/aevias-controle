import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual } from "@/services/usuariosService";
import { listarRegionais } from "@/services/regionaisService";
import { listarRegistros } from "@/services/recordsService";
import { logger } from '@/utils/logger';

export const useGestaoNCData = () => {
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [ncs, setNcs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await obterUsuarioAtual();
      setUser(userData);

      const [obrasData, regionaisData, ncsData] = await Promise.all([
        listarRegistros('Obra'),
        listarRegionais(),
        listarRegistros('RelatorioNC', '-created_date', 200),
      ]);

      setRegionais(regionaisData);
      setObras(obrasData);
      setNcs(ncsData);
    } catch (error) {
      logger.error("[GestaoNC] Erro ao carregar dados:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { user, obras, regionais, ncs, setNcs, loading };
};