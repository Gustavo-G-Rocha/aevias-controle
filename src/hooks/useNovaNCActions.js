import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export function useNovaNCActions(user) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSave = async ({ obraId, obras, tipoChecklist, checklistId, form, fotos, pdfs }) => {
    if (!obraId || !form.descricao_nc || !form.data_nc) {
      alert("Preencha os campos obrigatórios: Obra, Data da NC e Descrição.");
      return;
    }

    setSaving(true);
    try {
      const managerName = user?.laboratorista_name || user?.full_name || "";
      await base44.entities.RelatorioNC.create({
        ...form,
        obra_id: obraId,
        obra_nome: obras.find(o => o.id === obraId)?.name || "",
        relatorio_criador: managerName,
        checklist_ref_tipo: tipoChecklist,
        checklist_ref_id: checklistId,
        fotos,
        pdfs,
        status: "aberta",
        pendente_aprovacao_cliente: true,
        manager_signature: {
          signed_by: user?.email || "",
          signed_date: new Date().toISOString(),
          manager_name: managerName,
          crea_number: user?.crea_number || ""
        }
      });
      navigate(createPageUrl("GestaoNC"));
    } catch (error) {
      console.error("[useNovaNCActions] Erro ao salvar NC:", error?.message || error);
      alert("Erro ao salvar a NC. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return { handleSave, saving };
}