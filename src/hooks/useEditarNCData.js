import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { filtrarRegistros } from "@/services/recordsService";
import { createPageUrl } from "@/utils";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { extractNCIdFromUrl, initializeNCForm } from "@/utils/editarNCUtils";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
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
      toast({ title: "ID da NC não encontrado", variant: "destructive" });
      navigate(createPageUrl("GestaoNC"));
      return;
    }

    setNcLoading(true);
    filtrarRegistros('RelatorioNC', { id: ncId })
      .then(ncData => {
        if (!ncData || ncData.length === 0) {
          toast({ title: "NC não encontrada", variant: "destructive" });
          navigate(createPageUrl("GestaoNC"));
          return;
        }
        setNc(ncData[0]);
      })
      .catch(error => {
        logger.error("[EditarNC] Erro ao carregar dados:", error?.message || error);
        toast({ title: "Erro ao carregar a NC. Tente novamente.", variant: "destructive" });
        navigate(createPageUrl("GestaoNC"));
      })
      .finally(() => setNcLoading(false));
  }, [loadingUser, loadingAux, user?.id, navigate]);

  // Preservado para compatibilidade de interface — React Query cuida do carregamento
  const loadData = useCallback(() => {}, []);

  const loading = loadingUser || loadingAux || ncLoading;

  return { user, obras, regionais, nc, loading, loadData };
};