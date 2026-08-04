import { useState, useEffect, useMemo, useCallback } from "react";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getInitialFormData } from "@/utils/acompanhamentoUsinagemUtils";
import { filtrarObrasPorAcessoRegional } from "@/utils/regionalFilter";
import { ACCESS_LEVELS, USER_LIKE_LEVELS, getUserAccessLevel } from "@/lib/layoutConstants";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useAcompanhamentoUsinagemData() {
  const [editingId, setEditingId] = useState(null);
  const [isEditable, setIsEditable] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData);
  const [editLoading, setEditLoading] = useState(false);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const obras = useMemo(() => {
    if (!auxData?.obras || !auxData?.regionais || !user) return [];
    const userAccessLevel = getUserAccessLevel(user);
    const isLaboratorista = USER_LIKE_LEVELS.includes(userAccessLevel);
    const isFuncionarioCliente = userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE;
    const porAcesso = filtrarObrasPorAcessoRegional(auxData.obras, auxData.regionais, user);
    if (isLaboratorista) {
      // funcionarios_cliente vê obras de qualquer status; user (laboratorista) apenas em_andamento
      return isFuncionarioCliente ? porAcesso : porAcesso.filter(o => o.status === 'em_andamento');
    }
    return porAcesso;
  }, [auxData?.obras, auxData?.regionais, user]);
  const regionais = useMemo(() => auxData?.regionais ?? [], [auxData?.regionais]);
  const projects = useMemo(() => auxData?.projects ?? [], [auxData?.projects]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');

    if (editId) {
      setEditLoading(true);
      obterEnsaioById('AcompanhamentoUsinagem', editId)
        .then(ensaioData => {
          const canEdit = ensaioData.created_by === user.email &&
            (ensaioData.status === 'rascunho' || ensaioData.approved === false);
          setIsEditable(canEdit);
          setEditingId(editId);
          setFormData({
            ...ensaioData,
            agregados: ensaioData.agregados || [],
            cargas: ensaioData.cargas || [],
          });
        })
        .catch(error => {
          logger.error("Erro ao carregar dados:", error);
          toast({ title: "Erro ao carregar dados iniciais", variant: "destructive" });
        })
        .finally(() => setEditLoading(false));
    } else {
      setFormData(prev => ({
        ...prev,
        laboratorista_name: user.laboratorista_name || user.full_name || '',
      }));
    }
  }, [loadingUser, loadingAux, user?.id]);

  const loading = loadingUser || loadingAux || editLoading;

  return {
    loading, user, obras, regionais, projects,
    editingId, isEditable,
    formData, setFormData,
  };
}