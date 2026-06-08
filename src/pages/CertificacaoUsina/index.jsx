import { useState, useCallback, useRef } from "react";
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
import { Button } from "@/components/ui/button";

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

const PAGES = [
  { label: "1–4: Identificação e Aspectos Legais" },
  { label: "5: Saúde e Segurança" },
  { label: "6: Meio Ambiente" },
  { label: "7: Laboratório e Estrutura" },
  { label: "8: Resultado" },
];

export default function CertificacaoUsinaPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const topRef = useRef(null);

  const {
    obras, regionais, projects, faixas, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada, regionalSelecionada,
    projetosDisponiveis, isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, "CertificacaoUsina", "certificacao_usina");

  const handlers = useCertificacaoUsinaForm({ setFormData });

  const goToPage = (page) => {
    setCurrentPage(page);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

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
      <div className="max-w-6xl mx-auto" ref={topRef}>
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

            {/* Navegação por abas/páginas */}
            <div className="flex flex-wrap gap-1 pt-2">
              {PAGES.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    currentPage === i
                      ? "bg-[#00233B] text-white border-[#00233B]"
                      : "bg-white text-[#00233B] border-slate-300 hover:border-[#00233B]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") e.preventDefault(); }}
              className="space-y-8"
            >
              {/* Obra — aparece em todas as páginas */}
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

              {/* Página 0: Tópicos 1–4 */}
              {currentPage === 0 && (<>
                <SecaoDescricao formData={formData} onChange={handlers.handleChange} disabled={disabled} />
                <SecaoClasseTipo formData={formData} onChange={handlers.handleChange} disabled={disabled} />
                <SecaoAspectosLegais formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              </>)}

              {/* Página 1: Tópico 5 - Saúde e Segurança */}
              {currentPage === 1 && (
                <SecaoSaudeSeguranca formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              )}

              {/* Página 2: Tópico 6 - Meio Ambiente */}
              {currentPage === 2 && (
                <SecaoMeioAmbiente formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              )}

              {/* Página 3: Tópico 7 - Laboratório, Aferição, Estrutura e Usina */}
              {currentPage === 3 && (<>
                <SecaoLaboratorio formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
                <SecaoAfeicao
                  formData={formData}
                  onNestedChange={handlers.handleNestedChange}
                  onEnsaioValidacaoChange={handlers.handleEnsaioValidacaoChange}
                  onGranulometriaChange={handlers.handleGranulometriaChange}
                  onPreencherProjeto={handlers.handlePreencherProjeto}
                  projetosDisponiveis={projetosDisponiveis}
                  projects={projects}
                  disabled={disabled}
                />
                <SecaoEstruturaUsina
                  formData={formData}
                  onNestedChange={handlers.handleNestedChange}
                  handleChange={handlers.handleChange}
                  disabled={disabled}
                />
              </>)}

              {/* Página 4: Tópico 8 - Resultado */}
              {currentPage === 4 && (
                <SecaoResultado formData={formData} onChange={handlers.handleChange} disabled={disabled} />
              )}

              {/* Navegação anterior/próximo + footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === 0}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  ← Anterior
                </Button>
                <span className="text-xs text-slate-500">
                  Página {currentPage + 1} de {PAGES.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === PAGES.length - 1}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Próxima →
                </Button>
              </div>

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