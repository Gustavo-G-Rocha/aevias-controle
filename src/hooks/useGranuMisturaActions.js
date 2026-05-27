import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { buildDataToSave } from "@/utils/granuMisturaUtils";

export function useGranuMisturaActions({ formData, editingId, user }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e, saveStatus = "finalizado") => {
    e?.preventDefault();
    if (saveStatus === "finalizado" && !formData.obra_id) {
      alert("Selecione uma obra.");
      return;
    }
    setSaving(true);
    try {
      const dataToSave = buildDataToSave(formData, saveStatus, editingId, user);
      if (editingId) {
        await base44.entities.GranuMistura.update(editingId, dataToSave);
      } else {
        await base44.entities.GranuMistura.create(dataToSave);
      }
      alert(saveStatus === "rascunho" ? "Progresso salvo!" : "Ensaio finalizado com sucesso!");
      navigate(createPageUrl("MeusEnsaios"));
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleSubmit };
}