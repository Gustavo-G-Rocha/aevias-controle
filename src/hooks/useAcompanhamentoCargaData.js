import { useState, useEffect, useMemo, useRef } from "react";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import {
  getInitialFormData,
  filtrarProjetosDisponiveis,
} from "@/utils/acompanhamentoCargaUtils";
import { filtrarObrasPorAcessoRegional } from "@/utils/regionalFilter";
import { ACCESS_LEVELS, USER_LIKE_LEVELS, getUserAccessLevel } from "@/lib/layoutConstants";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useAcompanhamentoCargaData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [availableProjects, setAvailableProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const { clearSavedData } = useFormPersistence(
    'acompanhamento_carga_form', formData, setFormData, editMode
  );

  const obras = useMemo(() => {
    if (!auxData?.obras || !auxData?.regionais || !user) return [];
    const userAccessLevel = getUserAccessLevel(user);
    const isLaboratorista = USER_LIKE_LEVELS.includes(userAccessLevel);
    const isFuncionarioCliente = userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE;
    const porAcesso = filtrarObrasPorAcessoRegional(auxData.obras, auxData.regionais, user);
    // Mantém filtro de tipo (conservacao/implantacao) + status para laboratorista
    const tiposOk = (o) => o.tipo_obra === 'conservacao' || o.tipo_obra === 'implantacao';
    if (isLaboratorista) {
      const statusOk = isFuncionarioCliente ? () => true : (o) => o.status === 'em_andamento';
      return porAcesso.filter(o => tiposOk(o) && statusOk(o));
    }
    return porAcesso.filter(tiposOk);
  }, [auxData?.obras, auxData?.regionais, user]);

  const regionais = useMemo(() => auxData?.regionais ?? [], [auxData?.regionais]);
  const projects = useMemo(() => auxData?.projects ?? [], [auxData?.projects]);

  // Refs para acessar valores atualizados dentro do .then() sem re-disparar o effect
  const auxRef = useRef({ obras, regionais, projects });
  auxRef.current = { obras, regionais, projects };

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editIdParam = urlParams.get('editId');

    if (editIdParam) {
      setEditLoading(true);
      obterEnsaioById('AcompanhamentoCarga', editIdParam)
        .then(ensaioData => {
          setFormData(ensaioData);
          setEditMode(true);
          setEditId(editIdParam);
          const { obras: curObras, regionais: curReg, projects: curProj } = auxRef.current;
          const projFiltered = filtrarProjetosDisponiveis(
            ensaioData.obra_id, curObras, curReg, curProj
          );
          setAvailableProjects(projFiltered);
        })
        .catch(error => {
          logger.error("Erro ao carregar dados:", error);
          toast({ title: "Erro ao carregar dados iniciais.", variant: "destructive" });
        })
        .finally(() => setEditLoading(false));
    } else {
      setFormData({
        ...getInitialFormData(),
        laboratorista_name: user.laboratorista_name || user.full_name || "",
      });
    }
  }, [loadingUser, loadingAux, user?.id]);

  const loading = loadingUser || loadingAux || editLoading;

  return {
    formData, setFormData,
    user, obras, regionais, projects, availableProjects, setAvailableProjects,
    loading, editMode, editId, clearSavedData,
  };
}