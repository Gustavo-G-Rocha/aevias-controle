import { Loader2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";

import { useChecklistReciclagemForm } from "./hooks/useChecklistReciclagemForm";
import DadosObraSection from "./components/DadosObraSection";
import ClimaSection from "./components/ClimaSection";
import AcompanhamentoExecucaoSection from "./components/AcompanhamentoExecucaoSection";
import EnsaiosEmpreiteiraSection from "./components/EnsaiosEmpreiteiraSection";

export default function ChecklistReciclagem() {
  const {
    obras, projects, editingChecklist,
    loading, formData, setFormData, obraSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
    saving, uploadingPhotos, selectedFileNames,
    handleCheckboxChange, handleRoloChange, handleEnsaioChange,
    handleFileChange, handleRemovePhoto, handleSubmit,
  } = useChecklistReciclagemForm();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingChecklist ? 'Editar Checklist de Reciclagem' : 'Novo Checklist de Reciclagem'}</CardTitle>
            <CardDescription>
              {editingChecklist
                ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString('pt-BR')}`
                : 'Controle Tecnológico de Reciclagem'}
            </CardDescription>
            {formData.status === 'rascunho' && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800">Em Rascunho</p>
                  <p className="text-sm text-blue-700">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p>
                </div>
              </div>
            )}
            {formData.approved === false && formData.rejection_reason && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Registro Reprovado</p>
                  <p className="text-sm text-red-700">{formData.rejection_reason}</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form onSubmit={(e) => handleSubmit(e, 'finalizado')} className="space-y-6">

              <DadosObraSection
                formData={formData} setFormData={setFormData}
                obras={obras} obraSelecionada={obraSelecionada}
                projects={projects} isEditable={isEditable} editingChecklist={editingChecklist}
              />

              <ClimaSection
                periodos={formData.periodos_clima}
                onChange={(periodos) => setFormData(prev => ({ ...prev, periodos_clima: periodos }))}
                isEditable={isEditable}
              />

              <AcompanhamentoExecucaoSection
                acompanhamento={formData.acompanhamento_execucao}
                onCheckboxChange={handleCheckboxChange}
                onRoloChange={handleRoloChange}
                setFormData={setFormData}
                isEditable={isEditable}
              />

              <EnsaiosEmpreiteiraSection
                ensaios={formData.ensaios_empreiteira}
                onChange={handleEnsaioChange}
                isEditable={isEditable}
              />

              {/* Observações Gerais */}
              <div>
                <Label>Observações Gerais</Label>
                <Textarea value={formData.observacoes_gerais} disabled={!isEditable}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
                  rows={3} placeholder="Observações gerais sobre o checklist..." maxLength={500} />
                <p className="text-xs text-right text-slate-500 mt-1">{formData.observacoes_gerais?.length || 0} / 500</p>
              </div>

              <AcoesCorretivasNC
                acoesRealizadas={formData.acoes_corretivas_realizado}
                acoesDescricao={formData.acoes_corretivas_descricao}
                naoConformidades={formData.nao_conformidades || []}
                onAcoesRealizadasChange={(value) => setFormData(prev => ({ ...prev, acoes_corretivas_realizado: value, acoes_corretivas_descricao: value === false ? "" : prev.acoes_corretivas_descricao }))}
                onAcoesDescricaoChange={(value) => setFormData(prev => ({ ...prev, acoes_corretivas_descricao: value }))}
                onNaoConformidadesChange={(ncs) => setFormData(prev => ({ ...prev, nao_conformidades: ncs }))}
                disabled={!isEditable}
                locaisPermitidos={["CAMPO"]}
                instanceId="reciclagem"
              />

              {/* Fotos */}
              <div>
                <Label>Registro Fotográfico</Label>
                {isEditable && (
                  <div>
                    <Input id="fotos-rec" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange} disabled={uploadingPhotos} className="hidden" />
                    <Label htmlFor="fotos-rec"
                      className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-slate-50 ${uploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span className="truncate text-slate-500">{selectedFileNames}</span>
                      <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {uploadingPhotos ? 'Enviando...' : 'Escolher Ficheiros'}
                      </span>
                    </Label>
                  </div>
                )}
                {uploadingPhotos && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" /><span>Fazendo upload das fotos...</span>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {(formData.fotos || []).map((url, index) => (
                    <div key={index} className="relative group">
                      <picture><source srcSet={url} /><img src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" /></picture>
                      {isEditable && (
                        <Button type="button" variant="destructive" size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <ChecklistFooter
                isEditable={isEditable} isApproved={isApproved}
                loadingUpload={saving || uploadingPhotos}
                onCancel={() => { clearSavedData(); navigate(createPageUrl('MeusEnsaios')); }}
                onSaveProgress={async (e) => { e.preventDefault(); await handleSubmit(e, 'rascunho'); }}
                onFinalize={() => {}}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}