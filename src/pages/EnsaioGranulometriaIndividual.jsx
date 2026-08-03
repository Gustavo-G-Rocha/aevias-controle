import React from "react";
import LoadingState from "@/components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useEnsaioForm } from "@/hooks/useEnsaioForm";
import { useEnsaioGranulometriaIndividualForm }    from "@/hooks/useEnsaioGranulometriaIndividualForm";
import { useEnsaioGranulometriaIndividualActions } from "@/hooks/useEnsaioGranulometriaIndividualActions";
import { getInitialFormData } from "@/utils/ensaioGranulometriaIndividualUtils";

import EnsaioGranIndividualHeader      from "@/components/ensaio-granulometria-individual/EnsaioGranIndividualHeader";
import EnsaioGranIndividualDadosGerais from "@/components/ensaio-granulometria-individual/EnsaioGranIndividualDadosGerais";
import EnsaioGranIndividualAgregados   from "@/components/ensaio-granulometria-individual/EnsaioGranIndividualAgregados";
import EnsaioGranIndividualEquivalente from "@/components/ensaio-granulometria-individual/EnsaioGranIndividualEquivalente";
import EnsaioGranIndividualActions     from "@/components/ensaio-granulometria-individual/EnsaioGranIndividualActions";

export default function EnsaioGranulometriaIndividualPage() {
  const {
    obras, regionais, projects,
    user, editingEnsaio,
    loading, formData, setFormData,
    obraSelecionada, projetosDisponiveis,
    isApproved, isEditable, navigate,
  } = useEnsaioForm(getInitialFormData, 'EnsaioGranulometriaIndividual', 'ensaio_gran_individual');

  const {
    filteredProjects, selectedProject, peneirasVisiveis,
    handleChange, handleAgregadoChange, handleGranulometriaChange,
    addAgregado, removeAgregado, handleEquivalenteChange,
  } = useEnsaioGranulometriaIndividualForm({
    formData, setFormData, projects, projetosDisponiveis, editingEnsaio,
  });

  const { handleSubmit } = useEnsaioGranulometriaIndividualActions({
    formData, user, editingEnsaio, navigate,
  });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <EnsaioGranIndividualHeader editingEnsaio={editingEnsaio} formData={formData} />

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <EnsaioGranIndividualDadosGerais
                formData={formData}
                obras={obras}
                regionais={regionais}
                filteredProjects={filteredProjects}
                obraSelecionada={obraSelecionada}
                isEditable={isEditable}
                isApproved={isApproved}
                editingEnsaio={editingEnsaio}
                handleChange={handleChange}
              />

              <EnsaioGranIndividualAgregados
                agregados={formData.agregados}
                peneirasVisiveis={peneirasVisiveis}
                selectedProject={selectedProject}
                isEditable={isEditable}
                isApproved={isApproved}
                onAgregadoChange={handleAgregadoChange}
                onGranulometriaChange={handleGranulometriaChange}
                onAdd={addAgregado}
                onRemove={removeAgregado}
              />

              <EnsaioGranIndividualEquivalente
                equivalente_areia={formData.equivalente_areia}
                isEditable={isEditable}
                isApproved={isApproved}
                onMedicaoChange={handleEquivalenteChange}
              />

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  disabled={!isEditable || isApproved}
                  rows={3}
                />
              </div>

              <EnsaioGranIndividualActions
                isEditable={isEditable}
                isApproved={isApproved}
                onSubmit={handleSubmit}
                navigate={navigate}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}