import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { extractNCIdFromUrl, initializeNCForm } from "@/utils/editarNCUtils";

export const useEditarNCData = () => {
  const navigate = useNavigate();
  const [nc, setNc] = useState(null);
  const [ncLoading, setNcLoading] = useState(true);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const obras = auxData?.obras ?? [];
  const regionais = auxData?.regionais ?? [];

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const ncId = extractNCIdFromUrl();
    if (!ncId) {
      alert("ID da NC não encontrado");
      navigate(createPageUrl("GestaoNC"));
      return;
    }

    setNcLoading(true);
    base44.entities.RelatorioNC.filter({ id: ncId })
      .then(ncData => {
        if (!ncData || ncData.length === 0) {
          alert("NC não encontrada");
          navigate(createPageUrl("GestaoNC"));
          return;
        }
        setNc(ncData[0]);
      })
      .catch(error => {
        console.error("[EditarNC] Erro ao carregar dados:", error?.message || error);
        alert("Erro ao carregar a NC. Tente novamente.");
        navigate(createPageUrl("GestaoNC"));
      })
      .finally(() => setNcLoading(false));
  }, [loadingUser, loadingAux, user?.id, navigate]);

  // Preservado para compatibilidade de interface — React Query cuida do carregamento
  const loadData = useCallback(() => {}, []);

  const loading = loadingUser || loadingAux || ncLoading;

  return { user, obras, regionais, nc, loading, loadData };
};