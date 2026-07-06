/**
 * Hook de submissão do formulário de BoletimSondagemTrado.
 * Responsável por validar, salvar (create/update) e redirecionar.
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useBoletimSondagemTradoActions(formData, user, editingBoletim) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.obra_id || !formData.data) {
      toast({ title: "Preencha todos os campos obrigatórios (Obra, Data).", variant: "destructive" });
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
        await atualizarEnsaio('BoletimSondagemTrado', editingBoletim.id, updateData);
        toast({ title: "Boletim atualizado com sucesso!" });
      } else {
        await criarEnsaio('BoletimSondagemTrado', dataToSave);
        toast({ title: "Boletim criado com sucesso!" });
      }
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      logger.error("Erro ao salvar boletim:", error);
      toast({ title: "Erro ao salvar boletim: " + error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [formData, user, editingBoletim, navigate]);

  return { saving, handleSubmit };
}