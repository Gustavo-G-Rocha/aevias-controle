import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ImagePlus, FileUp, X } from "lucide-react";
import { removePhotoByIndex, removePdfByIndex } from "@/utils/editarNCUtils";

export default function AttachmentsSection({
  fotos,
  setFotos,
  pdfs,
  setPdfs,
  uploadingFotos,
  uploadingPdfs,
  onUploadFotos,
  onUploadPdfs,
}) {
  const handleFileInput = (e, handler, setUploading) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      handler(files, setUploading);
    }
  };

  return (
    <Card className="bg-card/20 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <CardTitle className="text-foreground text-base bg-secondary/20/30 px-3 py-1 rounded">
          ANEXOS
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
              className="border-white/20 text-foreground"
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
              onChange={(e) =>
                handleFileInput(e, (files) => onUploadFotos(files, fotos, setFotos), null)
              }
            />
          </label>
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {fotos.map((url, i) => (
                <div key={i} className="relative group">
                  <picture>
                    <source srcSet={url} />
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-28 object-cover rounded-md border border-white/20"
                      width="auto"
                      height="112"
                    />
                  </picture>
                  <button
                    type="button"
                    onClick={() =>
                      setFotos((prev) => removePhotoByIndex(prev, i))
                    }
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
              className="border-white/20 text-foreground"
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
              onChange={(e) =>
                handleFileInput(
                  e,
                  (files) => onUploadPdfs(files, pdfs, setPdfs),
                  null
                )
              }
            />
          </label>
          {pdfs.length > 0 && (
            <ul className="mt-3 space-y-2">
              {pdfs.map((pdf, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-foreground bg-card/30 rounded px-3 py-2"
                >
                  <FileUp className="w-4 h-4 text-[#BFCF99] shrink-0" />
                  <span className="flex-1 truncate">{pdf.nome}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPdfs((prev) => removePdfByIndex(prev, i))
                    }
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