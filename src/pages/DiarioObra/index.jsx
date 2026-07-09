import { useState } from "react";
import { Save, CheckCircle, AlertTriangle } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import TruthConfirmationDialog from "@/components/forms/TruthConfirmationDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import { useDiarioObra } from "@/hooks/useDiarioObra";

import DadosObraSection from "./components/DadosObraSection";
import EfetivoObraSection from "./components/EfetivoObraSection";
import ChecklistVeiculoSection from "./components/ChecklistVeiculoSection";
import FotosSection from "./components/FotosSection";

export default function DiarioObraPage() {
  const {
    loading, obras, regionais, editingDiarioOriginal,
    formData, handleChange, loadingUpload, selectedFileNames, uploadProgress,
    handleFileChange, handleRemovePhoto, handleSubmit, handleCancel,
    isApproved, isEditable, saving,
  } = useDiarioObra();

  const [showTruthConfirm, setShowTruthConfirm] = useState(false);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingDiarioOriginal?.id ? "Editar Diário de Obra" : "Novo Diário de Obra"}</CardTitle>
            <CardDescription>
              {editingDiarioOriginal?.id
                ? `Editando registro de ${new Date(editingDiarioOriginal.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`
                : "Preencha as informações abaixo para criar um novo registro."}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <form
              className="space-y-6"
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") e.preventDefault(); }}
            >
              {/* Banners de status */}
              {formData.status === "rascunho" && (
                <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-primary">Em Rascunho</p>
                    <p className="text-sm text-muted-foreground">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p>
                  </div>
                </div>
              )}
              {formData.rejection_reason && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive">Motivo da Reprovação:</p>
                    <p className="text-sm text-muted-foreground">{formData.rejection_reason}</p>
                  </div>
                </div>
              )}

              <DadosObraSection
                formData={formData} handleChange={handleChange}
                obras={obras} regionais={regionais}
                isEditable={isEditable} isApproved={isApproved}
              />

              {/* Atividades + Observações */}
              <div className="space-y-2">
                <Label>Atividades Realizadas *</Label>
                <Textarea name="atividades_realizadas" value={formData.atividades_realizadas}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Descreva as atividades realizadas no dia." rows={4} required
                  disabled={!isEditable || isApproved} />
              </div>
              <div className="space-y-2">
                <Label>Observações Gerais</Label>
                <Textarea name="observacoes" value={formData.observacoes}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  placeholder="Outras observações importantes." rows={3}
                  disabled={!isEditable || isApproved} />
              </div>

              {formData.tipo_local !== "escritorio" && (
                <AcoesCorretivasNC
                  acoesRealizadas={formData.acoes_corretivas_realizado}
                  acoesDescricao={formData.acoes_corretivas_descricao}
                  naoConformidades={formData.nao_conformidades || []}
                  onAcoesRealizadasChange={(v) => { handleChange("acoes_corretivas_realizado", v); if (v === false) handleChange("acoes_corretivas_descricao", ""); }}
                  onAcoesDescricaoChange={(v) => handleChange("acoes_corretivas_descricao", v)}
                  onNaoConformidadesChange={(ncs) => handleChange("nao_conformidades", ncs)}
                  disabled={!isEditable || isApproved}
                  locaisPermitidos={["CAMPO", "USINA"]}
                />
              )}

              <EfetivoObraSection
                formData={formData} handleChange={handleChange}
                isEditable={isEditable} isApproved={isApproved}
              />

              <ChecklistVeiculoSection
                formData={formData} handleChange={handleChange}
                isEditable={isEditable} isApproved={isApproved}
              />

              <FotosSection
                formData={formData}
                handleFileChange={handleFileChange}
                handleRemovePhoto={handleRemovePhoto}
                loadingUpload={loadingUpload}
                selectedFileNames={selectedFileNames}
                uploadProgress={uploadProgress}
                isEditable={isEditable}
                isApproved={isApproved}
              />

              {/* Botões */}
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                {isEditable && !isApproved && (
                  <>
                    <Button type="button" variant="outline" disabled={loadingUpload || saving}
                      onClick={(e) => handleSubmit(e, "rascunho")}
                      >
                      <Save className="mr-2 h-4 w-4" /> Salvar Progresso
                    </Button>
                    <Button type="button" disabled={loadingUpload || saving} onClick={() => setShowTruthConfirm(true)}>
                      <Save className="mr-2 h-4 w-4" /> Finalizar
                    </Button>
                  </>
                )}
                {isApproved && (
                  <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
                  </Badge>
                )}
              </div>
              <TruthConfirmationDialog
                open={showTruthConfirm}
                onOpenChange={setShowTruthConfirm}
                onConfirm={() => {
                  setShowTruthConfirm(false);
                  handleSubmit({ preventDefault: () => {} }, "finalizado");
                }}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}