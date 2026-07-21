import React, { createContext, useContext } from "react";
import { Loader2 } from "lucide-react";
import { useControleExecucaoServicosData } from "@/hooks/useControleExecucaoServicosData";
import { useControleExecucaoServicosActions } from "@/hooks/useControleExecucaoServicosActions";
import { calcCanEdit } from "@/utils/controleExecucaoServicosUtils";

const ControleExecucaoServicosContext = createContext(null);

export function useControleExecucaoServicosCtx() {
  const ctx = useContext(ControleExecucaoServicosContext);
  if (!ctx) {
    throw new Error(
      "useControleExecucaoServicosCtx deve ser usado dentro de <ControleExecucaoServicosProvider>"
    );
  }
  return ctx;
}

export function ControleExecucaoServicosProvider({ children }) {
  const {
    formData, setFormData,
    user, obras, regionais,
    loading, editMode, editId, clearSavedData,
  } = useControleExecucaoServicosData();

  const {
    saving,
    handleObraChange,
    handleAddServico, handleRemoveServico, handleServicoChange,
    handleSubmit,
  } = useControleExecucaoServicosActions({
    formData, setFormData,
    editMode, editId, clearSavedData,
  });

  const obraSelecionada = obras.find(o => o.id === formData.obra_id);
  const regionalSelecionada = regionais.find(r => r.id === obraSelecionada?.regional_id);
  const canEdit = calcCanEdit(editMode, formData, user, obraSelecionada, regionais);

  const value = {
    formData, setFormData,
    user, obras, regionais,
    loading, editMode, editId,
    saving,
    handleObraChange,
    handleAddServico, handleRemoveServico, handleServicoChange,
    handleSubmit,
    obraSelecionada, regionalSelecionada, canEdit,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ControleExecucaoServicosContext.Provider value={value}>
      {children}
    </ControleExecucaoServicosContext.Provider>
  );
}