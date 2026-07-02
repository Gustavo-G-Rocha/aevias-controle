import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import { useGranuMisturaData }    from "@/hooks/useGranuMisturaData";
import { useGranuMisturaForm }    from "@/hooks/useGranuMisturaForm";
import { useGranuMisturaActions } from "@/hooks/useGranuMisturaActions";

import GranuMisturaHeader          from "@/components/granu-mistura/GranuMisturaHeader";
import GranuMisturaDadosObra       from "@/components/granu-mistura/GranuMisturaDadosObra";
import GranuMisturaUmidade         from "@/components/granu-mistura/GranuMisturaUmidade";
import GranuMisturaGranulometria   from "@/components/granu-mistura/GranuMisturaGranulometria";
import GranuMisturaEquivalenteAreia from "@/components/granu-mistura/GranuMisturaEquivalenteAreia";
import GranuMisturaPulverulentos   from "@/components/granu-mistura/GranuMisturaPulverulentos";
import GranuMisturaActions         from "@/components/granu-mistura/GranuMisturaActions";

export default function GranuMistura() {
  const {
    loading, user, obras, regionais, projects, faixasDisponiveis,
    editingId, formData, setFormData,
  } = useGranuMisturaData();

  const {
    selectedProject, faixaGran, faixaSelecionada, filteredProjects,
    handleChange, handlePeneiraChange, handlePesoAmostraChange,
    handleUmidadeChange, handleEAChange, handlePulvChange,
  } = useGranuMisturaForm({ formData, setFormData, obras, regionais, projects, faixasDisponiveis, editingId });

  const { saving, handleSubmit } = useGranuMisturaActions({ formData, editingId, user });

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const obraSelecionada    = obras.find(o => o.id === formData.obra_id);
  const regionalSelecionada = obraSelecionada ? regionais.find(r => r.id === obraSelecionada.regional_id) : null;
  const isApproved = formData.approved === true;
  const isEditable = !isApproved;

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <GranuMisturaHeader
          editingId={editingId}
          rejectionReason={formData.rejection_reason}
        />

        <GranuMisturaDadosObra
          formData={formData}
          obras={obras}
          filteredProjects={filteredProjects}
          faixasDisponiveis={faixasDisponiveis}
          faixaGran={faixaGran}
          regionalSelecionada={regionalSelecionada}
          obraSelecionada={obraSelecionada}
          editingId={editingId}
          isApproved={isApproved}
          handleChange={handleChange}
        />

        <GranuMisturaUmidade
          umidade={formData.umidade}
          isApproved={isApproved}
          handleUmidadeChange={handleUmidadeChange}
        />

        <GranuMisturaGranulometria
          formData={formData}
          selectedProject={selectedProject}
          faixaGran={faixaGran}
          faixaSelecionada={faixaSelecionada}
          isApproved={isApproved}
          handlePeneiraChange={handlePeneiraChange}
          handlePesoAmostraChange={handlePesoAmostraChange}
        />

        <GranuMisturaEquivalenteAreia
          equivalenteAreia={formData.equivalente_areia}
          isApproved={isApproved}
          handleEAChange={handleEAChange}
        />

        <GranuMisturaPulverulentos
          materiais={formData.materiais_pulverulentos}
          isApproved={isApproved}
          handlePulvChange={handlePulvChange}
        />

        <div>
          <Label>Observações</Label>
          <Textarea value={formData.observacoes} onChange={e => handleChange("observacoes", e.target.value)} rows={3} disabled={isApproved} className="text-xs mt-1" />
        </div>

        <GranuMisturaActions
          isEditable={isEditable}
          isApproved={isApproved}
          saving={saving}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}