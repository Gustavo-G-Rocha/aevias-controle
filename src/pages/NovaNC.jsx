import React from "react";
import { Loader2, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useNovaNCData } from "@/hooks/useNovaNCData";
import { useNovaNCForm } from "@/hooks/useNovaNCForm";
import { useNovaNCActions } from "@/hooks/useNovaNCActions";

import { DadosObraSection } from "@/components/nova-nc/DadosObraSection";
import { EquipeSection } from "@/components/nova-nc/EquipeSection";
import { ClassificacaoSection } from "@/components/nova-nc/ClassificacaoSection";
import { DescricaoSection } from "@/components/nova-nc/DescricaoSection";
import { AcoesSection } from "@/components/nova-nc/AcoesSection";
import { AnexosSection } from "@/components/nova-nc/AnexosSection";

export default function NovaNcPage() {
  // Data
  const { user, obras, regionais, loading } = useNovaNCData();

  // Form state
  const {
    form, setForm,
    obraId, handleObraChange,
    tipoChecklist, handleTipoChecklistChange,
    checklists, checklistId, handleChecklistChange,
    loadingChecklists,
    fotos, setFotos, uploadingFotos, handleUploadFotos,
    pdfs, setPdfs, uploadingPdfs, handleUploadPdfs
  } = useNovaNCForm(user);

  // Actions
  const { handleSave, saving } = useNovaNCActions(user);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  const handleSaveWrapper = () => {
    handleSave({ obraId, obras, tipoChecklist, checklistId, form, fotos, pdfs });
  };

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nova Não Conformidade</h1>
            <p className="text-muted-foreground text-sm mt-1">Relatório de Não Conformidade (RNC)</p>
          </div>
        </div>

        <DadosObraSection
          obras={obras}
          obraId={obraId}
          onObraChange={handleObraChange}
          form={form}
          onFormChange={setForm}
          tipoChecklist={tipoChecklist}
          onTipoChecklistChange={handleTipoChecklistChange}
          checklists={checklists}
          checklistId={checklistId}
          onChecklistChange={handleChecklistChange}
          loadingChecklists={loadingChecklists}
        />

        <EquipeSection form={form} onFormChange={setForm} user={user} />

        <ClassificacaoSection form={form} onFormChange={setForm} />

        <DescricaoSection form={form} onFormChange={setForm} />

        <AcoesSection form={form} onFormChange={setForm} />

        <AnexosSection
          fotos={fotos}
          setFotos={setFotos}
          uploadingFotos={uploadingFotos}
          handleUploadFotos={handleUploadFotos}
          pdfs={pdfs}
          setPdfs={setPdfs}
          uploadingPdfs={uploadingPdfs}
          handleUploadPdfs={handleUploadPdfs}
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveWrapper}
            disabled={saving}
            className="bg-[#00233B] text-white hover:bg-[#00233B]/90"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar NC
          </Button>
        </div>
      </div>
    </div>
  );
}