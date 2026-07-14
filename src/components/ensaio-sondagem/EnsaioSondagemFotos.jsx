import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import OfflinePhoto from "@/components/offline/OfflinePhoto";

export default function EnsaioSondagemFotos({ fotos, uploadingPhotos, selectedFileNames, onFileChange, onRemove }) {
  return (
    <div className="space-y-3">
      <Label>Registro Fotográfico</Label>
      <div className="flex items-center gap-3">
        <label
          htmlFor="fotos-upload"
          className={`flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm cursor-pointer hover:bg-muted ${uploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploadingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Escolher Ficheiros
        </label>
        <input id="fotos-upload" type="file" multiple accept="image/*"
          onChange={onFileChange} disabled={uploadingPhotos} className="hidden" />
        <span className="text-sm text-muted-foreground">{selectedFileNames}</span>
      </div>

      {fotos && fotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {fotos.map((url, index) => (
            <div key={index} className="relative group">
              <OfflinePhoto src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md border border-border" />
              <Button
                type="button" variant="destructive" size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}