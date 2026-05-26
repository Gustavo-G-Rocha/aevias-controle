import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BoletimSondagemTradoActions({
  formData, setFormData, isEditable, saving,
  uploadingPhoto, handlePhotoUpload, handleRemovePhoto,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={e => setFormData(p => ({ ...p, observacoes: e.target.value }))}
          disabled={!isEditable}
          rows={3}
          maxLength={500}
          placeholder="Observações gerais sobre o boletim..."
        />
      </div>

      {/* Registro Fotográfico */}
      <div>
        <Label>Registro Fotográfico</Label>
        {isEditable && (
          <div className="mt-2">
            <input id="fotos-upload" type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="hidden" />
            <label htmlFor="fotos-upload" className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-[#00233B]/20 bg-white/30 rounded-md text-sm cursor-pointer hover:bg-white/50 ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span className="text-[#00233B]/60">{uploadingPhoto ? 'Enviando...' : 'Selecionar fotos'}</span>
              <span className="px-3 py-1 rounded-md text-sm font-semibold bg-[#00233B]/10 text-[#00233B] hover:bg-[#00233B]/20">
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Escolher Ficheiros'}
              </span>
            </label>
          </div>
        )}
        {formData.fotos && formData.fotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {formData.fotos.map((url, index) => (
              <div key={index} className="relative group">
                <picture><source srcSet={url} /><img src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md border border-[#00233B]/20" width="auto" height="128" /></picture>
                {isEditable && (
                  <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemovePhoto(index)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))} className="hover:bg-black/10">Cancelar</Button>
        {isEditable && (
          <Button type="submit" disabled={saving} className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar Boletim</>}
          </Button>
        )}
      </div>
    </div>
  );
}