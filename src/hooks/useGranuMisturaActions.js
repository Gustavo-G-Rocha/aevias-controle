import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarGranuMistura, atualizarGranuMistura } from "@/services/granuMisturaService";
import { createPageUrl } from "@/utils";
import { buildDataToSave } from "@/utils/granuMisturaUtils";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useGranuMisturaActions({ formData, editingId, user }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e, saveStatus = "finalizado") => {
    e?.preventDefault();
    if (saveStatus === "finalizado" && !formData.obra_id) {
      toast({ title: "Selecione uma obra.", variant: "destructive" });
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
      toast({ title: saveStatus === "rascunho" ? "Progresso salvo!" : "Ensaio finalizado com sucesso!" });
      navigate(createPageUrl("MeusEnsaios"));
    } catch (err) {
      logger.error(err);
      toast({ title: "Erro ao salvar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleSubmit };
}