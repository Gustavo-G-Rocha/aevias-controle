import { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Obra } from "@/entities/Obra";
import { Regional } from "@/entities/Regional";
import { filterObrasByUserAccess } from "@/utils/relatoriosUnificadosUtils";

export const useRelatoriosUnificadosData = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [obrasData, regionaisData] = await Promise.all([
        Obra.list(),
        Regional.list(),
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