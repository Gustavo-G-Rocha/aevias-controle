import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, XCircle } from "lucide-react";

export default function BoletimSondagemFotos({ fotos, isEditable, uploadingPhoto, onUpload, onRemove }) {
  return (
    <div>
      <Label>Registro Fotográfico</Label>
      {isEditable && (
        <div className="mt-2">
          <input id="fotos-upload" type="file" multiple accept="image/*" onChange={onUpload} disabled={uploadingPhoto} className="hidden" />
          <label htmlFor="fotos-upload" className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-border bg-muted/20 rounded-md text-sm cursor-pointer hover:bg-card/50 ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-muted-foreground/70">{uploadingPhoto ? 'Enviando...' : 'Selecionar fotos'}</span>
            <span className="px-3 py-1 rounded-md text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/70">
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Escolher Ficheiros'}
            </span>
          </label>
        </div>
      )}
      {fotos && fotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {fotos.map((url, index) => (
            <div key={index} className="relative group">
              <picture>
                <source srcSet={url} />
                <img src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md border border-border" width="auto" height="128" />
              </picture>
              {isEditable && (
                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(index)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}