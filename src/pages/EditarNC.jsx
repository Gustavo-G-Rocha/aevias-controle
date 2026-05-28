import React from "react";
import { Loader2, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditarNCData } from "@/hooks/useEditarNCData";
import { useEditarNCForm } from "@/hooks/useEditarNCForm";
import { useEditarNCActions } from "@/hooks/useEditarNCActions";
import RejectionAlert from "@/components/editar-nc/RejectionAlert";
import ObraDataSection from "@/components/editar-nc/ObraDataSection";
import EquipeRncSection from "@/components/editar-nc/EquipeRncSection";
import ClassificationSection from "@/components/editar-nc/ClassificationSection";
import TextSectionsGroup from "@/components/editar-nc/TextSectionsGroup";
import AttachmentsSection from "@/components/editar-nc/AttachmentsSection";

export default function EditarNCPage() {
  const { user, obras, regionais, nc, loading, loadData } = useEditarNCData();
  const {
    form,
    updateForm,
    resetCategoryAndParameter,
    resetParameter,
    fotos,
    setFotos,
    pdfs,
    setPdfs,
    categorias,
    parametros,
  } = useEditarNCForm(nc);
  const {
    uploadingFotos,
    uploadingPdfs,
    saving,
    handleUploadFotos,
    handleUploadPdfs,
    handleSave,
  } = useEditarNCActions(nc);

  if (loading || !nc) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  const obra = obras.find((o) => o.id === nc.obra_id);

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-[#00233B]">
              Editar Não Conformidade
            </h1>
            <p className="text-[#00233B]/70 text-sm mt-1">
              RNC: {nc.numero_rnc || "—"}
            </p>
          </div>
        </div>

        {/* Rejection Alert */}
        <RejectionAlert motivo={nc.cliente_reprovacao_motivo} />

        {/* Sections */}
        <ObraDataSection obra={obra} nc={nc} form={form} updateForm={updateForm} />
        <EquipeRncSection nc={nc} form={form} updateForm={updateForm} />
        <ClassificationSection
          form={form}
          updateForm={updateForm}
          resetCategoryAndParameter={resetCategoryAndParameter}
          resetParameter={resetParameter}
          categorias={categorias}
          parametros={parametros}
        />
        <TextSectionsGroup form={form} updateForm={updateForm} />
        <AttachmentsSection
          fotos={fotos}
          setFotos={setFotos}
          pdfs={pdfs}
          setPdfs={setPdfs}
          uploadingFotos={uploadingFotos}
          uploadingPdfs={uploadingPdfs}
          onUploadFotos={handleUploadFotos}
          onUploadPdfs={handleUploadPdfs}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-white/20 text-[#00233B]"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleSave(form, fotos, pdfs)}
            disabled={saving}
            className="bg-[#00233B] text-white hover:bg-[#00233B]/90"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar e Reenviar para Aprovação
          </Button>
        </div>
      </div>
    </div>
  );
}