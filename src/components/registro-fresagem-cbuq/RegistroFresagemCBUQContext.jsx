import React, { createContext, useContext } from "react";
import { Loader2 } from "lucide-react";
import { useRegistroFresagemCBUQData } from "@/hooks/useRegistroFresagemCBUQData";
import { useRegistroFresagemCBUQActions } from "@/hooks/useRegistroFresagemCBUQActions";
import { calcCanEdit } from "@/utils/registroFresagemCBUQUtils";

const RegistroFresagemCBUQContext = createContext(null);

export function useRegistroFresagemCBUQCtx() {
  const ctx = useContext(RegistroFresagemCBUQContext);
  if (!ctx) {
    throw new Error(
      "useRegistroFresagemCBUQCtx deve ser usado dentro de <RegistroFresagemCBUQProvider>"
    );
  }
  return ctx;
}

export function RegistroFresagemCBUQProvider({ children }) {
  const {
    formData, setFormData,
    user, obras, regionais, projects,
    loading, editMode, editId, clearSavedData,
  } = useRegistroFresagemCBUQData();

  const {
    saving,
    handleObraChange,
    handleAddRegistro, handleRemoveRegistro, handleRegistroChange,
    handleSubmit,
  } = useRegistroFresagemCBUQActions({
    formData, setFormData,
    editMode, editId, clearSavedData,
    obras,
  });

  const obraSelecionada = obras.find(o => o.id === formData.obra_id);
  const regionalSelecionada = regionais.find(r => r.id === obraSelecionada?.regional_id);
  const projetosDisponiveis = projects.filter(
    p => !regionalSelecionada?.project_ids?.length || regionalSelecionada.project_ids.includes(p.id)
  );
  const canEdit = calcCanEdit(editMode, formData, user, obraSelecionada, regionais);

  const value = {
    formData, setFormData,
    user, obras, regionais,
    projetosDisponiveis,
    loading, editMode, editId,
    saving,
    handleObraChange,
    handleAddRegistro, handleRemoveRegistro, handleRegistroChange,
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
    <RegistroFresagemCBUQContext.Provider value={value}>
      {children}
    </RegistroFresagemCBUQContext.Provider>
  );
}