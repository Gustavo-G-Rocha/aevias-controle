import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { createPageUrl } from "@/utils";
import {
  filtrarProjetosDisponiveis,
  addCarga,
  removeCarga,
  updateCarga,
  validateFormData,
  buildDataToSave,
  MAX_CARGAS,
} from "@/utils/acompanhamentoCargaUtils";

export function useAcompanhamentoCargaActions({
  formData, setFormData,
  obras, regionais, projects, setAvailableProjects,
  editMode, editId, clearSavedData,
}) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleObraChange = (obraId) => {
    const projFiltered = filtrarProjetosDisponiveis(obraId, obras, regionais, projects);
    setAvailableProjects(projFiltered);
    setFormData(prev => ({
      ...prev,
      obra_id: obraId,
      project_id: "",
      rodovia: "",
      usina_fornecedora: "",
    }));
  };

  const handleProjectChange = (projectId) => {
    setFormData(prev => ({ ...prev, project_id: projectId }));
  };

  const handleAddCarga = () => {
    const novas = addCarga(formData.cargas);
    if (novas === null) {
      alert(`Limite máximo de ${MAX_CARGAS} cargas atingido.`);
      return;
    }
    setFormData(prev => ({ ...prev, cargas: novas }));
  };

  const handleRemoveCarga = (index) => {
    setFormData(prev => ({ ...prev, cargas: removeCarga(prev.cargas, index) }));
  };

  const handleCargaChange = (index, field, value) => {
    setFormData(prev => ({ ...prev, cargas: updateCarga(prev.cargas, index, field, value) }));
  };

  const handleSubmit = async (finalizar = false) => {
    const error = validateFormData(formData, finalizar);
    if (error) { alert(error); return; }

    setSaving(true);
    try {
      const dataToSave = buildDataToSave(formData, finalizar);

      if (editMode) {
        await atualizarEnsaio('AcompanhamentoCarga', editId, dataToSave);
      } else {
        await criarEnsaio('AcompanhamentoCarga', dataToSave);
      }

      clearSavedData();
      alert(finalizar ? "Acompanhamento finalizado com sucesso!" : "Progresso salvo!");
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar acompanhamento.");
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleObraChange,
    handleProjectChange,
    handleAddCarga,
    handleRemoveCarga,
    handleCargaChange,
    handleSubmit,
  };
}