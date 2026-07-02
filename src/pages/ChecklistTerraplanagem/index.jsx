import { Loader2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";

import UploadGallery from "@/components/forms/UploadGallery";
import { useChecklistTerrapalagemForm } from "./hooks/useChecklistTerrapalagemForm";
import DadosObraSection from "./components/DadosObraSection";
import ClimaSection from "./components/ClimaSection";
import AcompanhamentoExecucaoSection from "./components/AcompanhamentoExecucaoSection";
import EnsaiosEmpreiteiraSection from "./components/EnsaiosEmpreiteiraSection";

export default function ChecklistTerraplanagem() {
  const {
    obras, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
    saving, uploadingPhotos, selectedFileNames,
    handleCheckboxChange, handleRoloChange, handleEnsaioChange,
    handleFileChange, handleRemovePhoto, handleLegendChange, handleSubmit,
  } = useChecklistTerrapalagemForm();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingChecklist ? 'Editar Checklist de Terraplanagem' : 'Novo Checklist de Terraplanagem'}</CardTitle>
            <CardDescription>
              {editingChecklist
                ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString('pt-BR')}`
                : 'Controle Tecnológico de Terraplanagem'}
            </CardDescription>

            {formData.status === 'rascunho' && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Em Rascunho</p>
                  <p className="text-sm text-white/90">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p>
                </div>
              </div>
            )}
            {formData.approved === false && formData.rejection_reason && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <XCircle className="w-5 h-5 text-white mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Registro Reprovado</p>
                  <p className="text-sm text-white/90">{formData.rejection_reason}</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form onSubmit={(e) => handleSubmit(e, 'finalizado')} className="space-y-6">

              <DadosObraSection
                formData={formData}
                setFormData={setFormData}
                obras={obras}
                obraSelecionada={obraSelecionada}
                editingChecklist={editingChecklist}
              />

              <ClimaSection
                periodos={formData.periodos_clima}
                onChange={(periodos) => setFormData(prev => ({ ...prev, periodos_clima: periodos }))}
              />

              <AcompanhamentoExecucaoSection
                acompanhamento={formData.acompanhamento_execucao}
                onCheckboxChange={(field, opt) => handleCheckboxChange('acompanhamento_execucao', field, opt)}
                onRoloChange={handleRoloChange}
                onObservacoesChange={(v) => setFormData(prev => ({ ...prev, acompanhamento_execucao: { ...prev.acompanhamento_execucao, observacoes: v } }))}
              />

              <EnsaiosEmpreiteiraSection
                formData={formData}
                onEnsaioChange={handleEnsaioChange}
                setFormData={setFormData}
              />

              {/* Observações Gerais */}
              <div>
                <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
                <Textarea
                  id="observacoes_gerais"
                  value={formData.observacoes_gerais}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
                  rows={3}
                  placeholder="Observações gerais sobre o checklist..."
                  maxLength="500"
                />
                <p className="text-xs text-right text-muted-foreground mt-1">{formData.observacoes_gerais?.length || 0} / 500</p>
              </div>

              <AcoesCorretivasNC
                acoesRealizadas={formData.acoes_corretivas_realizado}
                acoesDescricao={formData.acoes_corretivas_descricao}
                naoConformidades={formData.nao_conformidades || []}
                onAcoesRealizadasChange={(value) => setFormData(prev => ({ ...prev, acoes_corretivas_realizado: value, acoes_corretivas_descricao: value === false ? "" : prev.acoes_corretivas_descricao }))}
                onAcoesDescricaoChange={(value) => setFormData(prev => ({ ...prev, acoes_corretivas_descricao: value }))}
                onNaoConformidadesChange={(ncs) => setFormData(prev => ({ ...prev, nao_conformidades: ncs }))}
                disabled={false}
                locaisPermitidos={["CAMPO"]}
              />

              {/* Fotos */}
              <UploadGallery
                fotos={formData.fotos || []}
                onFileChange={handleFileChange}
                onRemove={handleRemovePhoto}
                onLegendChange={handleLegendChange}
                loading={uploadingPhotos}
                progress={[]}
                isEditable={isEditable}
                isApproved={isApproved}
                fileNames={selectedFileNames}
                inputId="fotos-terraplanagem"
                label="Registro Fotográfico"
              />

              <ChecklistFooter
                isEditable={isEditable}
                isApproved={isApproved}
                loadingUpload={saving || uploadingPhotos}
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