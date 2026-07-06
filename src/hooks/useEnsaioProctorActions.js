/**
 * Hook de submissão do formulário de EnsaioProctor.
 * Responsável por validar, sanitizar, salvar (create/update) e redirecionar.
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { sanitizeFormForSave, getEmptyRequiredFields } from "@/utils/ensaioProctorUtils";

import { toast } from "@/components/ui/use-toast";
export function useEnsaioProctorActions(form, recordId) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = useCallback(async (status) => {
    const emptyFields = getEmptyRequiredFields(form);
    if (emptyFields.length > 0) {
      toast({ title: `Preencha os campos obrigatórios:\n${emptyFields.map(f => f.label).join(', ')}`, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const data = { ...sanitizeFormForSave(form), status };
      if (recordId) {
        await atualizarEnsaio('EnsaioProctor', recordId, data);
        toast({ title: "Ensaio atualizado com sucesso!" });
      } else {
        await criarEnsaio('EnsaioProctor', data);
        toast({ title: "Ensaio criado com sucesso!" });
        navigate("/MeusEnsaios");
      }
    } catch (err) {
      toast({ title: "Erro ao salvar ensaio: " + err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [form, recordId, navigate]);

  return { saving, handleSave };
}