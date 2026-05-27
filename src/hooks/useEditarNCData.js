import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { Obra } from "@/entities/Obra";
import { Regional } from "@/entities/Regional";
import { createPageUrl } from "@/utils";
import { extractNCIdFromUrl, initializeNCForm } from "@/utils/editarNCUtils";

export const useEditarNCData = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [nc, setNc] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const ncId = extractNCIdFromUrl();

      if (!ncId) {
        alert("ID da NC não encontrado");
        navigate(createPageUrl("GestaoNC"));
        return;
      }

      const userData = await User.me();
      setUser(userData);

      const [obrasData, regionaisData, ncData] = await Promise.all([
        Obra.list(),
        Regional.list(),
        base44.entities.RelatorioNC.filter({ id: ncId }),
      ]);

      if (!ncData || ncData.length === 0) {
        alert("NC não encontrada");
        navigate(createPageUrl("GestaoNC"));
        return;
      }

      const ncItem = ncData[0];
      setNc(ncItem);
      setRegionais(regionaisData);
      setObras(obrasData);
    } catch (error) {
      console.error("[EditarNC] Erro ao carregar dados:", error?.message || error);
      alert("Erro ao carregar a NC. Tente novamente.");
      navigate(createPageUrl("GestaoNC"));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { user, obras, regionais, nc, loading, loadData };
};