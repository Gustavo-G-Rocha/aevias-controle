import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarRegistro } from "@/services/recordsService";
import { createPageUrl } from "@/utils";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useNovaNCActions(user) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSave = async ({ obraId, obras, tipoChecklist, checklistId, form, fotos, pdfs }) => {
    if (!obraId || !form.descricao_nc || !form.data_nc) {
      toast({ title: "Preencha os campos obrigatórios: Obra, Data da NC e Descrição.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const managerName = user?.laboratorista_name || user?.full_name || "";
      await criarRegistro('RelatorioNC', {
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
      logger.error("[useNovaNCActions] Erro ao salvar NC:", error?.message || error);
      toast({ title: "Erro ao salvar a NC. Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return { handleSave, saving };
}