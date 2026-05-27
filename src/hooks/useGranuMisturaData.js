import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  getInitialForm,
  getInitialPeneiras,
} from "@/utils/granuMisturaUtils";

export function useGranuMisturaData() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading]                   = useState(true);
  const [user, setUser]                         = useState(null);
  const [obras, setObras]                       = useState([]);
  const [regionais, setRegionais]               = useState([]);
  const [projects, setProjects]                 = useState([]);
  const [faixasDisponiveis, setFaixasDisponiveis] = useState([]);
  const [editingId, setEditingId]               = useState(null);
  const [formData, setFormData]                 = useState(getInitialForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [obrasData, regionaisData, projectsData, faixasData] = await Promise.all([
        base44.entities.Obra.list(),
        base44.entities.Regional.list(),
        base44.entities.Project.list(),
        base44.entities.FaixaGranulometrica.list(),
      ]);

      const userAccessLevel = currentUser.access_level || (currentUser.role === "admin" ? "admin" : "user");
      let availableObras = obrasData;
      if (userAccessLevel === "user") {
        const reg = regionaisData.find(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === currentUser.email.toLowerCase())
        );
        availableObras = reg
          ? obrasData.filter(o => o.regional_id === reg.id && o.status === "em_andamento")
          : [];
      }

      setObras(availableObras);
      setRegionais(regionaisData);
      setProjects(projectsData);
      setFaixasDisponiveis(faixasData);

      const params = new URLSearchParams(location.search);
      const editId = params.get("editId");

      if (editId) {
        const rec = await base44.entities.GranuMistura.get(editId);
        if (currentUser.role === "admin" || (rec.created_by === currentUser.email && (rec.status === "rascunho" || rec.approved === false))) {
          setEditingId(editId);
          setFormData({ ...getInitialForm(), ...rec, peneiras: rec.peneiras || getInitialPeneiras() });
        } else {
          alert("Sem permissão para editar.");
          navigate(createPageUrl("MeusEnsaios"));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          laboratorista_name: currentUser.laboratorista_name || currentUser.full_name || "",
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [location.search, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  return {
    loading, user, obras, regionais, projects, faixasDisponiveis,
    editingId, formData, setFormData,
  };
}