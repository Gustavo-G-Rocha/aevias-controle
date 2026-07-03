import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual } from "@/services/usuariosService";
import { listarRegistros } from "@/services/recordsService";
import { listarRegionais } from "@/services/regionaisService";
import { filterObrasByUserAccess } from "@/utils/relatoriosUnificadosUtils";

export const useRelatoriosUnificadosData = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await obterUsuarioAtual();
      setUser(currentUser);

      const [obrasData, regionaisData] = await Promise.all([
        listarRegistros('Obra'),
        listarRegionais(),
      ]);

      setRegionais(regionaisData);

      const userAccessLevel =
        currentUser.access_level ||
        (currentUser.role === "admin" ? "admin" : "user");
      const availableObras = filterObrasByUserAccess(
        obrasData,
        regionaisData,
        currentUser,
        userAccessLevel
      );

      setObras(availableObras);
    } catch (err) {
      console.error(
        "[RelatoriosUnificados] Erro ao carregar dados iniciais:",
        err?.message || err
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return { loading, user, obras, regionais };
};