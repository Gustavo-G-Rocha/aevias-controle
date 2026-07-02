import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Seção de relatório fotográfico para a Certificação de Usina.
 * Segue o mesmo padrão do FotosSection do Diário de Obra.
 */
export default function SecaoFotos({
  fotos = [],
  onFileChange,
  onRemove,
  loading = false,
  progress = [],
  isEditable = true,
  isApproved = false,
}) {
  const canEdit = isEditable && !isApproved;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Relatório Fotográfico</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Adicione fotos da vistoria para compor o relatório.</p>
      </div>

      {canEdit && (
        <div>
          <Input
            id="fotos-certificacao"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={onFileChange}
            disabled={loading}
            className="hidden"
          />
          <Label
            htmlFor="fotos-certificacao"
            className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-muted ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="truncate text-muted-foreground">Selecionar fotos</span>
            <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-muted text-muted-foreground">
              {loading ? "Enviando..." : "Escolher Ficheiros"}
            </span>
          </Label>
        </div>
      )}

      {loading && (
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Enviando fotos...
          </p>
          {progress.length > 0 && (
            <div className="text-xs space-y-1">
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
        </div>
      )}

      {fotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {fotos.map((url, i) => (
            <div key={i} className="relative group">
              <picture>
                <source srcSet={url} />
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" />
              </picture>
              <p className="text-xs text-center text-muted-foreground mt-1">Foto {i + 1}</p>
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
          ))}
        </div>
      ) : (
        !loading && <p className="text-sm text-gray-500">Nenhuma foto adicionada.</p>
      )}
    </div>
  );
}