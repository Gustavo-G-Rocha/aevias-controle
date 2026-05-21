/**
 * ObservacoesSection.jsx — ChecklistAplicacao
 *
 * Seção final do Checklist de Aplicação com:
 *   - observações gerais (textarea)
 *   - ações corretivas e não conformidades (componente reutilizável)
 *   - registro fotográfico (upload + galeria)
 *   - medições geométricas (componente reutilizável)
 */
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import MedicoesGeometricasSection from "@/components/checklists/aplicacao/MedicoesGeometricasSection";

export default function ObservacoesSection({
  formData,
  isEditable,
  uploadingPhoto,
  onChange,
  onPhotoUpload,
  onRemovePhoto,
}) {
  return (
    <div className="space-y-4">
      {/* Observações gerais */}
      <div>
        <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
        <Textarea id="observacoes_gerais" value={formData.observacoes_gerais || ''}
          onChange={(e) => onChange('observacoes_gerais', e.target.value)}
          disabled={!isEditable} rows={3} maxLength={1000}
          placeholder="Observações gerais sobre o checklist..." />
        <p className="text-xs text-right text-[#00233B]/60 mt-1">
          {(formData.observacoes_gerais || '').length} / 1000 caracteres
        </p>
      </div>

      {/* Ações corretivas + NCs */}
      <AcoesCorretivasNC
        acoesRealizadas={formData.acoes_corretivas_realizado}
        acoesDescricao={formData.acoes_corretivas_descricao}
        naoConformidades={formData.nao_conformidades || []}
        onAcoesRealizadasChange={(v) => onChange('acoes_corretivas_realizado', v)}
        onAcoesDescricaoChange={(v) => onChange('acoes_corretivas_descricao', v)}
        onNaoConformidadesChange={(ncs) => onChange('nao_conformidades', ncs)}
        disabled={!isEditable}
        locaisPermitidos={["CAMPO"]}
      />

      {/* Registro fotográfico */}
      <div>
        <Label>Registro Fotográfico</Label>
        {isEditable && (
          <div className="mt-2">
            <input type="file" multiple accept="image/*" onChange={onPhotoUpload}
              className="hidden" disabled={uploadingPhoto} id="photo-upload-aplicacao" />
            <Button type="button" variant="outline" className="w-full" disabled={uploadingPhoto}
              onClick={(e) => { e.preventDefault(); document.getElementById('photo-upload-aplicacao').click(); }}>
              <Upload className="w-4 h-4 mr-2" />
              {uploadingPhoto ? 'Enviando...' : 'Adicionar Fotos'}
            </Button>
          </div>
        )}
        {formData.fotos?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {formData.fotos.map((foto, index) => (
              <div key={index} className="relative group">
                <picture>
                  <source srcSet={foto} />
                  <img src={foto} alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-white/20"
                    width="auto" height="128" />
                </picture>
                {isEditable && (
                  <button type="button" onClick={() => onRemovePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medições geométricas */}
      <MedicoesGeometricasSection
        medicoes_geometricas={formData.medicoes_geometricas}
        onChange={(val) => onChange('medicoes_geometricas', val)}
        disabled={!isEditable}
      />
    </div>
  );
}