import { Loader2, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import ChecklistFooter from "@/components/checklists/ChecklistFooter";

import { useChecklistMRAFForm } from "./hooks/useChecklistMRAFForm";
import DadosObraSection from "./components/DadosObraSection";
import ClimaSection from "./components/ClimaSection";
import CondicionamentoInsumos from "./components/CondicionamentoInsumos";
import PreparacaoSuperficieSection from "./components/PreparacaoSuperficieSection";
import AcompanhamentoAplicacaoSection from "./components/AcompanhamentoAplicacaoSection";
import ControleAplicacaoSection from "./components/ControleAplicacaoSection";

export default function ChecklistMRAFPage() {
  const {
    obras, regionais, editingChecklist,
    loading, formData, setFormData, obraSelecionada, regionalSelecionada,
    isApproved, isEditable, clearSavedData, navigate,
    loadingUpload, selectedFileNames, uploadProgress,
    projetosDisponiveis, selectedProject,
    handleChange, handleObraChange, handleProjectChange,
    handleNestedChange, handleAcompChange,
    handleFileChange, handleRemovePhoto, handleSubmit,
  } = useChecklistMRAFForm();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">
              {editingChecklist?.id ? "Editar Checklist de MRAF" : "Novo Checklist de MRAF"}
            </CardTitle>
            <CardDescription className="text-base">
              {editingChecklist?.id
                ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                : "Controle tecnológico de aplicação de MRAF - DNIT 035/2018"}
            </CardDescription>

            {formData.status === 'rascunho' && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-blue-600 border border-blue-700 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Em Rascunho</p>
                  <p className="text-sm text-white/90">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p>
                </div>
              </div>
            )}
            {editingChecklist?.rejection_reason && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Motivo da Reprovação:</p>
                  <p className="text-sm text-red-700">{editingChecklist.rejection_reason}</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') e.preventDefault(); }}
              className="space-y-8"
            >
              <DadosObraSection
                formData={formData} setFormData={setFormData}
                obras={obras} regionais={regionais}
                obraSelecionada={obraSelecionada} regionalSelecionada={regionalSelecionada}
                projetosDisponiveis={projetosDisponiveis} selectedProject={selectedProject}
                isEditable={isEditable} isApproved={isApproved} editingChecklist={editingChecklist}
                handleChange={handleChange} handleObraChange={handleObraChange} handleProjectChange={handleProjectChange}
              />

              <ClimaSection
                periodos={formData.periodos_clima}
                onChange={(periodos) => handleChange('periodos_clima', periodos)}
                isEditable={isEditable} isApproved={isApproved}
              />

              <CondicionamentoInsumos
                data={formData.condicionamento_insumos}
                onChange={(v) => handleNestedChange('condicionamento_insumos', null, v)}
                isEditable={isEditable} isApproved={isApproved}
              />

              <PreparacaoSuperficieSection
                data={formData.preparacao_superficie}
                onChange={(v) => handleNestedChange('preparacao_superficie', null, v)}
                isEditable={isEditable} isApproved={isApproved}
              />

              <AcompanhamentoAplicacaoSection
                data={formData.acompanhamento_aplicacao}
                onChange={(v) => setFormData(prev => ({ ...prev, acompanhamento_aplicacao: v }))}
                isEditable={isEditable} isApproved={isApproved}
              />

              <ControleAplicacaoSection
                data={formData.controle_aplicacao}
                onChange={(v) => setFormData(prev => ({ ...prev, controle_aplicacao: v }))}
                isEditable={isEditable} isApproved={isApproved}
              />

              {/* Observações Gerais */}
              <div>
                <Label className="text-base">Observações Gerais</Label>
                <Textarea value={formData.observacoes_gerais} onChange={(e) => handleChange('observacoes_gerais', e.target.value)}
                  disabled={!isEditable || isApproved} rows={4} maxLength={1000}
                  placeholder="Observações gerais sobre a aplicação..."
                  className="bg-white border-slate-200 text-slate-700 text-base" />
                <p className="text-sm text-right text-slate-600 mt-1">{formData.observacoes_gerais?.length || 0} / 1000 caracteres</p>
              </div>

              <AcoesCorretivasNC
                acoesRealizadas={formData.acoes_corretivas_realizado}
                acoesDescricao={formData.acoes_corretivas_descricao}
                naoConformidades={formData.nao_conformidades || []}
                onAcoesRealizadasChange={(value) => handleChange('acoes_corretivas_realizado', value)}
                onAcoesDescricaoChange={(value) => handleChange('acoes_corretivas_descricao', value)}
                onNaoConformidadesChange={(ncs) => handleChange('nao_conformidades', ncs)}
                disabled={!isEditable || isApproved}
                locaisPermitidos={["CAMPO"]}
              />

              {/* Fotos */}
              <div>
                <Label className="text-base">Relatório Fotográfico</Label>
                {isEditable && !isApproved && (
                  <div>
                    <Input id="fotos" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange} disabled={loadingUpload} className="hidden" />
                    <Label htmlFor="fotos"
                      className={`flex items-center justify-between w-full h-12 px-4 py-3 border border-slate-200 bg-white rounded-md text-base cursor-pointer hover:bg-slate-50 ${loadingUpload ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span className="truncate text-slate-700">{selectedFileNames}</span>
                      <span className="flex-shrink-0 ml-4 px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">
                        {loadingUpload ? 'Enviando...' : 'Escolher Ficheiros'}
                      </span>
                    </Label>
                  </div>
                )}
                {loadingUpload && uploadProgress.length > 0 && (
                  <div className="text-xs space-y-1 mt-2">
                    {uploadProgress.map((progress) => (
                      <div key={progress.id} className="flex items-center gap-2">
                        <span className="w-4">
                          {progress.status === 'pending' && '⚪'}
                          {progress.status === 'uploading' && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                          {progress.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                          {progress.status === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
                        </span>
                        <span className={progress.status === 'error' ? 'text-red-700' : 'text-slate-700'}>
                          {progress.fileName} - {progress.status === 'pending' && 'Aguardando'}
                          {progress.status === 'uploading' && 'Enviando...'}
                          {progress.status === 'success' && 'Sucesso'}
                          {progress.status === 'error' && `Erro: ${progress.error}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                  {(formData.fotos || []).map((url, index) => (
                    <div key={index} className="relative group">
                      <picture>
                        <source srcSet={url} />
                        <img src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md border border-slate-200" loading="lazy" width="auto" height="128" />
                      </picture>
                      {isEditable && !isApproved && (
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
                isEditable={isEditable} isApproved={isApproved} loadingUpload={loadingUpload}
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