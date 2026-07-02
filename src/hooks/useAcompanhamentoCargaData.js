import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import {
  getInitialFormData,
  filtrarObras,
  filtrarProjetosDisponiveis,
} from "@/utils/acompanhamentoCargaUtils";

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

  const regionais = auxData?.regionais ?? [];
  const projects = auxData?.projects ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras) return [];
    return filtrarObras(auxData.obras);
  }, [auxData?.obras]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editIdParam = urlParams.get('editId');

    if (editIdParam) {
      setEditLoading(true);
      base44.entities.AcompanhamentoCarga.get(editIdParam)
        .then(ensaioData => {
          setFormData(ensaioData);
          setEditMode(true);
          setEditId(editIdParam);
          const projFiltered = filtrarProjetosDisponiveis(
            ensaioData.obra_id, obras, regionais, projects
          );
          setAvailableProjects(projFiltered);
        })
        .catch(error => {
          console.error("Erro ao carregar dados:", error);
          alert("Erro ao carregar dados iniciais.");
        })
        .finally(() => setEditLoading(false));
    } else {
      setFormData({
        ...getInitialFormData(),
        laboratorista_name: user.laboratorista_name || user.full_name || "",
      });
    }
  }, [loadingUser, loadingAux, user?.id, obras, regionais, projects]);

  const loading = loadingUser || loadingAux || editLoading;

  return {
    formData, setFormData,
    user, obras, regionais, projects, availableProjects, setAvailableProjects,
    loading, editMode, editId, clearSavedData,
  };
}