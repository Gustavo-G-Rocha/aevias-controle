import React from "react";
import { Loader2 } from "lucide-react";

import { useAcompanhamentoUsinagemData }    from "@/hooks/useAcompanhamentoUsinagemData";
import { useAcompanhamentoUsinagemFilters }  from "@/hooks/useAcompanhamentoUsinagemFilters";
import { useAcompanhamentoUsinagemActions }  from "@/hooks/useAcompanhamentoUsinagemActions";

import AcompanhamentoUsinagemHeader    from "@/components/acompanhamento-usinagem/AcompanhamentoUsinagemHeader";
import AcompanhamentoUsinagemDadosObra from "@/components/acompanhamento-usinagem/AcompanhamentoUsinagemDadosObra";
import AcompanhamentoUsinagemAgregados from "@/components/acompanhamento-usinagem/AcompanhamentoUsinagemAgregados";
import AcompanhamentoUsinagemCargas    from "@/components/acompanhamento-usinagem/AcompanhamentoUsinagemCargas";
import AcompanhamentoUsinagemActions   from "@/components/acompanhamento-usinagem/AcompanhamentoUsinagemActions";

export default function AcompanhamentoUsinagemPage() {
  const {
    loading, obras, regionais, projects,
    editingId, isEditable,
    formData, setFormData,
  } = useAcompanhamentoUsinagemData();

  const { filteredProjects, handleObraChange, handleProjectChange } =
    useAcompanhamentoUsinagemFilters({ formData, setFormData, obras, regionais, projects });

  const {
    saving,
    handleAgregadoChange, adicionarAgregado, removerAgregado,
    handleCargaChange, adicionarCarga, removerCarga,
    handleSubmit, navigate,
  } = useAcompanhamentoUsinagemActions({ formData, setFormData, editingId });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AcompanhamentoUsinagemHeader
          editingId={editingId}
          rejectionReason={formData.rejection_reason}
        />

        <AcompanhamentoUsinagemDadosObra
          formData={formData}
          setFormData={setFormData}
          obras={obras}
          filteredProjects={filteredProjects}
          isEditable={isEditable}
          handleObraChange={handleObraChange}
          handleProjectChange={handleProjectChange}
        />

        <AcompanhamentoUsinagemAgregados
          formData={formData}
          setFormData={setFormData}
          isEditable={isEditable}
          handleAgregadoChange={handleAgregadoChange}
          adicionarAgregado={adicionarAgregado}
          removerAgregado={removerAgregado}
        />

        <AcompanhamentoUsinagemCargas
          cargas={formData.cargas}
          isEditable={isEditable}
          handleCargaChange={handleCargaChange}
          adicionarCarga={adicionarCarga}
          removerCarga={removerCarga}
        />

        <AcompanhamentoUsinagemActions
          isEditable={isEditable}
          saving={saving}
          approved={formData.approved}
          navigate={navigate}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}