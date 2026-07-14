import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizarFoto } from "@/utils/photoLegendaUtils";
import OfflinePhoto from "@/components/offline/OfflinePhoto";

/**
 * Componente reutilizável de upload + galeria de fotos.
 * Aceita até N imagens, exibe progresso de upload e permite remoção individual.
 *
 * Props:
 *   fotos         — Array<string | { url: string; legenda?: string }>  — URLs ou fotos com legenda
 *   onFileChange  — (e) => void — handler do input file
 *   onRemove      — (index) => void — remove foto por índice
 *   onLegendChange— (index, legenda) => void — atualiza legenda da foto
 *   loading       — boolean — exibe spinner durante upload
 *   progress      — Array<{ id, fileName, status, error }> — progresso por arquivo
 *   isEditable    — boolean — exibe controles de edição
 *   isApproved    — boolean — bloqueia edição quando aprovado
 *   fileNames     — string — texto exibido no botão de escolha
 *   inputId       — string — id único do input (default: "fotos")
 *   label         — string — label da seção (default: "Registro Fotográfico" / "Relatório Fotográfico")
 */
export default function UploadGallery({
  fotos = [],
  onFileChange,
  onRemove,
  onLegendChange,
  loading = false,
  progress = [],
  isEditable = true,
  isApproved = false,
  fileNames = "Nenhum ficheiro selecionado",
  inputId = "fotos",
  label = "Registro Fotográfico",
}) {
  const canEdit = isEditable && !isApproved;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {canEdit && (
        <div>
          <Input
            id={inputId}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={onFileChange}
            disabled={loading}
            className="hidden"
          />
          <Label
            htmlFor={inputId}
            className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-muted/30 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="truncate text-muted-foreground">{fileNames}</span>
            <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100">
              {loading ? "Enviando..." : "Escolher Ficheiros"}
            </span>
          </Label>
        </div>
      )}

      {loading && progress.length > 0 && (
        <div className="text-xs space-y-1 mt-2">
          {loading && !progress.length && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando fotos...
            </p>
          )}
          {progress.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-4">
                {p.status === "pending" && "⚪"}
                {p.status === "uploading" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                {p.status === "success" && <CheckCircle className="w-3 h-3 text-green-500" />}
                {p.status === "error" && <XCircle className="w-3 h-3 text-red-500" />}
              </span>
              <span className={p.status === "error" ? "text-destructive" : "text-gray-600"}>
                {p.fileName} —{" "}
                {p.status === "pending" && "Aguardando"}
                {p.status === "uploading" && "Enviando..."}
                {p.status === "success" && "Sucesso"}
                {p.status === "error" && `Erro: ${p.error}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {fotos.length > 0 && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, i) => {
              const fotoNormalizada = normalizarFoto(foto);
              return (
                <div key={i} className="relative group">
                  <OfflinePhoto src={fotoNormalizada.url} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" />
                  {canEdit && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemove(i)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {canEdit && onLegendChange && (
            <div className="space-y-3 border-t pt-4">
              {fotos.map((foto, i) => {
                const fotoNormalizada = normalizarFoto(foto);
                return (
                  <div key={`legenda-${i}`} className="flex flex-col gap-1">
                    <Label htmlFor={`legenda-${i}`} className="text-sm font-medium text-foreground">
                      Legenda da Foto {i + 1}
                    </Label>
                    <Input
                      id={`legenda-${i}`}
                      type="text"
                      placeholder={`Foto ${i + 1}`}
                      value={fotoNormalizada.legenda}
                      onChange={(e) => onLegendChange(i, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {fotos.length === 0 && !loading && (
        <p className="text-sm text-gray-500 mt-2">Nenhuma foto adicionada.</p>
      )}
    </div>
  );
}