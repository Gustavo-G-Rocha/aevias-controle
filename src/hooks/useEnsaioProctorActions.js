/**
 * Hook de submissão do formulário de EnsaioProctor.
 * Responsável por validar, sanitizar, salvar (create/update) e redirecionar.
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { sanitizeFormForSave, getEmptyRequiredFields } from "@/utils/ensaioProctorUtils";

export function useEnsaioProctorActions(form, recordId) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = useCallback(async (status) => {
    const emptyFields = getEmptyRequiredFields(form);
    if (emptyFields.length > 0) {
      alert(`Preencha os campos obrigatórios:\n${emptyFields.map(f => f.label).join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      const data = { ...sanitizeFormForSave(form), status };
      if (recordId) {
        await base44.entities.EnsaioProctor.update(recordId, data);
        alert("Ensaio atualizado com sucesso!");
      } else {
        await base44.entities.EnsaioProctor.create(data);
        alert("Ensaio criado com sucesso!");
        navigate("/MeusEnsaios");
      }
    } catch (err) {
      alert("Erro ao salvar ensaio: " + err.message);
    } finally {
      setSaving(false);
    }
  }, [form, recordId, navigate]);

  return { saving, handleSave };
}