import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import { useAcompanhamentoCargaData }    from "@/hooks/useAcompanhamentoCargaData";
import { useAcompanhamentoCargaActions } from "@/hooks/useAcompanhamentoCargaActions";
import { calcCanEdit }                   from "@/utils/acompanhamentoCargaUtils";

import AcompanhamentoCargaHeader   from "@/components/acompanhamento-carga/AcompanhamentoCargaHeader";
import AcompanhamentoCargaDadosObra from "@/components/acompanhamento-carga/AcompanhamentoCargaDadosObra";
import AcompanhamentoCargaCargas   from "@/components/acompanhamento-carga/AcompanhamentoCargaCargas";
import AcompanhamentoCargaActions  from "@/components/acompanhamento-carga/AcompanhamentoCargaActions";

export default function AcompanhamentoCarga() {
  const {
    formData, setFormData,
    user, obras, regionais, projects, availableProjects, setAvailableProjects,
    loading, editMode, editId, clearSavedData,
  } = useAcompanhamentoCargaData();

  const {
    saving,
    handleObraChange, handleProjectChange,
    handleAddCarga, handleRemoveCarga, handleCargaChange,
    handleSubmit,
  } = useAcompanhamentoCargaActions({
    formData, setFormData,
    obras, regionais, projects, setAvailableProjects,
    editMode, editId, clearSavedData,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const obraSelecionada     = obras.find(o => o.id === formData.obra_id);
  const regionalSelecionada = regionais.find(r => r.id === obraSelecionada?.regional_id);
  const projetoSelecionado  = projects.find(p => p.id === formData.project_id);
  const canEdit             = calcCanEdit(editMode, formData, user?.email);

  return (
    <div className="min-h-screen bg-transparent p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <AcompanhamentoCargaHeader editMode={editMode} />

        <Card className="bg-card border border-border text-card-foreground">
          <CardContent className="p-6 space-y-6">
            <AcompanhamentoCargaDadosObra
              formData={formData}
              setFormData={setFormData}
              obras={obras}
              availableProjects={availableProjects}
              obraSelecionada={obraSelecionada}
              regionalSelecionada={regionalSelecionada}
              projetoSelecionado={projetoSelecionado}
              canEdit={canEdit}
              handleObraChange={handleObraChange}
              handleProjectChange={handleProjectChange}
            />

            <AcompanhamentoCargaCargas
              cargas={formData.cargas}
              canEdit={canEdit}
              handleAddCarga={handleAddCarga}
              handleRemoveCarga={handleRemoveCarga}
              handleCargaChange={handleCargaChange}
            />

            <div>
              <Label>Observações Gerais</Label>
              <Textarea
                value={formData.observacoes_gerais}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes_gerais: e.target.value }))}
                rows={3}
                disabled={!canEdit}
                className="text-xs mt-1"
              />
            </div>

            <AcompanhamentoCargaActions
              canEdit={canEdit}
              saving={saving}
              handleSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}