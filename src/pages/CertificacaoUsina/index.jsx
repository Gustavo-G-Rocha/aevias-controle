import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { useCertificacaoUsinaForm } from "@/hooks/useCertificacaoUsinaForm";
import { validarCertificacao } from "@/utils/certificacaoUsinaUtils";
import { criarCertificacao, atualizarCertificacao } from "@/services/certificacaoUsinaService";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";
import StatusDraftBanner from "@/components/forms/StatusDraftBanner";
import RejectionBanner from "@/components/forms/RejectionBanner";
import ChecklistUsinaHeader from "@/components/checklists/ChecklistUsinaHeader";

import SecaoDescricao from "@/components/certificacao-usina/SecaoDescricao";
import SecaoClasseTipo from "@/components/certificacao-usina/SecaoClasseTipo";
import SecaoAspectosLegais from "@/components/certificacao-usina/SecaoAspectosLegais";
import SecaoSaudeSeguranca from "@/components/certificacao-usina/SecaoSaudeSeguranca";
import SecaoMeioAmbiente from "@/components/certificacao-usina/SecaoMeioAmbiente";
import SecaoLaboratorio from "@/components/certificacao-usina/SecaoLaboratorio";
import SecaoAfeicao from "@/components/certificacao-usina/SecaoAfeicao";
import SecaoEstruturaUsina from "@/components/certificacao-usina/SecaoEstruturaUsina";
import SecaoResultado from "@/components/certificacao-usina/SecaoResultado";

const getInitialFormData = () => ({
  obra_id: "",
  razao_social: "",
  interessado: "",
  responsavel_tecnico: "",
  telefone: "",
  email: "",
  data_vistoria: new Date().toISOString().split("T")[0],
  avaliador: "",
  cnpj: "",
  validade: "",
  localizacao: "",
  marca_usina: "",
  numero_serie: "",
  fornecimento_agregado: "",
  mineralogia: "",
  classe_usina: "",
  tipo_dosagem: "",
  tipo_secagem: "",
  aspectos_legais: {},
  saude_seguranca: {},
  meio_ambiente: {},
  laboratorio: { equipamentos: {}, profissionais: {} },
  afeicao: {},
  estrutura_fisica: {},
  usina_asfalto: {},
  ensaios_validacao: {},
  resultado_classe: "",
  observacoes_resultado: "",
  observacoes_gerais: "",
  status: "rascunho",
  approved: null,
  rejection_reason: null,
});

export default function CertificacaoUsinaPage() {
  const {
    obras, regionais, projects, faixas, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada, regionalSelecionada,
    projetosDisponiveis, isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, "CertificacaoUsina", "certificacao_usina");

  const handlers = useCertificacaoUsinaForm({ setFormData });

  const handleSubmit = useCallback(async (e, saveStatus = "finalizado") => {
    e.preventDefault();
    const validation = validarCertificacao(formData, saveStatus);
    if (!validation.valid) { alert(validation.message); return; }

    const dataToSave = { ...formData, status: saveStatus };

    const editing = editingChecklist?.id;
    if (editing) {
      const updateData = { ...dataToSave };
      let msg = saveStatus === "rascunho" ? "Progresso salvo!" : "Certificação atualizada com sucesso!";
      if ((editingChecklist.approved === false || editingChecklist.approved === null) && saveStatus === "finalizado" && editingChecklist.status === "finalizado") {
        updateData.approved = null;
        updateData.rejection_reason = null;
        updateData.approved_by = null;
        updateData.approved_date = null;
        updateData.was_rejected = true;
        msg = "Certificação atualizada! O registro voltará para análise.";
      }
      await atualizarCertificacao(editing, updateData);
      alert(msg);
    } else {
      await criarCertificacao({ ...dataToSave, laboratorista_name: user?.laboratorista_name || user?.full_name });
      alert(saveStatus === "rascunho" ? "Progresso salvo!" : "Certificação criada com sucesso!");
    }
    clearSavedData();
    navigate(createPageUrl("MeusEnsaios"));
  }, [formData, editingChecklist, user, clearSavedData, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const disabled = !isEditable || isApproved;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingChecklist?.id ? "Editar Certificação de Usina" : "Nova Certificação de Usina"}
            </CardTitle>
            <CardDescription>
              Check List - Padronização e Certificação de Usinas de Misturas Asfálticas
            </CardDescription>
            <StatusDraftBanner status={formData.status} />
            <RejectionBanner rejectionReason={editingChecklist?.rejection_reason} />
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") e.preventDefault(); }}
              className="space-y-8"
            >
              {/* Obra */}
              <ChecklistUsinaHeader
                formData={formData}
                setFormData={setFormData}
                obras={obras}
                regionais={regionais}
                projects={projects}
                projetosDisponiveis={projetosDisponiveis}
                obraSelecionada={obraSelecionada}
                regionalSelecionada={regionalSelecionada}
                isEditable={isEditable}
                isApproved={isApproved}
                editingChecklist={editingChecklist}
              />

              <SecaoDescricao formData={formData} onChange={handlers.handleChange} disabled={disabled} />
              <SecaoClasseTipo formData={formData} onChange={handlers.handleChange} disabled={disabled} />
              <SecaoAspectosLegais formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              <SecaoSaudeSeguranca formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              <SecaoMeioAmbiente formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              <SecaoLaboratorio formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              <SecaoAfeicao
                formData={formData}
                onNestedChange={handlers.handleNestedChange}
                onEnsaioValidacaoChange={handlers.handleEnsaioValidacaoChange}
                onGranulometriaChange={handlers.handleGranulometriaChange}
                disabled={disabled}
              />
              <SecaoEstruturaUsina
                formData={formData}
                onNestedChange={handlers.handleNestedChange}
                handleChange={handlers.handleChange}
                disabled={disabled}
              />
              <SecaoResultado formData={formData} onChange={handlers.handleChange} disabled={disabled} />

              <ChecklistFooter
                isEditable={isEditable}
                isApproved={isApproved}
                loadingUpload={false}
                onCancel={() => { clearSavedData(); navigate(createPageUrl("MeusEnsaios")); }}
                onSaveProgress={async (e) => { e.preventDefault(); await handleSubmit(e, "rascunho"); }}
                onFinalize={async (e) => { e.preventDefault(); await handleSubmit(e, "finalizado"); }}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}