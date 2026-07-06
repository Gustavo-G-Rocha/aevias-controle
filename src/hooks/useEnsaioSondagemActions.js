/**
 * Hook de ações de persistência do Ensaio de Sondagem (salvar progresso + finalizar).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { createPageUrl } from "@/utils";
import { serializarFormData, validarCPsParaFinalizar } from "@/utils/ensaioSondagemUtils";

import { toast } from "@/components/ui/use-toast";
export function useEnsaioSondagemActions({ formData, editingEnsaio, setEditingEnsaio }) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSaveProgress = async () => {
    if (!formData.obra_id) {
      toast({ title: "Por favor, selecione uma obra para salvar o progresso.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const dataToSave = serializarFormData(formData, "rascunho");
      if (editingEnsaio) {
        await atualizarEnsaio('EnsaioSondagem', editingEnsaio.id, dataToSave);
      } else {
        const novo = await criarEnsaio('EnsaioSondagem', dataToSave);
        setEditingEnsaio(novo);
      }
      toast({ title: "Progresso salvo com sucesso!" });
    } catch (error) {
      console.error("[EnsaioSondagem] Erro ao salvar progresso:", error?.message || error);
      toast({ title: "Erro ao salvar progresso.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.obra_id) { toast({ title: "Por favor, selecione uma obra.", variant: "destructive" }); return; }
    if (!formData.data || !formData.rodovia || !formData.trecho) {
      toast({ title: "Por favor, preencha todos os campos obrigatórios: Data, Rodovia e Trecho.", variant: "destructive" });
      return;
    }

    if (formData.corpos_prova.length > 0) {
      const incompletos = validarCPsParaFinalizar(formData.corpos_prova, formData.metodo_ensaio);
      if (incompletos.length > 0) {
        toast({ title: `Por favor, complete todos os dados obrigatórios dos corpos de prova: ${incompletos.join(', ')}\n\nCampos obrigatórios:\n- 4 medidas de espessura\n- Peso ao Ar\n- Peso Imerso${formData.metodo_ensaio === "DNIT 428/2022" ? '\n- Peso Saturado' : ''}`, variant: "destructive" });
        return;
      }
    }

    setSaving(true);
    try {
      const dataToSave = serializarFormData(formData, "finalizado");
      if (editingEnsaio) {
        const updateData = { ...dataToSave };
        let msg = "Ensaio de Sondagem atualizado com sucesso!";
        if (editingEnsaio.approved === false) {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          msg = "Ensaio atualizado com sucesso! O registro voltará para análise do administrador.";
        }
        await atualizarEnsaio('EnsaioSondagem', editingEnsaio.id, updateData);
        toast({ title: msg });
      } else {
        await criarEnsaio('EnsaioSondagem', dataToSave);
        toast({ title: "Ensaio de Sondagem criado com sucesso!" });
      }
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      console.error("[EnsaioSondagem] Erro ao salvar ensaio:", error?.message || error);
      toast({ title: `Erro ao salvar ensaio: ${error.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleSaveProgress, handleSubmit };
}