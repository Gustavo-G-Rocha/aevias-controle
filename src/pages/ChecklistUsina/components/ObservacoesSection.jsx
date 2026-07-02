import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import UploadGallery from "@/components/forms/UploadGallery";

export default function ObservacoesSection({
  formData,
  isEditable,
  isApproved,
  loadingUpload,
  uploadProgress,
  selectedFileNames,
  onObservacoesChange,
  onAcoesRealizadasChange,
  onAcoesDescricaoChange,
  onNaoConformidadesChange,
  onFileChange,
  onRemovePhoto,
}) {
  const canEdit = isEditable && !isApproved;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="observacoes">Observações Gerais</Label>
        <Textarea id="observacoes" value={formData.observacoes}
          onChange={(e) => onObservacoesChange(e.target.value)}
          disabled={!canEdit} rows={3}
          placeholder="Observações sobre o checklist..." maxLength="500" />
        <p className="text-xs text-right text-muted-foreground mt-1">{formData.observacoes?.length || 0} / 500</p>
      </div>

      <AcoesCorretivasNC
        acoesRealizadas={formData.acoes_corretivas_realizado}
        acoesDescricao={formData.acoes_corretivas_descricao}
        naoConformidades={formData.nao_conformidades || []}
        onAcoesRealizadasChange={onAcoesRealizadasChange}
        onAcoesDescricaoChange={onAcoesDescricaoChange}
        onNaoConformidadesChange={onNaoConformidadesChange}
        disabled={!canEdit}
        locaisPermitidos={["USINA"]}
      />

      <UploadGallery
        label="Relatório Fotográfico"
        fotos={formData.fotos || []}
        onFileChange={onFileChange}
        onRemove={onRemovePhoto}
        loading={loadingUpload}
        progress={uploadProgress}
        isEditable={isEditable}
        isApproved={isApproved}
        fileNames={selectedFileNames}
        inputId="fotos-usina"
      />
    </div>
  );
}