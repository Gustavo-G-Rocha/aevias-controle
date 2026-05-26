import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import { useEnsaioSondagemData } from "@/hooks/useEnsaioSondagemData";
import { useEnsaioSondagemForm } from "@/hooks/useEnsaioSondagemForm";
import { useEnsaioSondagemActions } from "@/hooks/useEnsaioSondagemActions";

import EnsaioSondagemHeader from "@/components/ensaio-sondagem/EnsaioSondagemHeader";
import EnsaioSondagemDadosGerais from "@/components/ensaio-sondagem/EnsaioSondagemDadosGerais";
import EnsaioSondagemResultados from "@/components/ensaio-sondagem/EnsaioSondagemResultados";
import EnsaioSondagemFotos from "@/components/ensaio-sondagem/EnsaioSondagemFotos";
import EnsaioSondagemActions from "@/components/ensaio-sondagem/EnsaioSondagemActions";

export default function EnsaioSondagem() {
  const {
    loading, obras, projects,
    editingEnsaio, setEditingEnsaio,
    formData, setFormData,
  } = useEnsaioSondagemData();

  const { addCorpoProva, removeCorpoProva, updateCorpoProva, handleFileChange, handleRemovePhoto } =
    useEnsaioSondagemForm(formData, setFormData);

  const { saving, handleSaveProgress, handleSubmit } =
    useEnsaioSondagemActions({ formData, editingEnsaio, setEditingEnsaio });

  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <EnsaioSondagemHeader editingEnsaio={editingEnsaio} status={formData.status} />

          <CardContent>
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                  e.preventDefault();
                }
              }}
              className="space-y-6"
            >
              <EnsaioSondagemDadosGerais
                formData={formData}
                setFormData={setFormData}
                obras={obras}
                projects={projects}
              />

              <EnsaioSondagemResultados
                formData={formData}
                addCorpoProva={addCorpoProva}
                removeCorpoProva={removeCorpoProva}
                updateCorpoProva={updateCorpoProva}
              />

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  placeholder="Observações sobre o ensaio..."
                />
              </div>

              <EnsaioSondagemFotos
                fotos={formData.fotos}
                uploadingPhotos={uploadingPhotos}
                selectedFileNames={selectedFileNames}
                onFileChange={e => handleFileChange(e, setUploadingPhotos, setSelectedFileNames)}
                onRemove={handleRemovePhoto}
              />

              <EnsaioSondagemActions
                saving={saving}
                uploadingPhotos={uploadingPhotos}
                obraId={formData.obra_id}
                onSaveProgress={handleSaveProgress}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}