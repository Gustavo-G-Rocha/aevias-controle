import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarGranuMistura, atualizarGranuMistura } from "@/services/granuMisturaService";
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
        await atualizarGranuMistura(editingId, dataToSave);
      } else {
        await criarGranuMistura(dataToSave);
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