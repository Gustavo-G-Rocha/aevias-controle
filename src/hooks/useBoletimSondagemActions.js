/**
 * Hook de ações de persistência do Boletim de Sondagem (save).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";

export function useBoletimSondagemActions({ formData, user, editingBoletim }) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.obra_id || !formData.data) {
      alert("Preencha todos os campos obrigatórios (Obra, Data).");
      return;
    }
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        laboratorista_name: user?.laboratorista_name || user?.full_name,
      };
      if (editingBoletim) {
        const updateData = { ...dataToSave };
        if (editingBoletim.approved === false) {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
        }
        await atualizarEnsaio('BoletimSondagem', editingBoletim.id, updateData);
        alert("Boletim atualizado com sucesso!");
      } else {
        await criarEnsaio('BoletimSondagem', dataToSave);
        alert("Boletim criado com sucesso!");
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("Erro ao salvar boletim:", error);
      alert("Erro ao salvar boletim: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleSubmit };
}