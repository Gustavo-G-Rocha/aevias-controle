import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { criarChecklist, atualizarChecklist } from "@/services/checklistsService";
import { uploadMultipleFiles } from "@/utils/imageUpload";
import { createPageUrl } from "@/utils";
import { useChecklistForm } from "@/hooks/useChecklistForm";
import { validateChecklistForm } from "@/utils/checklistValidation";
import MedicaoUsina from "@/components/checklists/MedicaoUsina";
import ChecklistUsinaHeader from "@/components/checklists/ChecklistUsinaHeader";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";
import ControleCauqSection from "@/components/checklists/ControleCauqSection";
import StatusDraftBanner from "@/components/forms/StatusDraftBanner";
import RejectionBanner from "@/components/forms/RejectionBanner";

import { useChecklistUsinaForm } from "./hooks/useChecklistUsinaForm";
import ControleAgregadosSection from "./components/ControleAgregadosSection";
import RodadasProducaoSection from "./components/RodadasProducaoSection";
import ControleLiganteSection from "./components/ControleLiganteSection";
import ObservacoesSection from "./components/ObservacoesSection";
import { getInitialFormData } from "@/utils/checklistUsinaFormInitial";
import { toast } from "@/components/ui/use-toast";

export default function ChecklistUsinaPage() {
  const {
    obras, regionais, projects, faixas, user, editingChecklist,
    loading, formData, setFormData, obraSelecionada, regionalSelecionada,
    projetosDisponiveis, isApproved, isEditable, clearSavedData, navigate,
  } = useChecklistForm(getInitialFormData, 'ChecklistUsina', 'checklist_usina');

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");
  const [uploadProgress, setUploadProgress] = useState([]);

  const selectedProject = useMemo(() => projects.find(p => p.id === formData.project_id), [projects, formData.project_id]);

  const handlers = useChecklistUsinaForm({ formData, setFormData, projects, faixas, selectedProject });

  // ── upload ──────────────────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) { setSelectedFileNames("Nenhum ficheiro selecionado"); return; }

    setLoadingUpload(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);
    setUploadProgress(files.map((file, i) => ({ id: i, fileName: file.name, status: 'pending', error: null })));

    const { urls, errors } = await uploadMultipleFiles(files, (i, status, err) => {
      setUploadProgress(prev => prev.map(p => p.id === i ? { ...p, status, error: err || null } : p));
    });

    if (urls.length > 0) setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...urls] }));
    if (errors.length > 0) toast({ title: `${urls.length} de ${files.length} fotos enviadas.\n\nErros:\n` + errors.map(err => `• ${err.fileName}: ${err.error}`).join('\n'), variant: "destructive" });

    setLoadingUpload(false);
    setUploadProgress([]);
    e.target.value = '';
  }, [setFormData]);

  const handleRemovePhoto = useCallback((indexToRemove) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== indexToRemove) }));
  }, [setFormData]);

  // ── equivalente areia status ─────────────────────────────────────────────────
  const handleEquivalenteAreiaStatusChange = useCallback((status, clearResultados) => {
    setFormData(prev => ({
      ...prev,
      equivalente_areia_status: status,
      ...(clearResultados ? { equivalente_areia_quantidade: 0, equivalente_areia_resultados: [] } : {}),
    }));
  }, [setFormData]);

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e, saveStatus = 'finalizado') => {
    e.preventDefault();
    const validation = validateChecklistForm(formData, saveStatus);
    if (!validation.valid) { toast({ title: validation.message }); return; }

    const dataToSave = {
      ...formData,
      status: saveStatus,
      fotos: (formData.fotos || []).map(f => (typeof f === 'string' ? f : (f?.url || ''))).filter(Boolean),
    };

    try {
      if (editingChecklist?.id) {
        const updateData = { ...dataToSave };
        let msg = saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist atualizado com sucesso!";
        if ((editingChecklist.approved === false || editingChecklist.approved === null) && saveStatus === 'finalizado' && editingChecklist.status === 'finalizado') {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          updateData.was_rejected = true;
          msg = "Checklist atualizado com sucesso! O registro voltará para análise do administrador.";
        }
        await atualizarChecklist('ChecklistUsina', editingChecklist.id, updateData);
        toast({ title: msg });
      } else {
        await criarChecklist('ChecklistUsina', { ...dataToSave, laboratorista_name: user?.laboratorista_name || user?.full_name });
        toast({ title: saveStatus === 'rascunho' ? "Progresso salvo com sucesso!" : "Checklist criado com sucesso!" });
      }
      clearSavedData();
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("[ChecklistUsina] Erro ao salvar:", error?.message || error);
      toast({ title: "Erro ao salvar checklist.", variant: "destructive" });
    }
  }, [formData, editingChecklist, user, clearSavedData, navigate]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingChecklist?.id ? "Editar Checklist de Usina" : "Novo Checklist de Usina"}</CardTitle>
            <CardDescription>
              {editingChecklist?.id
                ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                : "Controle tecnológico de usinagem - DNIT 031/2024"}
            </CardDescription>
            <StatusDraftBanner status={formData.status} />
            <RejectionBanner rejectionReason={editingChecklist?.rejection_reason} />
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form onSubmit={handleSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') e.preventDefault(); }}
              className="space-y-6">

              <ChecklistUsinaHeader
                formData={formData}
                setFormData={setFormData}
                obras={obras}
                regionais={regionais}
                projetosDisponiveis={projetosDisponiveis}
                obraSelecionada={obraSelecionada}
                regionalSelecionada={regionalSelecionada}
                isEditable={isEditable}
                isApproved={isApproved}
                editingChecklist={editingChecklist}
                onObraChange={handlers.handleObraChange}
                onProjectChange={handlers.handleProjectChange}
              />

              <ControleAgregadosSection
                formData={formData}
                isEditable={isEditable}
                isApproved={isApproved}
                onAgregadoChange={handlers.handleAgregadoChange}
                onEquivalenteAreiaStatusChange={handleEquivalenteAreiaStatusChange}
                onEquivalenteAreiaAddResultado={handlers.handleEquivalenteAreiaAddResultado}
                onEquivalenteAreiaRemoveResultado={handlers.handleEquivalenteAreiaRemoveResultado}
                onEquivalenteAreiaResultadoChange={handlers.handleEquivalenteAreiaResultadoChange}
                onObservacoesChange={(v) => handlers.handleChange('observacoes_agregados', v)}
              />

              <RodadasProducaoSection
                rodadas={formData.rodadas_producao}
                isEditable={isEditable}
                isApproved={isApproved}
                onRodadaChange={handlers.handleRodadaChange}
                onAdicionarRodada={handlers.adicionarRodada}
                onRemoverRodada={handlers.removerRodada}
              />

              <ControleCauqSection
                formData={formData}
                selectedProject={selectedProject}
                isEditable={isEditable}
                isApproved={isApproved}
                onNestedChange={handlers.handleNestedChange}
              />

              <ControleLiganteSection
                formData={formData}
                isEditable={isEditable}
                isApproved={isApproved}
                onNestedChange={handlers.handleNestedChange}
                onChange={handlers.handleChange}
              />

              <ObservacoesSection
                formData={formData}
                isEditable={isEditable}
                isApproved={isApproved}
                loadingUpload={loadingUpload}
                uploadProgress={uploadProgress}
                selectedFileNames={selectedFileNames}
                onObservacoesChange={(v) => handlers.handleChange('observacoes', v)}
                onAcoesRealizadasChange={(v) => handlers.handleChange('acoes_corretivas_realizado', v)}
                onAcoesDescricaoChange={(v) => handlers.handleChange('acoes_corretivas_descricao', v)}
                onNaoConformidadesChange={(v) => handlers.handleChange('nao_conformidades', v)}
                onFileChange={handleFileChange}
                onRemovePhoto={handleRemovePhoto}
              />

              <MedicaoUsina
                medicoes_usina={formData.medicoes_usina}
                onChange={(val) => handlers.handleChange('medicoes_usina', val)}
                disabled={!isEditable || isApproved}
                empreiteiras={obraSelecionada?.empreiteiras || []}
              />

              <ChecklistFooter
                isEditable={isEditable}
                isApproved={isApproved}
                loadingUpload={loadingUpload}
                onCancel={() => { clearSavedData(); navigate(createPageUrl('MeusEnsaios')); }}
                onSaveProgress={async (e) => { e.preventDefault(); await handleSubmit(e, 'rascunho'); }}
                onFinalize={async (e) => { e.preventDefault(); await handleSubmit(e, 'finalizado'); }}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}