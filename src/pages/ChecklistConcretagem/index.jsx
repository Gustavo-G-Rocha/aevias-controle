import { Loader2, AlertTriangle, Save } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import { useChecklistConcretagem } from "@/hooks/useChecklistConcretagem";

import DadosObraSection from "./components/DadosObraSection";
import ClimaSection from "./components/ClimaSection";
import CargasSection from "./components/CargasSection";

export default function ChecklistConcretagem() {
  const {
    loading, saving, obras, projects,
    uploadingPhotos, selectedFileNames, editingChecklist,
    formData, setFormData,
    adicionarCarga, removerCarga, handleCargaChange, handleCPConfigChange,
    getQuantidadeCPs, getTipoRupturaCPs,
    handleFileChange, handleRemovePhoto, handleSubmit, handleCancel,
  } = useChecklistConcretagem();

  if (loading) {
    return <LoadingState />;
  }

  const selectedProject = projects.find(p => p.id === formData.project_id);

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingChecklist ? "Editar Checklist de Concretagem" : "Novo Checklist de Concretagem"}</CardTitle>
            <CardDescription>
              {editingChecklist
                ? `Editando checklist de ${new Date(editingChecklist.data).toLocaleDateString("pt-BR")}`
                : "Controle Tecnológico de Concreto"}
            </CardDescription>
            {formData.status === "rascunho" && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Em Rascunho</p>
                  <p className="text-sm text-muted-foreground">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="overflow-hidden">
            <form
              onSubmit={(e) => handleSubmit(e, "finalizado")}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") e.preventDefault(); }}
              className="space-y-6"
            >
              <DadosObraSection
                formData={formData} setFormData={setFormData}
                obras={obras} projects={projects} editingChecklist={editingChecklist}
              />

              <ClimaSection
                periodos={formData.periodos_clima}
                onChange={(periodos) => setFormData(prev => ({ ...prev, periodos_clima: periodos }))}
              />

              <CargasSection
                cargas={formData.cargas_concreto}
                selectedProject={selectedProject}
                setFormData={setFormData}
                adicionarCarga={adicionarCarga}
                removerCarga={removerCarga}
                handleCargaChange={handleCargaChange}
                handleCPConfigChange={handleCPConfigChange}
                getQuantidadeCPs={getQuantidadeCPs}
                getTipoRupturaCPs={getTipoRupturaCPs}
              />

              {/* Observações Gerais */}
              <div>
                <Label>Observações Gerais</Label>
                <Textarea value={formData.observacoes_gerais}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
                  rows={3} placeholder="Observações gerais..." maxLength="500" />
                <p className="text-xs text-right text-muted-foreground mt-1">{formData.observacoes_gerais?.length || 0} / 500</p>
              </div>

              <AcoesCorretivasNC
                acoesRealizadas={formData.acoes_corretivas_realizado}
                acoesDescricao={formData.acoes_corretivas_descricao}
                naoConformidades={formData.nao_conformidades || []}
                onAcoesRealizadasChange={(v) => setFormData(prev => ({ ...prev, acoes_corretivas_realizado: v, acoes_corretivas_descricao: v === false ? "" : prev.acoes_corretivas_descricao }))}
                onAcoesDescricaoChange={(v) => setFormData(prev => ({ ...prev, acoes_corretivas_descricao: v }))}
                onNaoConformidadesChange={(ncs) => setFormData(prev => ({ ...prev, nao_conformidades: ncs }))}
                disabled={false}
                locaisPermitidos={["CAMPO"]}
              />

              {/* Fotos */}
              <div>
                <Label>Registro Fotográfico</Label>
                <div>
                  <Input id="fotos" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange} disabled={uploadingPhotos} className="hidden" />
                  <Label htmlFor="fotos"
                    className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-muted ${uploadingPhotos ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <span className="truncate text-muted-foreground">{selectedFileNames}</span>
                    <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-muted text-muted-foreground">
                      {uploadingPhotos ? "Enviando..." : "Escolher Ficheiros"}
                    </span>
                  </Label>
                </div>
                {uploadingPhotos && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" /><span>Fazendo upload das fotos...</span>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {formData.fotos?.map((url, i) => (
                    <div key={i} className="relative group">
                      <picture><source srcSet={url} /><img src={url} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" /></picture>
                      <Button type="button" variant="destructive" size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(i)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button type="button" variant="outline" disabled={saving || uploadingPhotos}
                  onClick={(e) => handleSubmit(e, "rascunho")}
                  >
                  <Save className="mr-2 h-4 w-4" /> Salvar Progresso
                </Button>
                <Button type="submit" disabled={saving || uploadingPhotos}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Finalizar</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}