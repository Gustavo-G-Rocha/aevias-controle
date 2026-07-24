import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { useBoletimSondagemTradoData } from "@/hooks/useBoletimSondagemTradoData";
import { useBoletimSondagemTradoForm } from "@/hooks/useBoletimSondagemTradoForm";
import { useBoletimSondagemTradoActions } from "@/hooks/useBoletimSondagemTradoActions";

import BoletimSondagemTradoHeader from "@/components/boletim-sondagem-trado/BoletimSondagemTradoHeader";
import BoletimSondagemTradoDadosGerais from "@/components/boletim-sondagem-trado/BoletimSondagemTradoDadosGerais";
import BoletimSondagemTradoCamadas from "@/components/boletim-sondagem-trado/BoletimSondagemTradoCamadas";
import BoletimSondagemTradoResultados from "@/components/boletim-sondagem-trado/BoletimSondagemTradoResultados";
import BoletimSondagemTradoActions from "@/components/boletim-sondagem-trado/BoletimSondagemTradoActions";

export default function BoletimSondagemTradoPage() {
  const { formData, setFormData, obras, regionais, user, loading, editingBoletim } =
    useBoletimSondagemTradoData();

  const {
    uploadingPhoto,
    handleObraChange,
    handleCamadaChange, adicionarCamada, removerCamada,
    handleUmidadeChange, adicionarUmidade2, removerUmidade2, handleUmidade2Change,
    handleDensidadeChange, adicionarDensidade, removerDensidade,
    handlePhotoUpload, handleRemovePhoto,
  } = useBoletimSondagemTradoForm(setFormData);

  const { saving, handleSubmit } = useBoletimSondagemTradoActions(formData, user, editingBoletim);

  const isApproved = editingBoletim?.approved === true;
  const isEditable = !isApproved;

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
          <BoletimSondagemTradoHeader editingBoletim={editingBoletim} />
          <CardContent>
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                // Previne Enter de submeter o formulário apenas em campos de texto.
                // Botões (incluindo o trigger do seletor de Obra) e textareas
                // não são afetados — assim o seletor abre normalmente pelo teclado.
                if (e.key === 'Enter' && e.target.tagName === 'INPUT')
                  e.preventDefault();
              }}
              className="space-y-6"
            >
              <BoletimSondagemTradoDadosGerais
                formData={formData}
                setFormData={setFormData}
                obras={obras}
                regionais={regionais}
                isEditable={isEditable}
                editingBoletim={editingBoletim}
                handleObraChange={handleObraChange}
              />

              <BoletimSondagemTradoCamadas
                formData={formData}
                setFormData={setFormData}
                isEditable={isEditable}
                handleCamadaChange={handleCamadaChange}
                adicionarCamada={adicionarCamada}
                removerCamada={removerCamada}
              />

              <BoletimSondagemTradoResultados
                formData={formData}
                setFormData={setFormData}
                isEditable={isEditable}
                handleUmidadeChange={handleUmidadeChange}
                adicionarUmidade2={adicionarUmidade2}
                removerUmidade2={removerUmidade2}
                handleUmidade2Change={handleUmidade2Change}
                handleDensidadeChange={handleDensidadeChange}
                adicionarDensidade={adicionarDensidade}
                removerDensidade={removerDensidade}
              />

              <BoletimSondagemTradoActions
                formData={formData}
                setFormData={setFormData}
                isEditable={isEditable}
                saving={saving}
                uploadingPhoto={uploadingPhoto}
                handlePhotoUpload={handlePhotoUpload}
                handleRemovePhoto={handleRemovePhoto}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}