import { useState, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { useCertificacaoUsinaForm } from "@/hooks/useCertificacaoUsinaForm";
import { validarCertificacao } from "@/utils/certificacaoUsinaUtils";
import { canGestorPreencherResultado, laboratoristaDeveOcultarResultado } from "@/utils/certificacaoUsinaAccess";
import { criarCertificacao, atualizarCertificacao } from "@/services/certificacaoUsinaService";
import { uploadMultipleFiles } from "@/utils/imageUpload";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";
import StatusDraftBanner from "@/components/forms/StatusDraftBanner";
import RejectionBanner from "@/components/forms/RejectionBanner";
import CertificacaoUsinaHeader from "@/components/certificacao-usina/CertificacaoUsinaHeader";
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
import SecaoFotos from "@/components/certificacao-usina/SecaoFotos";
import { getInitialFormData } from "@/utils/certificacaoUsinaFormInitial";
import { toast } from "@/components/ui/use-toast";
import {
  ALL_PAGES,
  isPageComplete as checkPageComplete,
  getCamposVaziosByPage,
} from "./certificacaoUsinaPages";

export default function CertificacaoUsinaPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const topRef = useRef(null);

  const {
    obras, regionais, projects, faixas, user, editingChecklist,
    loading, formData, setFormData, regionalSelecionada,
    projetosDisponiveis, isApproved, isEditable, extraCanEdit, clearSavedData, navigate,
  } = useChecklistForm(
    getInitialFormData,
    "CertificacaoUsina",
    "certificacao_usina",
    canGestorPreencherResultado,
  );

  // Laboratorista não preenche a etapa de Resultado — ela pertence ao Gestor de Contrato.
  const ocultarResultado = laboratoristaDeveOcultarResultado(user);

  // Páginas visíveis conforme o perfil (laboratorista não vê a aba de Resultado).
  const PAGES = useMemo(
    () => ALL_PAGES.filter((p) => !(p.key === "resultado" && ocultarResultado)),
    [ocultarResultado],
  );

  const setFormDataAndClear = useCallback((updater) => {
    setCamposVazios([]);
    setFormData(updater);
  }, [setFormData]);

  const handlers = useCertificacaoUsinaForm({ setFormData: setFormDataAndClear, projects, faixas });

  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    setLoadingUpload(true);
    setUploadProgress(files.map((file, i) => ({ id: i, fileName: file.name, status: "pending", error: null })));
    const { urls, errors } = await uploadMultipleFiles(files, (i, status, err) => {
      setUploadProgress(prev => prev.map(p => p.id === i ? { ...p, status, error: err || null } : p));
    });
    if (urls.length > 0) setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...urls] }));
    if (errors.length > 0) toast({ title: `${urls.length} de ${files.length} fotos enviadas.\n\nErros:\n` + errors.map(e => `• ${e.fileName}: ${e.error}`).join("\n"), variant: "destructive" });
    setLoadingUpload(false);
    setUploadProgress([]);
    e.target.value = "";
  }, [setFormData]);

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: (prev.fotos || []).filter((_, i) => i !== index) }));
  }, [setFormData]);

  const [camposVazios, setCamposVazios] = useState([]);

  const isPageComplete = (pageIndex) => checkPageComplete(PAGES, pageIndex, formData);

  const goToPage = (page) => {
    // Ao avançar, mostrar campos vazios da página atual
    if (page > currentPage && !isPageComplete(currentPage)) {
      setCamposVazios(getCamposVaziosByPage(PAGES, currentPage, formData));
      return;
    }
    // Ao navegar por tab, só permite se as anteriores estiverem completas
    if (page > currentPage + 1) {
      for (let i = 0; i < page; i++) {
        if (!isPageComplete(i)) return;
      }
    }
    setCamposVazios([]);
    setCurrentPage(page);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSubmit = useCallback(async (e, saveStatus = "finalizado") => {
    e.preventDefault();
    const validation = validarCertificacao(formData, saveStatus);
    if (!validation.valid) { toast({ title: validation.message }); return; }

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
      toast({ title: msg });
    } else {
      await criarCertificacao({ ...dataToSave, laboratorista_name: user?.laboratorista_name || user?.full_name });
      toast({ title: saveStatus === "rascunho" ? "Progresso salvo!" : "Certificação criada com sucesso!" });
    }
    clearSavedData();
    navigate(createPageUrl("MeusEnsaios"));
  }, [formData, editingChecklist, user, clearSavedData, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // Edição geral (todas as seções exceto Resultado). O gestor liberado via
  // extraCanEdit só pode mexer no Resultado, então para ele as demais ficam travadas.
  const disabled = !isEditable || isApproved || extraCanEdit;
  // Só o gestor liberado, ou admin/owner com edição habilitada, preenche o Resultado.
  const podeEditarResultado = !ocultarResultado && (isEditable || extraCanEdit) && !isApproved;
  const currentPageKey = PAGES[currentPage]?.key;

  return (
    <div className="p-6 bg-transparent min-h-screen">
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
              <div className="relative mb-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300"
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
                          ? "bg-muted text-muted-foreground/50 border-border cursor-not-allowed"
                          : currentPage === i
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                          : complete && i < currentPage
                          ? "bg-secondary/20 text-foreground border-secondary hover:bg-secondary/40"
                          : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                      }`}
                    >
                      <span className={`text-base font-bold leading-none ${locked ? "text-muted-foreground/50" : currentPage === i ? "text-secondary" : i < currentPage ? "text-foreground" : "text-muted-foreground/70"}`}>
                        {locked ? "🔒" : p.num}
                      </span>
                      <span className="text-[10px] leading-tight text-center whitespace-pre-line">{p.label}</span>
                      {!locked && complete && i < currentPage && (
                        <span className="text-[10px] leading-none text-foreground font-semibold">✓</span>
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
              <CertificacaoUsinaHeader
                formData={formData}
                obras={obras}
                regionais={regionais}
                regionalSelecionada={regionalSelecionada}
                isEditable={isEditable}
                isApproved={isApproved}
                editingChecklist={editingChecklist}
                onObraChange={(v) => handlers.handleChange("obra_id", v)}
                onDataChange={(v) => handlers.handleChange("data_vistoria", v)}
              />

              {/* Tópicos 1–4 */}
              {currentPageKey === "identificacao" && (<>
                <SecaoDescricao formData={formData} onChange={handlers.handleChange} disabled={disabled} />
                <SecaoClasseTipo formData={formData} onChange={handlers.handleChange} disabled={disabled} />
                <SecaoAspectosLegais formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              </>)}

              {/* Tópico 5 - Saúde e Segurança */}
              {currentPageKey === "saude" && (
                <SecaoSaudeSeguranca formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              )}

              {/* Tópico 6 - Meio Ambiente */}
              {currentPageKey === "meio_ambiente" && (
                <SecaoMeioAmbiente formData={formData} onNestedChange={handlers.handleNestedChange} disabled={disabled} />
              )}

              {/* Tópico 7 - Laboratório, Aferição, Estrutura e Usina */}
              {currentPageKey === "laboratorio" && (<>
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

              {/* Tópico 8 - Resultado (preenchido pelo Gestor de Contrato) */}
              {currentPageKey === "resultado" && (
                <SecaoResultado formData={formData} onChange={handlers.handleChange} disabled={!podeEditarResultado} />
              )}

              {/* Relatório Fotográfico */}
              {currentPageKey === "fotos" && (
                <SecaoFotos
                  fotos={formData.fotos || []}
                  onFileChange={handleFileChange}
                  onRemove={handleRemovePhoto}
                  loading={loadingUpload}
                  progress={uploadProgress}
                  isEditable={isEditable}
                  isApproved={isApproved}
                />
              )}

              {/* Campos obrigatórios vazios */}
              {camposVazios.length > 0 && (
                <div className="rounded-md border border-orange-500/30 bg-card0/10 px-4 py-3 text-sm text-orange-600">
                  <p className="font-semibold mb-1">Preencha os campos obrigatórios antes de avançar:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {camposVazios.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {/* Navegação anterior/próximo + footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === 0}
                  onClick={() => { setCamposVazios([]); goToPage(currentPage - 1); }}
                >
                  ← Anterior
                </Button>
                <span className="text-xs text-muted-foreground">
                  Página {currentPage + 1} de {PAGES.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === PAGES.length - 1 || loadingUpload}
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