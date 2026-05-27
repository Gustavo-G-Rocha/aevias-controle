import { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Obra } from "@/entities/Obra";
import { Regional } from "@/entities/Regional";
import { Project } from "@/entities/Project";
import { base44 } from "@/api/base44Client";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import {
  getInitialFormData,
  filtrarObras,
  filtrarProjetosDisponiveis,
} from "@/utils/acompanhamentoCargaUtils";

export function useAcompanhamentoCargaData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [projects, setProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const { clearSavedData } = useFormPersistence(
    'acompanhamento_carga_form', formData, setFormData, editMode
  );

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const editIdParam = urlParams.get('editId');

        const [userData, obrasData, regionaisData, projectsData] = await Promise.all([
          User.me(),
          Obra.list(),
          Regional.list(),
          Project.list(),
        ]);

        setUser(userData);
        setObras(filtrarObras(obrasData));
        setRegionais(regionaisData);
        setProjects(projectsData);

        if (editIdParam) {
          const ensaioData = await base44.entities.AcompanhamentoCarga.get(editIdParam);
          setFormData(ensaioData);
          setEditMode(true);
          setEditId(editIdParam);

          const projFiltered = filtrarProjetosDisponiveis(
            ensaioData.obra_id, obrasData, regionaisData, projectsData
          );
          setAvailableProjects(projFiltered);
        } else {
          setFormData({
            ...getInitialFormData(),
            laboratorista_name: userData.laboratorista_name || userData.full_name || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados iniciais.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return {
    formData, setFormData,
    user, obras, regionais, projects, availableProjects, setAvailableProjects,
    loading, editMode, editId, clearSavedData,
  };
}