import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, FileUp, Loader2, X } from "lucide-react";
import OfflinePhoto from "@/components/offline/OfflinePhoto";

export function AnexosSection({
  fotos,
  setFotos,
  uploadingFotos,
  handleUploadFotos,
  pdfs,
  setPdfs,
  uploadingPdfs,
  handleUploadPdfs
}) {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle className="text-primary text-base bg-secondary/20/30 px-3 py-1 rounded">
          ANEXOS DO GESTOR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fotos */}
        <div>
          <Label className="text-foreground mb-2 block">Fotos</Label>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-foreground"
              disabled={uploadingFotos}
            >
              <span>
                {uploadingFotos ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ImagePlus className="w-4 h-4 mr-2" />
                )}
                Adicionar Fotos
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadFotos}
            />
          </label>
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {fotos.map((url, i) => (
                <div key={`foto-nc-${i}`} className="relative group">
                  <OfflinePhoto
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-28 object-cover rounded-md border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setFotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDFs */}
        <div>
          <Label className="text-foreground mb-2 block">PDFs</Label>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-foreground"
              disabled={uploadingPdfs}
            >
              <span>
                {uploadingPdfs ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <FileUp className="w-4 h-4 mr-2" />
                )}
                Adicionar PDFs
              </span>
            </Button>
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleUploadPdfs}
            />
          </label>
          {pdfs.length > 0 && (
            <ul className="mt-3 space-y-2">
              {pdfs.map((pdf, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-foreground bg-muted rounded px-3 py-2"
                >
                  <FileUp className="w-4 h-4 text-secondary shrink-0" />
                  <span className="flex-1 truncate">{pdf.nome}</span>
                  <button
                    type="button"
                    onClick={() => setPdfs(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-500 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}