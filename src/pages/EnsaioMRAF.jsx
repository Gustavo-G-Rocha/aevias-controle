import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEnsaioForm } from "@/hooks/useEnsaioForm";
import { useEnsaioMRAFForm } from "@/hooks/useEnsaioMRAFForm";
import { useEnsaioMRAFActions } from "@/hooks/useEnsaioMRAFActions";
import { getInitialFormData } from "@/utils/ensaioMRAFUtils";

import EnsaioMRAFHeader        from "@/components/ensaio-mraf/EnsaioMRAFHeader";
import EnsaioMRAFDadosGerais   from "@/components/ensaio-mraf/EnsaioMRAFDadosGerais";
import EnsaioMRAFExtracaoLigante from "@/components/ensaio-mraf/EnsaioMRAFExtracaoLigante";
import EnsaioMRAFGranulometria  from "@/components/ensaio-mraf/EnsaioMRAFGranulometria";
import EnsaioMRAFActions        from "@/components/ensaio-mraf/EnsaioMRAFActions";

export default function EnsaioMRAFPage() {
  const {
    obras, regionais, projects, faixas, user,
    editingEnsaio, setEditingEnsaio,
    loading, formData, setFormData,
    obraSelecionada, regionalSelecionada, projetosDisponiveis,
    isApproved, isEditable, clearSavedData, navigate,
  } = useEnsaioForm(getInitialFormData, 'EnsaioMRAF', 'ensaio_mraf');

  const {
    handleChange, handleNestedChange, handleProjectChange,
    selectedProject, peneirasDoProjecto,
    projetosMRAF, rodoviasDisponiveis,
  } = useEnsaioMRAFForm({
    formData, setFormData,
    projects, faixas,
    projetosDisponiveis, obraSelecionada,
  });

  const { saving, handleSaveProgress, handleSubmit } = useEnsaioMRAFActions({
    formData, user,
    editingEnsaio, setEditingEnsaio,
    clearSavedData, navigate,
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <Card>
          <EnsaioMRAFHeader editingEnsaio={editingEnsaio} status={formData.status} />

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
              <EnsaioMRAFDadosGerais
                formData={formData}
                obras={obras}
                regionais={regionais}
                projetosMRAF={projetosMRAF}
                rodoviasDisponiveis={rodoviasDisponiveis}
                selectedProject={selectedProject}
                isEditable={isEditable}
                isApproved={isApproved}
                handleChange={handleChange}
                handleProjectChange={handleProjectChange}
                editingEnsaio={editingEnsaio}
                regionalSelecionada={regionalSelecionada}
              />

              <EnsaioMRAFExtracaoLigante
                ext={formData.extracao_ligante}
                isEditable={isEditable}
                isApproved={isApproved}
                isFinalizado={formData.status === 'finalizado'}
                onChange={(field, value) => handleNestedChange('extracao_ligante', field, value)}
              />

              <EnsaioMRAFGranulometria
                peneirasDoProjecto={peneirasDoProjecto}
                pesosRetidos={formData.granulometria.peso_retido_peneiras}
                pesoInicial={formData.extracao_ligante.amostra_sem_ligante || 0}
                selectedProject={selectedProject}
                isEditable={isEditable}
                isApproved={isApproved}
                onPesoChange={(key, val) => {
                  const newPesos = { ...formData.granulometria.peso_retido_peneiras, [key]: val };
                  handleNestedChange('granulometria', 'peso_retido_peneiras', newPesos);
                }}
              />

              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  disabled={!isEditable || isApproved}
                  rows={3}
                  maxLength="500"
                />
              </div>

              <EnsaioMRAFActions
                saving={saving}
                isEditable={isEditable}
                isApproved={isApproved}
                obraId={formData.obra_id}
                onSaveProgress={handleSaveProgress}
                clearSavedData={clearSavedData}
                navigate={navigate}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}