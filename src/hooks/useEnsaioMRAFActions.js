import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

/**
 * Gerencia as ações de salvar/finalizar do EnsaioMRAF.
 */
export function useEnsaioMRAFActions({
  formData, user,
  editingEnsaio, setEditingEnsaio,
  clearSavedData, navigate,
}) {
  const [saving, setSaving] = useState(false);

  const handleSaveProgress = async () => {
    if (!formData.obra_id) {
      alert("Por favor, selecione uma obra para salvar o progresso.");
      return;
    }
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: "rascunho",
        laboratorista_name: user?.laboratorista_name || user?.full_name,
      };
      if (editingEnsaio?.id) {
        await base44.entities.EnsaioMRAF.update(editingEnsaio.id, dataToSave);
        alert("Progresso salvo com sucesso!");
      } else {
        const newEnsaio = await base44.entities.EnsaioMRAF.create(dataToSave);
        setEditingEnsaio(newEnsaio);
        alert("Progresso salvo com sucesso!");
      }
      clearSavedData();
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      alert("Erro ao salvar progresso.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.obra_id) {
      alert("Por favor, selecione uma obra.");
      return;
    }
    if (!formData.data_ensaio) {
      alert("Por favor, informe a data do ensaio.");
      return;
    }
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: "finalizado",
        laboratorista_name: user?.laboratorista_name || user?.full_name,
      };
      if (editingEnsaio?.id) {
        const updateData = { ...dataToSave };
        if (editingEnsaio.approved === false) {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          await base44.entities.EnsaioMRAF.update(editingEnsaio.id, updateData);
          alert("Ensaio finalizado com sucesso! O registro voltará para análise.");
        } else {
          await base44.entities.EnsaioMRAF.update(editingEnsaio.id, updateData);
          alert("Ensaio finalizado com sucesso!");
        }
      } else {
        await base44.entities.EnsaioMRAF.create(dataToSave);
        alert("Ensaio criado e finalizado com sucesso!");
      }
      clearSavedData();
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("Erro ao finalizar ensaio:", error);
      alert("Erro ao finalizar ensaio.");
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleSaveProgress, handleSubmit };
}