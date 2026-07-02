import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import { useBoletimSondagemData } from "@/hooks/useBoletimSondagemData";
import { useBoletimSondagemForm } from "@/hooks/useBoletimSondagemForm";
import { useBoletimSondagemActions } from "@/hooks/useBoletimSondagemActions";

import BoletimSondagemHeader from "@/components/boletim-sondagem/BoletimSondagemHeader";
import BoletimSondagemDadosGerais from "@/components/boletim-sondagem/BoletimSondagemDadosGerais";
import BoletimSondagemCamadas from "@/components/boletim-sondagem/BoletimSondagemCamadas";
import BoletimSondagemUmidade from "@/components/boletim-sondagem/BoletimSondagemUmidade";
import BoletimSondagemDensidades from "@/components/boletim-sondagem/BoletimSondagemDensidades";
import BoletimSondagemFotos from "@/components/boletim-sondagem/BoletimSondagemFotos";
import BoletimSondagemActions from "@/components/boletim-sondagem/BoletimSondagemActions";

export default function BoletimSondagemPage() {
  const { formData, setFormData, obras, regionais, user, loading, editingBoletim } = useBoletimSondagemData();
  const {
    handleObraChange, handleCamadaChange,
    adicionarCamada, removerCamada,
    adicionarCamada2, removerCamada2,
    handleUmidadeChange, handleDensidadeChange,
    adicionarDensidade, removerDensidade,
    handlePhotoUpload, handleRemovePhoto,
  } = useBoletimSondagemForm(setFormData);
  const { saving, handleSubmit } = useBoletimSondagemActions({ formData, user, editingBoletim });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isEditable = editingBoletim?.approved !== true;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-card border border-border text-card-foreground">
          <BoletimSondagemHeader editingBoletim={editingBoletim} />

          <CardContent>
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') e.preventDefault();
              }}
              className="space-y-6"
            >
              <BoletimSondagemDadosGerais
                formData={formData}
                setFormData={setFormData}
                obras={obras}
                regionais={regionais}
                isEditable={isEditable}
                editingBoletim={editingBoletim}
                handleObraChange={handleObraChange}
              />

              <BoletimSondagemCamadas
                formData={formData}
                setFormData={setFormData}
                isEditable={isEditable}
                handleCamadaChange={handleCamadaChange}
                adicionarCamada={adicionarCamada}
                removerCamada={removerCamada}
                adicionarCamada2={adicionarCamada2}
                removerCamada2={removerCamada2}
              />

              <BoletimSondagemUmidade
                formData={formData}
                setFormData={setFormData}
                isEditable={isEditable}
                handleUmidadeChange={handleUmidadeChange}
              />

              <BoletimSondagemDensidades
                formData={formData}
                setFormData={setFormData}
                isEditable={isEditable}
                handleDensidadeChange={handleDensidadeChange}
                adicionarDensidade={adicionarDensidade}
                removerDensidade={removerDensidade}
              />

              {/* OBSERVAÇÕES */}
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

              <BoletimSondagemFotos
                fotos={formData.fotos}
                isEditable={isEditable}
                uploadingPhoto={uploadingPhoto}
                onUpload={e => handlePhotoUpload(e, setUploadingPhoto)}
                onRemove={handleRemovePhoto}
              />

              <BoletimSondagemActions isEditable={isEditable} saving={saving} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}