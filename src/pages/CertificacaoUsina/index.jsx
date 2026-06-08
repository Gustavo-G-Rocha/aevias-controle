import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { useCertificacaoUsinaForm } from "@/hooks/useCertificacaoUsinaForm";
import { validarCertificacao, VALIDADORES_PAGINA } from "@/utils/certificacaoUsinaUtils";
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
  { num: "1-4", label: "Identificação e\nAspectos Legais" },
  { num: "5",   label: "Saúde e\nSegurança" },
  { num: "6",   label: "Meio\nAmbiente" },
  { num: "7",   label: "Laboratório\ne Estrutura" },
  { num: "8",   label: "Resultado" },
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

  const isPageComplete = (pageIndex) => VALIDADORES_PAGINA[pageIndex]?.(formData) ?? true;

  const goToPage = (page) => {
    // Só permite avançar se todas as páginas anteriores estiverem completas
    for (let i = 0; i < page; i++) {
      if (!isPageComplete(i)) return;
    }
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

            {/* Navegação por seções */}
            <div className="pt-3">
              {/* Barra de progresso */}
              <div className="relative mb-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#00233B] rounded-full transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / PAGES.length) * 100}%` }}
                />
              </div>
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {PAGES.map((p, i) => {
                  const complete = isPageComplete(i);
                  const prevComplete = i === 0 || Array.from({ length: i }, (_, j) => j).every(isPageComplete);
                  const locked = !prevComplete && i !== currentPage;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToPage(i)}
                      disabled={locked}
                      title={locked ? "Complete as seções anteriores para avançar" : undefined}
                      className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border-2 transition-all duration-200 min-w-[90px] ${
                        locked
                          ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                          : currentPage === i
                          ? "bg-[#00233B] text-white border-[#00233B] shadow-md scale-105"
                          : complete && i < currentPage
                          ? "bg-[#BFCF99]/20 text-[#00233B] border-[#BFCF99] hover:bg-[#BFCF99]/40"
                          : "bg-white text-slate-500 border-slate-200 hover:border-[#00233B] hover:text-[#00233B]"
                      }`}
                    >
                      <span className={`text-base font-bold leading-none ${locked ? "text-slate-300" : currentPage === i ? "text-[#BFCF99]" : i < currentPage ? "text-[#00233B]" : "text-slate-400"}`}>
                        {locked ? "🔒" : p.num}
                      </span>
                      <span className="text-[10px] leading-tight text-center whitespace-pre-line">{p.label}</span>
                      {!locked && complete && i < currentPage && (
                        <span className="text-[10px] leading-none text-[#00233B] font-semibold">✓</span>
                      )}
                      {!locked && !complete && i === currentPage && (
                        <span className="text-[10px] leading-none text-orange-500 font-semibold">incompleta</span>
                      )}
                    </button>
                  );
                })}
              </div>
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
                <div className="flex flex-col items-end gap-1">
                  {!isPageComplete(currentPage) && currentPage < PAGES.length - 1 && (
                    <span className="text-xs text-orange-500">Preencha todos os campos para avançar</span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage === PAGES.length - 1 || !isPageComplete(currentPage)}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Próxima →
                  </Button>
                </div>
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