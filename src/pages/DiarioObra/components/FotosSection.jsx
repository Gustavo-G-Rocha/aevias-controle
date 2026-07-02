import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function FotosSection({ formData, handleFileChange, handleRemovePhoto, loadingUpload, selectedFileNames, uploadProgress, isEditable, isApproved }) {
  return (
    <div className="space-y-2">
      <Label>Relatório Fotográfico</Label>
      {isEditable && !isApproved && (
        <div>
          <Input id="fotos" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange} disabled={loadingUpload} className="hidden" />
          <Label htmlFor="fotos" className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-muted ${loadingUpload ? "opacity-50 cursor-not-allowed" : ""}`}>
            <span className="truncate text-muted-foreground">{selectedFileNames}</span>
            <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-muted text-muted-foreground">
              {loadingUpload ? "Enviando..." : "Escolher Ficheiros"}
            </span>
          </Label>
        </div>
      )}
      {loadingUpload && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando fotos...</p>
          {uploadProgress.length > 0 && (
            <div className="text-xs space-y-1 mt-2">
              {uploadProgress.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="w-4">
                    {p.status === "pending" && "⚪"}
                    {p.status === "uploading" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                    {p.status === "success" && <CheckCircle className="w-3 h-3 text-green-500" />}
                    {p.status === "error" && <XCircle className="w-3 h-3 text-red-500" />}
                  </span>
                  <span className={p.status === "error" ? "text-red-600" : "text-muted-foreground"}>
                    {p.fileName} - {p.status === "pending" ? "Aguardando" : p.status === "uploading" ? "Enviando..." : p.status === "success" ? "Sucesso" : `Erro: ${p.error}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {formData.fotos?.map((url, i) => (
          <div key={i} className="relative group">
            <picture><source srcSet={url} /><img src={url} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" /></picture>
            {isEditable && !isApproved && (
              <Button type="button" variant="destructive" size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemovePhoto(i)}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {(!formData.fotos || formData.fotos.length === 0) && !loadingUpload && (
        <p className="text-sm text-muted-foreground mt-2">Nenhuma foto adicionada.</p>
      )}
    </div>
  );
}