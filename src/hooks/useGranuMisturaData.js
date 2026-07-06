import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { obterGranuMisturaById } from "@/services/granuMisturaService";
import { listarFaixas } from "@/services/faixasService";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import {
  getInitialForm,
  getInitialPeneiras,
} from "@/utils/granuMisturaUtils";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useGranuMisturaData() {
  const location = useLocation();
  const navigate = useNavigate();

  const [editLoading, setEditLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getInitialForm);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  // FaixaGranulometrica — cache próprio (não está no useAuxData)
  const { data: faixasDisponiveis } = useQuery({
    queryKey: ['faixasGranulometricas'],
    queryFn: () => listarFaixas(),
    staleTime: 10 * 60 * 1000,
  });

  const regionais = auxData?.regionais ?? [];
  const projects = auxData?.projects ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    const userAccessLevel = user.access_level || (user.role === "admin" ? "admin" : "user");
    if (userAccessLevel === "user") {
      const emailLower = user.email.toLowerCase();
      const regionaisIds = regionais
        .filter(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
          (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
        )
        .map(r => r.id);
      const regionaisSet = new Set(regionaisIds);
      return regionaisIds.length > 0
        ? auxData.obras.filter(o => regionaisSet.has(o.regional_id) && o.status === "em_andamento")
        : [];
    }
    return auxData.obras;
  }, [auxData?.obras, regionais, user]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get("editId");

    if (editId) {
      setEditLoading(true);
      obterGranuMisturaById(editId)
        .then(rec => {
          if (user.role === "admin" || (rec.created_by === user.email && (rec.status === "rascunho" || rec.approved === false))) {
            setEditingId(editId);
            setFormData({ ...getInitialForm(), ...rec, peneiras: rec.peneiras || getInitialPeneiras() });
          } else {
            toast({ title: "Sem permissão para editar.", variant: "destructive" });
            navigate(createPageUrl("MeusEnsaios"));
          }
        })
        .catch(err => {
          logger.error(err);
          toast({ title: "Erro ao carregar dados.", variant: "destructive" });
        })
        .finally(() => setEditLoading(false));
    } else {
      setFormData(prev => ({
        ...prev,
        laboratorista_name: user.laboratorista_name || user.full_name || "",
      }));
    }
  }, [location.search, loadingUser, loadingAux, user?.id, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  return {
    loading, user, obras, regionais, projects, faixasDisponiveis: faixasDisponiveis ?? [],
    editingId, formData, setFormData,
  };
}