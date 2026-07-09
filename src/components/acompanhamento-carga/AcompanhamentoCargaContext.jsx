import React, { createContext, useContext } from "react";
import { Loader2 } from "lucide-react";
import { useAcompanhamentoCargaData } from "@/hooks/useAcompanhamentoCargaData";
import { useAcompanhamentoCargaActions } from "@/hooks/useAcompanhamentoCargaActions";
import { calcCanEdit } from "@/utils/acompanhamentoCargaUtils";

const AcompanhamentoCargaContext = createContext(null);

/**
 * Hook consumidor do contexto de Acompanhamento de Carga.
 * Lança erro se usado fora do Provider, falhando cedo em desenvolvimento.
 */
export function useAcompanhamentoCargaCtx() {
  const ctx = useContext(AcompanhamentoCargaContext);
  if (!ctx) {
    throw new Error(
      "useAcompanhamentoCargaCtx deve ser usado dentro de <AcompanhamentoCargaProvider>"
    );
  }
  return ctx;
}

/**
 * Provider que encapsula hooks de dados e ações, derivando valores
 * computados (obra selecionada, regional, projeto, canEdit).
 * Componentes filhos consomem via useAcompanhamentoCargaCtx() — sem prop drilling.
 */
export function AcompanhamentoCargaProvider({ children }) {
  const {
    formData, setFormData,
    user, obras, regionais, projects, availableProjects, setAvailableProjects,
    loading, editMode, editId, clearSavedData,
  } = useAcompanhamentoCargaData();

  const {
    saving,
    handleObraChange, handleProjectChange,
    handleAddCarga, handleRemoveCarga, handleCargaChange,
    handleSubmit,
  } = useAcompanhamentoCargaActions({
    formData, setFormData,
    obras, regionais, projects, setAvailableProjects,
    editMode, editId, clearSavedData,
  });

  // Valores derivados — cálculos triviais (find em arrays pequenos)
  const obraSelecionada = obras.find(o => o.id === formData.obra_id);
  const regionalSelecionada = regionais.find(r => r.id === obraSelecionada?.regional_id);
  const projetoSelecionado = projects.find(p => p.id === formData.project_id);
  const canEdit = calcCanEdit(editMode, formData, user?.email);

  const value = {
    formData, setFormData,
    user, obras, regionais, projects, availableProjects,
    loading, editMode, editId,
    saving,
    handleObraChange, handleProjectChange,
    handleAddCarga, handleRemoveCarga, handleCargaChange,
    handleSubmit,
    obraSelecionada, regionalSelecionada, projetoSelecionado, canEdit,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AcompanhamentoCargaContext.Provider value={value}>
      {children}
    </AcompanhamentoCargaContext.Provider>
  );
}