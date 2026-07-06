import { useState } from "react";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { createPageUrl } from "@/utils";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
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
      toast({ title: "Por favor, selecione uma obra para salvar o progresso.", variant: "destructive" });
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
        await atualizarEnsaio('EnsaioMRAF', editingEnsaio.id, dataToSave);
        toast({ title: "Progresso salvo com sucesso!" });
      } else {
        const newEnsaio = await criarEnsaio('EnsaioMRAF', dataToSave);
        setEditingEnsaio(newEnsaio);
        toast({ title: "Progresso salvo com sucesso!" });
      }
      clearSavedData();
    } catch (error) {
      logger.error("Erro ao salvar progresso:", error);
      toast({ title: "Erro ao salvar progresso.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.obra_id) {
      toast({ title: "Por favor, selecione uma obra.", variant: "destructive" });
      return;
    }
    if (!formData.data_ensaio) {
      toast({ title: "Por favor, informe a data do ensaio.", variant: "destructive" });
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
          await atualizarEnsaio('EnsaioMRAF', editingEnsaio.id, updateData);
          toast({ title: "Ensaio finalizado com sucesso! O registro voltará para análise." });
        } else {
          await atualizarEnsaio('EnsaioMRAF', editingEnsaio.id, updateData);
          toast({ title: "Ensaio finalizado com sucesso!" });
        }
      } else {
        await criarEnsaio('EnsaioMRAF', dataToSave);
        toast({ title: "Ensaio criado e finalizado com sucesso!" });
      }
      clearSavedData();
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      logger.error("Erro ao finalizar ensaio:", error);
      toast({ title: "Erro ao finalizar ensaio.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleSaveProgress, handleSubmit };
}