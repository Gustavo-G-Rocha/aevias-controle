import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { Obra } from "@/entities/Obra";
import { Regional } from "@/entities/Regional";
import { Project } from "@/entities/Project";
import { getInitialFormData } from "@/utils/acompanhamentoUsinagemUtils";

export function useAcompanhamentoUsinagemData() {
  const [loading, setLoading]         = useState(true);
  const [user, setUser]               = useState(null);
  const [obras, setObras]             = useState([]);
  const [regionais, setRegionais]     = useState([]);
  const [projects, setProjects]       = useState([]);
  const [editingId, setEditingId]     = useState(null);
  const [isEditable, setIsEditable]   = useState(true);
  const [formData, setFormData]       = useState(getInitialFormData);

  const loadInitialData = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [obrasData, regionaisData, projectsData] = await Promise.all([
        Obra.list(),
        Regional.list(),
        Project.list(),
      ]);

      setObras(obrasData);
      setRegionais(regionaisData);
      setProjects(projectsData);

      const params = new URLSearchParams(window.location.search);
      const editId = params.get('editId');

      if (editId) {
        const ensaioData = await base44.entities.AcompanhamentoUsinagem.get(editId);
        const canEdit = ensaioData.created_by === userData.email &&
          (ensaioData.status === 'rascunho' || ensaioData.approved === false);

        setIsEditable(canEdit);
        setEditingId(editId);
        setFormData({
          ...ensaioData,
          agregados: ensaioData.agregados || [],
          cargas:    ensaioData.cargas    || [],
        });
      } else {
        setFormData(prev => ({
          ...prev,
          laboratorista_name: userData.laboratorista_name || userData.full_name || '',
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados iniciais");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  return {
    loading, user, obras, regionais, projects,
    editingId, isEditable,
    formData, setFormData,
  };
}