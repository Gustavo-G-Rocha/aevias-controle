import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { useEnsaioDensidadeData } from "@/hooks/useEnsaioDensidadeData";
import { useEnsaioDensidadeForm } from "@/hooks/useEnsaioDensidadeForm";
import { useEnsaioDensidadeActions } from "@/hooks/useEnsaioDensidadeActions";

import EnsaioDensidadeHeader from "@/components/ensaio-densidade-in-situ/EnsaioDensidadeHeader";
import EnsaioDensidadeDadosGerais from "@/components/ensaio-densidade-in-situ/EnsaioDensidadeDadosGerais";
import EnsaioDensidadeResultados from "@/components/ensaio-densidade-in-situ/EnsaioDensidadeResultados";
import EnsaioDensidadeActions from "@/components/ensaio-densidade-in-situ/EnsaioDensidadeActions";

export default function EnsaioDensidadeInSituPage() {
  const { formData, setFormData, obras, projects, regionais, user, loading, editingEnsaio } =
    useEnsaioDensidadeData();

  const {
    handleFuroChange,
    handleProctorChange,
    handleGlobalDataChange,
    adicionarFuro,
    removerFuro,
  } = useEnsaioDensidadeForm(formData, setFormData);

  const { saving, handleSubmit } = useEnsaioDensidadeActions(formData, user, editingEnsaio);

  const handleSaveProgress = (e) => {
    e?.preventDefault();
    handleSubmit({ preventDefault: () => {} }, "rascunho");
  };

  const isApproved = editingEnsaio?.approved === true;
  const isEditable = !isApproved;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-[#00233B]/50" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/20 backdrop-blur-lg border border-white/20 text-[#00233B]">
          <EnsaioDensidadeHeader editingEnsaio={editingEnsaio} />
          <CardContent>
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                  e.preventDefault();
                }
              }}
              className="space-y-6"
            >
              <EnsaioDensidadeDadosGerais
                formData={formData}
                setFormData={setFormData}
                obras={obras}
                regionais={regionais}
                projects={projects}
                isEditable={isEditable}
                handleGlobalDataChange={handleGlobalDataChange}
                handleProctorChange={handleProctorChange}
              />

              <EnsaioDensidadeResultados
                formData={formData}
                isEditable={isEditable}
                onFuroChange={handleFuroChange}
                onAdicionarFuro={adicionarFuro}
                onRemoverFuro={removerFuro}
              />

              <EnsaioDensidadeActions
                formData={formData}
                setFormData={setFormData}
                isEditable={isEditable}
                saving={saving}
                onSaveProgress={handleSaveProgress}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}