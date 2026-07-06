import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { createPageUrl } from "@/utils";
import {
  AGREGADO_VAZIO,
  CARGA_VAZIA,
  buildDataToSave,
} from "@/utils/acompanhamentoUsinagemUtils";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

export function useAcompanhamentoUsinagemActions({ formData, setFormData, editingId }) {
  const navigate  = useNavigate();
  const [saving, setSaving] = useState(false);

  // ── Agregados ─────────────────────────────────────────────────────────────

  const handleAgregadoChange = (index, field, value) => {
    const newAgregados = [...formData.agregados];
    newAgregados[index] = { ...newAgregados[index], [field]: value };
    setFormData(prev => ({ ...prev, agregados: newAgregados }));
  };

  const adicionarAgregado = () => {
    setFormData(prev => ({
      ...prev,
      agregados: [...prev.agregados, AGREGADO_VAZIO(prev.agregados.length)],
    }));
  };

  const removerAgregado = (index) => {
    setFormData(prev => ({ ...prev, agregados: prev.agregados.filter((_, i) => i !== index) }));
  };

  // ── Cargas ────────────────────────────────────────────────────────────────

  const handleCargaChange = (index, field, value) => {
    const newCargas = [...formData.cargas];
    newCargas[index] = { ...newCargas[index], [field]: value };
    setFormData(prev => ({ ...prev, cargas: newCargas }));
  };

  const adicionarCarga = () => {
    setFormData(prev => ({ ...prev, cargas: [...prev.cargas, CARGA_VAZIA()] }));
  };

  const removerCarga = (index) => {
    setFormData(prev => ({ ...prev, cargas: prev.cargas.filter((_, i) => i !== index) }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (finalizar = false) => {
    if (!formData.obra_id || !formData.data) {
      toast({ title: "Por favor, preencha os campos obrigatórios: Obra e Data", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = buildDataToSave(formData, finalizar, editingId);

      if (editingId) {
        await atualizarEnsaio('AcompanhamentoUsinagem', editingId, dataToSave);
        toast({ title: finalizar ? 'Acompanhamento finalizado e enviado para aprovação!' : 'Acompanhamento salvo como rascunho!' });
      } else {
        await criarEnsaio('AcompanhamentoUsinagem', dataToSave);
        toast({ title: finalizar ? 'Acompanhamento criado e enviado para aprovação!' : 'Acompanhamento salvo como rascunho!' });
      }

      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      logger.error("Erro ao salvar:", error);
      toast({ title: "Erro ao salvar acompanhamento", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleAgregadoChange, adicionarAgregado, removerAgregado,
    handleCargaChange, adicionarCarga, removerCarga,
    handleSubmit,
    navigate,
  };
}